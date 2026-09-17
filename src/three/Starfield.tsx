import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { starFrag, starVert } from '../shaders/space';
import { STAR_BOX } from './constants';
import { readStore } from '../state/useStore';
import { clamp, damp, smoothstep } from '../utils/math';
import { mulberry32 } from '../utils/noise';

interface Props {
  count: number;
  pixelRatio: number;
}

/**
 * The star field the whole journey flies through.
 *
 * One static buffer, wrapped around the camera in the vertex shader, so travel
 * distance is unlimited and the CPU does no per-frame work. Colours follow a
 * rough stellar distribution: mostly faint and white, a minority blue-white and
 * amber, a handful bright enough to carry the frame on their own.
 */
export default function Starfield({ count, pixelRatio }: Props) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const { camera } = useThree();
  const opacity = useRef(0);
  const warp = useRef(0);
  /** seconds since the journey began — the opening reveal is timed, not scrolled */
  const life = useRef(0);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const tint = new Float32Array(count * 3);
    const rand = mulberry32(20260911);
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (rand() - 0.5) * STAR_BOX;
      pos[i * 3 + 1] = (rand() - 0.5) * STAR_BOX;
      pos[i * 3 + 2] = (rand() - 0.5) * STAR_BOX;

      // heavy tail: a few very bright stars among many faint ones
      const r = rand();
      size[i] = 12 + Math.pow(r, 6) * 260;
      seed[i] = rand();

      const t = rand();
      if (t < 0.62) c.setHSL(0.58 + rand() * 0.08, 0.12 + rand() * 0.2, 0.86);
      else if (t < 0.86) c.setHSL(0.6 + rand() * 0.05, 0.55, 0.74);
      else if (t < 0.97) c.setHSL(0.08 + rand() * 0.04, 0.55, 0.72);
      else c.setHSL(0.0 + rand() * 0.03, 0.7, 0.66);
      tint[i * 3] = c.r;
      tint[i * 3 + 1] = c.g;
      tint[i * 3 + 2] = c.b;
    }

    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    g.setAttribute('aTint', new THREE.BufferAttribute(tint, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
    return g;
  }, [count]);

  // Stable across the life of the field. Rebuilding this object when the
  // pixel ratio changes would reset uTime and uOpacity with it, and the whole
  // sky would fade in again from black in the middle of the flight.
  const uniforms = useMemo(
    () => ({
      uCamPos: { value: new THREE.Vector3() },
      uBox: { value: STAR_BOX },
      uPixelRatio: { value: pixelRatio },
      uSizeScale: { value: 1 },
      uTime: { value: 0 },
      uWarp: { value: 0 },
      uOpacity: { value: 0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame((_, dt) => {
    const u = uniforms;
    // a star is sized in device pixels, so it has to follow the pixel ratio
    // when the monitor trims it
    u.uPixelRatio.value = pixelRatio;
    u.uCamPos.value.copy(camera.position);
    u.uTime.value += dt;

    const s = readStore();
    if (s.stage === 'journey') life.current += dt;
    // The field opens from black on a clock rather than on the scrollbar: the
    // first thing the visitor sees must be a reveal, not a reward for input.
    const introIn = smoothstep(0.9, 5.2, life.current);
    const outroOut = 1 - smoothstep(0.80, 0.95, s.progress) * 0.72;
    // under the black hole the shader draws its own lensed sky
    const bhDim = 1 - smoothstep(0.2, 0.33, s.progress) * 0.45 + smoothstep(0.42, 0.5, s.progress) * 0.45;
    const target = introIn * outroOut * clamp(bhDim, 0.3, 1);
    opacity.current = damp(opacity.current, target, 3, dt);
    u.uOpacity.value = opacity.current;

    const v = clamp(Math.abs(s.velocity) * 14, 0, 1);
    warp.current = damp(warp.current, v, 5, dt);
    u.uWarp.value = warp.current;
  });

  return (
    <points frustumCulled={false} geometry={geometry} renderOrder={-10}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={starVert}
        fragmentShader={starFrag}
        transparent
        depthWrite={false}
        depthTest={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
