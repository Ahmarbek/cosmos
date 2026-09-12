import { useStore } from '../state/useStore';

import type { RootState } from '@react-three/fiber';

type Advance = (timestamp: number) => void;

/**
 * Development-only inspection harness.
 *
 * A backgrounded tab issues no animation frames, which makes a scroll-driven
 * WebGL scene impossible to inspect from an automated browser. This installs a
 * manual clock on window: seek the journey to a position, step the render loop
 * a fixed number of frames, and read back a settled frame. Dev builds only.
 */
export function installDevHarness(state: RootState) {
  if (!import.meta.env.DEV) return;
  const advance: Advance = state.advance;
  let t = performance.now();
  const w = window as unknown as Record<string, unknown>;

  // r3f derives its frame delta from THREE.Clock, which reads the real wall
  // clock — so stepping in a tight loop would hand every frame a delta of
  // roughly zero and nothing would move. Rewinding oldTime before each advance
  // gives the loop the fixed timestep it thinks it measured.
  const step = (frames = 90, dt = 16.6667) => {
    for (let i = 0; i < frames; i++) {
      t += dt;
      state.clock.oldTime = performance.now() - dt;
      advance(t);
    }
    return frames;
  };

  w.__r3f = state;
  w.__step = step;

  /**
   * Pin the journey to a position with the page scrolled to the top, so an
   * embedded preview that captures the document from its origin still sees the
   * right chapter. The scroll loop is continuously overridden rather than
   * disabled, which keeps the rest of the app on its normal code path.
   */
  w.__hold = (p: number | null) => {
    w.__holdP = p;
    if (p === null) return 'released';
    useStore.getState().setStage('journey');
    window.scrollTo(0, 0);
    useStore.getState().setProgress(p, p);
    step(320);
    return p;
  };
  w.__seek = (p: number, frames = 180) => {
    const s = useStore.getState();
    s.setStage('journey');
    s.setProgress(p, p);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, max * p);
    step(frames);
    // the live scroll loop would otherwise damp back toward the real scrollbar
    useStore.getState().setProgress(p, p);
    step(10);
    return p;
  };
}
