import { useMemo, useState } from 'react';
import type { Icon } from '../../data/icons';
import { buildField } from './portraitField';

/**
 * A generative portrait.
 *
 * Photographs of these people are almost all under copyright, and an AI-made
 * likeness passed off as a photograph would be worse than no image at all. So
 * each person gets a deterministic field portrait instead: a contour system
 * seeded from their name, drawn in their own two colours, with their initials
 * set over it. It is honestly an illustration, and it is unique per person.
 *
 * If a properly licensed image is later placed at /portraits/<id>.jpg it is
 * used automatically and the field becomes its underlay.
 */
export default function Portrait({
  icon,
  active = false,
  className = '',
}: {
  icon: Icon;
  active?: boolean;
  className?: string;
}) {
  const [hasPhoto, setHasPhoto] = useState(true);

  const lines = useMemo(() => buildField(icon), [icon]);

  const initials = icon.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className={`relative overflow-hidden bg-void ${className}`}
      style={{
        boxShadow: active ? `inset 0 0 90px ${icon.palette[0]}22` : undefined,
        transition: 'box-shadow 900ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div
        className="absolute inset-0 transition-transform duration-[1400ms] ease-cine"
        style={{
          background: `radial-gradient(120% 90% at 50% 18%, ${icon.palette[1]}55 0%, #050609 62%, #000 100%)`,
          transform: active ? 'scale(1.06)' : 'scale(1)',
        }}
      />

      <svg
        viewBox="0 0 100 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full transition-transform duration-[1600ms] ease-cine"
        style={{ transform: active ? 'scale(1.09) translateY(-1.5%)' : 'scale(1)' }}
        aria-hidden
      >
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            fill="none"
            stroke={l.c < 0.5 ? icon.palette[0] : icon.palette[1]}
            strokeWidth={l.w}
            strokeLinecap={l.cap ?? 'butt'}
            opacity={l.o * (active ? 1 : 0.66)}
            style={{ transition: 'opacity 900ms' }}
          />
        ))}
      </svg>

      {/* The licensed photograph, graded. Ten portraits from ten sources across
          a century arrive in ten different colour temperatures; holding them at
          low saturation until the card is live makes them one set, and lets the
          active card bloom into colour as the only thing in the frame doing so. */}
      {hasPhoto && (
        <>
          <img
            src={`/portraits/${icon.id}.jpg`}
            alt=""
            onError={() => setHasPhoto(false)}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[1400ms] ease-cine"
            style={{
              opacity: active ? 1 : 0.82,
              filter: active
                ? 'grayscale(0.12) contrast(1.06) brightness(0.98) saturate(1.05)'
                : 'grayscale(0.88) contrast(1.08) brightness(0.58)',
              transform: active ? 'scale(1.05)' : 'scale(1)',
            }}
          />
          {/* grounds the photograph into the card so the name below it is not
              sitting on an arbitrary crop */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-[1200ms]"
            style={{
              background: `linear-gradient(to top, #000 2%, rgba(0,0,0,0.45) 26%, rgba(0,0,0,0) 62%), radial-gradient(120% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.5) 100%)`,
              opacity: active ? 0.8 : 0.95,
            }}
          />
        </>
      )}

      <span
        className="absolute inset-0 grid place-items-center font-display pointer-events-none select-none transition-all duration-[1200ms] ease-cine"
        style={{
          fontSize: 'clamp(3rem, 9vw, 7rem)',
          color: 'rgba(255,255,255,0.07)',
          letterSpacing: '0.06em',
          transform: active ? 'translateY(-4%) scale(1.04)' : 'none',
        }}
        aria-hidden
      >
        {initials}
      </span>

      <div className="absolute inset-0 grain pointer-events-none" />
    </div>
  );
}
