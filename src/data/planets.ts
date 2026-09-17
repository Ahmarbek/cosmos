import type { Text } from '../i18n/lang';
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
  name: Text;
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
  tagline: Text;
  facts: { label: Text; value: Text }[];
  blurb: Text;
}

export const SUN = {
  name: { en: 'The Sun', uz: 'Quyosh' },
  radius: 22,
  facts: [
    { label: { en: 'Type', uz: 'Turi' }, value: { en: 'G-type main-sequence star', uz: 'G sinfidagi bosh ketma-ketlik yulduzi' } },
    { label: { en: 'Diameter', uz: 'Diametri' }, value: '1,392,700 km' },
    { label: { en: 'Surface', uz: 'Sirti' }, value: { en: 'about 5,500 °C', uz: 'taxminan 5 500 °C' } },
    { label: { en: 'Core', uz: 'Yadrosi' }, value: { en: 'about 15 million °C', uz: 'taxminan 15 million °C' } },
    { label: { en: 'Share of system mass', uz: 'Tizim massasidagi ulushi' }, value: { en: '99.86%', uz: '99,86%' } },
  ],
  blurb:
    { en: 'Everything else in the solar system — every planet, moon, asteroid and comet — is built from the fraction of one percent of matter the Sun did not take.', uz: 'Quyosh tizimidagi qolgan hamma narsa — har bir sayyora, yoʻldosh, asteroid va kometa — Quyosh olmay qoldirgan bir foizning ulushidan qurilgan.' },
};

export const PLANETS: PlanetDef[] = [
  {
    id: 'mercury',
    name: { en: 'Mercury', uz: 'Merkuriy' },
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
    tagline: { en: 'Scorched, frozen, and barely holding an atmosphere at all.', uz: 'Kuygan, muzlagan va deyarli atmosferasiz.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '4,879 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '0.39 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '58.6 Earth days', uz: '58,6 Yer sutkasi' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '88 Earth days', uz: '88 Yer sutkasi' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'None', uz: 'Yoʻq' } },
      { label: { en: 'Surface', uz: 'Sirti' }, value: { en: '−173 °C to 427 °C', uz: '−173 °C dan 427 °C gacha' } },
    ],
    blurb:
      { en: 'The smallest planet and the closest to the Sun. With almost no atmosphere to move heat around, the difference between its day and night sides is the most extreme of any planet.', uz: 'Eng kichik va Quyoshga eng yaqin sayyora. Issiqlikni tarqatadigan atmosfera deyarli boʻlmagani uchun uning kunduzgi va tungi tomonlari orasidagi farq barcha sayyoralar ichida eng keskin.' },
  },
  {
    id: 'venus',
    name: { en: 'Venus', uz: 'Venera' },
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
    tagline: { en: 'The hottest surface in the solar system, and it is not the closest planet.', uz: 'Quyosh tizimidagi eng issiq sirt — va u Quyoshga eng yaqin sayyora emas.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '12,104 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '0.72 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '243 Earth days, retrograde', uz: '243 Yer sutkasi, teskari yoʻnalishda' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '225 Earth days', uz: '225 Yer sutkasi' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'None', uz: 'Yoʻq' } },
      { label: { en: 'Surface', uz: 'Sirti' }, value: { en: 'about 464 °C', uz: 'taxminan 464 °C' } },
    ],
    blurb:
      { en: 'A runaway greenhouse effect under a carbon dioxide atmosphere keeps Venus hotter than Mercury. It also turns on its axis backwards, and so slowly that its day is longer than its year.', uz: 'Karbonat angidrid atmosferasi ostidagi nazoratsiz issiqxona effekti Venerani Merkuriydan ham issiqroq saqlaydi. U oʻz oʻqi atrofida teskari va shu qadar sekin aylanadiki, sutkasi yilidan uzun.' },
  },
  {
    id: 'earth',
    name: { en: 'Earth', uz: 'Yer' },
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
    tagline: { en: 'The only place in the observed universe known to carry life.', uz: 'Kuzatilgan olamda hayot borligi maʼlum boʻlgan yagona joy.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '12,742 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: { en: '1 AU — 149.6 million km', uz: '1 a.b. — 149,6 million km' } },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '23 h 56 m', uz: '23 soat 56 daqiqa' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '365.25 days', uz: '365,25 sutka' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'One', uz: 'Bitta' } },
      { label: { en: 'Surface', uz: 'Sirti' }, value: { en: 'average about 15 °C', uz: 'oʻrtacha 15 °C atrofida' } },
    ],
    blurb:
      { en: 'Liquid water, a magnetic field and a stable atmosphere — a narrow set of conditions that has held for billions of years.', uz: 'Suyuq suv, magnit maydon va barqaror atmosfera — milliardlab yillar davomida saqlanib kelgan tor sharoitlar toʻplami.' },
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
    tagline: { en: 'Home to the tallest volcano and the deepest canyon yet found.', uz: 'Hozirgacha topilgan eng baland vulqon va eng chuqur kanyon vatani.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '6,779 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '1.52 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '24 h 37 m', uz: '24 soat 37 daqiqa' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '687 Earth days', uz: '687 Yer sutkasi' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'Two — Phobos and Deimos', uz: 'Ikkita — Fobos va Deymos' } },
      { label: { en: 'Surface', uz: 'Sirti' }, value: { en: 'average about −63 °C', uz: 'oʻrtacha −63 °C atrofida' } },
    ],
    blurb:
      { en: 'Olympus Mons rises roughly 22 km above the surrounding plain. Valles Marineris runs for over 4,000 km. Water once flowed here; the evidence is written into the terrain.', uz: 'Olimp togʻi atrofdagi tekislikdan qariyb 22 km koʻtarilgan. Mariner vodiysi 4 000 km dan ortiq choʻzilgan. Bir vaqtlar bu yerda suv oqqan; dalili relyefga bitilgan.' },
  },
];

PLANETS.push(
  {
    id: 'jupiter',
    name: { en: 'Jupiter', uz: 'Yupiter' },
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
    tagline: { en: 'Twice the mass of every other planet combined.', uz: 'Qolgan barcha sayyoralar yigʻindisidan ikki barobar ogʻir.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '139,820 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '5.20 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '9 h 56 m — the fastest in the system', uz: '9 soat 56 daqiqa — tizimdagi eng tezi' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '11.9 Earth years', uz: '11,9 Yer yili' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: '95 confirmed, and still counting', uz: '95 tasi tasdiqlangan, hisob davom etmoqda' } },
      { label: { en: 'Great Red Spot', uz: 'Katta Qizil Dogʻ' }, value: { en: 'A storm observed for well over a century', uz: 'Bir asrdan ortiq kuzatilayotgan boʻron' } },
    ],
    blurb:
      { en: 'A gas giant with no solid surface to land on. Its gravity shapes the asteroid belt and has deflected or captured objects that might otherwise have reached the inner planets.', uz: 'Qoʻnish uchun qattiq sirti boʻlmagan gaz giganti. Uning tortishishi asteroidlar kamarini shakllantiradi hamda ichki sayyoralarga yetib borishi mumkin boʻlgan jismlarni ogʻdirgan yoki oʻziga tortib olgan.' },
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
    tagline: { en: 'Rings a few tens of metres thick, spanning hundreds of thousands of kilometres.', uz: 'Qalinligi bir necha oʻn metr, kengligi yuz minglab kilometr boʻlgan halqalar.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '116,460 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '9.58 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '10 h 42 m', uz: '10 soat 42 daqiqa' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '29.4 Earth years', uz: '29,4 Yer yili' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: '146 confirmed', uz: '146 tasi tasdiqlangan' } },
      { label: { en: 'Density', uz: 'Zichligi' }, value: { en: 'Less than water', uz: 'Suvnikidan kam' } },
    ],
    blurb:
      { en: 'The rings are made almost entirely of water ice, in pieces from dust grains to house-sized blocks. They are vast across and astonishingly thin from edge to edge.', uz: 'Halqalar deyarli butunlay suv muzidan iborat — chang zarrasidan uy kattaligidagi boʻlaklargacha. Ular koʻndalangiga ulkan, qalinligi esa hayratlanarli darajada yupqa.' },
  },
  {
    id: 'uranus',
    name: { en: 'Uranus', uz: 'Uran' },
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
    tagline: { en: 'Tipped over on its side, most likely by an ancient collision.', uz: 'Katta ehtimol bilan qadimgi toʻqnashuvdan yonboshiga agʻdarilgan.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '50,724 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '19.2 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '17 h 14 m, retrograde', uz: '17 soat 14 daqiqa, teskari yoʻnalishda' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '84 Earth years', uz: '84 Yer yili' } },
      { label: { en: 'Axial tilt', uz: 'Oʻq qiyaligi' }, value: { en: '97.8 degrees', uz: '97,8 daraja' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'At least 27', uz: 'Kamida 27 ta' } },
    ],
    blurb:
      { en: 'An ice giant that effectively rolls along its orbit. Each pole spends about 42 years in continuous sunlight, then 42 years in darkness.', uz: 'Orbitasi boʻylab deyarli dumalab boradigan muz giganti. Har bir qutbi taxminan 42 yil uzluksiz quyosh nurida, keyin 42 yil zulmatda boʻladi.' },
  },
  {
    id: 'neptune',
    name: { en: 'Neptune', uz: 'Neptun' },
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
    tagline: { en: 'The windiest place we know of, and the last of the planets.', uz: 'Biz biladigan eng shamolli joy va sayyoralarning oxirgisi.' },
    facts: [
      { label: { en: 'Diameter', uz: 'Diametri' }, value: '49,244 km' },
      { label: { en: 'Distance from Sun', uz: 'Quyoshdan masofa' }, value: '30.1 AU' },
      { label: { en: 'Day', uz: 'Sutkasi' }, value: { en: '16 h 6 m', uz: '16 soat 6 daqiqa' } },
      { label: { en: 'Year', uz: 'Yili' }, value: { en: '164.8 Earth years', uz: '164,8 Yer yili' } },
      { label: { en: 'Winds', uz: 'Shamollari' }, value: { en: 'Over 2,000 km/h', uz: 'Soatiga 2 000 km dan ortiq' } },
      { label: { en: 'Moons', uz: 'Yoʻldoshlari' }, value: { en: 'At least 14', uz: 'Kamida 14 ta' } },
    ],
    blurb:
      { en: 'Found by mathematics before it was found by telescope: irregularities in the orbit of Uranus pointed to where it had to be. Sunlight here is about a thousandth of its strength at Earth.', uz: 'Teleskopdan oldin matematika yordamida topilgan: Uran orbitasidagi ogʻishlar uning qayerda boʻlishi kerakligini koʻrsatdi. Bu yerdagi quyosh nuri Yerdagisidan taxminan ming baravar zaif.' },
  },
);

export const PLANET_BY_ID = Object.fromEntries(PLANETS.map((p) => [p.id, p])) as Record<
  string,
  PlanetDef
>;
