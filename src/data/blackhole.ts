/**
 * Black hole chapter copy.
 *
 * The physics here is standard, textbook general relativity. The visualisation
 * beside it is a real-time approximation, not a scientific simulation, and the
 * UI says so where it matters.
 */

import type { Text } from '../i18n/lang';

export interface BHTopic {
  id: string;
  index: string;
  title: Text;
  lead: Text;
  body: Text;
  /** normalized position inside the black-hole chapter where this panel lives */
  at: number;
  figure?: 'horizon' | 'singularity' | 'disk' | 'dilation' | 'formation' | 'scale';
}

export const BH_TOPICS: BHTopic[] = [
  {
    id: 'what',
    index: '01',
    title: { en: 'What is a black hole?', uz: 'Qora tuynuk nima?' },
    lead: { en: 'A region where gravity has closed the exits.', uz: 'Tortishish barcha chiqish yoʻllarini yopgan hudud.' },
    body: { en: 'Put enough mass into a small enough volume and spacetime curves so steeply that every path out of the region bends back inward. Nothing escapes — not matter, not light. A black hole is not a thing sitting in space so much as a shape that space itself has taken.', uz: 'Yetarlicha katta massani yetarlicha kichik hajmga joylang — fazo-vaqt shu qadar keskin egiladiki, hududdan chiqadigan har qanday yoʻl yana ichkariga qayriladi. Hech narsa qochib chiqolmaydi — na modda, na yorugʻlik. Qora tuynuk fazoda turgan jism emas, balki fazoning oʻzi olgan shakl.' },
    at: 0.06,
    figure: 'horizon',
  },
  {
    id: 'horizon',
    index: '02',
    title: { en: 'The event horizon', uz: 'Hodisalar ufqi' },
    lead: { en: 'The boundary, and the point of no return.', uz: 'Chegara va ortga qaytmas nuqta.' },
    body: { en: 'The horizon is the surface at which the escape velocity reaches the speed of light. It is not a physical membrane: there is nothing to touch, and an infalling observer crossing a large one would notice no local landmark. It marks the last place from which any signal can still reach the outside universe.', uz: 'Ufq — qochish tezligi yorugʻlik tezligiga yetadigan sirt. U jismoniy parda emas: ushlab koʻradigan narsa yoʻq va katta ufqni kesib oʻtayotgan kuzatuvchi hech qanday belgi sezmaydi. U tashqi olamga signal yetkazish mumkin boʻlgan soʻnggi joyni bildiradi.' },
    at: 0.2,
    figure: 'horizon',
  },
  {
    id: 'disk',
    index: '03',
    title: { en: 'The accretion disk', uz: 'Akkretsiya diski' },
    lead: { en: 'The brightest objects in the universe are things falling in.', uz: 'Olamdagi eng yorqin jismlar — ichkariga qulayotgan narsalar.' },
    body: { en: 'Gas spiralling inward cannot fall straight down; it forms a flattened disk and shears against itself. Friction and magnetic stress heat that gas to millions of degrees, so it radiates in ultraviolet and X-rays. The glow you see is not the black hole. It is the queue.', uz: 'Spiral boʻylab ichkariga tortilayotgan gaz toʻgʻri qulay olmaydi; u yassi disk hosil qiladi va oʻz-oʻziga ishqalanadi. Ishqalanish va magnit kuchlanishi bu gazni millionlab gradusgacha qizdiradi, shu sababli u ultrabinafsha va rentgen nurlarini taratadi. Siz koʻrayotgan yogʻdu — qora tuynuk emas. Bu — navbat.' },
    at: 0.34,
    figure: 'disk',
  },
  {
    id: 'lensing',
    index: '04',
    title: { en: 'Light that bends around it', uz: 'Uning atrofida egiladigan yorugʻlik' },
    lead: { en: 'You see the far side of the disk above and below the near side.', uz: 'Diskning uzoq tomonini yaqin tomoni tepasida va pastida koʻrasiz.' },
    body: { en: 'Gravity deflects light, so the disk behind the black hole is lifted into view over the top and under the bottom, wrapping the shadow in a ring. At roughly 1.5 times the horizon radius lies the photon sphere, where light can orbit. The dark silhouette it produces looks about 2.6 times wider than the horizon itself.', uz: 'Tortishish yorugʻlikni ogʻdiradi, shuning uchun qora tuynuk ortidagi disk tepadan va pastdan koʻrinishga koʻtarilib, soyani halqaga oʻraydi. Ufq radiusidan taxminan 1,5 barobar uzoqlikda foton sferasi joylashgan — u yerda yorugʻlik orbitada aylana oladi. Hosil boʻladigan qora siluet ufqning oʻzidan qariyb 2,6 barobar keng koʻrinadi.' },
    at: 0.46,
    figure: 'disk',
  },
  {
    id: 'dilation',
    index: '05',
    title: { en: 'Gravitational time dilation', uz: 'Gravitatsion vaqt sekinlashuvi' },
    lead: { en: 'Clocks run slower the deeper they sit in gravity.', uz: 'Soat tortishish ichida qanchalik chuqur boʻlsa, shunchalik sekin yuradi.' },
    body: { en: 'To a distant observer, a probe approaching the horizon appears to slow, dim and redden without limit, never quite arriving. To the probe, nothing unusual happens to its own clock and the crossing takes a finite, ordinary amount of time. Both accounts are correct.', uz: 'Uzoqdagi kuzatuvchi uchun ufqqa yaqinlashayotgan zond cheksiz sekinlashib, xiralashib, qizarib boradi va hech qachon yetib bormaydi. Zondning oʻzi uchun esa soatida gʻayrioddiy hech narsa yuz bermaydi va kesib oʻtish oddiy, chekli vaqt oladi. Ikkala tavsif ham toʻgʻri.' },
    at: 0.58,
    figure: 'dilation',
  },
  {
    id: 'singularity',
    index: '06',
    title: { en: 'The singularity', uz: 'Singulyarlik' },
    lead: { en: 'Where the equations stop answering.', uz: 'Tenglamalar javob berishdan toʻxtaydigan joy.' },
    body: { en: 'General relativity predicts that the collapsed matter reaches a point of infinite density at the centre. Infinity in a physical theory is a signal that the theory has been pushed past its range. Describing what is actually there needs a quantum theory of gravity, which does not yet exist.', uz: 'Umumiy nisbiylik nazariyasi qulagan modda markazda cheksiz zichlik nuqtasiga yetishini bashorat qiladi. Fizik nazariyadagi cheksizlik — nazariya oʻz chegarasidan chiqarib yuborilgani belgisi. U yerda aslida nima borligini tavsiflash uchun tortishishning kvant nazariyasi kerak, u esa hali mavjud emas.' },
    at: 0.68,
    figure: 'singularity',
  },
  {
    id: 'formation',
    index: '07',
    title: { en: 'How they form', uz: 'Ular qanday paydo boʻladi' },
    lead: { en: 'The collapse of a massive star, at the end of everything else.', uz: 'Massiv yulduzning qulashi — boshqa hamma narsa tugagach.' },
    body: { en: 'A star holds itself open against gravity with the pressure of fusion. When the core runs out of usable fuel, that support fails in seconds. If the remaining core is above roughly two to three solar masses, no known force can stop the collapse, and the outer layers blow away as a supernova.', uz: 'Yulduz oʻzini tortishishga qarshi sintez bosimi bilan ushlab turadi. Yadroda yaroqli yoqilgʻi tugaganda bu tayanch soniyalar ichida yoʻqoladi. Qolgan yadro taxminan ikki-uch quyosh massasidan ogʻir boʻlsa, maʼlum hech bir kuch qulashni toʻxtata olmaydi va tashqi qatlamlar oʻta yangi yulduz sifatida uchib ketadi.' },
    at: 0.78,
    figure: 'formation',
  },
  {
    id: 'stellar',
    index: '08',
    title: { en: 'Stellar-mass black holes', uz: 'Yulduz massali qora tuynuklar' },
    lead: { en: 'A few times the mass of the Sun, a few kilometres across.', uz: 'Quyosh massasidan bir necha barobar ogʻir, koʻndalangi bir necha kilometr.' },
    body: { en: 'These are the remnants of individual stars. When two of them spiral together and merge, the collision shakes spacetime itself; those gravitational waves have been detected directly since 2015, and each detection is a black hole pair confirming its own existence.', uz: 'Bular alohida yulduzlarning qoldiqlari. Ikkitasi spiral boʻylab yaqinlashib qoʻshilganda toʻqnashuv fazo-vaqtning oʻzini silkitadi; bunday gravitatsion toʻlqinlar 2015-yildan beri bevosita qayd etilmoqda va har bir qayd qora tuynuklar juftining mavjudligini oʻzi tasdiqlaydi.' },
    at: 0.86,
    figure: 'scale',
  },
  {
    id: 'supermassive',
    index: '09',
    title: { en: 'Supermassive black holes', uz: 'Oʻta massiv qora tuynuklar' },
    lead: { en: 'Millions to billions of solar masses, at the centre of galaxies.', uz: 'Millionlabdan milliardlab quyosh massasi, galaktikalar markazida.' },
    body: { en: 'Sagittarius A*, at the centre of the Milky Way, holds about 4.3 million solar masses. M87* holds around 6.5 billion. How they grew so large so early is an open question. Both have now been imaged by the Event Horizon Telescope — M87* in 2019, Sagittarius A* in 2022.', uz: 'Somon yoʻli markazidagi Sagittarius A* taxminan 4,3 million quyosh massasiga ega. M87* esa qariyb 6,5 milliard. Ular shunchalik erta va shunchalik ulkan boʻlib ulgurgani ochiq savol. Ikkalasi ham Hodisalar Ufqi Teleskopida suratga olingan — M87* 2019-yilda, Sagittarius A* 2022-yilda.' },
    at: 0.92,
    figure: 'scale',
  },
  {
    id: 'crossing',
    index: '10',
    title: { en: 'If something crosses', uz: 'Agar biror narsa kesib oʻtsa' },
    lead: { en: 'It depends entirely on how big the black hole is.', uz: 'Bu butunlay qora tuynukning kattaligiga bogʻliq.' },
    body: { en: 'Near a stellar-mass black hole the difference in gravity between your head and your feet is lethal long before the horizon — you are stretched into a thread. At a supermassive one the tidal forces at the horizon are gentle enough to cross without noticing. Either way the path afterward leads inward only. Whether the information that fell in is destroyed or somehow preserved is still argued over.', uz: 'Yulduz massali qora tuynuk yonida boshingiz bilan oyogʻingiz orasidagi tortishish farqi ufqqa yetmasdanoq halokatli — tana ipdek choʻziladi. Oʻta massiv tuynukda esa ufqdagi toʻlqin kuchlari shu qadar yumshoqki, sezmay oʻtib ketish mumkin. Har holda undan keyingi yoʻl faqat ichkariga olib boradi. Ichkariga tushgan axborot yoʻq boʻladimi yoki qandaydir saqlanadimi — bu hamon bahsli.' },
    at: 0.97,
    figure: 'singularity',
  },
];

export const BH_DISCLAIMER =
  { en: 'Interactive visualisation. Light paths are integrated in real time from a simplified Schwarzschild approximation — close to the real geometry in spirit, not a scientific simulation.', uz: 'Interaktiv vizualizatsiya. Yorugʻlik yoʻllari soddalashtirilgan Shvartsshild yaqinlashuvi asosida real vaqtda integrallanadi — mohiyatan haqiqiy geometriyaga yaqin, ammo ilmiy simulyatsiya emas.' };
