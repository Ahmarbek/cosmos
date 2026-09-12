import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { readStore } from '../state/useStore';
import { damp, smoothstep } from '../utils/math';
import { planetVert } from '../shaders/planet';
import { coronaFrag, quadVert, sunFrag } from '../shaders/star-and-shells';
import { SUN } from '../data/planets';

/** The star: a convecting surface, a corona billboard, and the scene's key light. */
export default function Sun({ segments }: { segments: number }) {
  const corona = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const sunMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVert,
        fragmentShader: sunFrag,
        uniforms: { uTime: { value: 0 } },
      }),
    []
  );

  const coronaMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: quadVert,
        fragmentShader: coronaFrag,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: 0.9 },
          uColor: { value: new THREE.Color('#ffb46a') },
        },
      }),
    []
  );

  const glow = useRef(0.9);

  useFrame((_, dt) => {
    sunMat.uniforms.uTime.value += dt;
    coronaMat.uniforms.uTime.value += dt;
    if (corona.current) corona.current.quaternion.copy(camera.quaternion);
    // the star still lights Earth's chapter, but its corona would flare across
    // the whole frame from that distance
    const target = 0.9 - smoothstep(0.60, 0.67, readStore().progress) * 0.72;
    glow.current = damp(glow.current, target, 4, dt);
    coronaMat.uniforms.uOpacity.value = glow.current;
  });

  return (
    <group>
      <mesh material={sunMat}>
        <sphereGeometry args={[SUN.radius, segments, segments / 2]} />
      </mesh>
      <mesh ref={corona} material={coronaMat} renderOrder={2}>
        <planeGeometry args={[SUN.radius * 13, SUN.radius * 13]} />
      </mesh>
      <pointLight intensity={4} distance={0} decay={0} color="#fff2dd" />
    </group>
  );
}
