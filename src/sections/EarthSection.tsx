import Cue from '../components/ui/Cue';
import { PLANET_BY_ID } from '../data/planets';

/**
 * 04 — EARTH
 *
 * The turn of the whole piece: the scale stops growing and starts shrinking,
 * from a system to a planet to the people on it.
 */
export default function EarthSection() {
  const earth = PLANET_BY_ID.earth;
  return (
    <div className="stack pointer-events-none">
      <Cue a={0.622} b={0.638} c={0.652} d={0.666} className="stack grid place-items-center px-[8vw]">
        <div className="text-center scrim">
          <p className="t-eyebrow mb-6">Chapter 04</p>
          <h2 className="t-display glow-soft">One planet.</h2>
        </div>
      </Cue>

      <Cue a={0.706} b={0.722} c={0.738} d={0.752} className="stack grid place-items-center px-[8vw]">
        <h2 className="t-display text-center glow-soft scrim">8 billion stories.</h2>
      </Cue>

      <Cue
        a={0.662}
        b={0.678}
        c={0.694}
        d={0.708}
        className="stack flex items-end pb-[12vh] px-[6vw] md:px-[8vw]"
      >
        {/* its own darkening field: this sits over the lit face of the planet */}
        <div
          className="absolute inset-x-0 bottom-0 h-[46vh] pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.82), rgba(0,0,0,0.45) 45%, transparent)',
          }}
        />
        <div className="relative w-full flex flex-col md:flex-row md:items-end justify-between gap-8">
          <p className="t-lead max-w-[34ch]">
            The only world in the observed universe known to carry life — and the only one
            where anybody has ever been remembered.
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4 md:max-w-[46ch]">
            {earth.facts.slice(0, 6).map((f) => (
              <div key={f.label}>
                <dt className="t-eyebrow mb-1">{f.label}</dt>
                <dd className="text-[0.82rem] text-bone/85 font-light leading-snug">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Cue>
    </div>
  );
}
