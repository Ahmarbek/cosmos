import Cue from '../components/ui/Cue';
import { useT } from '../i18n';
import { UI } from '../i18n/ui';
import Diagram from '../components/ui/Diagram';
import { BH_DISCLAIMER, BH_TOPICS } from '../data/blackhole';
import { useStore } from '../state/useStore';
import { band } from '../utils/math';
import { blip } from '../lib/audio';

/**
 * Where the ten topic panels live, in absolute journey progress.
 *
 * Deliberately not the chapter's own range. The chapter runs 0.14 → 0.42, but
 * its opening card owns the first slice of that, and a topic mapped from the
 * chapter start begins fading in *before* the card announcing the chapter —
 * so the reader met "What is a black hole?" before they had been told they
 * were looking at black holes. The panels therefore start where the card
 * finishes, and the last one still closes inside the chapter.
 */
const TOPICS_START = 0.1946;
const TOPICS_SPAN = 0.2237;

/** Map a topic's position inside the chapter to absolute journey progress. */
const at = (v: number) => TOPICS_START + v * TOPICS_SPAN;

/**
 * 02 — BLACK HOLES
 *
 * Ten short panels, alternating sides, each timed to a moment of the approach.
 * The visualisation behind them is doing the explaining; the text only has to
 * name what the eye is already looking at.
 */
export default function BlackHoles() {
  const t = useT();
  const p = useStore((s) => s.progress);
  const interactive = useStore((s) => s.interactive);
  const setInteractive = useStore((s) => s.setInteractive);
  const inChapter = band(p, 0.13, 0.16, 0.40, 0.43);
  const inspecting = interactive === 'blackhole';

  return (
    <div className="stack pointer-events-none">
      {/* the chapter card, held alone: nothing else is on screen until d */}
      <Cue a={0.14} b={0.15} c={0.168} d={0.182} className="stack grid place-items-center px-[8vw]">
        <div className="text-center scrim">
          <p className="t-eyebrow mb-6">{t(UI.chapter02)}</p>
          <h2 className="t-display glow-soft">{t(UI.chapterBlackHoles)}</h2>
          <p className="t-lead mt-8 max-w-[34ch] mx-auto">
            {t(UI.blackHolesLead)}
          </p>
        </div>
      </Cue>

      {!inspecting &&
        BH_TOPICS.map((topic, i) => {
          const g = at(topic.at);
          const left = i % 2 === 0;
          return (
            <Cue
              key={topic.id}
              a={g - 0.026}
              b={g - 0.012}
              c={g + 0.010}
              d={g + 0.024}
              rise={34}
              className="stack flex items-center px-[6vw] md:px-[8vw]"
              style={{ justifyContent: left ? 'flex-start' : 'flex-end' }}
            >
              <article className="max-w-[38ch] w-full md:w-auto panel-pad">
                <div className="flex items-center gap-4 mb-5">
                  <span className="t-eyebrow tabular-nums">{topic.index}</span>
                  <span className="h-px flex-1 bg-[rgba(234,234,242,0.16)] min-w-[40px]" />
                </div>
                <h3 className="t-display-sm mb-4">{t(topic.title)}</h3>
                <p className="t-lead mb-4">{t(topic.lead)}</p>
                <p className="t-body">{t(topic.body)}</p>
                {topic.figure && (
                  <div className="mt-8 opacity-80">
                    <Diagram kind={topic.figure} />
                  </div>
                )}
              </article>
            </Cue>
          );
        })}

      {/* inspect handoff */}
      {!inspecting && (
        <Cue
          a={0.235}
          b={0.25}
          c={0.30}
          d={0.315}
          rise={0}
          className="absolute bottom-[11vh] left-0 w-full grid place-items-center"
        >
          <button
            className="btn-cosmos pointer-events-auto"
            onClick={() => {
              blip(520, 0.12, 0.05);
              setInteractive('blackhole');
            }}
            data-cursor="hover"
          >
            <span>{t(UI.inspectObject)}</span>
            <span aria-hidden>◎</span>
          </button>
        </Cue>
      )}

      {/* scientific honesty, held for the whole chapter */}
      <div
        className="absolute bottom-[5.5vh] left-0 w-full px-[6vw] text-center"
        style={{ opacity: inChapter * 0.5 }}
      >
        <p className="text-[0.58rem] tracking-[0.2em] uppercase text-smoke max-w-[72ch] mx-auto leading-relaxed">
          {t(BH_DISCLAIMER)}
        </p>
      </div>

      {inspecting && (
        <div className="stack pointer-events-none">
          <div className="absolute top-[12vh] left-0 w-full grid place-items-center">
            <p className="t-eyebrow">{t(UI.dragOrbitZoom)}</p>
          </div>
          <div className="absolute bottom-[12vh] left-0 w-full grid place-items-center">
            <button
              className="btn-cosmos btn-ghost pointer-events-auto"
              onClick={() => {
                blip(400, 0.12, 0.05);
                setInteractive(null);
              }}
              data-cursor="hover"
            >
              <span aria-hidden>←</span>
              <span>{t(UI.returnToJourney)}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
