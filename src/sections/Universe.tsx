import Cue from '../components/ui/Cue';
import { useStore } from '../state/useStore';
import { band } from '../utils/math';

/**
 * 01 — UNIVERSE
 *
 * Almost nothing, for a long time. One point of light, two statements, a
 * wordmark. The restraint here is what makes the black hole land later.
 */
export default function Universe() {
  const p = useStore((s) => s.progress);
  const dot = band(p, -0.05, -0.04, 0.004, 0.026);

  return (
    <div className="stack pointer-events-none select-none">
      {/* the first point of light */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ opacity: dot }}
      >
        <div
          className="rounded-full bg-white"
          style={{
            width: 3 + dot * 3,
            height: 3 + dot * 3,
            boxShadow: `0 0 ${10 + dot * 90}px ${2 + dot * 22}px rgba(190,205,255,${0.5 * dot})`,
          }}
        />
      </div>

      <Cue a={0.012} b={0.03} c={0.05} d={0.064} className="stack grid place-items-center px-[8vw]">
        <h2 className="t-display text-center glow-soft scrim">We are here.</h2>
      </Cue>

      <Cue a={0.058} b={0.074} c={0.088} d={0.1} className="stack grid place-items-center px-[8vw]">
        <h2 className="t-display-sm text-center max-w-[16ch] leading-[1.05] text-bone/90 scrim">
          In an unimaginably large universe.
        </h2>
      </Cue>

      <Cue
        a={0.098}
        b={0.112}
        c={0.128}
        d={0.145}
        rise={40}
        className="stack grid place-items-center px-[8vw]"
      >
        <div className="text-center scrim">
          <h1 className="t-display glow-soft" style={{ letterSpacing: '0.1em', paddingLeft: '0.1em' }}>
            COSMOS
          </h1>
          <p className="t-eyebrow mt-8">Two trillion galaxies · One address</p>
        </div>
      </Cue>

      {/* scroll invitation — only at the very top */}
      <Cue
        a={-0.05}
        b={-0.04}
        c={0.012}
        d={0.03}
        className="absolute bottom-[9vh] left-0 w-full grid place-items-center"
        rise={0}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="t-eyebrow">Scroll to travel</span>
          <span className="block w-px h-12 bg-gradient-to-b from-transparent via-bone/60 to-transparent animate-pulse" />
        </div>
      </Cue>
    </div>
  );
}
