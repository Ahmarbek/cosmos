import * as THREE from 'three';

/**
 * Type baked to a canvas and used as a texture.
 *
 * The alternative — an SDF text library — would pull a font over the network at
 * runtime. Baking instead keeps the world self-contained and lets the labels
 * use the same two typefaces as the rest of the site, once the webfonts have
 * loaded (see waitForFonts).
 */

export interface LabelOptions {
  text: string;
  sub?: string;
  width?: number;
  height?: number;
  color?: string;
  subColor?: string;
  font?: string;
  subFont?: string;
  align?: CanvasTextAlign;
  letterSpacing?: string;
}

const cache = new Map<string, THREE.CanvasTexture>();

export function makeLabelTexture(o: LabelOptions): THREE.CanvasTexture {
  const key = JSON.stringify(o);
  const hit = cache.get(key);
  if (hit) return hit;

  const W = o.width ?? 1024;
  const H = o.height ?? 256;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d')!;

  ctx.clearRect(0, 0, W, H);
  ctx.textAlign = o.align ?? 'center';
  ctx.textBaseline = 'middle';
  const x = o.align === 'left' ? 24 : o.align === 'right' ? W - 24 : W / 2;

  // main line
  ctx.font = o.font ?? `400 ${Math.round(H * 0.38)}px "Instrument Serif", Georgia, serif`;
  ctx.fillStyle = o.color ?? '#EAEAF2';
  ctx.shadowColor = 'rgba(140,160,255,0.5)';
  ctx.shadowBlur = H * 0.09;
  ctx.fillText(o.text, x, o.sub ? H * 0.40 : H * 0.5);

  if (o.sub) {
    ctx.shadowBlur = 0;
    ctx.font = o.subFont ?? `400 ${Math.round(H * 0.11)}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = o.subColor ?? 'rgba(234,234,242,0.55)';
    if ('letterSpacing' in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing =
        o.letterSpacing ?? '0.28em';
    }
    ctx.fillText(o.sub.toUpperCase(), x, H * 0.72);
  }

  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  t.needsUpdate = true;
  cache.set(key, t);
  return t;
}

/** Webfonts must be resolved before baking, or the labels fall back to serif. */
export async function waitForFonts() {
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* font loading API unavailable — the fallback stack is fine */
  }
}
