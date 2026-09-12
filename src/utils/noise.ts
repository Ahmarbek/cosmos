/** Tiny deterministic value-noise + fbm, used for CPU-side texture baking. */

function hash2(x: number, y: number, seed: number) {
  let h = x * 374761393 + y * 668265263 + seed * 2246822519;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}

const fade = (t: number) => t * t * (3 - 2 * t);

export function valueNoise2(x: number, y: number, seed = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const a = hash2(xi, yi, seed);
  const b = hash2(xi + 1, yi, seed);
  const c = hash2(xi, yi + 1, seed);
  const d = hash2(xi + 1, yi + 1, seed);
  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
}

/** Seamless in x: the field wraps at `period` so the globe has no visible seam. */
export function tileNoise2(x: number, y: number, period: number, seed = 0) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = fade(x - xi);
  const yf = fade(y - yi);
  const wrap = (v: number) => ((v % period) + period) % period;
  const x0 = wrap(xi);
  const x1 = wrap(xi + 1);
  const a = hash2(x0, yi, seed);
  const b = hash2(x1, yi, seed);
  const c = hash2(x0, yi + 1, seed);
  const d = hash2(x1, yi + 1, seed);
  return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf;
}

export function fbm2(x: number, y: number, octaves = 4, seed = 0) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * valueNoise2(x * f, y * f, seed + i * 17);
    f *= 2.03;
    amp *= 0.5;
  }
  return sum;
}

export function fbmTile(x: number, y: number, period: number, octaves = 4, seed = 0) {
  let sum = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    sum += amp * tileNoise2(x * f, y * f, period * f, seed + i * 17);
    f *= 2;
    amp *= 0.5;
  }
  return sum;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
