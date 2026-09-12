/**
 * Black hole chapter copy.
 *
 * The physics here is standard, textbook general relativity. The visualisation
 * beside it is a real-time approximation, not a scientific simulation, and the
 * UI says so where it matters.
 */

export interface BHTopic {
  id: string;
  index: string;
  title: string;
  lead: string;
  body: string;
  /** normalized position inside the black-hole chapter where this panel lives */
  at: number;
  figure?: 'horizon' | 'singularity' | 'disk' | 'dilation' | 'formation' | 'scale';
}

export const BH_TOPICS: BHTopic[] = [
  {
    id: 'what',
    index: '01',
    title: 'What is a black hole?',
    lead: 'A region where gravity has closed the exits.',
    body: 'Put enough mass into a small enough volume and spacetime curves so steeply that every path out of the region bends back inward. Nothing escapes — not matter, not light. A black hole is not a thing sitting in space so much as a shape that space itself has taken.',
    at: 0.06,
    figure: 'horizon',
  },
  {
    id: 'horizon',
    index: '02',
    title: 'The event horizon',
    lead: 'The boundary, and the point of no return.',
    body: 'The horizon is the surface at which the escape velocity reaches the speed of light. It is not a physical membrane: there is nothing to touch, and an infalling observer crossing a large one would notice no local landmark. It marks the last place from which any signal can still reach the outside universe.',
    at: 0.2,
    figure: 'horizon',
  },
  {
    id: 'disk',
    index: '03',
    title: 'The accretion disk',
    lead: 'The brightest objects in the universe are things falling in.',
    body: 'Gas spiralling inward cannot fall straight down; it forms a flattened disk and shears against itself. Friction and magnetic stress heat that gas to millions of degrees, so it radiates in ultraviolet and X-rays. The glow you see is not the black hole. It is the queue.',
    at: 0.34,
    figure: 'disk',
  },
  {
    id: 'lensing',
    index: '04',
    title: 'Light that bends around it',
    lead: 'You see the far side of the disk above and below the near side.',
    body: 'Gravity deflects light, so the disk behind the black hole is lifted into view over the top and under the bottom, wrapping the shadow in a ring. At roughly 1.5 times the horizon radius lies the photon sphere, where light can orbit. The dark silhouette it produces looks about 2.6 times wider than the horizon itself.',
    at: 0.46,
    figure: 'disk',
  },
  {
    id: 'dilation',
    index: '05',
    title: 'Gravitational time dilation',
    lead: 'Clocks run slower the deeper they sit in gravity.',
    body: 'To a distant observer, a probe approaching the horizon appears to slow, dim and redden without limit, never quite arriving. To the probe, nothing unusual happens to its own clock and the crossing takes a finite, ordinary amount of time. Both accounts are correct.',
    at: 0.58,
    figure: 'dilation',
  },
  {
    id: 'singularity',
    index: '06',
    title: 'The singularity',
    lead: 'Where the equations stop answering.',
    body: 'General relativity predicts that the collapsed matter reaches a point of infinite density at the centre. Infinity in a physical theory is a signal that the theory has been pushed past its range. Describing what is actually there needs a quantum theory of gravity, which does not yet exist.',
    at: 0.68,
    figure: 'singularity',
  },
  {
    id: 'formation',
    index: '07',
    title: 'How they form',
    lead: 'The collapse of a massive star, at the end of everything else.',
    body: 'A star holds itself open against gravity with the pressure of fusion. When the core runs out of usable fuel, that support fails in seconds. If the remaining core is above roughly two to three solar masses, no known force can stop the collapse, and the outer layers blow away as a supernova.',
    at: 0.78,
    figure: 'formation',
  },
  {
    id: 'stellar',
    index: '08',
    title: 'Stellar-mass black holes',
    lead: 'A few times the mass of the Sun, a few kilometres across.',
    body: 'These are the remnants of individual stars. When two of them spiral together and merge, the collision shakes spacetime itself; those gravitational waves have been detected directly since 2015, and each detection is a black hole pair confirming its own existence.',
    at: 0.86,
    figure: 'scale',
  },
  {
    id: 'supermassive',
    index: '09',
    title: 'Supermassive black holes',
    lead: 'Millions to billions of solar masses, at the centre of galaxies.',
    body: 'Sagittarius A*, at the centre of the Milky Way, holds about 4.3 million solar masses. M87* holds around 6.5 billion. How they grew so large so early is an open question. Both have now been imaged by the Event Horizon Telescope — M87* in 2019, Sagittarius A* in 2022.',
    at: 0.92,
    figure: 'scale',
  },
  {
    id: 'crossing',
    index: '10',
    title: 'If something crosses',
    lead: 'It depends entirely on how big the black hole is.',
    body: 'Near a stellar-mass black hole the difference in gravity between your head and your feet is lethal long before the horizon — you are stretched into a thread. At a supermassive one the tidal forces at the horizon are gentle enough to cross without noticing. Either way the path afterward leads inward only. Whether the information that fell in is destroyed or somehow preserved is still argued over.',
    at: 0.97,
    figure: 'singularity',
  },
];

export const BH_DISCLAIMER =
  'Interactive visualisation. Light paths are integrated in real time from a simplified Schwarzschild approximation — close to the real geometry in spirit, not a scientific simulation.';
