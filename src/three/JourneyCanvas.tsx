import { Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import Rig from './Rig';
import Starfield from './Starfield';
import Nebulae from './Nebulae';
import BlackHole from './BlackHole';
import SolarSystem from './SolarSystem';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { installDevHarness } from './devHarness';
import type { Quality } from '../state/useStore';

const STAR_COUNT: Record<Quality, number> = { low: 2600, medium: 6000, high: 11000 };

/**
 * One canvas for the entire journey.
 *
 * Everything lives in a single scene and a single camera flight; sections are
 * regions of space rather than separate renders. Quality is chosen once from
 * the device probe and then trimmed at runtime if frames start to slip — see
 * useAdaptiveQuality for why resolution and tier are not treated alike.
 */
export default function JourneyCanvas({ quality }: { quality: Quality }) {
  const { dpr, tier, onDecline, onIncline, onFallback } = useAdaptiveQuality(quality);

  return (
    <Canvas
      className="stack"
      dpr={dpr}
      gl={{
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: true,
        preserveDrawingBuffer: import.meta.env.DEV,
      }}
      camera={{ fov: 62, near: 0.4, far: 9000, position: [0, 0, 150] }}
      onCreated={(state) => {
        const { gl, scene } = state;
        // Asking for a restore is opt-in: without preventDefault the browser
        // never fires contextrestored and a recoverable blip is permanent.
        gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
        gl.toneMapping = THREE.NoToneMapping;
        gl.setClearColor('#000000', 1);
        scene.background = new THREE.Color('#000000');
        if (import.meta.env.DEV) installDevHarness(state);
      }}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
    >
      {/* A long sampling window on purpose: the journey is scroll-driven, and a
          short one reads the frame the camera arrives at the black hole as a
          collapse rather than as one expensive moment. */}
      <PerformanceMonitor
        ms={300}
        iterations={8}
        flipflops={6}
        onDecline={onDecline}
        onIncline={onIncline}
        onFallback={onFallback}
      />
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
