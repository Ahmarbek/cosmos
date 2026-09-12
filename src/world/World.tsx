import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import Museum from './Museum';
import Player from './Player';
import Avatar from './Avatar';
import HUD from './HUD';
import ChatPanel from './ChatPanel';
import { STATIONS } from './worldLayout';
import { useWorldControls } from './useWorldControls';
import { detectCapabilities } from '../hooks/useCapabilities';
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
  const caps = detectCapabilities();
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, caps.maxDpr));
  const [tier, setTier] = useState<Quality>(quality);
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
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          preserveDrawingBuffer: import.meta.env.DEV,
        }}
        camera={{ fov: 72, near: 0.1, far: 600, position: [0, 1.68, 14] }}
        onCreated={(state) => {
          const { gl, scene } = state;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.1;
          scene.background = new THREE.Color('#02030a');
          scene.fog = new THREE.FogExp2('#04050c', 0.0135);
          if (import.meta.env.DEV) installDevHarness(state);
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setDpr((d) => Math.max(0.7, d * 0.85));
            setTier((t) => (t === 'high' ? 'medium' : 'low'));
          }}
        />
        <AdaptiveDpr />
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
