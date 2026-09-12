import { useEffect, useRef } from 'react';

export interface ControlState {
  forward: number;
  strafe: number;
  jump: boolean;
  run: boolean;
  interact: boolean;
  /** touch look delta, consumed each frame */
  lookX: number;
  lookY: number;
}

/**
 * Keyboard and touch input for the world.
 *
 * Held in a ref rather than React state: this is read every frame by the
 * physics step and must never cause a render.
 */
export function useWorldControls(enabled: boolean) {
  const state = useRef<ControlState>({
    forward: 0,
    strafe: 0,
    jump: false,
    run: false,
    interact: false,
    lookX: 0,
    lookY: 0,
  });

  useEffect(() => {
    if (!enabled) return;
    const keys = new Set<string>();

    const apply = () => {
      const s = state.current;
      s.forward = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
      s.strafe = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      s.jump = keys.has('Space');
      s.run = keys.has('ShiftLeft') || keys.has('ShiftRight');
    };

    const down = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea/i.test(target.tagName)) return;
      if (e.code === 'Space') e.preventDefault();
      keys.add(e.code);
      if (e.code === 'KeyE') state.current.interact = true;
      apply();
    };
    const up = (e: KeyboardEvent) => {
      keys.delete(e.code);
      apply();
    };
    const blur = () => {
      keys.clear();
      apply();
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  }, [enabled]);

  return state;
}
