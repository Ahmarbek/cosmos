import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import Sun from './Sun';
import Planet from './Planet';
import Earth3D from './Earth3D';
import OrbitRings from './OrbitRings';
import { PLANETS } from '../data/planets';
import { ORBIT_SPEED, SS_POS } from './constants';
import { earthWorldPos, planetWorldPos } from './shared';
import { readStore, useStore, type Quality } from '../state/useStore';
import { clamp, smoothstep } from '../utils/math';

const SEGMENTS: Record<Quality, number> = { low: 24, medium: 40, high: 64 };

/**
 * The solar system as an interactive visualisation.
 *
 * Sizes and orbital radii are compressed for legibility — stated plainly in the
 * UI — while ordering, relative periods, rotation directions and axial tilts
 * follow the real bodies. Orbital motion slows to a near stop as the camera
 * closes on Earth, so the hero shot is not chasing a moving target.
 */
export default function SolarSystem({ quality }: { quality: Quality }) {
  const group = useRef<THREE.Group>(null);
  const orbitT = useRef(0);
  const refs = useRef<Record<string, THREE.Object3D>>({});
  const selected = useStore((s) => s.selectedPlanet);
  const setSelected = useStore((s) => s.setSelectedPlanet);
  const seg = SEGMENTS[quality];

  const register = useCallback((id: string, obj: THREE.Object3D) => {
    refs.current[id] = obj;
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      if (readStore().interactive !== 'solar') return;
      setSelected(readStore().selectedPlanet === id ? null : id);
    },
    [setSelected]
  );

  const handleHover = useCallback((id: string | null) => {
    if (readStore().interactive !== 'solar') return;
    document.body.dataset.planetHover = id ?? '';
  }, []);

  useFrame((_, dt) => {
    const s = readStore();
    // fade the whole system in as the camera arrives, out as it leaves
    const vis = smoothstep(0.40, 0.47, s.progress);
    const g = group.current;
    if (!g) return;
    g.visible = vis > 0.001;
    if (!g.visible) return;

    const closing = smoothstep(0.62, 0.76, s.progress);
    orbitT.current += dt * (1 - closing * 0.94);

    // Earth's chapter is a portrait, not a group shot: the rest of the system
    // recedes so nothing else is competing in frame when the camera arrives.
    const solo = smoothstep(0.60, 0.665, s.progress);

    for (const p of PLANETS) {
      const obj = refs.current[p.id];
      if (!obj) continue;
      const a = (orbitT.current * ORBIT_SPEED * 2 * Math.PI) / p.period + p.orbit * 0.37;
      obj.position.set(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit);
      if (p.id !== 'earth') {
        const k = Math.max(0.0001, 1 - solo);
        obj.scale.setScalar(k);
        obj.visible = k > 0.01;
      }
      const wp = planetWorldPos[p.id] ?? (planetWorldPos[p.id] = new THREE.Vector3());
      obj.getWorldPosition(wp);
      if (p.id === 'earth') earthWorldPos.copy(wp);
    }
  });

  return (
    <group ref={group} position={SS_POS} visible={false}>
      <Sun segments={seg} />
      <OrbitRings opacity={0.14} />
      {PLANETS.map((p) =>
        p.id === 'earth' ? (
          <Earth3D
            key={p.id}
            segments={Math.max(seg, 48)}
            selected={selected === 'earth'}
            onSelect={handleSelect}
            onHover={handleHover}
            register={register}
          />
        ) : (
          <Planet
            key={p.id}
            def={p}
            segments={seg}
            selected={selected === p.id}
            onSelect={handleSelect}
            onHover={handleHover}
            register={register}
          />
        )
      )}
      <ambientLight intensity={0.05} />
    </group>
  );
}

/** Distance from the system centre that frames the whole thing. */
export const SYSTEM_FRAME_RADIUS = clamp(PLANETS[PLANETS.length - 1].orbit * 1.55, 200, 900);
