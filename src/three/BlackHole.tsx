import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { blackHoleFrag, blackHoleVert, compositeFrag, compositeVert } from '../shaders/blackhole';
import { BH_POS, DISK_INNER, DISK_NORMAL, DISK_OUTER, RS_WORLD } from './constants';
import { readStore, type Quality } from '../state/useStore';
import { band, clamp, damp } from '../utils/math';

/**
 * How densely the integrator samples the screen, in device pixels per CSS
 * pixel. One means one photon per CSS pixel — which is exactly what a
 * standard-density display has always shown — so on a retina screen the pass
 * runs at a quarter of the pixels for no change in what the picture resolves.
 */
const SAMPLE_DPR: Record<Quality, number> = { low: 0.6, medium: 0.85, high: 1 };

/** Hard ceiling, so a very large display cannot uncap the cost by itself. */
const PIXEL_CAP: Record<Quality, number> = { low: 700000, medium: 1500000, high: 2400000 };

/**
 * The step budget, and the reason it is a range rather than a number.
 *
 * MIN is the budget this chapter has always run at. MAX is what it may run at
 * when the pass is being downscaled enough to have paid for it — a longer
 * march is the best thing to spend that saving on: a smoother disk, a cleaner
 * photon ring, less stepping in the lensed sky.
 *
 * Which of the two applies cannot be decided once and kept, because the saving
 * is not a property of the display. The frame monitor moves the pixel ratio at
 * runtime, and when it moves below SAMPLE_DPR the pass stops being downscaled
 * at all — at which point a budget chosen for a denser screen is simply the
 * chapter costing more than it used to on the machine that could least afford
 * it. So the budget is recomputed every frame from the scale actually in use,
 * and the shader carries a hard ceiling with a dynamic break rather than a
 * compiled-in step count.
 */
const MIN_STEPS: Record<Quality, number> = { low: 46, medium: 76, high: 112 };
const MAX_STEPS: Record<Quality, number> = { low: 64, medium: 108, high: 152 };

/** The fraction of the drawing buffer the pass runs at. */
function passScale(quality: Quality, width: number, height: number, dpr: number) {
  return Math.min(
    1,
    SAMPLE_DPR[quality] / Math.max(dpr, 0.01),
    Math.sqrt(PIXEL_CAP[quality] / Math.max(width * height, 1))
  );
}

/**
 * Steps to run at a given scale. At scale one there is no saving and the
 * budget is exactly the old one, so the chapter can never cost more than it
 * did; by half scale the pass is a quarter of the pixels and the full budget
 * is comfortably affordable.
 */
function stepBudget(quality: Quality, scale: number) {
  const spent = clamp((1 - scale) / 0.5);
  return Math.round(MIN_STEPS[quality] + (MAX_STEPS[quality] - MIN_STEPS[quality]) * spent);
}

/**
 * The black hole is drawn as a screen-space pass rather than as geometry.
 *
 * Every pixel traces a photon backwards through curved space, so the shadow,
 * the photon ring and the lensed far side of the disk are consequences of the
 * integration rather than modelled objects. The quad's alpha is driven by how
 * far each photon was deflected, which lets the real three-dimensional star
 * field behind it show through wherever spacetime is effectively flat — the
 * two skies meet with no visible seam.
 *
 * The march runs into an offscreen target sized in CSS pixels and is lifted
 * onto the canvas by a trivial composite, which is the whole performance story
 * of this chapter: a per-pixel geodesic trace at a device pixel ratio of two is
 * four times the work for a picture nobody can tell apart from the same trace
 * at one. What that saving buys back is a longer integration — see the step
 * budget below.
 */
export default function BlackHole({ quality }: { quality: Quality }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, gl } = useThree();
  const opacity = useRef(0);
  const warp = useRef(0);

  const uniforms = useMemo(
    () => ({
      uCamPos: { value: new THREE.Vector3() },
      uCamRight: { value: new THREE.Vector3() },
      uCamUp: { value: new THREE.Vector3() },
      uCamFwd: { value: new THREE.Vector3() },
      uTanHalfFov: { value: 0.5 },
      uAspect: { value: 1 },
      uBhPos: { value: BH_POS.clone() },
      uRsWorld: { value: RS_WORLD },
      uToLocal: { value: new THREE.Matrix3() },
      uToWorld: { value: new THREE.Matrix3() },
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uDiskInner: { value: DISK_INNER },
      uDiskOuter: { value: DISK_OUTER },
      uDiskBright: { value: 2.6 },
      uWarpBoost: { value: 0 },
      uSteps: { value: MIN_STEPS.high },
    }),
    []
  );

  // Orthonormal frame in which the accretion disk lies in the y = 0 plane.
  useMemo(() => {
    const up = DISK_NORMAL.clone().normalize();
    const ref = Math.abs(up.y) > 0.94 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const xAxis = new THREE.Vector3().crossVectors(ref, up).normalize();
    const zAxis = new THREE.Vector3().crossVectors(up, xAxis).normalize();
    const toWorld = new THREE.Matrix3().set(
      xAxis.x, up.x, zAxis.x,
      xAxis.y, up.y, zAxis.y,
      xAxis.z, up.z, zAxis.z
    );
    uniforms.uToWorld.value.copy(toWorld);
    uniforms.uToLocal.value.copy(toWorld).transpose();
  }, [uniforms]);

  /**
   * The offscreen target the march writes into.
   *
   * Half float rather than bytes: a render target is always written in the
   * linear working space, and eight linear bits band visibly across the soft
   * glow around the hole — which is most of what the pass draws.
   */
  const target = useMemo(() => {
    const half =
      gl.extensions.has('EXT_color_buffer_half_float') ||
      gl.extensions.has('EXT_color_buffer_float');
    const rt = new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      type: half ? THREE.HalfFloatType : THREE.UnsignedByteType,
      depthBuffer: false,
      stencilBuffer: false,
    });
    rt.texture.generateMipmaps = false;
    return rt;
  }, [gl]);

  /** The march: its own one-quad scene, so it can be rendered on its own. */
  const pass = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: blackHoleVert,
      fragmentShader: blackHoleFrag,
      uniforms,
      // Written straight into a cleared target, so there is nothing to blend
      // against and the alpha channel reaches the composite intact.
      blending: THREE.NoBlending,
      transparent: false,
      depthTest: false,
      depthWrite: false,
      defines: { STEPS: MAX_STEPS[quality] },
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const scene = new THREE.Scene();
    const quad = new THREE.Mesh(geometry, material);
    quad.frustumCulled = false;
    scene.add(quad);
    // the vertex shader writes clip space directly, so the camera is a formality
    return { scene, camera: new THREE.Camera(), material, geometry };
  }, [uniforms, quality]);

  const compositeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: compositeVert,
        fragmentShader: compositeFrag,
        uniforms: { uMap: { value: target.texture } },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [target]
  );

  useEffect(
    () => () => {
      target.dispose();
      pass.material.dispose();
      pass.geometry.dispose();
      compositeMat.dispose();
    },
    [target, pass, compositeMat]
  );

  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const buffer = useMemo(() => new THREE.Vector2(), []);
  const clearColor = useMemo(() => new THREE.Color(), []);

  // Negative priority: this runs ahead of every other frame subscriber and
  // ahead of the scene render, so the target is already filled by the time the
  // composite quad is drawn. It does not take rendering over from the canvas.
  useFrame((_, dt) => {
    const s = readStore();
    // present through the whole black-hole movement, gone before the system
    const t = band(s.progress, 0.085, 0.17, 0.43, 0.50);
    opacity.current = damp(opacity.current, t, 4, dt);

    const m = mesh.current;
    if (!m) return;
    const vis = opacity.current > 0.002;
    m.visible = vis;
    // Outside its chapter the pass is not merely invisible, it is not run.
    if (!vis) return;

    const cam = camera as THREE.PerspectiveCamera;
    cam.matrixWorld.extractBasis(right, up, fwd);
    uniforms.uCamPos.value.copy(cam.position);
    uniforms.uCamRight.value.copy(right);
    uniforms.uCamUp.value.copy(up);
    uniforms.uCamFwd.value.copy(fwd).negate();
    uniforms.uTanHalfFov.value = Math.tan((cam.fov * Math.PI) / 360);
    uniforms.uTime.value += dt;
    uniforms.uOpacity.value = opacity.current;

    const v = clamp(Math.abs(s.velocity) * 10, 0, 1);
    warp.current = damp(warp.current, v, 4, dt);
    uniforms.uWarpBoost.value = warp.current;

    // ── size the pass ───────────────────────────────────────────────────────
    gl.getDrawingBufferSize(buffer);
    const scale = passScale(quality, buffer.x, buffer.y, gl.getPixelRatio() || 1);
    uniforms.uSteps.value = stepBudget(quality, scale);
    const w = Math.max(2, Math.round(buffer.x * scale));
    const h = Math.max(2, Math.round(buffer.y * scale));
    if (target.width !== w || target.height !== h) target.setSize(w, h);
    // the aspect rays are cast at is the target's, not the canvas's
    uniforms.uAspect.value = w / h;

    // ── run it ──────────────────────────────────────────────────────────────
    const prevTarget = gl.getRenderTarget();
    gl.getClearColor(clearColor);
    const prevAlpha = gl.getClearAlpha();
    gl.setRenderTarget(target);
    gl.setClearColor(0x000000, 0);
    gl.render(pass.scene, pass.camera);
    gl.setRenderTarget(prevTarget);
    gl.setClearColor(clearColor, prevAlpha);
  }, -1);

  return (
    <mesh ref={mesh} material={compositeMat} frustumCulled={false} renderOrder={5} visible={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
