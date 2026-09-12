import Cue from '../components/ui/Cue';
import { useStore } from '../state/useStore';
import { band, range } from '../utils/math';
import { blip } from '../lib/audio';

/**
 * 06 — THE THRESHOLD
 *
 * Everything goes out. A single point returns, the same one the journey opened
 * with, and this time it is a door rather than a star.
 */
export default function EnterWorld() {
  const p = useStore((s) => s.progress);
  const setStage = useStore((s) => s.setStage);

  // the screen is taken to black by an overlay, not by fading each element
  const blackout = range(p, 0.935, 0.968);
  const point = band(p, 0.962, 0.982, 1.01, 1.02);
  const cta = band(p, 0.975, 0.99, 1.01, 1.02);

  return (
    <div className="stack pointer-events-none">
      <div
        className="stack bg-void"
        style={{ opacity: blackout, transition: 'opacity 120ms linear' }}
      />

      <Cue a={0.928} b={0.944} c={0.955} d={0.966} className="stack grid place-items-center px-[8vw]">
        <h2 className="t-display text-center scrim">Enough watching.</h2>
      </Cue>

      {/* the returning point of light */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: point }}
      >
        <div
          className="rounded-full bg-white"
          style={{
            width: 4 + point * 10,
            height: 4 + point * 10,
            boxShadow: `0 0 ${30 + point * 180}px ${6 + point * 60}px rgba(150,180,255,${0.35 * point})`,
          }}
        />
      </div>

      {/* Rendered only once it is actually on screen: an invisible button is
          still focusable, and a hidden call to action that can be tabbed into
          is a trapdoor out of the journey. */}
      {cta > 0.01 && (
      <div
        className="stack grid place-items-center px-[8vw]"
        style={{ opacity: cta, pointerEvents: cta > 0.6 ? 'auto' : 'none' }}
      >
        <div className="text-center scrim">
          <h2 className="t-display glow-soft mb-12">Enter the world.</h2>
          <button
            className="btn-cosmos"
            onClick={() => {
              blip(940, 0.16, 0.06);
              setStage('world');
            }}
            data-cursor="hover"
          >
            <span>Enter</span>
            <span aria-hidden>◈</span>
          </button>
          <p className="t-eyebrow mt-10 opacity-60 max-w-[40ch] mx-auto leading-relaxed">
            A walkable memorial hall · Contains AI-simulated characters, not the real people
          </p>
        </div>
      </div>
      )}
    </div>
  );
}
