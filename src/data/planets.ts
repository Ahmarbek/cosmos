/**
 * The Solar System, as an artistic visualisation.
 *
 * Sizes and orbital distances here are NOT to scale. At true scale the rocky
 * planets are invisible dots and Neptune sits a thousand screens away, which
 * makes for accurate astronomy and an unusable scene. Radii are compressed
 * logarithmically and orbits are spaced for legibility; ordering, relative
 * rotation direction, axial tilt and orbital period ratios are kept honest.
 *
 * The written facts are real.
 */

export interface PlanetDef {
  id: string;
  name: string;
  index: string;
  /** display radius in scene units (artistic) */
  radius: number;
  /** orbital radius in scene units (artistic) */
  orbit: number;
  /** orbital period in Earth years — used for relative angular speed */
  period: number;
  /** axial tilt in degrees */
  tilt: number;
  /** self-rotation seconds per turn in the visualisation */
  spin: number;
  /** base surface colour and a secondary band/detail colour */
  colorA: string;
  colorB: string;
  /** atmosphere rim colour, empty string for airless bodies */
  atmosphere: string;
  atmosphereStrength: number;
  /** procedural surface style consumed by the planet shader */
  style: 'cratered' | 'clouded' | 'terrestrial' | 'desert' | 'banded' | 'ice';
  ring?: { inner: number; outer: number; color: string; tilt: number };
  moons?: { dist: number; size: number; speed: number }[];
  tagline: string;
  facts: { label: string; value: string }[];
  blurb: string;
}

export const SUN = {
  name: 'The Sun',
  radius: 22,
  facts: [
    { label: 'Type', value: 'G-type main-sequence star' },
    { label: 'Diameter', value: '1,392,700 km' },
    { label: 'Surface', value: 'about 5,500 °C' },
    { label: 'Core', value: 'about 15 million °C' },
    { label: 'Share of system mass', value: '99.86%' },
  ],
  blurb:
    'Everything else in the solar system — every planet, moon, asteroid and comet — is built from the fraction of one percent of matter the Sun did not take.',
};

export const PLANETS: PlanetDef[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    index: 'I',
    radius: 2.98,
    orbit: 32.2,
    period: 0.24,
    tilt: 0.03,
    spin: 90,
    colorA: '#9a9086',
    colorB: '#5d564f',
    atmosphere: '',
    atmosphereStrength: 0,
    style: 'cratered',
    tagline: 'Scorched, frozen, and barely holding an atmosphere at all.',
    facts: [
      { label: 'Diameter', value: '4,879 km' },
      { label: 'Distance from Sun', value: '0.39 AU' },
      { label: 'Day', value: '58.6 Earth days' },
      { label: 'Year', value: '88 Earth days' },
      { label: 'Moons', value: 'None' },
      { label: 'Surface', value: '−173 °C to 427 °C' },
    ],
    blurb:
      'The smallest planet and the closest to the Sun. With almost no atmosphere to move heat around, the difference between its day and night sides is the most extreme of any planet.',
  },
  {
    id: 'venus',
    name: 'Venus',
    index: 'II',
    radius: 6.12,
    orbit: 46.2,
    period: 0.62,
    tilt: 177.4,
    spin: 140,
    colorA: '#e8c98f',
    colorB: '#a8763f',
    atmosphere: '#ffd9a0',
    atmosphereStrength: 0.7,
    style: 'clouded',
    tagline: 'The hottest surface in the solar system, and it is not the closest planet.',
    facts: [
      { label: 'Diameter', value: '12,104 km' },
      { label: 'Distance from Sun', value: '0.72 AU' },
      { label: 'Day', value: '243 Earth days, retrograde' },
      { label: 'Year', value: '225 Earth days' },
      { label: 'Moons', value: 'None' },
      { label: 'Surface', value: 'about 464 °C' },
    ],
    blurb:
      'A runaway greenhouse effect under a carbon dioxide atmosphere keeps Venus hotter than Mercury. It also turns on its axis backwards, and so slowly that its day is longer than its year.',
  },
  {
    id: 'earth',
    name: 'Earth',
    index: 'III',
    radius: 6.48,
    orbit: 61.6,
    period: 1,
    tilt: 23.4,
    spin: 34,
    colorA: '#2f6ea8',
    colorB: '#3f7a44',
    atmosphere: '#6fb6ff',
    atmosphereStrength: 1,
    style: 'terrestrial',
    moons: [{ dist: 26, size: 0.95, speed: 0.55 }],
    tagline: 'The only place in the observed universe known to carry life.',
    facts: [
      { label: 'Diameter', value: '12,742 km' },
      { label: 'Distance from Sun', value: '1 AU — 149.6 million km' },
      { label: 'Day', value: '23 h 56 m' },
      { label: 'Year', value: '365.25 days' },
      { label: 'Moons', value: 'One' },
      { label: 'Surface', value: 'average about 15 °C' },
    ],
    blurb:
      'Liquid water, a magnetic field and a stable atmosphere — a narrow set of conditions that has held for billions of years.',
  },
  {
    id: 'mars',
    name: 'Mars',
    index: 'IV',
    radius: 4.02,
    orbit: 78.4,
    period: 1.88,
    tilt: 25.2,
    spin: 36,
    colorA: '#c1633a',
    colorB: '#6e3520',
    atmosphere: '#e08f5f',
    atmosphereStrength: 0.25,
    style: 'desert',
    moons: [
      { dist: 6.3, size: 0.61, speed: 1.4 },
      { dist: 8.82, size: 0.49, speed: 0.9 },
    ],
    tagline: 'Home to the tallest volcano and the deepest canyon yet found.',
    facts: [
      { label: 'Diameter', value: '6,779 km' },
      { label: 'Distance from Sun', value: '1.52 AU' },
      { label: 'Day', value: '24 h 37 m' },
      { label: 'Year', value: '687 Earth days' },
      { label: 'Moons', value: 'Two — Phobos and Deimos' },
      { label: 'Surface', value: 'average about −63 °C' },
    ],
    blurb:
      'Olympus Mons rises roughly 22 km above the surrounding plain. Valles Marineris runs for over 4,000 km. Water once flowed here; the evidence is written into the terrain.',
  },
];

PLANETS.push(
  {
    id: 'jupiter',
    name: 'Jupiter',
    index: 'V',
    radius: 19.25,
    orbit: 117.6,
    period: 11.86,
    tilt: 3.1,
    spin: 14,
    colorA: '#d6b48c',
    colorB: '#8a5a3c',
    atmosphere: '#ffd9b0',
    atmosphereStrength: 0.35,
    style: 'banded',
    moons: [
      { dist: 21.42, size: 1.22, speed: 1.1 },
      { dist: 26.46, size: 1.05, speed: 0.8 },
      { dist: 31.5, size: 1.49, speed: 0.6 },
      { dist: 37.8, size: 1.31, speed: 0.45 },
    ],
    tagline: 'Twice the mass of every other planet combined.',
    facts: [
      { label: 'Diameter', value: '139,820 km' },
      { label: 'Distance from Sun', value: '5.20 AU' },
      { label: 'Day', value: '9 h 56 m — the fastest in the system' },
      { label: 'Year', value: '11.9 Earth years' },
      { label: 'Moons', value: '95 confirmed, and still counting' },
      { label: 'Great Red Spot', value: 'A storm observed for well over a century' },
    ],
    blurb:
      'A gas giant with no solid surface to land on. Its gravity shapes the asteroid belt and has deflected or captured objects that might otherwise have reached the inner planets.',
  },
  {
    id: 'saturn',
    name: 'Saturn',
    index: 'VI',
    radius: 16.45,
    orbit: 150.5,
    period: 29.45,
    tilt: 26.7,
    spin: 16,
    colorA: '#e6d3a3',
    colorB: '#b09257',
    atmosphere: '#ffeec2',
    atmosphereStrength: 0.3,
    style: 'banded',
    ring: { inner: 21.88, outer: 33.0, color: '#d9c9a0', tilt: 26.7 },
    moons: [
      { dist: 32.76, size: 1.4, speed: 0.7 },
      { dist: 39.06, size: 0.88, speed: 0.5 },
    ],
    tagline: 'Rings a few tens of metres thick, spanning hundreds of thousands of kilometres.',
    facts: [
      { label: 'Diameter', value: '116,460 km' },
      { label: 'Distance from Sun', value: '9.58 AU' },
      { label: 'Day', value: '10 h 42 m' },
      { label: 'Year', value: '29.4 Earth years' },
      { label: 'Moons', value: '146 confirmed' },
      { label: 'Density', value: 'Less than water' },
    ],
    blurb:
      'The rings are made almost entirely of water ice, in pieces from dust grains to house-sized blocks. They are vast across and astonishingly thin from edge to edge.',
  },
  {
    id: 'uranus',
    name: 'Uranus',
    index: 'VII',
    radius: 9.8,
    orbit: 180.6,
    period: 84.02,
    tilt: 97.8,
    spin: 22,
    colorA: '#9fd8e0',
    colorB: '#5e9fae',
    atmosphere: '#b8f0ff',
    atmosphereStrength: 0.5,
    style: 'ice',
    ring: { inner: 13.12, outer: 18.38, color: '#8fb9c4', tilt: 97.8 },
    tagline: 'Tipped over on its side, most likely by an ancient collision.',
    facts: [
      { label: 'Diameter', value: '50,724 km' },
      { label: 'Distance from Sun', value: '19.2 AU' },
      { label: 'Day', value: '17 h 14 m, retrograde' },
      { label: 'Year', value: '84 Earth years' },
      { label: 'Axial tilt', value: '97.8 degrees' },
      { label: 'Moons', value: 'At least 27' },
    ],
    blurb:
      'An ice giant that effectively rolls along its orbit. Each pole spends about 42 years in continuous sunlight, then 42 years in darkness.',
  },
  {
    id: 'neptune',
    name: 'Neptune',
    index: 'VIII',
    radius: 9.45,
    orbit: 208.6,
    period: 164.8,
    tilt: 28.3,
    spin: 21,
    colorA: '#3f6fd8',
    colorB: '#24408c',
    atmosphere: '#6f9dff',
    atmosphereStrength: 0.6,
    style: 'ice',
    moons: [{ dist: 11.97, size: 1.22, speed: -0.6 }],
    tagline: 'The windiest place we know of, and the last of the planets.',
    facts: [
      { label: 'Diameter', value: '49,244 km' },
      { label: 'Distance from Sun', value: '30.1 AU' },
      { label: 'Day', value: '16 h 6 m' },
      { label: 'Year', value: '164.8 Earth years' },
      { label: 'Winds', value: 'Over 2,000 km/h' },
      { label: 'Moons', value: 'At least 14' },
    ],
    blurb:
      'Found by mathematics before it was found by telescope: irregularities in the orbit of Uranus pointed to where it had to be. Sunlight here is about a thousandth of its strength at Earth.',
  },
);

export const PLANET_BY_ID = Object.fromEntries(PLANETS.map((p) => [p.id, p])) as Record<
  string,
  PlanetDef
>;
