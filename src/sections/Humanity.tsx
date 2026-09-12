import { useEffect, useState } from 'react';
import Cue from '../components/ui/Cue';
import Portrait from '../components/ui/Portrait';
import { ICONS } from '../data/icons';
import { useStore } from '../state/useStore';
import { band, clamp, range } from '../utils/math';
import { blip } from '../lib/audio';

const RAIL_START = 0.80;
const RAIL_END = 0.935;

/**
 * 05 — ICONS
 *
 * Scale inverts here: the camera stops moving outward and the gallery moves
 * sideways instead. Scroll drives a horizontal rail of ten portraits, so the
 * change of register from cosmic to human is felt as a change of axis.
 *
 * Explicitly not a ranking. Ten people from different fields, presented as
 * people who changed culture.
 */
export default function Humanity() {
  const p = useStore((s) => s.progress);
  const setOpenIcon = useStore((s) => s.setOpenIcon);
  const isTouch = useStore((s) => s.isTouch);
  const [hover, setHover] = useState<string | null>(null);

  const [vp, setVp] = useState(() => ({
    w: typeof window === 'undefined' ? 1440 : window.innerWidth,
    h: typeof window === 'undefined' ? 900 : window.innerHeight,
  }));
  useEffect(() => {
    const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const vw = vp.w;
  const mobile = vw < 820;
  // The card is capped by viewport height as well as width: a short laptop
  // window would otherwise push the names off the bottom of the screen.
  const cardW = mobile
    ? Math.min(vw * 0.66, vp.h * 0.34)
    : Math.min(vw * 0.24, vp.h * 0.38, 360);
  const gap = mobile ? 18 : 34;
  const padding = mobile ? vw * 0.08 : vw * 0.1;
  const total = ICONS.length * (cardW + gap) - gap + padding * 2;
  const travel = Math.max(0, total - vw);

  const t = range(p, RAIL_START, RAIL_END);
  const x = -travel * t;

  // whichever card is nearest the centre of the viewport is "live"
  const centre = (vw / 2 - padding - x) / (cardW + gap);
  const activeIndex = clamp(Math.round(centre - 0.5), 0, ICONS.length - 1);
  const railOpacity = band(p, 0.792, 0.818, 0.925, 0.945);

  return (
    <div className="stack pointer-events-none overflow-hidden">
      <Cue a={0.754} b={0.768} c={0.780} d={0.793} className="stack grid place-items-center px-[8vw]">
        <div className="text-center scrim">
          <p className="t-eyebrow mb-6">Chapter 05</p>
          <h2 className="t-display-sm max-w-[20ch] leading-[1.08]">
            From billions of people, a few became unforgettable.
          </h2>
        </div>
      </Cue>

      {/* section marker, parked top-left for the length of the rail */}
      <div
        className="absolute top-[11vh] md:top-[7vh] left-[6vw] md:left-[8vw]"
        style={{ opacity: railOpacity * 0.9 }}
      >
        <h2
          className="font-display leading-none"
          style={{ letterSpacing: '0.1em', fontSize: 'clamp(1.8rem, 3.4vw, 3.2rem)' }}
        >
          ICONS
        </h2>
        <p className="t-eyebrow mt-3 max-w-[34ch] leading-relaxed">
          People who changed culture · Not a ranking
        </p>
      </div>

      {/* the rail */}
      <div
        className="absolute left-0 bottom-[10vh] md:bottom-[8vh] w-full"
        style={{ opacity: railOpacity, pointerEvents: railOpacity > 0.5 ? 'auto' : 'none' }}
      >
        <div
          className="flex items-end will-change-transform"
          style={{
            transform: `translate3d(${x}px,0,0)`,
            gap,
            paddingLeft: padding,
            paddingRight: padding,
          }}
        >
          {ICONS.map((icon, i) => {
            const isActive = i === activeIndex || hover === icon.id;
            return (
              <button
                key={icon.id}
                className="group relative text-left shrink-0"
                style={{ width: cardW }}
                onMouseEnter={() => !isTouch && setHover(icon.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => {
                  blip(720, 0.1, 0.045);
                  setOpenIcon(icon.id);
                }}
                data-cursor="hover"
                aria-label={`Open profile: ${icon.name}`}
                tabIndex={railOpacity > 0.5 ? 0 : -1}
                aria-hidden={railOpacity <= 0.5}
              >
                <div
                  className="relative overflow-hidden transition-all duration-[1200ms] ease-cine"
                  style={{
                    height: isActive ? (mobile ? cardW * 1.32 : cardW * 1.36) : mobile ? cardW * 1.2 : cardW * 1.18,
                    filter: isActive ? 'none' : 'brightness(0.62)',
                  }}
                >
                  <Portrait icon={icon} active={isActive} className="w-full h-full" />
                  <span
                    className="absolute inset-x-0 bottom-0 h-px transition-all duration-700"
                    style={{
                      background: isActive
                        ? `linear-gradient(90deg, transparent, ${icon.palette[0]}, transparent)`
                        : 'rgba(234,234,242,0.14)',
                    }}
                  />
                </div>

                <div className="mt-5 flex items-baseline gap-3">
                  <span className="t-eyebrow tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className="h-px flex-1 transition-all duration-700"
                    style={{ background: isActive ? 'rgba(234,234,242,0.5)' : 'rgba(234,234,242,0.14)' }}
                  />
                </div>
                <h3
                  className="font-display mt-3 leading-[1.05] transition-all duration-700"
                  style={{
                    fontSize: mobile ? '1.7rem' : 'clamp(1.4rem, 2.1vw, 2.2rem)',
                    color: isActive ? 'var(--bone)' : 'rgba(234,234,242,0.6)',
                  }}
                >
                  {icon.name}
                </h3>
                <p className="t-eyebrow mt-2">
                  {icon.discipline.split(',')[0]} · {icon.born}
                  {icon.died ? `–${icon.died}` : '–'}
                </p>
                <span
                  className="block mt-4 text-[0.6rem] tracking-[0.24em] uppercase transition-all duration-700"
                  style={{ color: isActive ? icon.palette[0] : 'transparent' }}
                >
                  Meet icon →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* rail progress */}
      <div
        className="absolute bottom-[4.5vh] left-[6vw] right-[6vw] h-px bg-[rgba(234,234,242,0.1)]"
        style={{ opacity: railOpacity }}
      >
        <div
          className="h-full bg-bone/60 origin-left transition-transform duration-300"
          style={{ transform: `scaleX(${Math.max(t, 0.02)})`, width: '100%' }}
        />
      </div>
    </div>
  );
}
