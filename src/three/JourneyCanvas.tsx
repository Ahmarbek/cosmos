import { Suspense, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import Rig from './Rig';
import Starfield from './Starfield';
import Nebulae from './Nebulae';
import BlackHole from './BlackHole';
import SolarSystem from './SolarSystem';
import { detectCapabilities } from '../hooks/useCapabilities';
import { installDevHarness } from './devHarness';
import type { Quality } from '../state/useStore';

const STAR_COUNT: Record<Quality, number> = { low: 2600, medium: 6000, high: 11000 };

/**
 * One canvas for the entire journey.
 *
 * Everything lives in a single scene and a single camera flight; sections are
 * regions of space rather than separate renders. Quality is chosen once from
 * the device probe and then trimmed further at runtime if frames start to slip.
 */
export default function JourneyCanvas({ quality }: { quality: Quality }) {
  const caps = detectCapabilities();
  const [dpr, setDpr] = useState<number>(Math.min(window.devicePixelRatio || 1, caps.maxDpr));
  const [tier, setTier] = useState<Quality>(quality);

  return (
    <Canvas
      className="stack"
      dpr={dpr}
      gl={{
        antialias: tier !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: import.meta.env.DEV,
      }}
      camera={{ fov: 62, near: 0.4, far: 9000, position: [0, 0, 150] }}
      onCreated={(state) => {
        const { gl, scene } = state;
        gl.toneMapping = THREE.NoToneMapping;
        gl.setClearColor('#000000', 1);
        scene.background = new THREE.Color('#000000');
        if (import.meta.env.DEV) installDevHarness(state);
      }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr((d) => Math.max(0.75, d * 0.85));
          setTier((t) => (t === 'high' ? 'medium' : 'low'));
        }}
      />
      <AdaptiveDpr />
      <Suspense fallback={null}>
        <Rig />
        <Starfield count={STAR_COUNT[tier]} pixelRatio={dpr} />
        <Nebulae />
        <BlackHole quality={tier} />
        <SolarSystem quality={tier} />
      </Suspense>
    </Canvas>
  );
}
