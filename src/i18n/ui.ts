import type { L } from './lang';

/**
 * Interface copy.
 *
 * Everything the interface says that is not part of the subject matter itself.
 * The chapters' facts live with the data they describe — see data/planets.ts,
 * data/blackhole.ts and data/icons.ts — so that a fact and its translation
 * cannot drift apart from each other.
 */
export const UI = {
  // ── document ────────────────────────────────────────────────────────────
  title: {
    en: 'COSMOS — A Journey From The Universe To Us',
    uz: 'KOINOT — Olamdan bizgacha boʻlgan sayohat',
  },
  description: {
    en: 'COSMOS is a cinematic interactive journey: from the scale of the universe, through black holes and the solar system, to Earth, humanity, and an explorable world.',
    uz: 'KOINOT — kinematik interaktiv sayohat: olam koʻlamidan qora tuynuklar va Quyosh tizimi orqali Yerga, insoniyatga va kezish mumkin boʻlgan olamga.',
  },

  // ── wordmark and chapters ───────────────────────────────────────────────
  wordmark: { en: 'COSMOS', uz: 'KOINOT' },
  wordmarkSmall: { en: 'Cosmos', uz: 'Koinot' },
  chapterUniverse: { en: 'Universe', uz: 'Olam' },
  chapterBlackHoles: { en: 'Black Holes', uz: 'Qora tuynuklar' },
  chapterSolar: { en: 'Solar System', uz: 'Quyosh tizimi' },
  chapterEarth: { en: 'Earth', uz: 'Yer' },
  chapterIcons: { en: 'Icons', uz: 'Timsollar' },
  chapterWorld: { en: 'Enter World', uz: 'Olamga kirish' },
  journeyChapters: { en: 'Journey chapters', uz: 'Sayohat boblari' },
  language: { en: 'Language', uz: 'Til' },

  // ── loader ──────────────────────────────────────────────────────────────
  loadRenderer: { en: 'Calibrating renderer', uz: 'Render sozlanmoqda' },
  loadStarfield: { en: 'Seeding starfield', uz: 'Yulduzlar sepilmoqda' },
  loadGeodesics: { en: 'Integrating geodesics', uz: 'Geodezik yoʻllar hisoblanmoqda' },
  loadSystem: { en: 'Assembling solar system', uz: 'Quyosh tizimi yigʻilmoqda' },
  loadEarth: { en: 'Mapping Earth', uz: 'Yer xaritalanmoqda' },
  loadArchive: { en: 'Opening the archive', uz: 'Arxiv ochilmoqda' },
  tagline: { en: 'A journey from everything to us', uz: 'Hamma narsadan bizgacha boʻlgan sayohat' },
  systemsNominal: { en: 'Systems nominal', uz: 'Tizimlar tayyor' },
  enter: { en: 'Enter', uz: 'Kirish' },
  scrollSound: { en: 'Scroll to travel · Sound optional', uz: 'Sayohat uchun pastga suring · Ovoz ixtiyoriy' },
  buildingTheHall: { en: 'Building the hall…', uz: 'Zal qurilmoqda…' },
  requiresJavaScript: { en: 'This experience requires JavaScript.', uz: 'Bu tajriba uchun JavaScript kerak.' },

  // ── 01 universe ─────────────────────────────────────────────────────────
  weAreHere: { en: 'We are here.', uz: 'Biz shu yerdamiz.' },
  inALargeUniverse: {
    en: 'In an unimaginably large universe.',
    uz: 'Tasavvurga sigʻmaydigan darajada ulkan olamda.',
  },
  twoTrillion: { en: 'Two trillion galaxies · One address', uz: 'Ikki trillion galaktika · Bitta manzil' },
  scrollToTravel: { en: 'Scroll to travel', uz: 'Sayohat uchun pastga suring' },

  // ── 02 black holes ──────────────────────────────────────────────────────
  chapter02: { en: 'Chapter 02', uz: '02-bob' },
  blackHolesLead: {
    en: 'The densest objects that exist, and the only places where the theory that describes gravity stops being able to describe anything.',
    uz: 'Mavjud eng zich jismlar va tortishishni tavsiflovchi nazariya hech narsani tavsiflay olmay qoladigan yagona joylar.',
  },
  inspectObject: { en: 'Inspect the object', uz: 'Jismni kuzatish' },
  dragOrbitZoom: {
    en: 'Drag to orbit · Scroll to zoom',
    uz: 'Aylanish uchun torting · Yaqinlashtirish uchun suring',
  },
  returnToJourney: { en: 'Return to the journey', uz: 'Sayohatga qaytish' },

  // ── 03 solar system ─────────────────────────────────────────────────────
  ourHome: { en: 'Our home.', uz: 'Bizning uyimiz.' },
  chapter03: { en: 'Chapter 03', uz: '03-bob' },
  solarSystemLead: {
    en: 'One ordinary star, eight planets, and everything we have ever touched.',
    uz: 'Bitta oddiy yulduz, sakkizta sayyora va biz qoʻl tekkizgan hamma narsa.',
  },
  exploreSystem: { en: 'Explore the system', uz: 'Tizimni kashf etish' },
  planetsAria: { en: 'Planets', uz: 'Sayyoralar' },
  planetWord: { en: 'Planet', uz: 'Sayyora' },
  dragOrbitZoomSelect: {
    en: 'Drag to orbit · Scroll to zoom · Select a planet to focus',
    uz: 'Aylanish uchun torting · Yaqinlashtirish uchun suring · Sayyorani tanlang',
  },
  solarDisclaimer: {
    en: 'Artistic visualisation. Planet sizes and orbital distances are compressed for legibility; ordering, relative periods, axial tilts and rotation directions follow the real bodies.',
    uz: 'Badiiy vizualizatsiya. Sayyoralarning oʻlchami va orbital masofalari koʻrinish uchun siqilgan; tartib, nisbiy davrlar, oʻq qiyaligi va aylanish yoʻnalishi haqiqiy jismlarga mos keladi.',
  },

  // ── 04 earth ────────────────────────────────────────────────────────────
  chapter04: { en: 'Chapter 04', uz: '04-bob' },
  onePlanet: { en: 'One planet.', uz: 'Bitta sayyora.' },
  eightBillionStories: { en: '8 billion stories.', uz: '8 milliard hikoya.' },
  earthLead: {
    en: 'The only world in the observed universe known to carry life — and the only one where anybody has ever been remembered.',
    uz: 'Kuzatilgan olamda hayot borligi maʼlum boʻlgan yagona dunyo — va kimdir xotirada qolgan yagona joy.',
  },

  // ── 05 icons ────────────────────────────────────────────────────────────
  chapter05: { en: 'Chapter 05', uz: '05-bob' },
  iconsHead: {
    en: 'From billions of people, a few became unforgettable.',
    uz: 'Milliardlab odamlar ichidan bir nechtasi unutilmas boʻlib qoldi.',
  },
  iconsWord: { en: 'ICONS', uz: 'TIMSOLLAR' },
  iconsSub: {
    en: 'People who changed culture · Not a ranking',
    uz: 'Madaniyatni oʻzgartirganlar · Reyting emas',
  },
  openProfile: { en: 'Open profile', uz: 'Profilni ochish' },
  meetIcon: { en: 'Meet icon →', uz: 'Tanishish →' },

  // ── 06 threshold ────────────────────────────────────────────────────────
  enoughWatching: { en: 'Enough watching.', uz: 'Kuzatish yetar.' },
  enterTheWorld: { en: 'Enter the world.', uz: 'Olamga kiring.' },
  worldNote: {
    en: 'A walkable memorial hall · Contains AI-simulated characters, not the real people',
    uz: 'Kezish mumkin boʻlgan xotira zali · Sunʼiy intellekt taqlid qilgan obrazlar, haqiqiy insonlar emas',
  },

  // ── sound ───────────────────────────────────────────────────────────────
  soundOn: { en: 'Sound on', uz: 'Ovoz yoniq' },
  soundOff: { en: 'Sound off', uz: 'Ovoz oʻchiq' },
  turnSoundOn: { en: 'Turn sound on', uz: 'Ovozni yoqish' },
  turnSoundOff: { en: 'Turn sound off', uz: 'Ovozni oʻchirish' },

  // ── diagrams ────────────────────────────────────────────────────────────
  figHorizon: { en: 'EVENT HORIZON · PHOTON SPHERE', uz: 'HODISALAR UFQI · FOTON SFERASI' },
  figDisk: { en: 'DISK · LENSED FAR SIDE', uz: 'DISK · LINZALANGAN UZOQ TOMON' },
  figDilation: { en: 'FAR CLOCK · NEAR CLOCK', uz: 'UZOQ SOAT · YAQIN SOAT' },
  figSingularity: { en: 'CURVATURE WITHOUT LIMIT', uz: 'CHEKSIZ EGRILIK' },
  figFormation: { en: 'STAR · SUPERNOVA · REMNANT', uz: 'YULDUZ · OʻTA YANGI · QOLDIQ' },

  // ── profile ─────────────────────────────────────────────────────────────
  biography: { en: 'Biography', uz: 'Tarjimayi hol' },
  culturalImpact: { en: 'Cultural impact', uz: 'Madaniy taʼsir' },
  achievements: { en: 'Achievements', uz: 'Yutuqlar' },
  majorWorks: { en: 'Major works', uz: 'Asosiy ishlar' },
  timeline: { en: 'Timeline', uz: 'Xronologiya' },
  meetInWorld: { en: 'Meet in the world', uz: 'Olamda uchrashish' },
  backToIcons: { en: 'Back to icons', uz: 'Timsollarga qaytish' },
  close: { en: 'Close', uz: 'Yopish' },
  photograph: { en: 'Photograph', uz: 'Surat' },
  generativeIllustration: {
    en: 'Generative illustration — not a photograph',
    uz: 'Generativ tasvir — surat emas',
  },
  fieldMusic: { en: 'Music', uz: 'Musiqa' },
  fieldSport: { en: 'Sport', uz: 'Sport' },
  fieldScience: { en: 'Science', uz: 'Fan' },
  fieldArt: { en: 'Art', uz: 'Sanʼat' },
  fieldTechnology: { en: 'Technology', uz: 'Texnologiya' },
  fieldFilm: { en: 'Film', uz: 'Kino' },
  publicDomain: { en: 'Public domain', uz: 'Umumiy mulk' },

  // ── the world ───────────────────────────────────────────────────────────
  hallOfIcons: { en: 'The Hall of Icons', uz: 'Timsollar zali' },
  walkItYourself: { en: 'Walk it yourself.', uz: 'Oʻzingiz kezib chiqing.' },
  worldBrief: {
    en: 'The ten figures here are interactive AI characters — simulations built from documented public information. They are not the real people, and nothing they say is a genuine quotation.',
    uz: 'Bu yerdagi oʻnta obraz — interaktiv sunʼiy intellekt qahramonlari, hujjatlashtirilgan ochiq maʼlumot asosida qurilgan taqlidlar. Ular haqiqiy insonlar emas va ular aytgan hech bir gap haqiqiy iqtibos emas.',
  },
  begin: { en: 'Begin', uz: 'Boshlash' },
  clickToTakeControl: { en: 'Click to take control', uz: 'Boshqaruvni olish uchun bosing' },
  tapToInteract: { en: 'Tap to interact', uz: 'Muloqot uchun bosing' },
  pressEToInteract: { en: 'Press E to interact', uz: 'Muloqot uchun E ni bosing' },
  returnToCosmos: { en: '← Return to Cosmos', uz: '← Koinotga qaytish' },
  paused: { en: 'Paused', uz: 'Toʻxtatilgan' },
  keyMove: { en: 'move', uz: 'yurish' },
  keyLook: { en: 'look', uz: 'qarash' },
  keyRun: { en: 'run', uz: 'yugurish' },
  keyJump: { en: 'jump', uz: 'sakrash' },
  keyInteract: { en: 'interact', uz: 'muloqot' },
  keyRelease: { en: 'release', uz: 'chiqish' },
  keyMouse: { en: 'Mouse', uz: 'Sichqoncha' },
  keyStick: { en: 'Stick', uz: 'Joystik' },
  keyDrag: { en: 'Drag', uz: 'Surish' },
  keyTap: { en: 'Tap', uz: 'Bosish' },

  // ── conversation ────────────────────────────────────────────────────────
  interactiveAiCharacter: { en: 'Interactive AI character', uz: 'Interaktiv SI qahramoni' },
  chatDisclaimer: {
    en: 'A simulation, not the person. Answers are drawn from documented public information and are not genuine quotations.',
    uz: 'Bu taqlid, insonning oʻzi emas. Javoblar hujjatlashtirilgan ochiq maʼlumotdan olingan va haqiqiy iqtibos emas.',
  },
  you: { en: 'You', uz: 'Siz' },
  thinking: { en: 'Thinking', uz: 'Oʻylamoqda' },
  askAQuestion: { en: 'Ask a question…', uz: 'Savol bering…' },
  yourQuestion: { en: 'Your question', uz: 'Savolingiz' },
  send: { en: 'Send →', uz: 'Yuborish →' },
  answeredByModel: {
    en: 'Answered by a language model, constrained to public record',
    uz: 'Til modeli javob berdi, faqat ochiq maʼlumot doirasida',
  },
  answeredByLocal: {
    en: 'Answered by the local engine — no API key configured',
    uz: 'Mahalliy dvigatel javob berdi — API kaliti sozlanmagan',
  },
  tapToClose: { en: 'Tap close to step back into the hall', uz: 'Zalga qaytish uchun yopishni bosing' },
  escToClose: { en: 'Press Escape to step back into the hall', uz: 'Zalga qaytish uchun Escape ni bosing' },
  characterUnreachable: {
    en: 'The character could not be reached. Try again.',
    uz: 'Qahramon bilan bogʻlanib boʻlmadi. Qayta urinib koʻring.',
  },
  notInThisHall: { en: 'That character is not part of this hall.', uz: 'Bu qahramon ushbu zalda yoʻq.' },
  unknown: { en: 'Unknown', uz: 'Nomaʼlum' },
} satisfies Record<string, L>;

/** The five figure captions, keyed the way Diagram receives them. */
export const FIGURE_CAPTION = {
  horizon: UI.figHorizon,
  disk: UI.figDisk,
  dilation: UI.figDilation,
  singularity: UI.figSingularity,
  formation: UI.figFormation,
  scale: UI.figFormation,
} satisfies Record<string, L>;

/** Display labels for the icon field enum, which the portrait generator reads. */
export const FIELD_LABEL = {
  music: UI.fieldMusic,
  sport: UI.fieldSport,
  science: UI.fieldScience,
  art: UI.fieldArt,
  technology: UI.fieldTechnology,
  film: UI.fieldFilm,
} satisfies Record<string, L>;
