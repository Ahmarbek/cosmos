import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { earthFrag, earthVert } from '../shaders/earth';
import { atmosphereFrag, atmosphereVert } from '../shaders/star-and-shells';
import { getEarthTextures } from '../utils/earthTextures';
import { PLANET_BY_ID } from '../data/planets';
import { readStore } from '../state/useStore';
import { damp, smoothstep } from '../utils/math';

interface Props {
  segments: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  register?: (id: string, obj: THREE.Object3D) => void;
}

/**
 * Earth gets its own material: day map, night-side city lights, a drifting
 * cloud deck sampled in the same pass, ocean specular and a scattering shell.
 * The same object serves both the system-wide view and the close approach, so
 * the camera never has to cut.
 */
export default function Earth3D({ segments, selected, onSelect, onHover, register }: Props) {
  const def = PLANET_BY_ID.earth;
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const moonT = useRef(1.2);
  const sel = useRef(0);

  const tex = useMemo(() => getEarthTextures(), []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: earthVert,
        fragmentShader: earthFrag,
        uniforms: {
          uDay: { value: tex.day },
          uNight: { value: tex.night },
          uClouds: { value: tex.clouds },
          uMask: { value: tex.mask },
          uLightDir: { value: new THREE.Vector3(1, 0, 0) },
          uTime: { value: 0 },
          uCloudOpacity: { value: 0.62 },
          uNightLights: { value: 1.15 },
        },
      }),
    [tex]
  );

  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVert,
        fragmentShader: atmosphereFrag,
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color('#5f9bff') },
          uLightDir: { value: new THREE.Vector3(1, 0, 0) },
          uStrength: { value: 0.52 },
          uPower: { value: 4.6 },
        },
      }),
    []
  );

  useFrame((_, dt) => {
    const g = root.current;
    if (!g) return;
    const s = readStore();

    // rotation eases off as the camera closes in, so the hero shot holds still
    const closing = smoothstep(0.60, 0.74, s.progress);
    const spin = THREE.MathUtils.lerp(1, 0.22, closing);
    time.current += dt * spin;

    const dir = g.position.clone().negate().normalize();
    mat.uniforms.uLightDir.value.copy(dir);
    mat.uniforms.uTime.value = time.current;
    atmoMat.uniforms.uLightDir.value.copy(dir);

    if (body.current) body.current.rotation.y += (dt * spin) / def.spin * Math.PI * 2;

    moonT.current += dt * 0.12 * spin;
    if (moonRef.current) {
      const m = def.moons![0];
      moonRef.current.position.set(
        Math.cos(moonT.current) * m.dist,
        Math.sin(moonT.current * 0.4) * 1.1,
        Math.sin(moonT.current) * m.dist
      );
    }

    sel.current = damp(sel.current, selected ? 1 : 0, 6, dt);
    atmoMat.uniforms.uStrength.value = 0.52 + sel.current * 0.3;

    if (register) register('earth', g);
  });

  return (
    <group ref={root}>
      <group ref={body} rotation={[0, 0, (def.tilt * Math.PI) / 180]}>
        <mesh
          material={mat}
          onClick={(e) => {
            e.stopPropagation();
            onSelect('earth');
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover('earth');
          }}
          onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[def.radius, segments, segments / 2]} />
        </mesh>
      </group>
      <mesh material={atmoMat} renderOrder={3}>
        <sphereGeometry args={[def.radius * 1.035, segments, segments / 2]} />
      </mesh>
      <mesh ref={moonRef}>
        <sphereGeometry args={[def.moons![0].size, 24, 16]} />
        <meshStandardMaterial color="#c9c5bd" roughness={1} metalness={0} />
      </mesh>
    </group>
  );
}
