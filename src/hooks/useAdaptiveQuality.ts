import { useCallback, useMemo, useRef, useState } from 'react';
import { detectCapabilities } from './useCapabilities';
import { clamp } from '../utils/math';
import type { Quality } from '../state/useStore';

/**
 * Runtime quality control for a canvas.
 *
 * Two knobs, and they are not interchangeable. Pixel ratio is continuous,
 * instant, reversible and very close to invisible — a scene at 0.85 of its
 * native density reads as the same picture. The quality tier is none of those
 * things: changing it rebuilds star buffers, re-tessellates every sphere,
 * recompiles the geodesic integrator and rebuilds ten merged humanoids, which
 * is a stall of several frames in its own right.
 *
 * So resolution moves first and moves both ways, and the tier only drops once
 * resolution has run out of room, no sooner than a few seconds after the last
 * time it moved. That ordering matters more than it sounds: a tier change is
 * itself a frame-time spike, so a monitor that reaches for the tier on the
 * first sign of trouble triggers the very decline it is reacting to, and the
 * scene ratchets down to its lowest setting within seconds of loading and
 * stays there for the rest of the visit — slower to get to, and worse to look
 * at, than if nothing had adapted at all.
 */

/**
 * Declines are ignored for this long after the canvas mounts. Shader
 * compilation, texture upload and the first geometry builds all land in the
 * opening seconds and none of them say anything about what the device can
 * sustain afterwards.
 */
const WARMUP_MS = 4500;

/** Minimum gap between tier changes. */
const TIER_COOLDOWN_MS = 8000;

/** Sustained declines at the resolution floor before the tier gives way. */
const DECLINES_BEFORE_TIER = 3;

const LOWER: Record<Quality, Quality> = { high: 'medium', medium: 'low', low: 'low' };

export interface AdaptiveQuality {
  /** Pixel ratio to hand the canvas. */
  dpr: number;
  /** Quality tier the scene should build at. */
  tier: Quality;
  onDecline: () => void;
  onIncline: () => void;
  /** Called once the monitor gives up oscillating; settle rather than collapse. */
  onFallback: () => void;
}

export function useAdaptiveQuality(initial: Quality): AdaptiveQuality {
  const caps = detectCapabilities();

  const { ceiling, floor } = useMemo(() => {
    const c = Math.min(window.devicePixelRatio || 1, caps.maxDpr);
    // Never below three quarters of native, and never below 0.7 outright:
    // past that the picture is soft enough that the visitor reads it as the
    // site being broken rather than the site being fast.
    return { ceiling: c, floor: Math.max(0.7, c * 0.62) };
  }, [caps.maxDpr]);

  const [dpr, setDprState] = useState(ceiling);
  const [tier, setTierState] = useState<Quality>(initial);

  const dprRef = useRef(ceiling);
  const tierRef = useRef<Quality>(initial);
  const declines = useRef(0);
  const mounted = useRef(typeof performance !== 'undefined' ? performance.now() : 0);
  const lastTierChange = useRef(0);

  /** Returns false when the value was already at the requested end of its range. */
  const setDpr = useCallback(
    (next: number) => {
      const v = clamp(next, floor, ceiling);
      if (Math.abs(v - dprRef.current) < 0.02) return false;
      dprRef.current = v;
      setDprState(v);
      return true;
    },
    [ceiling, floor]
  );

  const onDecline = useCallback(() => {
    const now = performance.now();
    if (now - mounted.current < WARMUP_MS) return;

    // Resolution first — it is the cheap, reversible knob.
    if (setDpr(dprRef.current - 0.18)) {
      declines.current = 0;
      return;
    }

    declines.current += 1;
    if (declines.current < DECLINES_BEFORE_TIER) return;
    if (now - lastTierChange.current < TIER_COOLDOWN_MS) return;
    if (tierRef.current === 'low') return;

    declines.current = 0;
    lastTierChange.current = now;
    tierRef.current = LOWER[tierRef.current];
    setTierState(tierRef.current);
  }, [setDpr]);

  // The tier itself is never raised again. Rebuilding upward costs exactly the
  // stall that dropping it was meant to avoid, and a visitor who has settled
  // into a steady frame rate has nothing to gain from being interrupted.
  const onIncline = useCallback(() => {
    declines.current = 0;
    // Recovery is deliberately slower than the drop, so a scene that is only
    // just keeping up drifts upward instead of flickering between two
    // resolutions every couple of seconds.
    setDpr(dprRef.current + 0.08);
  }, [setDpr]);

  /**
   * The monitor gives up after enough changes of direction and stops adjusting.
   * That is not a signal to go to the lowest setting — this journey alternates
   * between a per-pixel geodesic trace and an almost empty star field, so some
   * flip-flopping is the scene being honest rather than the device failing.
   * Whatever resolution the declines have already converged on is the evidence;
   * take one more step down for margin and leave it there.
   */
  const onFallback = useCallback(() => {
    setDpr(dprRef.current - 0.18);
  }, [setDpr]);

  return { dpr, tier, onDecline, onIncline, onFallback };
}
