import { motion } from 'framer-motion';
import { CHAPTERS, chapterAt, useStore } from '../../state/useStore';
import { scrollToProgress } from '../../hooks/useScrollJourney';
import SoundToggle from './SoundToggle';
import { blip } from '../../lib/audio';

/**
 * Navigation as a flight plan, not a menu bar.
 *
 * A hairline rail down the right edge carries the six chapters; the active one
 * is lit and the travelled distance is drawn as a filled line. Labels stay
 * hidden until the rail is approached, so at rest it reads as instrumentation
 * rather than chrome.
 */
export default function Nav({ visible }: { visible: boolean }) {
  const progress = useStore((s) => s.rawProgress);
  const interactive = useStore((s) => s.interactive);
  const active = chapterAt(progress).id;

  const go = (p: number) => {
    blip(660, 0.08, 0.04);
    scrollToProgress(p + 0.012);
  };

  return (
    <motion.div
      className="fixed inset-0 z-40 pointer-events-none"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* wordmark */}
      <div className="absolute top-[3.4vh] left-[4vw] pointer-events-auto">
        <button
          onClick={() => go(0)}
          className="t-eyebrow hover:text-bone transition-colors duration-500"
          data-cursor="hover"
        >
          Cosmos
        </button>
      </div>

      {/* sound */}
      <div className="absolute top-[3vh] right-[4vw] pointer-events-auto">
        <SoundToggle />
      </div>

      {/* chapter rail */}
      <nav
        className="absolute right-[4vw] top-1/2 -translate-y-1/2 pointer-events-auto hidden md:block group/rail"
        aria-label="Journey chapters"
      >
        <ol className="flex flex-col gap-5 items-end">
          {CHAPTERS.map((c) => {
            const isActive = c.id === active;
            const passed = progress >= c.end;
            return (
              <li key={c.id}>
                <button
                  onClick={() => go(c.start)}
                  className="flex items-center gap-3 justify-end"
                  data-cursor="hover"
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span
                    className="text-[0.6rem] tracking-[0.22em] uppercase transition-all duration-500 opacity-0 group-hover/rail:opacity-100 translate-x-2 group-hover/rail:translate-x-0"
                    style={{ color: isActive ? 'var(--bone)' : 'var(--ash)' }}
                  >
                    {c.label}
                  </span>
                  <span
                    className="text-[0.6rem] tracking-[0.18em] tabular-nums transition-colors duration-500"
                    style={{ color: isActive ? 'var(--bone)' : passed ? 'var(--ash)' : 'rgba(234,234,242,0.22)' }}
                  >
                    {c.index}
                  </span>
                  <span
                    className="block transition-all duration-700"
                    style={{
                      width: isActive ? 26 : 12,
                      height: 1,
                      background: isActive ? 'var(--bone)' : 'rgba(234,234,242,0.28)',
                    }}
                  />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* progress hairline */}
      <div className="absolute left-0 bottom-0 w-full h-px bg-[rgba(234,234,242,0.08)]">
        <div
          className="h-full bg-bone/70 origin-left"
          style={{ transform: `scaleX(${progress})`, width: '100%' }}
        />
      </div>

      {/* readout */}
      <div className="absolute bottom-[3vh] left-[4vw] flex items-baseline gap-4 pointer-events-none">
        <span className="t-eyebrow tabular-nums">
          {chapterAt(progress).index} / 06
        </span>
        <span className="t-eyebrow opacity-60">{chapterAt(progress).label}</span>
      </div>

      {!interactive && (
        <div className="absolute bottom-[3vh] right-[4vw] hidden md:block">
          <span className="t-eyebrow opacity-40 tabular-nums">
            {String(Math.round(progress * 100)).padStart(3, '0')}
          </span>
        </div>
      )}
    </motion.div>
  );
}
