import { useEffect, useRef } from 'react';
import { useStore } from '../state/useStore';
import { mulberry32 } from '../utils/noise';
import { clamp, range, smoothstep } from '../utils/math';

interface Star {
  x: number;
  y: number;
  z: number;
  r: number;
  hue: number;
}

/**
 * The no-WebGL path.
 *
 * Same journey, same copy, same timing — rendered on a 2D canvas instead. A
 * perspective-projected star field carries the flight, and each chapter gets a
 * drawn stand-in: an eclipsed disk for the black hole, a lit system for the
 * planets, a terminator-lit sphere for Earth. It is not a downgrade message;
 * it is a smaller version of the same film.
 */
export default function Fallback2D() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useStore((s) => s.reducedMotion);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;

    const rand = mulberry32(4242);
    const stars: Star[] = Array.from({ length: 620 }, () => ({
      x: rand() * 2 - 1,
      y: rand() * 2 - 1,
      z: rand(),
      r: Math.pow(rand(), 3) * 1.9 + 0.25,
      hue: rand(),
    }));

    let raf = 0;
    let t = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = `${window.innerWidth}px`;
      c.style.height = `${window.innerHeight}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const W = c.width;
      const H = c.height;
      const cx = W / 2;
      const cy = H / 2;
      const p = useStore.getState().progress;
      t += reduced ? 0.0015 : 0.004;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, W, H);

      // ── star field, projected ──
      const travel = p * 6 + t;
      const intro = smoothstep(0.004, 0.05, p);
      const outro = 1 - smoothstep(0.82, 0.95, p) * 0.8;
      for (const s of stars) {
        const z = (s.z + travel) % 1;
        const depth = 0.06 + z * 0.94;
        const scale = 1 / depth;
        const x = cx + s.x * cx * scale * 0.55;
        const y = cy + s.y * cy * scale * 0.55;
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
        const a = clamp((1 - z) * 1.4, 0, 1) * intro * outro;
        const hue = s.hue < 0.7 ? '220' : s.hue < 0.9 ? '30' : '0';
        ctx.beginPath();
        ctx.arc(x, y, s.r * scale * 0.55 * dpr, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 40%, ${78 + s.hue * 18}%, ${a})`;
        ctx.fill();
      }

      // ── black hole ──
      const bh = Math.sin(clamp(range(p, 0.12, 0.44)) * Math.PI);
      if (bh > 0.01) {
        const R = Math.min(W, H) * (0.06 + range(p, 0.14, 0.34) * 0.19) * bh;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(-0.3);
        // accretion disk
        const g = ctx.createLinearGradient(-R * 2.6, 0, R * 2.6, 0);
        g.addColorStop(0, `rgba(255,150,60,${0.15 * bh})`);
        g.addColorStop(0.5, `rgba(255,220,180,${0.75 * bh})`);
        g.addColorStop(1, `rgba(255,120,40,${0.2 * bh})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 2.6, R * 0.42, 0, 0, Math.PI * 2);
        ctx.fill();
        // shadow and photon ring
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = Math.max(1, R * 0.035);
        ctx.strokeStyle = `rgba(255,210,160,${0.85 * bh})`;
        ctx.stroke();
        ctx.restore();
      }

      // ── the system, then Earth ──
      const sys = Math.sin(clamp(range(p, 0.42, 0.64)) * Math.PI);
      if (sys > 0.01) {
        ctx.save();
        ctx.translate(cx, cy);
        const base = Math.min(W, H) * 0.32;
        for (let i = 0; i < 8; i++) {
          const r = base * (0.22 + i * 0.1);
          ctx.beginPath();
          ctx.ellipse(0, 0, r, r * 0.3, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(140,175,255,${0.12 * sys})`;
          ctx.lineWidth = dpr;
          ctx.stroke();
          const a = t * (1.6 - i * 0.14) + i;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * r, Math.sin(a) * r * 0.3, (3 + i * 1.4) * dpr * sys, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${[35, 45, 210, 18, 30, 44, 190, 220][i]}, 55%, 70%, ${sys})`;
          ctx.fill();
        }
        const sun = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.3);
        sun.addColorStop(0, `rgba(255,246,220,${sys})`);
        sun.addColorStop(0.25, `rgba(255,180,90,${0.7 * sys})`);
        sun.addColorStop(1, 'rgba(255,140,40,0)');
        ctx.fillStyle = sun;
        ctx.beginPath();
        ctx.arc(0, 0, base * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const earth = Math.sin(clamp(range(p, 0.6, 0.96)) * Math.PI);
      if (earth > 0.01) {
        const R = Math.min(W, H) * (0.16 + earth * 0.2);
        const ex = cx + W * 0.14 * smoothstep(0.76, 0.92, p);
        ctx.save();
        const g = ctx.createRadialGradient(ex - R * 0.4, cy - R * 0.4, R * 0.1, ex, cy, R);
        g.addColorStop(0, `rgba(120,190,255,${earth})`);
        g.addColorStop(0.55, `rgba(30,90,170,${earth})`);
        g.addColorStop(1, `rgba(3,10,28,${earth})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ex, cy, R, 0, Math.PI * 2);
        ctx.fill();
        const halo = ctx.createRadialGradient(ex, cy, R * 0.96, ex, cy, R * 1.3);
        halo.addColorStop(0, `rgba(110,180,255,${0.4 * earth})`);
        halo.addColorStop(1, 'rgba(110,180,255,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(ex, cy, R * 1.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [reduced]);

  return <canvas ref={canvas} className="stack" aria-hidden />;
}
