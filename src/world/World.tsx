import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import Museum from './Museum';
import Player from './Player';
import Avatar from './Avatar';
import HUD from './HUD';
import ChatPanel from './ChatPanel';
import { STATIONS } from './worldLayout';
import { useWorldControls } from './useWorldControls';
import { useAdaptiveQuality } from '../hooks/useAdaptiveQuality';
import { useStore, type Quality } from '../state/useStore';
import { waitForFonts } from '../utils/labelTexture';
import { installDevHarness } from '../three/devHarness';

/**
 * 07 — THE WORLD
 *
 * A separate canvas and a separate scene from the journey: different lighting
 * model, different camera, different input. Loaded on demand so none of its
 * cost is paid by anyone who never reaches the threshold.
 */
export default function World({ quality }: { quality: Quality }) {
  const { dpr, tier, onDecline, onIncline, onFallback } = useAdaptiveQuality(quality);
  const [fontsReady, setFontsReady] = useState(false);
  const controls = useWorldControls(true);
  const chatWith = useStore((s) => s.chatWith);
  const setChatWith = useStore((s) => s.setChatWith);

  // labels are baked to canvas, so the webfonts must resolve first
  useEffect(() => {
    let alive = true;
    waitForFonts().then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Escape closes the conversation before it leaves the world
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (useStore.getState().chatWith) setChatWith(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setChatWith]);

  // release pointer lock whenever a conversation opens
  useEffect(() => {
    if (chatWith && document.pointerLockElement) document.exitPointerLock?.();
  }, [chatWith]);

  return (
    <div className="fixed inset-0 z-[60] bg-[#02030a]">
      <Canvas
        className="stack"
        dpr={dpr}
        shadows={false}
        gl={{
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          preserveDrawingBuffer: import.meta.env.DEV,
        }}
        camera={{ fov: 72, near: 0.1, far: 600, position: [0, 1.68, 14] }}
        onCreated={(state) => {
          const { gl, scene } = state;
          // Asking for a restore is opt-in: without preventDefault the browser
          // never fires contextrestored and a recoverable blip is permanent.
          gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault());
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          scene.background = new THREE.Color('#02030a');
          scene.fog = new THREE.FogExp2('#04050c', 0.0135);
          if (import.meta.env.DEV) installDevHarness(state);
        }}
      >
        <PerformanceMonitor
          ms={300}
          iterations={8}
          flipflops={6}
          onDecline={onDecline}
          onIncline={onIncline}
          onFallback={onFallback}
        />
        <Suspense fallback={null}>
          <Museum quality={tier} />
          {fontsReady &&
            STATIONS.map((s) => <Avatar key={s.id} station={s} quality={tier} />)}
          <Player controls={controls} />
        </Suspense>
      </Canvas>

      <HUD controls={controls} />
      <ChatPanel />
    </div>
  );
}
