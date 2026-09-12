import type { CSSProperties, ReactNode } from 'react';
import { useStore } from '../../state/useStore';
import { band } from '../../utils/math';

interface Props {
  /** fade in between a and b, hold, fade out between c and d — journey progress */
  a: number;
  b: number;
  c: number;
  d: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** vertical travel in px across the cue's life */
  rise?: number;
  blur?: number;
  /** keeps the node in the layout (and in the a11y tree) when fully faded */
  keepMounted?: boolean;
}

/**
 * A timed piece of on-screen text or UI.
 *
 * Everything in the journey overlay is placed on the scroll timeline rather
 * than in document flow, so a cue is defined by when it appears and when it
 * leaves — the same way a subtitle track works.
 */
export default function Cue({
  a,
  b,
  c,
  d,
  children,
  className = '',
  style,
  rise = 26,
  blur = 8,
  keepMounted = false,
}: Props) {
  const p = useStore((s) => s.progress);
  const t = band(p, a, b, c, d);
  if (t <= 0.001 && !keepMounted) return null;

  const life = (p - a) / Math.max(d - a, 1e-6);
  return (
    <div
      className={className}
      aria-hidden={t < 0.15}
      style={{
        opacity: t,
        transform: `translate3d(0, ${(0.5 - life) * rise}px, 0)`,
        filter: t < 0.999 ? `blur(${(1 - t) * blur}px)` : undefined,
        pointerEvents: t > 0.6 ? 'auto' : 'none',
        willChange: 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
