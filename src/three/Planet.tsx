import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { planetFrag, planetVert } from '../shaders/planet';
import { atmosphereFrag, atmosphereVert, ringFrag, ringVert } from '../shaders/star-and-shells';
import type { PlanetDef } from '../data/planets';
import { damp } from '../utils/math';

const STYLE_INDEX: Record<PlanetDef['style'], number> = {
  cratered: 0,
  clouded: 1,
  terrestrial: 2,
  desert: 3,
  banded: 4,
  ice: 5,
};

interface Props {
  def: PlanetDef;
  segments: number;
  selected: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** the group is positioned by the parent; this ref reports world position back */
  register?: (id: string, obj: THREE.Object3D) => void;
}

/**
 * One planet: procedural surface, optional atmosphere shell, optional rings,
 * optional moons. The sun sits at the parent group's origin, so the light
 * direction is simply the negated local position — no scene graph lookups.
 */
export default function Planet({ def, segments, selected, onSelect, onHover, register }: Props) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const sel = useRef(0);
  const time = useRef(Math.random() * 100);

  const seed = useMemo(() => (def.id === 'jupiter' ? 0.9 : Math.random() * 0.4), [def.id]);
  /** Scratch for the light direction; eight planets at sixty hertz is enough
      allocation to be worth not doing. */
  const lightDir = useMemo(() => new THREE.Vector3(), []);

  const surfaceMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVert,
        fragmentShader: planetFrag,
        uniforms: {
          uColorA: { value: new THREE.Color(def.colorA) },
          uColorB: { value: new THREE.Color(def.colorB) },
          uLightDir: { value: new THREE.Vector3(1, 0, 0) },
          uAtmo: { value: new THREE.Color(def.atmosphere || def.colorA) },
          uAtmoStrength: { value: def.atmosphereStrength },
          uTime: { value: 0 },
          uStyle: { value: STYLE_INDEX[def.style] },
          uSeed: { value: seed },
          uSelected: { value: 0 },
        },
      }),
    [def, seed]
  );

  const atmoMat = useMemo(() => {
    if (!def.atmosphere) return null;
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVert,
      fragmentShader: atmosphereFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color(def.atmosphere) },
        uLightDir: { value: new THREE.Vector3(1, 0, 0) },
        uStrength: { value: def.atmosphereStrength * 0.9 },
        uPower: { value: 3.0 },
      },
    });
  }, [def]);

  const ringMat = useMemo(() => {
    if (!def.ring) return null;
    return new THREE.ShaderMaterial({
      vertexShader: ringVert,
      fragmentShader: ringFrag,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(def.ring.color) },
        uLightDir: { value: new THREE.Vector3(1, 0, 0) },
        uCenter: { value: new THREE.Vector3() },
        uPlanetRadius: { value: def.radius },
        uInner: { value: def.ring.inner },
        uOuter: { value: def.ring.outer },
      },
    });
  }, [def]);

  useFrame((_, dt) => {
    time.current += dt;
    const g = root.current;
    if (!g) return;

    // sun is at the parent origin, so this is the direction toward the light
    const dir = lightDir.copy(g.position).negate().normalize();
    surfaceMat.uniforms.uLightDir.value.copy(dir);
    surfaceMat.uniforms.uTime.value = time.current;
    if (atmoMat) atmoMat.uniforms.uLightDir.value.copy(dir);
    if (ringMat) {
      ringMat.uniforms.uLightDir.value.copy(dir);
      g.getWorldPosition(ringMat.uniforms.uCenter.value);
    }

    sel.current = damp(sel.current, selected ? 1 : 0, 6, dt);
    surfaceMat.uniforms.uSelected.value = sel.current;

    if (body.current) body.current.rotation.y += (dt / def.spin) * Math.PI * 2;
    if (register) register(def.id, g);
  });

  return (
    <group ref={root}>
      <group ref={body} rotation={[0, 0, (def.tilt * Math.PI) / 180]}>
        <mesh
          material={surfaceMat}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(def.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            onHover(def.id);
          }}
          onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[def.radius, segments, segments / 2]} />
        </mesh>
        {atmoMat && (
          <mesh material={atmoMat} renderOrder={3}>
            <sphereGeometry args={[def.radius * 1.055, segments, segments / 2]} />
          </mesh>
        )}
      </group>

      {def.ring && ringMat && (
        <mesh
          material={ringMat}
          rotation={[Math.PI / 2 + (def.ring.tilt * Math.PI) / 180, 0, 0]}
          renderOrder={2}
        >
          <ringGeometry args={[def.ring.inner, def.ring.outer, 128, 1]} />
        </mesh>
      )}

      {def.moons?.map((m, i) => (
        <Moon key={i} def={m} index={i} />
      ))}
    </group>
  );
}

function Moon({ def, index }: { def: { dist: number; size: number; speed: number }; index: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(index * 2.1);
  useFrame((_, dt) => {
    t.current += dt * def.speed * 0.25;
    if (ref.current) {
      ref.current.position.set(
        Math.cos(t.current) * def.dist,
        Math.sin(t.current * 0.6) * def.dist * 0.12,
        Math.sin(t.current) * def.dist
      );
    }
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[def.size, 16, 12]} />
      <meshStandardMaterial color="#b6b2ab" roughness={0.95} metalness={0} />
    </mesh>
  );
}
