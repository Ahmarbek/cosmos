import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { galaxyFrag, nebulaFrag } from '../shaders/space';
import { quadVert } from '../shaders/star-and-shells';
import { readStore } from '../state/useStore';
import { clamp } from '../utils/math';

interface CloudDef {
  pos: [number, number, number];
  size: number;
  a: string;
  b: string;
  seed: number;
  detail: number;
  opacity: number;
}

/** Hand-placed so each one arrives at a deliberate moment of the flight. */
const NEBULAE: CloudDef[] = [
  { pos: [-380, 120, -120], size: 700, a: '#3a1c7a', b: '#0d2f6b', seed: 1.7, detail: 2.4, opacity: 0.5 },
  { pos: [420, -180, -520], size: 900, a: '#6b1f4d', b: '#1b2a6b', seed: 5.3, detail: 3.1, opacity: 0.38 },
  { pos: [120, 260, -900], size: 1300, a: '#12345e', b: '#3d1a5e', seed: 9.1, detail: 2.0, opacity: 0.34 },
  { pos: [900, -60, -1500], size: 1600, a: '#4a1f6e', b: '#0f3a5e', seed: 2.9, detail: 2.7, opacity: 0.3 },
  { pos: [-700, -320, -1750], size: 1400, a: '#5e2a1f', b: '#1f2b6e', seed: 7.7, detail: 2.2, opacity: 0.26 },
];

interface GalaxyDef {
  pos: [number, number, number];
  size: number;
  core: string;
  arm: string;
  seed: number;
  arms: number;
  tilt: [number, number, number];
  opacity: number;
}

const GALAXIES: GalaxyDef[] = [
  { pos: [-620, 240, -700], size: 260, core: '#ffe6c0', arm: '#7ba7ff', seed: 0.8, arms: 2, tilt: [0.9, 0.2, 0.4], opacity: 0.85 },
  { pos: [740, 300, -1250], size: 170, core: '#fff0d8', arm: '#9c8bff', seed: 3.4, arms: 4, tilt: [0.3, 0.9, -0.2], opacity: 0.6 },
  { pos: [-260, -420, -1600], size: 420, core: '#ffdcb0', arm: '#6fd0ff', seed: 6.1, arms: 2, tilt: [1.2, -0.4, 0.8], opacity: 0.5 },
];

/**
 * Distant structure: emission nebulae and a handful of galaxies.
 *
 * All of it is procedural and drawn on single quads. Nebulae billboard toward
 * the camera; galaxies keep a fixed attitude, because a galaxy that turns to
 * face you reads as a sprite rather than an object in space.
 */
export default function Nebulae() {
  const group = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const clock = useRef(0);

  const nebulaMats = useMemo(
    () =>
      NEBULAE.map((n) =>
        new THREE.ShaderMaterial({
          vertexShader: quadVert,
          fragmentShader: nebulaFrag,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uColorA: { value: new THREE.Color(n.a) },
            uColorB: { value: new THREE.Color(n.b) },
            uSeed: { value: n.seed },
            uDetail: { value: n.detail },
          },
        })
      ),
    []
  );

  const galaxyMats = useMemo(
    () =>
      GALAXIES.map((g) =>
        new THREE.ShaderMaterial({
          vertexShader: quadVert,
          fragmentShader: galaxyFrag,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uCore: { value: new THREE.Color(g.core) },
            uArm: { value: new THREE.Color(g.arm) },
            uSeed: { value: g.seed },
            uArms: { value: g.arms },
          },
        })
      ),
    []
  );

  useFrame((_, dt) => {
    clock.current += dt;
    const s = readStore();
    // present for the deep-space movements, gone once we are inside the system
    const fade = clamp(1 - (s.progress - 0.48) / 0.12) * clamp((s.progress - 0.006) / 0.04);

    const g = group.current;
    if (!g) return;
    g.children.forEach((child, i) => {
      if (i < NEBULAE.length) {
        child.quaternion.copy(camera.quaternion);
        const m = nebulaMats[i];
        m.uniforms.uTime.value = clock.current;
        m.uniforms.uOpacity.value = NEBULAE[i].opacity * fade;
      } else {
        const m = galaxyMats[i - NEBULAE.length];
        m.uniforms.uTime.value = clock.current;
        m.uniforms.uOpacity.value = GALAXIES[i - NEBULAE.length].opacity * fade;
      }
    });
  });

  return (
    <group ref={group} renderOrder={-9}>
      {NEBULAE.map((n, i) => (
        <mesh key={`n${i}`} position={n.pos} material={nebulaMats[i]} frustumCulled={false}>
          <planeGeometry args={[n.size, n.size]} />
        </mesh>
      ))}
      {GALAXIES.map((g, i) => (
        <mesh
          key={`g${i}`}
          position={g.pos}
          rotation={g.tilt}
          material={galaxyMats[i]}
          frustumCulled={false}
        >
          <planeGeometry args={[g.size, g.size]} />
        </mesh>
      ))}
    </group>
  );
}
