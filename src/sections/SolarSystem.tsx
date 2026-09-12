import { AnimatePresence, motion } from 'framer-motion';
import Cue from '../components/ui/Cue';
import { PLANETS, PLANET_BY_ID, SUN } from '../data/planets';
import { useStore } from '../state/useStore';
import { blip } from '../lib/audio';

/**
 * 03 — SOLAR SYSTEM
 *
 * The scroll brings the camera in; the visitor can then take the controls and
 * fly it themselves. The scale caveat is stated plainly rather than buried,
 * because the compression is severe and deliberate.
 */
export default function SolarSystem() {
  const interactive = useStore((s) => s.interactive);
  const setInteractive = useStore((s) => s.setInteractive);
  const selected = useStore((s) => s.selectedPlanet);
  const setSelected = useStore((s) => s.setSelectedPlanet);
  const exploring = interactive === 'solar';
  const planet = selected ? PLANET_BY_ID[selected] : null;

  return (
    <div className="stack pointer-events-none">
      {!exploring && (
        <>
          <Cue a={0.425} b={0.442} c={0.462} d={0.478} className="stack grid place-items-center px-[8vw]">
            <h2 className="t-display text-center glow-soft scrim">Our home.</h2>
          </Cue>

          <Cue a={0.474} b={0.49} c={0.515} d={0.535} className="stack grid place-items-center px-[8vw]">
            <div className="text-center scrim">
              <p className="t-eyebrow mb-6">Chapter 03</p>
              <h2 className="t-display">The Solar System</h2>
              <p className="t-lead mt-8 max-w-[40ch] mx-auto">
                One ordinary star, eight planets, and everything we have ever touched.
              </p>
            </div>
          </Cue>

          <Cue a={0.53} b={0.545} c={0.585} d={0.605} className="stack flex items-center px-[8vw]">
            <div className="max-w-[36ch] panel-pad">
              <div className="flex items-center gap-4 mb-5">
                <span className="t-eyebrow">The Sun</span>
                <span className="h-px flex-1 bg-[rgba(234,234,242,0.16)] min-w-[40px]" />
              </div>
              <p className="t-body mb-6">{SUN.blurb}</p>
              <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
                {SUN.facts.slice(0, 4).map((f) => (
                  <div key={f.label}>
                    <dt className="t-eyebrow mb-1">{f.label}</dt>
                    <dd className="text-sm text-bone/85 font-light">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Cue>

          <Cue
            a={0.505}
            b={0.52}
            c={0.585}
            d={0.605}
            rise={0}
            className="absolute bottom-[11vh] left-0 w-full grid place-items-center"
          >
            <button
              className="btn-cosmos pointer-events-auto"
              onClick={() => {
                blip(600, 0.12, 0.05);
                setInteractive('solar');
              }}
              data-cursor="hover"
            >
              <span>Explore the system</span>
              <span aria-hidden>✦</span>
            </button>
          </Cue>
        </>
      )}

      {exploring && (
        <div className="stack pointer-events-none">
          {/* planet picker */}
          <motion.nav
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-[4vw] top-1/2 -translate-y-1/2 pointer-events-auto"
            aria-label="Planets"
          >
            <ol className="flex flex-col gap-3">
              {PLANETS.map((p) => {
                const on = selected === p.id;
                return (
                  <li key={p.id}>
                    <button
                      className="flex items-center gap-3 group"
                      onClick={() => {
                        blip(on ? 420 : 760, 0.08, 0.04);
                        setSelected(on ? null : p.id);
                      }}
                      data-cursor="hover"
                      aria-pressed={on}
                    >
                      <span
                        className="block h-px transition-all duration-700"
                        style={{ width: on ? 30 : 12, background: on ? 'var(--bone)' : 'rgba(234,234,242,0.3)' }}
                      />
                      <span
                        className="text-[0.62rem] tracking-[0.22em] uppercase transition-colors duration-500"
                        style={{ color: on ? 'var(--bone)' : 'var(--ash)' }}
                      >
                        {p.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </motion.nav>

          {/* info panel */}
          <AnimatePresence mode="wait">
            {planet && (
              <motion.aside
                key={planet.id}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 28 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-[4vw] top-1/2 -translate-y-1/2 w-[min(34ch,80vw)] max-h-[74vh] overflow-y-auto overscroll-contain pointer-events-auto hair-l pl-7 panel-pad"
              >
                <p className="t-eyebrow mb-4">Planet {planet.index}</p>
                <h3 className="t-display-sm mb-3 leading-none">{planet.name}</h3>
                <p className="t-lead mb-5">{planet.tagline}</p>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
                  {planet.facts.map((f) => (
                    <div key={f.label}>
                      <dt className="t-eyebrow mb-1">{f.label}</dt>
                      <dd className="text-[0.82rem] text-bone/85 font-light leading-snug">{f.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="t-body">{planet.blurb}</p>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="absolute top-[11vh] left-0 w-full grid place-items-center px-[6vw]">
            <p className="t-eyebrow text-center">
              Drag to orbit · Scroll to zoom · Select a planet to focus
            </p>
          </div>

          <div className="absolute bottom-[5.5vh] left-0 w-full px-[6vw] text-center">
            <p className="text-[0.58rem] tracking-[0.2em] uppercase text-smoke/70 max-w-[74ch] mx-auto leading-relaxed">
              Artistic visualisation. Planet sizes and orbital distances are compressed for
              legibility; ordering, relative periods, axial tilts and rotation directions follow
              the real bodies.
            </p>
          </div>

          <div className="absolute bottom-[11vh] left-0 w-full grid place-items-center">
            <button
              className="btn-cosmos btn-ghost pointer-events-auto"
              onClick={() => {
                blip(400, 0.12, 0.05);
                setSelected(null);
                setInteractive(null);
              }}
              data-cursor="hover"
            >
              <span aria-hidden>←</span>
              <span>Return to the journey</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
