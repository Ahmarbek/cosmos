import { mulberry32 } from '../../utils/noise';
import type { Icon } from '../../data/icons';

export interface FieldPath {
  d: string;
  w: number;
  o: number;
  /** 0 = first colour, 1 = second */
  c: number;
  cap?: 'round';
}

const hashId = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * A generative portrait system, drawn on a 100 x 120 field.
 *
 * Each discipline gets its own structure — a musician is rendered as sound, a
 * scientist as orbits, an athlete as motion — and the parameters inside that
 * structure are seeded from the person's name. Ten cards side by side therefore
 * read as ten different objects rather than ten recolours of one shape, which
 * is the failure mode of a single generative rule applied to a whole set.
 */
export function buildField(icon: Icon): FieldPath[] {
  const rand = mulberry32(hashId(icon.id));
  const out: FieldPath[] = [];
  const push = (d: string, w: number, o: number, c: number, cap?: 'round') =>
    out.push({ d, w, o, c, cap });

  switch (icon.field) {
    case 'music': {
      // stacked waveforms, dense where the performance peaks
      const rows = 30 + Math.floor(rand() * 8);
      for (let i = 0; i < rows; i++) {
        const t = i / (rows - 1);
        const y = 12 + t * 96;
        const env = Math.exp(-Math.pow((t - 0.42) / 0.3, 2));
        const amp = (1.5 + env * 13) * (0.55 + rand() * 0.9);
        const freq = 2 + rand() * 5 + env * 5;
        const ph = rand() * 7;
        const pts: string[] = [];
        for (let j = 0; j <= 40; j++) {
          const u = j / 40;
          const win = Math.sin(u * Math.PI);
          const v =
            Math.sin(u * freq * 6.28 + ph) * 0.7 + Math.sin(u * freq * 2.7 + ph * 2) * 0.3;
          pts.push(`${(6 + u * 88).toFixed(2)},${(y + v * amp * win).toFixed(2)}`);
        }
        push(`M${pts.join(' L')}`, 0.3 + env * 0.55, 0.2 + env * 0.7, t);
      }
      break;
    }

    case 'science': {
      // nested orbits at shared focus, plus one traced particle path
      const shells = 7 + Math.floor(rand() * 4);
      for (let i = 0; i < shells; i++) {
        const t = i / (shells - 1);
        const rx = 8 + t * 40 + rand() * 3;
        const ry = rx * (0.24 + rand() * 0.5);
        const rot = rand() * 180;
        push(
          `M${50 - rx},60 a${rx},${ry} ${rot} 1,0 ${rx * 2},0 a${rx},${ry} ${rot} 1,0 ${-rx * 2},0`,
          0.32 + rand() * 0.35,
          0.3 + (1 - t) * 0.55,
          t
        );
      }
      for (let k = 0; k < 3; k++) {
        const rr = 12 + rand() * 34;
        const a = rand() * 6.28;
        push(
          `M${(50 + Math.cos(a) * rr).toFixed(2)},${(60 + Math.sin(a) * rr * 0.4).toFixed(2)} l0.6,0`,
          2.4,
          0.9,
          rand(),
          'round'
        );
      }
      break;
    }

    case 'sport': {
      // motion: a swept trail of arcs leaning out of frame
      const lines = 26 + Math.floor(rand() * 10);
      const lean = 0.5 + rand() * 0.8;
      for (let i = 0; i < lines; i++) {
        const t = i / (lines - 1);
        const y0 = 6 + t * 108;
        const bend = (12 + rand() * 26) * lean;
        const x0 = 4 + rand() * 16;
        const x1 = 62 + rand() * 34;
        push(
          `M${x0.toFixed(1)},${y0.toFixed(1)} Q${((x0 + x1) / 2).toFixed(1)},${(y0 - bend).toFixed(1)} ${x1.toFixed(1)},${(y0 - bend * 0.35).toFixed(1)}`,
          0.28 + rand() * 0.7,
          0.22 + Math.exp(-Math.pow((t - 0.5) / 0.34, 2)) * 0.7,
          t
        );
      }
      break;
    }

    case 'technology': {
      // an orthogonal lattice, perturbed — structure with a fault line through it
      const cols = 13;
      const rowsN = 16;
      for (let i = 0; i <= cols; i++) {
        const x = 6 + (i / cols) * 88;
        const pts: string[] = [];
        for (let j = 0; j <= rowsN; j++) {
          const y = 8 + (j / rowsN) * 104;
          const warp = Math.sin(j * 0.6 + i * 0.4) * (1.2 + rand() * 1.6);
          pts.push(`${(x + warp).toFixed(2)},${y.toFixed(2)}`);
        }
        push(`M${pts.join(' L')}`, 0.26 + rand() * 0.3, 0.22 + rand() * 0.45, i / cols);
      }
      for (let j = 0; j <= rowsN; j += 2) {
        const y = 8 + (j / rowsN) * 104;
        push(`M6,${y.toFixed(2)} L94,${y.toFixed(2)}`, 0.2, 0.16 + rand() * 0.2, j / rowsN);
      }
      break;
    }

    case 'art': {
      // topographic contours: the same form studied over and over
      const rings = 26 + Math.floor(rand() * 10);
      for (let i = 0; i < rings; i++) {
        const t = i / (rings - 1);
        const rr = 4 + t * 46;
        const pts: string[] = [];
        for (let j = 0; j <= 64; j++) {
          const a = (j / 64) * Math.PI * 2;
          const wob =
            Math.sin(a * 3 + t * 6) * (1.4 + t * 4) + Math.sin(a * 7 + t * 3) * (0.8 + t * 1.6);
          const r = rr + wob;
          pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(58 + Math.sin(a) * r * 1.08).toFixed(2)}`);
        }
        push(`M${pts.join(' L')} Z`, 0.26 + (1 - t) * 0.4, 0.2 + (1 - t) * 0.6, t);
      }
      break;
    }

    default: {
      // film: frames on a strip, each one a slightly different exposure
      const frames = 9 + Math.floor(rand() * 4);
      for (let i = 0; i < frames; i++) {
        const t = i / (frames - 1);
        const h = 104 / frames;
        const y = 8 + i * h;
        const inset = 8 + rand() * 10;
        push(
          `M${inset},${y.toFixed(1)} H${(100 - inset).toFixed(1)} V${(y + h * 0.78).toFixed(1)} H${inset} Z`,
          0.3 + rand() * 0.4,
          0.22 + rand() * 0.5,
          t
        );
        const bars = 3 + Math.floor(rand() * 4);
        for (let b = 0; b < bars; b++) {
          const by = y + (b / bars) * h * 0.7 + 2;
          push(
            `M${inset + 3},${by.toFixed(1)} H${(100 - inset - 3 - rand() * 20).toFixed(1)}`,
            0.22,
            0.18 + rand() * 0.35,
            t
          );
        }
      }
      break;
    }
  }

  return out;
}
