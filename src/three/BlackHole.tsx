import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { blackHoleFrag, blackHoleVert } from '../shaders/blackhole';
import { BH_POS, DISK_INNER, DISK_NORMAL, DISK_OUTER, RS_WORLD } from './constants';
import { readStore, type Quality } from '../state/useStore';
import { band, clamp, damp } from '../utils/math';

const STEPS: Record<Quality, number> = { low: 46, medium: 76, high: 112 };

/**
 * The black hole is drawn as a screen-space pass rather than as geometry.
 *
 * Every pixel traces a photon backwards through curved space, so the shadow,
 * the photon ring and the lensed far side of the disk are consequences of the
 * integration rather than modelled objects. The quad's alpha is driven by how
 * far each photon was deflected, which lets the real three-dimensional star
 * field behind it show through wherever spacetime is effectively flat — the
 * two skies meet with no visible seam.
 */
export default function BlackHole({ quality }: { quality: Quality }) {
  const mesh = useRef<THREE.Mesh>(null);
  const { camera, size } = useThree();
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

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: blackHoleVert,
        fragmentShader: blackHoleFrag,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        defines: { STEPS: STEPS[quality] },
      }),
    [uniforms, quality]
  );

  const right = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(), []);
  const fwd = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, dt) => {
    const s = readStore();
    // present through the whole black-hole movement, gone before the system
    const target = band(s.progress, 0.085, 0.17, 0.43, 0.50);
    opacity.current = damp(opacity.current, target, 4, dt);

    const m = mesh.current;
    if (!m) return;
    const vis = opacity.current > 0.002;
    m.visible = vis;
    if (!vis) return;

    const cam = camera as THREE.PerspectiveCamera;
    cam.matrixWorld.extractBasis(right, up, fwd);
    uniforms.uCamPos.value.copy(cam.position);
    uniforms.uCamRight.value.copy(right);
    uniforms.uCamUp.value.copy(up);
    uniforms.uCamFwd.value.copy(fwd).negate();
    uniforms.uTanHalfFov.value = Math.tan((cam.fov * Math.PI) / 360);
    uniforms.uAspect.value = size.width / size.height;
    uniforms.uTime.value += dt;
    uniforms.uOpacity.value = opacity.current;

    const v = clamp(Math.abs(s.velocity) * 10, 0, 1);
    warp.current = damp(warp.current, v, 4, dt);
    uniforms.uWarpBoost.value = warp.current;
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false} renderOrder={5} visible={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}
