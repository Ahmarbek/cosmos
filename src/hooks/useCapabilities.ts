import { useEffect } from 'react';
import { useStore, type Quality } from '../state/useStore';

export interface Caps {
  webgl: boolean;
  quality: Quality;
  isTouch: boolean;
  reducedMotion: boolean;
  maxDpr: number;
}

let cached: Caps | null = null;

/** One-time synchronous capability probe. */
export function detectCapabilities(): Caps {
  if (cached) return cached;

  let webgl = false;
  let renderer = '';
  try {
    const c = document.createElement('canvas');
    // WebGL 2 specifically: three no longer has a WebGL 1 path, so a context
    // this probe accepts but the renderer cannot use is worse than no context
    // at all — the visitor gets a black canvas instead of the 2D film.
    const gl = c.getContext('webgl2');
    if (gl) {
      webgl = true;
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (dbg) renderer = String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '');
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
  } catch {
    webgl = false;
  }

  const isTouch =
    window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cores = navigator.hardwareConcurrency ?? 4;
  // Chrome only. Absent elsewhere — and the old default of 4 meant every
  // visitor on Firefox and Safari failed the memory test and was capped at
  // the medium tier on hardware that had no trouble with the high one.
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  const small = Math.min(window.innerWidth, window.innerHeight) < 640;
  const softwareGpu = /swiftshader|software|llvmpipe|basic render/i.test(renderer);

  let quality: Quality = 'high';
  if (isTouch || small) quality = 'medium';
  if (cores <= 4 || (mem !== undefined && mem <= 4)) {
    quality = quality === 'high' ? 'medium' : 'low';
  }
  if (cores <= 2 || softwareGpu || reducedMotion) quality = 'low';

  const maxDpr = quality === 'high' ? 1.75 : quality === 'medium' ? 1.35 : 1;
  cached = { webgl, quality, isTouch, reducedMotion, maxDpr };
  return cached;
}

export function useCapabilities() {
  useEffect(() => {
    const caps = detectCapabilities();
    const s = useStore.getState();
    s.setWebgl(caps.webgl);
    s.setQuality(caps.quality);
    s.setIsTouch(caps.isTouch);
    s.setReducedMotion(caps.reducedMotion);
  }, []);
}
