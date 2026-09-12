import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { PLANETS } from '../data/planets';
import { readStore } from '../state/useStore';
import { damp, smoothstep } from '../utils/math';

/**
 * Faint orbit traces. They are the only non-physical element in the system
 * view, and they earn their place: without them the spacing of the planets is
 * impossible to read at a glance.
 */
export default function OrbitRings({ opacity = 0.16 }: { opacity?: number }) {
  const group = useRef<THREE.Group>(null);
  const fade = useRef(1);

  // the traces are scaffolding for the system view; once the camera commits to
  // Earth they would only clutter the frame
  useFrame((_, dt) => {
    const target = 1 - smoothstep(0.59, 0.655, readStore().progress);
    fade.current = damp(fade.current, target, 5, dt);
    const g = group.current;
    if (!g) return;
    g.visible = fade.current > 0.004;
    g.children.forEach((c) => {
      const m = (c as THREE.LineLoop).material as THREE.LineBasicMaterial;
      m.opacity = opacity * fade.current;
    });
  });

  const rings = useMemo(
    () =>
      PLANETS.map((p) => {
        const pts: THREE.Vector3[] = [];
        const N = 160;
        for (let i = 0; i <= N; i++) {
          const a = (i / N) * Math.PI * 2;
          pts.push(new THREE.Vector3(Math.cos(a) * p.orbit, 0, Math.sin(a) * p.orbit));
        }
        return { id: p.id, geo: new THREE.BufferGeometry().setFromPoints(pts) };
      }),
    []
  );

  return (
    <group ref={group}>
      {rings.map((r) => (
        <lineLoop key={r.id} geometry={r.geo}>
          <lineBasicMaterial
            color="#8fb4ff"
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      ))}
    </group>
  );
}
