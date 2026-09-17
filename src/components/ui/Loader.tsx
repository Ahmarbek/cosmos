import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { detectCapabilities } from '../../hooks/useCapabilities';
import { getEarthTextures, tryLoadRealTextures } from '../../utils/earthTextures';
import { useT } from '../../i18n';
import { UI } from '../../i18n/ui';

interface Step {
  label: import('../../i18n').Text;
  run: () => void | Promise<void>;
}

/**
 * The loading screen does real work.
 *
 * Earth's maps are baked here rather than on first sight of the planet — a few
 * hundred milliseconds of canvas work that would otherwise land as a stutter
 * halfway through the flight. The visitor also has to press ENTER, which is
 * both the right dramatic beat and the user gesture that lets audio start.
 */
const STEPS: Step[] = [
  { label: UI.loadRenderer, run: () => void detectCapabilities() },
  { label: UI.loadStarfield, run: () => {} },
  { label: UI.loadGeodesics, run: () => {} },
  { label: UI.loadSystem, run: () => {} },
  {
    // the generated maps are baked first so the planet is never texture-less,
    // then the real NASA imagery replaces them if it is present
    label: UI.loadEarth,
    run: async () => {
      const set = getEarthTextures();
      await tryLoadRealTextures(set);
    },
  },
  { label: UI.loadArchive, run: () => {} },
];

export default function Loader({ onEnter }: { onEnter: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let i = 0;
    const next = () => {
      if (!mounted.current) return;
      if (i >= STEPS.length) {
        setDone(true);
        return;
      }
      const s = STEPS[i];
      // Timers, not animation frames: a backgrounded tab stops issuing frames
      // entirely, and a loading screen that freezes when the visitor looks away
      // is a loading screen that never finishes.
      setTimeout(async () => {
        try {
          await s.run();
        } catch {
          /* a failed warm-up must never block entry */
        }
        i += 1;
        if (!mounted.current) return;
        setStep(i);
        next();
      }, 300);
    };
    next();
    return () => {
      mounted.current = false;
    };
  }, []);

  const enter = () => {
    setLeaving(true);
    setTimeout(onEnter, 900);
  };

  const pct = Math.round((step / STEPS.length) * 100);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-void grain vignette overflow-hidden"
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-full w-full flex flex-col justify-between px-[6vw] py-[7vh]">
        <div className="flex items-start justify-between">
          <span className="t-eyebrow">{t(UI.wordmarkSmall)}</span>
          <span className="t-eyebrow tabular-nums">
            {String(Math.min(step + (done ? 0 : 1), STEPS.length)).padStart(2, '0')} / 06
          </span>
        </div>

        <div className="flex flex-col items-center text-center">
          <motion.h1
            className="t-display glow-soft"
            initial={{ opacity: 0, letterSpacing: '0.6em', filter: 'blur(14px)' }}
            animate={{ opacity: 1, letterSpacing: '0.14em', filter: 'blur(0px)' }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ paddingLeft: '0.14em' }}
          >
            {t(UI.wordmark)}
          </motion.h1>

          <motion.p
            className="t-eyebrow mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 1.4 }}
          >
            {t(UI.tagline)}
          </motion.p>
        </div>

        <div className="w-full">
          <div className="flex items-end justify-between mb-4">
            <AnimatePresence mode="wait">
              <motion.span
                key={done ? 'ready' : t(STEPS[Math.min(step, STEPS.length - 1)].label)}
                className="t-label"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
              >
                {done ? t(UI.systemsNominal) : t(STEPS[Math.min(step, STEPS.length - 1)].label)}
              </motion.span>
            </AnimatePresence>
            <span className="t-label tabular-nums">{done ? '100' : pct}%</span>
          </div>

          <div className="h-px w-full bg-[rgba(234,234,242,0.12)] relative overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-bone"
              animate={{ width: `${done ? 100 : pct}%` }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="h-24 mt-9 flex items-center justify-center">
            <AnimatePresence>
              {done && (
                <motion.button
                  className="btn-cosmos"
                  onClick={enter}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  data-cursor="hover"
                  autoFocus
                >
                  <span>{t(UI.enter)}</span>
                  <span aria-hidden>→</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <p className="t-eyebrow text-center mt-2 opacity-50">
            {t(UI.scrollSound)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
