import { useEffect, useRef } from 'react';
import { useStore } from '../state/useStore';

/**
 * The whole experience is driven by one number.
 *
 * Native scrolling stays intact (wheel, trackpad, keyboard, touch, scrollbar all
 * behave normally) but the value the scenes read is critically damped. That
 * damping is what makes the camera feel like it has mass instead of being
 * bolted to the scrollbar.
 */
export function useScrollJourney(enabled: boolean) {
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const reduced = useStore.getState().reducedMotion;
    const smoothing = reduced ? 0.4 : 0.075;

    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };

    // Dev inspection can pin the journey to a position; the loop keeps running
    // so everything else behaves normally, it just stops writing.
    const holdP = () =>
      import.meta.env.DEV
        ? (window as unknown as { __holdP?: number | null }).__holdP
        : null;

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last) / 16.6667;
      last = now;
      const prev = current.current;
      const k = 1 - Math.pow(1 - smoothing, dt);
      current.current += (target.current - current.current) * k;
      if (Math.abs(target.current - current.current) < 1e-5) current.current = target.current;

      const st = useStore.getState();
      const pinned = holdP();
      if (pinned != null) {
        if (st.progress !== pinned) st.setProgress(pinned, pinned);
        raf.current = requestAnimationFrame(tick);
        return;
      }
      if (current.current !== st.progress || target.current !== st.rawProgress) {
        st.setProgress(current.current, target.current);
      }
      const inst = ((current.current - prev) / Math.max(dt, 1e-4)) * 60;
      const vel = st.velocity + (inst - st.velocity) * 0.15;
      if (Math.abs(vel - st.velocity) > 1e-4) st.setVelocity(vel);

      raf.current = requestAnimationFrame(tick);
    };

    read();
    current.current = target.current;
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
      cancelAnimationFrame(raf.current);
    };
  }, [enabled]);
}

/** Jump the page to a normalized journey position. */
export function scrollToProgress(p: number, behavior: ScrollBehavior = 'smooth') {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: max * p, behavior });
}
