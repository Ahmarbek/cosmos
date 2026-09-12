export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a || 1e-6));
  return t * t * (3 - 2 * t);
};

/** Normalized position inside a range, clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a || 1e-6));

/** Rises over [a,b], holds, falls over [c,d]. Cue visibility in one call. */
export const band = (v: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, v) * (1 - smoothstep(c, d, v));

/** Frame-rate independent damping toward a target. */
export const damp = (cur: number, target: number, lambda: number, dt: number) =>
  lerp(cur, target, 1 - Math.exp(-lambda * dt));

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
