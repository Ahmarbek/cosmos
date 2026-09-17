/**
 * ICONS — people who changed culture.
 *
 * Deliberately NOT a ranked list of "the most famous people": it is a curated
 * set of ten figures from different fields, used to carry the final movement of
 * the journey from cosmic scale down to human scale.
 *
 * Every date, title and achievement below is drawn from widely documented
 * public record. No quotations are attributed to anyone — invented quotes are
 * the fastest way to turn a tribute into a fabrication — so the copy describes
 * rather than ventriloquises.
 */

import type { Text } from '../i18n/lang';

export interface TimelineEntry {
  year: string;
  event: Text;
}

export interface Work {
  title: Text;
  year: string;
  note: Text;
}

export interface Icon {
  id: string;
  name: string;
  short: string;
  discipline: Text;
  field: 'music' | 'sport' | 'science' | 'art' | 'technology' | 'film';
  origin: Text;
  born: string;
  died?: string;
  /** one descriptive line — our words, never presented as a quote */
  line: Text;
  bio: Text[];
  impact: Text;
  achievements: Text[];
  works: Work[];
  timeline: TimelineEntry[];
  /** duotone driving the generative portrait, profile lighting and world hall */
  palette: [string, string];
}

export const ICONS: Icon[] = [
  {
    id: 'michael-jackson',
    name: 'Michael Jackson',
    short: 'Jackson',
    discipline: { en: 'Singer, songwriter, dancer', uz: 'Qoʻshiqchi, bastakor, raqqos' },
    field: 'music',
    origin: { en: 'Gary, Indiana, United States', uz: 'Gari, Indiana, AQSH' },
    born: '1958',
    died: '2009',
    line: { en: 'He rebuilt what a pop record, a music video and a live performance were allowed to be.', uz: 'U pop-albom, musiqiy klip va jonli chiqish nima boʻlishi mumkinligini qaytadan qurdi.' },
    bio: [
      { en: 'Michael Jackson began performing as a child with his brothers in the Jackson 5, who signed to Motown in 1968 and reached number one with their first four singles.', uz: 'Maykl Jekson bolaligidan akalari bilan Jackson 5 guruhida sahnaga chiqqan; guruh 1968-yilda Motown bilan shartnoma tuzdi va dastlabki toʻrtta singli bilan birinchi oʻringa chiqdi.' },
      { en: 'His solo work with producer Quincy Jones — Off the Wall (1979), Thriller (1982) and Bad (1987) — fused pop, soul, funk and rock into a sound built for radio and for the new medium of the music video.', uz: 'Prodyuser Kuinsi Jons bilan yaratgan yakkaxon albomlari — Off the Wall (1979), Thriller (1982) va Bad (1987) — pop, soul, fank va rokni radio hamda yangi paydo boʻlgan musiqiy klip uchun moʻljallangan yagona ovozga birlashtirdi.' },
      { en: 'Thriller became the best-selling album in history, and its long-form videos changed how music was made, marketed and watched.', uz: 'Thriller tarixdagi eng koʻp sotilgan albomga aylandi, uning uzun metrajli kliplari esa musiqa qanday yaratilishi, sotilishi va tomosha qilinishini oʻzgartirdi.' },
    ],
    impact:
      { en: 'Jackson turned the music video from promotional filler into a cinematic form, broke through the colour barrier in early MTV rotation, and set a standard for live pop choreography that performers still work against. His catalogue, stagecraft and silhouette remain among the most recognised in popular culture.', uz: 'Jekson musiqiy klipni reklama ilovasidan kinematografik shaklga aylantirdi, MTV ning dastlabki efirlaridagi irqiy toʻsiqni yorib oʻtdi va jonli pop-xoreografiyada shu kunga qadar oʻlchov boʻlib qolgan andozani belgiladi. Uning ijodi, sahna mahorati va silueti ommaviy madaniyatdagi eng tanish obrazlar qatorida qolmoqda.' },
    achievements: [
      { en: 'Thriller (1982) — the best-selling album of all time', uz: 'Thriller (1982) — barcha davrlarning eng koʻp sotilgan albomi' },
      { en: 'Thirteen Grammy Awards, including a record eight in a single night in 1984', uz: 'Oʻn uchta “Grammy” mukofoti, jumladan 1984-yilda bir kechada rekord darajadagi sakkiztasi' },
      { en: 'Inducted into the Rock and Roll Hall of Fame twice — with the Jackson 5 and as a solo artist', uz: 'Rok-n-roll shon-shuhrat zaliga ikki marta kiritilgan — Jackson 5 tarkibida va yakkaxon ijrochi sifatida' },
      { en: 'First performed the moonwalk on Motown 25 in 1983, before a national audience', uz: '1983-yilda Motown 25 koʻrsatuvida butun mamlakat oldida ilk bor “oy yurishi”ni namoyish etdi' },
    ],
    works: [
      { title: 'Off the Wall', year: '1979', note: { en: 'The break from child stardom into adult disco-soul.', uz: 'Bolalik shuhratidan kattalar disko-souliga oʻtish.' } },
      { title: 'Thriller', year: '1982', note: { en: 'Seven of its nine tracks were released as singles.', uz: 'Toʻqqizta trekdan yettitasi singl sifatida chiqarilgan.' } },
      { title: 'Bad', year: '1987', note: { en: 'Five US number-one singles from a single album.', uz: 'Bitta albomdan AQSHda birinchi oʻringa chiqqan beshta singl.' } },
      { title: 'Dangerous', year: '1991', note: { en: 'A harder new jack swing direction with Teddy Riley.', uz: 'Teddi Rayli bilan qattiqroq new jack swing yoʻnalishi.' } },
    ],
    timeline: [
      { year: '1964', event: { en: 'Joins his brothers in the group that becomes the Jackson 5.', uz: 'Keyinchalik Jackson 5 boʻlgan guruhda akalariga qoʻshiladi.' } },
      { year: '1969', event: { en: 'National breakthrough; the group signs to Motown.', uz: 'Mamlakat miqyosida shuhrat; guruh Motown bilan shartnoma tuzadi.' } },
      { year: '1979', event: { en: 'Off the Wall establishes him as a solo artist.', uz: 'Off the Wall uni yakkaxon ijrochi sifatida tanitadi.' } },
      { year: '1982', event: { en: 'Thriller is released.', uz: 'Thriller albomi chiqadi.' } },
      { year: '1983', event: { en: 'The Motown 25 performance.', uz: 'Motown 25 dagi chiqish.' } },
      { year: '1987', event: { en: 'The Bad world tour reaches audiences across four continents.', uz: 'Bad jahon gastroli toʻrt qitʼa tomoshabinlariga yetib boradi.' } },
      { year: '2009', event: { en: 'Dies in Los Angeles at the age of fifty.', uz: 'Ellik yoshida Los-Anjelesda vafot etadi.' } },
    ],
    palette: ['#C9A227', '#7C5CFF'],
  },
  {
    id: 'cristiano-ronaldo',
    name: 'Cristiano Ronaldo',
    short: 'Ronaldo',
    discipline: { en: 'Footballer', uz: 'Futbolchi' },
    field: 'sport',
    origin: { en: 'Funchal, Madeira, Portugal', uz: 'Funshal, Madeyra, Portugaliya' },
    born: '1985',
    line: { en: 'A career built less on natural gift than on a refusal to stop rebuilding himself.', uz: 'Tabiiy isteʼdodga emas, oʻzini qayta qurishdan toʻxtamaslikka qurilgan karyera.' },
    bio: [
      { en: 'Cristiano Ronaldo left Madeira for Sporting CP as a boy and signed for Manchester United in 2003, arriving as a winger known more for trickery than for end product.', uz: 'Kristiano Ronaldu bolaligida Madeyradan Sporting CP ga oʻtdi va 2003-yilda Manchester United bilan shartnoma imzoladi; oʻshanda u samaradorligidan koʻra hiylakor oʻyini bilan tanilgan qanot hujumchisi edi.' },
      { en: 'Across Manchester United, Real Madrid, Juventus, a return to United and Al Nassr he remade his game repeatedly — from touchline dribbler to central scorer — sustaining an output measured in decades rather than seasons.', uz: 'Manchester United, Real Madrid, Yuventus, Unitedga qaytish va Al-Nasr davrida u oʻz oʻyinini qayta-qayta oʻzgartirdi — chetdagi driblerdan markaziy goʻlchiga — va samaradorligini mavsumlar emas, oʻn yilliklar bilan oʻlchanadigan darajada saqladi.' },
      { en: 'With Portugal he captained the side that won UEFA Euro 2016 and the UEFA Nations League, and he is the all-time leading scorer in men’s international football.', uz: 'Portugaliya terma jamoasi kapitani sifatida UEFA Yevro-2016 va UEFA Millatlar ligasini qoʻlga kiritdi; u erkaklar xalqaro futboli tarixidagi eng koʻp gol urgan oʻyinchi.' },
    ],
    impact:
      { en: 'Ronaldo made professional longevity a discipline in itself: conditioning, recovery and body composition became part of how the modern game is discussed because of him. His rivalry with Lionel Messi defined a fifteen-year era of football, and his following is among the largest of any person on social media.', uz: 'Ronaldu professional uzoq umrni alohida intizomga aylantirdi: jismoniy tayyorgarlik, tiklanish va tana tarkibi zamonaviy futbol muhokamasiga aynan u tufayli kirdi. Lionel Messi bilan raqobati futbolning oʻn besh yillik davrini belgiladi, ijtimoiy tarmoqlardagi obunachilari soni esa dunyodagi eng koʻplaridan biri.' },
    achievements: [
      { en: 'Five Ballon d’Or awards', uz: 'Beshta “Oltin toʻp” mukofoti' },
      { en: 'Five UEFA Champions League titles — one with Manchester United, four with Real Madrid', uz: 'Beshta UEFA Chempionlar ligasi gʻalabasi — bittasi Manchester United, toʻrttasi Real Madrid bilan' },
      { en: 'All-time leading scorer in the UEFA Champions League', uz: 'UEFA Chempionlar ligasi tarixidagi eng koʻp gol urgan oʻyinchi' },
      { en: 'UEFA Euro 2016 and UEFA Nations League winner with Portugal', uz: 'Portugaliya bilan UEFA Yevro-2016 va UEFA Millatlar ligasi gʻolibi' },
      { en: 'Scored at five different FIFA World Cups', uz: 'Beshta turli FIFA Jahon chempionatida gol urgan' },
    ],
    works: [
      { title: 'Manchester United', year: '2003–2009', note: { en: 'Three league titles and the 2008 Champions League.', uz: 'Uchta chempionlik va 2008-yilgi Chempionlar ligasi.' } },
      { title: 'Real Madrid', year: '2009–2018', note: { en: 'Four Champions League titles; the club’s all-time leading scorer.', uz: 'Toʻrtta Chempionlar ligasi; klub tarixidagi eng koʻp gol urgan oʻyinchi.' } },
      { title: 'Juventus', year: '2018–2021', note: { en: 'Two Serie A titles.', uz: 'Ikkita Seriya A chempionligi.' } },
      { title: 'Al Nassr', year: '2023–', note: { en: 'A transfer that moved global attention onto the Saudi Pro League.', uz: 'Jahon eʼtiborini Saudiya Pro Ligasiga qaratgan transfer.' } },
    ],
    timeline: [
      { year: '2002', event: { en: 'Debuts for Sporting CP at seventeen.', uz: 'Oʻn yetti yoshida Sporting CP da debyut qiladi.' } },
      { year: '2003', event: { en: 'Signs for Manchester United.', uz: 'Manchester United bilan shartnoma imzolaydi.' } },
      { year: '2008', event: { en: 'Wins the Champions League and a first Ballon d’Or.', uz: 'Chempionlar ligasi va ilk “Oltin toʻp”ni qoʻlga kiritadi.' } },
      { year: '2009', event: { en: 'Transfers to Real Madrid.', uz: 'Real Madridga oʻtadi.' } },
      { year: '2016', event: { en: 'Captains Portugal to the European Championship.', uz: 'Portugaliyani kapitan sifatida Yevropa chempionligiga olib chiqadi.' } },
      { year: '2018', event: { en: 'Joins Juventus.', uz: 'Yuventusga qoʻshiladi.' } },
      { year: '2023', event: { en: 'Signs for Al Nassr.', uz: 'Al-Nasr bilan shartnoma imzolaydi.' } },
    ],
    palette: ['#5BC8FF', '#1B3A8C'],
  },
  {
    id: 'albert-einstein',
    name: 'Albert Einstein',
    short: 'Einstein',
    discipline: { en: 'Theoretical physicist', uz: 'Nazariyotchi fizik' },
    field: 'science',
    origin: { en: 'Ulm, German Empire', uz: 'Ulm, Germaniya imperiyasi' },
    born: '1879',
    died: '1955',
    line: { en: 'He took space and time — the stage everything else stood on — and made them part of the play.', uz: 'U fazo va vaqtni — qolgan hamma narsa turgan sahnani — olib, ularni spektaklning oʻziga aylantirdi.' },
    bio: [
      { en: 'In 1905, working as a patent examiner in Bern, Einstein published four papers that reshaped physics: on the photoelectric effect, Brownian motion, special relativity, and the equivalence of mass and energy.', uz: '1905-yilda Bernda patent ekspertizachisi boʻlib ishlagan Eynshteyn fizikani qayta shakllantirgan toʻrtta maqola eʼlon qildi: fotoeffekt, Broun harakati, maxsus nisbiylik va massa bilan energiyaning ekvivalentligi haqida.' },
      { en: 'A decade later he completed the general theory of relativity, describing gravity not as a force but as the curvature of spacetime by mass and energy.', uz: 'Oʻn yil oʻtib u umumiy nisbiylik nazariyasini yakunladi va tortishishni kuch emas, balki massa va energiya tomonidan fazo-vaqtning egilishi sifatida tavsifladi.' },
      { en: 'He left Germany in 1933 and spent the rest of his life at the Institute for Advanced Study in Princeton.', uz: 'U 1933-yilda Germaniyani tark etdi va umrining qolgan qismini Prinstondagi Ilgʻor tadqiqotlar institutida oʻtkazdi.' },
    ],
    impact:
      { en: 'General relativity underpins modern cosmology and predicts the objects at the opening of this journey: black holes, gravitational lensing, the bending of starlight. Satellite navigation corrects for his time dilation every day. He also became the public face of scientific thought itself — a rare case of a physicist recognised on sight.', uz: 'Umumiy nisbiylik nazariyasi zamonaviy kosmologiyaning asosi boʻlib, bu sayohat boshidagi jismlarni — qora tuynuklar, gravitatsion linzalanish, yulduz nurining egilishini bashorat qiladi. Sunʼiy yoʻldosh navigatsiyasi har kuni uning vaqt sekinlashuvini hisobga olib tuzatadi. U ilmiy tafakkurning ommaviy timsoliga ham aylandi — koʻrishi bilan tanib olinadigan fizik kamdan kam uchraydi.' },
    achievements: [
      { en: 'Nobel Prize in Physics, awarded for his explanation of the photoelectric effect', uz: 'Fotoeffektni tushuntirgani uchun fizika boʻyicha Nobel mukofoti' },
      { en: 'Special relativity (1905) and general relativity (1915)', uz: 'Maxsus nisbiylik (1905) va umumiy nisbiylik (1915) nazariyalari' },
      { en: 'The mass–energy equivalence relation E = mc²', uz: 'Massa va energiya ekvivalentligi munosabati E = mc²' },
      { en: 'Predicted gravitational lensing, supported by observations of the 1919 solar eclipse', uz: 'Gravitatsion linzalanishni bashorat qilgan; 1919-yilgi quyosh tutilishi kuzatuvlari buni tasdiqlagan' },
    ],
    works: [
      { title: { en: 'On the Electrodynamics of Moving Bodies', uz: 'Harakatlanuvchi jismlar elektrodinamikasi haqida' }, year: '1905', note: { en: 'The special relativity paper.', uz: 'Maxsus nisbiylik nazariyasi maqolasi.' } },
      { title: { en: 'The Field Equations of Gravitation', uz: 'Tortishishning maydon tenglamalari' }, year: '1915', note: { en: 'General relativity in its final form.', uz: 'Umumiy nisbiylik nazariyasining yakuniy koʻrinishi.' } },
      { title: { en: 'The Einstein–Podolsky–Rosen paper', uz: 'Eynshteyn–Podolskiy–Rozen maqolasi' }, year: '1935', note: { en: 'Framed the questions that became entanglement research.', uz: 'Kvant chigalligi tadqiqotlariga aylangan savollarni shakllantirgan.' } },
    ],
    timeline: [
      { year: '1905', event: { en: 'The miracle year — four papers that reset physics.', uz: 'Moʻjiza yili — fizikani qaytadan boshlagan toʻrtta maqola.' } },
      { year: '1915', event: { en: 'Completes the general theory of relativity.', uz: 'Umumiy nisbiylik nazariyasini yakunlaydi.' } },
      { year: '1919', event: { en: 'Eclipse observations support light bending; he becomes world-famous.', uz: 'Tutilish kuzatuvlari yorugʻlik egilishini tasdiqlaydi; u butun dunyoga mashhur boʻladi.' } },
      { year: '1921', event: { en: 'Awarded the Nobel Prize in Physics.', uz: 'Fizika boʻyicha Nobel mukofotiga sazovor boʻladi.' } },
      { year: '1933', event: { en: 'Leaves Germany for the United States.', uz: 'Germaniyani tark etib, AQSHga ketadi.' } },
      { year: '1955', event: { en: 'Dies in Princeton, New Jersey.', uz: 'Nyu-Jersi shtatining Prinston shahrida vafot etadi.' } },
    ],
    palette: ['#9AB4FF', '#2A2F5E'],
  },
  {
    id: 'leonardo-da-vinci',
    name: 'Leonardo da Vinci',
    short: 'Leonardo',
    discipline: { en: 'Painter, engineer, anatomist', uz: 'Rassom, muhandis, anatom' },
    field: 'art',
    origin: { en: 'Vinci, Republic of Florence', uz: 'Vinchi, Florensiya respublikasi' },
    born: '1452',
    died: '1519',
    line: { en: 'He refused the line between looking at the world and taking it apart.', uz: 'U dunyoga qarash bilan uni qismlarga ajratish orasidagi chegarani tan olmadi.' },
    bio: [
      { en: 'Trained in the Florentine workshop of Andrea del Verrocchio, Leonardo became a painter whose finished output was famously small and famously studied.', uz: 'Florensiyada Andrea del Verrokkio ustaxonasida taʼlim olgan Leonardo shunday rassom boʻldiki, uning tugallangan asarlari juda kam, ammo juda koʻp oʻrganilgan.' },
      { en: 'He filled thousands of notebook pages with anatomy, hydraulics, optics, geology, flight and mechanics, written in mirror script and largely unpublished in his lifetime.', uz: 'U minglab daftar sahifalarini anatomiya, gidravlika, optika, geologiya, uchish va mexanika bilan toʻldirdi; yozuvlari koʻzgu xatida bitilgan va hayotligida deyarli nashr etilmagan.' },
      { en: 'He worked in Florence, Milan and Rome, and died at Amboise in France.', uz: 'U Florensiya, Milan va Rimda ishlagan, Fransiyaning Amboz shahrida vafot etgan.' },
    ],
    impact:
      { en: 'Leonardo is the reference point for the idea that art and science are a single act of attention. His anatomical drawings were centuries ahead of their eventual publication, his sfumato changed European painting, and the Mona Lisa is the most visited painting in the world.', uz: 'Leonardo — sanʼat va fan yagona diqqat amali ekani haqidagi fikrning oʻlchovi. Uning anatomik chizmalari nashr etilishidan asrlar oldinda edi, sfumato uslubi Yevropa rangtasvirini oʻzgartirdi, “Mona Liza” esa dunyodagi eng koʻp tomosha qilinadigan surat.' },
    achievements: [
      { en: 'The Mona Lisa and The Last Supper', uz: '“Mona Liza” va “Soʻnggi kechlik”' },
      { en: 'Anatomical studies based on direct human dissection', uz: 'Inson tanasini bevosita yorib oʻrganishga asoslangan anatomik tadqiqotlar' },
      { en: 'Notebooks spanning engineering, hydrodynamics, optics and geology', uz: 'Muhandislik, gidrodinamika, optika va geologiyani qamragan daftarlar' },
      { en: 'The Vitruvian Man, a study of human proportion', uz: '“Vitruviy odami” — inson tana nisbatlari tadqiqoti' },
    ],
    works: [
      { title: { en: 'The Last Supper', uz: 'Soʻnggi kechlik' }, year: 'c. 1495–1498', note: { en: 'Mural in Santa Maria delle Grazie, Milan.', uz: 'Milandagi Santa Mariya delle Gratsie devoriy surati.' } },
      { title: 'Mona Lisa', year: 'c. 1503–1519', note: { en: 'Held at the Louvre, Paris.', uz: 'Parijdagi Luvrda saqlanadi.' } },
      { title: { en: 'Vitruvian Man', uz: 'Vitruviy odami' }, year: 'c. 1490', note: { en: 'Proportion study after the Roman architect Vitruvius.', uz: 'Rim meʼmori Vitruviy asosidagi nisbatlar tadqiqoti.' } },
      { title: { en: 'Codex Leicester', uz: 'Leyster kodeksi' }, year: 'c. 1508–1510', note: { en: 'Notebook on water, rock and celestial light.', uz: 'Suv, tosh va samoviy yorugʻlik haqidagi daftar.' } },
    ],
    timeline: [
      { year: 'c. 1466', event: { en: 'Apprenticed to Verrocchio in Florence.', uz: 'Florensiyada Verrokkio qoʻlida shogird boʻladi.' } },
      { year: '1482', event: { en: 'Enters the service of Ludovico Sforza in Milan.', uz: 'Milanda Lyudoviko Sforsa xizmatiga kiradi.' } },
      { year: 'c. 1495', event: { en: 'Begins The Last Supper.', uz: '“Soʻnggi kechlik”ni boshlaydi.' } },
      { year: 'c. 1503', event: { en: 'Begins the Mona Lisa.', uz: '“Mona Liza”ni boshlaydi.' } },
      { year: '1516', event: { en: 'Accepts the invitation of Francis I to France.', uz: 'Fransisk I ning Fransiyaga taklifini qabul qiladi.' } },
      { year: '1519', event: { en: 'Dies at Clos Lucé, Amboise.', uz: 'Ambozdagi Klo-Lyusede vafot etadi.' } },
    ],
    palette: ['#D8A76A', '#3A2A1B'],
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    short: 'Jobs',
    discipline: { en: 'Entrepreneur, product designer', uz: 'Tadbirkor, mahsulot dizayneri' },
    field: 'technology',
    origin: { en: 'San Francisco, California, United States', uz: 'San-Fransisko, Kaliforniya, AQSH' },
    born: '1955',
    died: '2011',
    line: { en: 'He argued, relentlessly, that how a thing feels to use is not a detail.', uz: 'U narsani ishlatish qanday his berishi mayda tafsilot emasligini tinimsiz isbotladi.' },
    bio: [
      { en: 'Steve Jobs co-founded Apple in 1976 with Steve Wozniak and Ronald Wayne, and led the Macintosh project that brought the graphical interface to a mass market in 1984.', uz: 'Stiv Jobs 1976-yilda Stiv Voznyak va Ronald Ueyn bilan Apple ni asos soldi hamda 1984-yilda grafik interfeysni ommaviy bozorga olib chiqqan Macintosh loyihasiga rahbarlik qildi.' },
      { en: 'Forced out of Apple in 1985, he founded NeXT and bought the computer graphics division that became Pixar, which released Toy Story — the first fully computer-animated feature — in 1995.', uz: '1985-yilda Apple dan ketishga majbur boʻlgach, u NeXT ni tashkil etdi va keyinchalik Pixar boʻlgan kompyuter grafikasi boʻlimini sotib oldi; Pixar 1995-yilda toʻliq kompyuterda chizilgan ilk badiiy film — Toy Story ni chiqardi.' },
      { en: 'Apple acquired NeXT in 1996, returning him to the company. The iMac, iPod, iPhone and iPad followed over the next thirteen years.', uz: 'Apple 1996-yilda NeXT ni sotib oldi va u kompaniyaga qaytdi. Keyingi oʻn uch yilda iMac, iPod, iPhone va iPad dunyoga keldi.' },
    ],
    impact:
      { en: 'Jobs made industrial design, typography and interface behaviour central to consumer technology rather than peripheral to it. The iPhone reorganised the phone, the camera, the music player and the map into one object, and the ecosystem built around it reshaped whole industries.', uz: 'Jobs sanoat dizayni, tipografika va interfeys xatti-harakatini isteʼmol texnologiyasining chekkasidan markaziga koʻchirdi. iPhone telefon, kamera, musiqa pleyeri va xaritani bitta jismga birlashtirdi, uning atrofida qurilgan ekotizim esa butun sohalarni qayta shakllantirdi.' },
    achievements: [
      { en: 'Co-founded Apple Computer in 1976', uz: '1976-yilda Apple Computer ga asos solgan' },
      { en: 'Led the Macintosh, the first mass-market computer with a graphical interface', uz: 'Grafik interfeysli ilk ommaviy kompyuter — Macintosh loyihasiga rahbarlik qilgan' },
      { en: 'Built Pixar into the studio behind Toy Story', uz: 'Pixar ni Toy Story ortidagi studiyaga aylantirgan' },
      { en: 'Introduced the iPod (2001), iPhone (2007) and iPad (2010)', uz: 'iPod (2001), iPhone (2007) va iPad (2010) ni taqdim etgan' },
    ],
    works: [
      { title: 'Macintosh', year: '1984', note: { en: 'Graphical computing for a general audience.', uz: 'Keng auditoriya uchun grafik hisoblash.' } },
      { title: 'NeXTSTEP', year: '1989', note: { en: 'Its descendants still run Apple’s operating systems.', uz: 'Uning vorislari hanuz Apple operatsion tizimlari asosida yotadi.' } },
      { title: 'iPod', year: '2001', note: { en: 'Reframed the music library as something carried.', uz: 'Musiqa kutubxonasini oʻzi bilan olib yuradigan narsaga aylantirdi.' } },
      { title: 'iPhone', year: '2007', note: { en: 'Collapsed a dozen devices into one.', uz: 'Oʻnlab qurilmani bittaga jamladi.' } },
    ],
    timeline: [
      { year: '1976', event: { en: 'Co-founds Apple in Los Altos, California.', uz: 'Kaliforniyaning Los-Altos shahrida Apple ga asos soladi.' } },
      { year: '1984', event: { en: 'Introduces the Macintosh.', uz: 'Macintosh ni taqdim etadi.' } },
      { year: '1985', event: { en: 'Leaves Apple; founds NeXT.', uz: 'Apple dan ketadi; NeXT ni tashkil qiladi.' } },
      { year: '1986', event: { en: 'Acquires the graphics group that becomes Pixar.', uz: 'Keyinchalik Pixar boʻlgan grafika guruhini sotib oladi.' } },
      { year: '1997', event: { en: 'Returns to Apple as interim chief executive.', uz: 'Apple ga vaqtinchalik bosh direktor sifatida qaytadi.' } },
      { year: '2007', event: { en: 'Introduces the iPhone.', uz: 'iPhone ni taqdim etadi.' } },
      { year: '2011', event: { en: 'Dies in Palo Alto, California.', uz: 'Kaliforniyaning Palo-Alto shahrida vafot etadi.' } },
    ],
    palette: ['#E8E8ED', '#4A4A55'],
  },
  {
    id: 'marilyn-monroe',
    name: 'Marilyn Monroe',
    short: 'Monroe',
    discipline: { en: 'Actress, producer, model', uz: 'Aktrisa, prodyuser, model' },
    field: 'film',
    origin: { en: 'Los Angeles, California, United States', uz: 'Los-Anjeles, Kaliforniya, AQSH' },
    born: '1926',
    died: '1962',
    line: { en: 'She played the persona the studios built for her, and then went to work on owning it.', uz: 'U studiyalar yaratgan obrazni oʻynadi, soʻng oʻsha obrazni oʻz qoʻliga olish ustida ishladi.' },
    bio: [
      { en: 'Born Norma Jeane Mortenson, she was photographed as a factory worker during the Second World War and moved from modelling into film contracts in the late 1940s.', uz: 'Norma Jin Mortenson nomi bilan tugʻilgan; Ikkinchi jahon urushi yillarida zavod ishchisi sifatida suratga tushgan va 1940-yillar oxirida modellikdan kino shartnomalariga oʻtgan.' },
      { en: 'By the mid-1950s she was one of the highest-profile stars in the world, in comedies including Gentlemen Prefer Blondes, The Seven Year Itch and Some Like It Hot.', uz: '1950-yillar oʻrtalarida u dunyodagi eng mashhur yulduzlardan biri edi: Gentlemen Prefer Blondes, The Seven Year Itch va Some Like It Hot kabi komediyalarda oʻynadi.' },
      { en: 'In 1955 she suspended her studio contract and co-founded Marilyn Monroe Productions, an unusual assertion of control for a performer of the era, and studied at the Actors Studio in New York.', uz: '1955-yilda u studiya shartnomasini toʻxtatib, Marilyn Monroe Productions ni tashkil etdi — bu oʻsha davr ijrochisi uchun gʻayrioddiy mustaqillik edi — va Nyu-Yorkdagi Actors Studio da taʼlim oldi.' },
    ],
    impact:
      { en: 'Monroe is among the most photographed people of the twentieth century, and her image has been recycled continuously by fine art, advertising and fashion since her death. Her fight for script approval and her own production company anticipated the creative control that leading actors negotiate today.', uz: 'Monro — XX asrning eng koʻp suratga olingan insonlaridan biri; vafotidan keyin uning obrazi tasviriy sanʼat, reklama va modada uzluksiz qayta ishlanmoqda. Ssenariyni tasdiqlash huquqi uchun kurashi va oʻz prodyuserlik kompaniyasi bugungi yetakchi aktyorlar talab qiladigan ijodiy nazoratni oldindan koʻrsatdi.' },
    achievements: [
      { en: 'Golden Globe for Best Actress in a Musical or Comedy for Some Like It Hot', uz: 'Some Like It Hot uchun musiqiy film yoki komediyadagi eng yaxshi aktrisa nominatsiyasida “Oltin globus”' },
      { en: 'Co-founded Marilyn Monroe Productions in 1955', uz: '1955-yilda Marilyn Monroe Productions ga asos solgan' },
      { en: 'Named among the greatest female screen legends of classic Hollywood by the American Film Institute', uz: 'Amerika kino instituti tomonidan klassik Gollivudning eng buyuk ayol ekran afsonalari qatoriga kiritilgan' },
    ],
    works: [
      { title: 'Gentlemen Prefer Blondes', year: '1953', note: { en: 'The performance that fixed her public image.', uz: 'Uning ommaviy obrazini mustahkamlagan rol.' } },
      { title: 'The Seven Year Itch', year: '1955', note: { en: 'Source of the most reproduced image of her career.', uz: 'Karyerasidagi eng koʻp takrorlangan kadr manbayi.' } },
      { title: 'Bus Stop', year: '1956', note: { en: 'The dramatic turn that followed her Actors Studio year.', uz: 'Actors Studio yilidan keyingi dramatik burilish.' } },
      { title: 'Some Like It Hot', year: '1959', note: { en: 'Routinely ranked among the best comedies ever made.', uz: 'Muntazam ravishda barcha davrlarning eng yaxshi komediyalari qatorida tilga olinadi.' } },
    ],
    timeline: [
      { year: '1946', event: { en: 'Signs a first film contract and takes the name Marilyn Monroe.', uz: 'Ilk kino shartnomasini imzolaydi va Merilin Monro nomini oladi.' } },
      { year: '1953', event: { en: 'Breakthrough year with Niagara and Gentlemen Prefer Blondes.', uz: 'Niagara va Gentlemen Prefer Blondes bilan burilish yili.' } },
      { year: '1955', event: { en: 'Founds her own production company and moves to New York.', uz: 'Oʻz prodyuserlik kompaniyasini ochadi va Nyu-Yorkka koʻchadi.' } },
      { year: '1959', event: { en: 'Some Like It Hot is released.', uz: 'Some Like It Hot ekranga chiqadi.' } },
      { year: '1962', event: { en: 'Dies in Los Angeles at the age of thirty-six.', uz: 'Oʻttiz olti yoshida Los-Anjelesda vafot etadi.' } },
    ],
    palette: ['#F2D4D8', '#5A2A3C'],
  },
  {
    id: 'muhammad-ali',
    name: 'Muhammad Ali',
    short: 'Ali',
    discipline: { en: 'Boxer, activist', uz: 'Bokschi, faol' },
    field: 'sport',
    origin: { en: 'Louisville, Kentucky, United States', uz: 'Luisvill, Kentukki, AQSH' },
    born: '1942',
    died: '2016',
    line: { en: 'The most famous athlete alive, who accepted losing everything rather than fight a war he rejected.', uz: 'Oʻz davrining eng mashhur sportchisi — u rad etgan urushda qatnashgandan koʻra hamma narsadan ayrilishni tanladi.' },
    bio: [
      { en: 'Born Cassius Clay, he won Olympic gold in Rome in 1960 and took the world heavyweight title from Sonny Liston in 1964, announcing his conversion to Islam and his new name soon after.', uz: 'Kassius Kley nomi bilan tugʻilgan; 1960-yilda Rimda olimpiya oltinini, 1964-yilda esa Sonni Listondan ogʻir vazndagi jahon chempioni unvonini qoʻlga kiritdi va koʻp oʻtmay islomni qabul qilgani hamda yangi ismini eʼlon qildi.' },
      { en: 'In 1967 he refused induction into the United States military on religious grounds. He was stripped of his title and licence and did not fight for over three years; the Supreme Court overturned his conviction in 1971.', uz: '1967-yilda u diniy eʼtiqodi sababli AQSH armiyasiga chaqiruvdan bosh tortdi. Unvoni va litsenziyasi bekor qilinib, uch yildan ortiq ringga chiqmadi; 1971-yilda Oliy sud hukmni bekor qildi.' },
      { en: 'He returned to win the title twice more, in Kinshasa against George Foreman in 1974 and against Leon Spinks in 1978.', uz: 'U qaytib kelib unvonni yana ikki marta qoʻlga kiritdi: 1974-yilda Kinshasada Jorj Foreman va 1978-yilda Leon Spinks ustidan gʻalaba qozondi.' },
    ],
    impact:
      { en: 'Ali fused athletic dominance with a public voice on race, religion and war at a moment when athletes were expected to stay silent, and paid a career’s worth of prime years for it. He remains a reference point for sport as a stage for conscience, and for showmanship as part of the craft.', uz: 'Ali sportdagi ustunlikni irq, din va urush haqidagi ochiq soʻz bilan birlashtirdi — sportchidan sukut kutilgan bir paytda — va buning evaziga karyerasining eng yaxshi yillarini berdi. U sport vijdon minbari boʻla olishiga va sahna mahorati kasbning bir qismi ekaniga misol boʻlib qolmoqda.' },
    achievements: [
      { en: 'Olympic light heavyweight gold medal, Rome 1960', uz: 'Rim-1960 olimpiadasida yarim ogʻir vaznda oltin medal' },
      { en: 'Three-time world heavyweight champion', uz: 'Ogʻir vaznda uch karra jahon chempioni' },
      { en: 'Won the Rumble in the Jungle against George Foreman in 1974', uz: '1974-yilda Jorj Foremanga qarshi “Rumble in the Jungle” jangida gʻalaba qozongan' },
      { en: 'Presidential Medal of Freedom, 2005', uz: '2005-yilda Prezidentning Erkinlik medali' },
    ],
    works: [
      { title: 'Clay vs Liston', year: '1964', note: { en: 'The upset that made him champion at twenty-two.', uz: 'Yigirma ikki yoshida uni chempion qilgan kutilmagan gʻalaba.' } },
      { title: 'The Fight of the Century', year: '1971', note: { en: 'His first professional defeat, to Joe Frazier.', uz: 'Jo Freyzerdan koʻrgan ilk professional magʻlubiyati.' } },
      { title: 'The Rumble in the Jungle', year: '1974', note: { en: 'Kinshasa; he regained the title against Foreman.', uz: 'Kinshasa; Foreman ustidan gʻalaba bilan unvonni qaytardi.' } },
      { title: 'The Thrilla in Manila', year: '1975', note: { en: 'The third and most brutal Frazier fight.', uz: 'Freyzer bilan uchinchi va eng shafqatsiz jang.' } },
    ],
    timeline: [
      { year: '1960', event: { en: 'Olympic gold in Rome.', uz: 'Rimda olimpiya oltini.' } },
      { year: '1964', event: { en: 'Beats Sonny Liston for the world heavyweight title.', uz: 'Sonni Listonni yengib, ogʻir vazndagi jahon chempioni boʻladi.' } },
      { year: '1967', event: { en: 'Refuses military induction; title and licence are stripped.', uz: 'Harbiy chaqiruvdan bosh tortadi; unvoni va litsenziyasi bekor qilinadi.' } },
      { year: '1971', event: { en: 'The Supreme Court overturns his conviction.', uz: 'Oliy sud hukmni bekor qiladi.' } },
      { year: '1974', event: { en: 'Regains the title in Kinshasa.', uz: 'Kinshasada unvonni qaytarib oladi.' } },
      { year: '1984', event: { en: 'Diagnosed with Parkinson’s syndrome.', uz: 'Parkinson sindromi tashxisi qoʻyiladi.' } },
      { year: '2016', event: { en: 'Dies in Scottsdale, Arizona.', uz: 'Arizona shtatining Skottsdeyl shahrida vafot etadi.' } },
    ],
    palette: ['#FFB877', '#6A1B1B'],
  },
  {
    id: 'lionel-messi',
    name: 'Lionel Messi',
    short: 'Messi',
    discipline: { en: 'Footballer', uz: 'Futbolchi' },
    field: 'sport',
    origin: 'Rosario, Argentina',
    born: '1987',
    line: { en: 'Close control at full speed, in spaces that should not have been there.', uz: 'Toʻliq tezlikda aniq nazorat — boʻlmasligi kerak boʻlgan boʻshliqlarda.' },
    bio: [
      { en: 'Messi moved from Rosario to Barcelona as a child, joining the La Masia academy, and debuted for the first team at seventeen.', uz: 'Messi bolaligida Rosariodan Barselonaga koʻchib, La Masiya akademiyasiga qoʻshildi va oʻn yetti yoshida asosiy tarkibda debyut qildi.' },
      { en: 'Over two decades he became Barcelona’s all-time leading scorer and the most decorated individual player in the sport, before spells at Paris Saint-Germain and Inter Miami.', uz: 'Yigirma yildan ortiq davrda u Barselona tarixidagi eng koʻp gol urgan va sportdagi eng koʻp shaxsiy mukofotga ega oʻyinchiga aylandi; soʻng Paris Sen-Jermen va Inter Mayamida oʻynadi.' },
      { en: 'With Argentina he won the Copa América in 2021 and the FIFA World Cup in 2022, having led the team through three previous major final defeats.', uz: 'Argentina bilan 2021-yilda Amerika kubogini va 2022-yilda FIFA Jahon chempionatini qoʻlga kiritdi — bundan oldin jamoani uchta yirik final magʻlubiyatidan olib oʻtgan edi.' },
    ],
    impact:
      { en: 'Messi is the central argument in the modern debate about what a footballer can be: a player of extreme technical economy in an era of physical extremes. His move to Inter Miami redirected attention onto Major League Soccer, and his rivalry with Cristiano Ronaldo shaped how a generation followed the game.', uz: 'Messi futbolchi qanday boʻlishi mumkinligi haqidagi zamonaviy bahsning markazi: jismoniy kuch hukmron davrda texnik tejamkorlikning eng yuqori namunasi. Uning Inter Mayamiga oʻtishi eʼtiborni Major League Soccer ga qaratdi, Kristiano Ronaldu bilan raqobati esa butun bir avlodning futbolga munosabatini shakllantirdi.' },
    achievements: [
      { en: 'A record eight Ballon d’Or awards', uz: 'Rekord darajadagi sakkizta “Oltin toʻp” mukofoti' },
      { en: 'FIFA World Cup winner with Argentina, 2022', uz: '2022-yilda Argentina bilan FIFA Jahon chempionati gʻolibi' },
      { en: 'Four UEFA Champions League titles with Barcelona', uz: 'Barselona bilan toʻrtta UEFA Chempionlar ligasi gʻalabasi' },
      { en: 'Barcelona’s all-time leading goalscorer', uz: 'Barselona tarixidagi eng koʻp gol urgan oʻyinchi' },
      { en: 'Copa América champion in 2021 and 2024', uz: '2021 va 2024-yillarda Amerika kubogi gʻolibi' },
    ],
    works: [
      { title: 'FC Barcelona', year: '2004–2021', note: { en: 'Ten league titles and four Champions Leagues.', uz: 'Oʻnta chempionlik va toʻrtta Chempionlar ligasi.' } },
      { title: 'Paris Saint-Germain', year: '2021–2023', note: { en: 'Two Ligue 1 titles.', uz: 'Ikkita Liga 1 chempionligi.' } },
      { title: 'Inter Miami', year: '2023–', note: { en: 'Won the Leagues Cup in his first season.', uz: 'Ilk mavsumidayoq Leagues Cup ni qoʻlga kiritdi.' } },
      { title: 'Argentina', year: '2005–', note: { en: 'World Cup 2022; Copa América 2021 and 2024.', uz: 'Jahon chempionati 2022; Amerika kubogi 2021 va 2024.' } },
    ],
    timeline: [
      { year: '2000', event: { en: 'Joins the Barcelona academy after moving from Rosario.', uz: 'Rosariodan koʻchib, Barselona akademiyasiga qoʻshiladi.' } },
      { year: '2004', event: { en: 'First-team debut at seventeen.', uz: 'Oʻn yetti yoshida asosiy tarkibda debyut.' } },
      { year: '2009', event: { en: 'First Ballon d’Or; Barcelona win a historic sextuple of trophies.', uz: 'Ilk “Oltin toʻp”; Barselona tarixiy oltita kubokni qoʻlga kiritadi.' } },
      { year: '2021', event: { en: 'Wins the Copa América, then leaves Barcelona for Paris.', uz: 'Amerika kubogini yutadi, soʻng Barselonani tark etib Parijga ketadi.' } },
      { year: '2022', event: { en: 'Wins the World Cup in Qatar.', uz: 'Qatarda Jahon chempionatini qoʻlga kiritadi.' } },
      { year: '2023', event: { en: 'Joins Inter Miami.', uz: 'Inter Mayamiga qoʻshiladi.' } },
    ],
    palette: ['#8FD6FF', '#123A5E'],
  },
  {
    id: 'nikola-tesla',
    name: 'Nikola Tesla',
    short: 'Tesla',
    discipline: { en: 'Inventor, electrical engineer', uz: 'Ixtirochi, elektrotexnika muhandisi' },
    field: 'science',
    origin: { en: 'Smiljan, Austrian Empire (modern Croatia)', uz: 'Smilyan, Avstriya imperiyasi (hozirgi Xorvatiya)' },
    born: '1856',
    died: '1943',
    line: { en: 'He designed the electrical system the modern world actually runs on.', uz: 'U zamonaviy dunyo amalda ishlab turgan elektr tizimini loyihalagan.' },
    bio: [
      { en: 'Tesla emigrated to the United States in 1884, worked briefly for Thomas Edison, and then developed the polyphase alternating-current system that George Westinghouse licensed.', uz: 'Tesla 1884-yilda AQSHga koʻchib keldi, qisqa muddat Tomas Edison qoʻlida ishladi, soʻng Jorj Vestingauz litsenziya olgan koʻp fazali oʻzgaruvchan tok tizimini yaratdi.' },
      { en: 'His induction motor and AC transmission designs won the practical argument over direct current, and were used to build the generating station at Niagara Falls.', uz: 'Uning induksion dvigateli va oʻzgaruvchan tok uzatish yechimlari oʻzgarmas tok bilan boʻlgan amaliy bahsda gʻalaba qozondi hamda Niagara sharsharasidagi elektr stansiyasini qurishda qoʻllanildi.' },
      { en: 'His later work on high-frequency currents, wireless transmission and the unfinished Wardenclyffe tower ran ahead of what could be financed or built.', uz: 'Yuqori chastotali toklar, simsiz uzatish va tugallanmagan Uordenklif minorasi ustidagi keyingi ishlari oʻsha davrda moliyalashtirish yoki qurish mumkin boʻlganidan oldinda edi.' },
    ],
    impact:
      { en: 'Almost every wall socket on Earth carries alternating current in the form Tesla’s patents defined. The SI unit of magnetic flux density is named after him, and he has become the archetype of the inventor whose vision outpaced his century.', uz: 'Yer yuzidagi deyarli har bir rozetka Tesla patentlari belgilagan koʻrinishdagi oʻzgaruvchan tokni uzatadi. Magnit induksiyaning XBT birligi uning nomi bilan atalgan, oʻzi esa qarashlari oʻz asridan oʻzib ketgan ixtirochining timsoliga aylangan.' },
    achievements: [
      { en: 'Invented the AC induction motor and the polyphase distribution system', uz: 'Oʻzgaruvchan tokli induksion dvigatel va koʻp fazali taqsimlash tizimini ixtiro qilgan' },
      { en: 'Around three hundred patents worldwide', uz: 'Dunyo boʻylab qariyb uch yuzta patent' },
      { en: 'Engineering behind the Niagara Falls hydroelectric power station', uz: 'Niagara sharsharasidagi gidroelektr stansiyasi ortidagi muhandislik' },
      { en: 'The tesla, the SI unit of magnetic flux density, is named for him', uz: 'Magnit induksiyaning XBT birligi — tesla uning nomi bilan atalgan' },
    ],
    works: [
      { title: { en: 'AC induction motor', uz: 'Oʻzgaruvchan tokli induksion dvigatel' }, year: '1888', note: { en: 'The machine that made alternating current practical.', uz: 'Oʻzgaruvchan tokni amaliyotga olib chiqqan mashina.' } },
      { title: { en: 'Tesla coil', uz: 'Tesla gʻaltagi' }, year: '1891', note: { en: 'Resonant transformer used in early radio work.', uz: 'Dastlabki radio ishlarida qoʻllangan rezonansli transformator.' } },
      { title: { en: 'Niagara Falls power station', uz: 'Niagara sharsharasi elektr stansiyasi' }, year: '1895', note: { en: 'Large-scale AC generation and transmission.', uz: 'Katta hajmda oʻzgaruvchan tok ishlab chiqarish va uzatish.' } },
      { title: { en: 'Wardenclyffe Tower', uz: 'Uordenklif minorasi' }, year: '1901–1906', note: { en: 'An unfinished wireless transmission experiment.', uz: 'Tugallanmagan simsiz uzatish tajribasi.' } },
    ],
    timeline: [
      { year: '1884', event: { en: 'Arrives in New York.', uz: 'Nyu-Yorkka keladi.' } },
      { year: '1888', event: { en: 'Patents the polyphase AC system; Westinghouse licenses it.', uz: 'Koʻp fazali oʻzgaruvchan tok tizimini patentlaydi; Vestingauz litsenziya oladi.' } },
      { year: '1893', event: { en: 'AC lights the Chicago World’s Columbian Exposition.', uz: 'Chikagodagi Jahon Kolumb koʻrgazmasi oʻzgaruvchan tok bilan yoritiladi.' } },
      { year: '1895', event: { en: 'Niagara Falls generating station begins operation.', uz: 'Niagara sharsharasidagi elektr stansiyasi ishga tushadi.' } },
      { year: '1901', event: { en: 'Begins construction of Wardenclyffe.', uz: 'Uordenklif qurilishini boshlaydi.' } },
      { year: '1943', event: { en: 'Dies in New York City.', uz: 'Nyu-York shahrida vafot etadi.' } },
    ],
    palette: ['#7CE7FF', '#1B2E4A'],
  },
  {
    id: 'charlie-chaplin',
    name: 'Charlie Chaplin',
    short: 'Chaplin',
    discipline: { en: 'Filmmaker, actor, composer', uz: 'Kinorejissor, aktyor, bastakor' },
    field: 'film',
    origin: { en: 'London, England', uz: 'London, Angliya' },
    born: '1889',
    died: '1977',
    line: { en: 'A silent figure who made poverty funny without ever making it weightless.', uz: 'Qashshoqlikni kulgili qilgan, ammo uni hech qachon yengil koʻrsatmagan soqov qahramon.' },
    bio: [
      { en: 'Chaplin grew up in extreme poverty in south London and came to the United States with a touring music-hall company, entering film in 1914.', uz: 'Chaplin Londonning janubida oʻta qashshoqlikda oʻsdi, gastrolchi myuzik-holl truppasi bilan AQSHga keldi va 1914-yilda kinoga kirdi.' },
      { en: 'The Tramp — bowler hat, cane, oversized shoes — appeared within his first year and became the most recognisable character in the world during the silent era.', uz: 'Daydi obrazi — kotelok, hassa, kattaligi oshib ketgan tufli — birinchi yiliyoq paydo boʻldi va soqov kino davrida dunyodagi eng tanish qahramonga aylandi.' },
      { en: 'He wrote, directed, produced, scored and starred in his own features, and in 1919 co-founded United Artists so that he could keep control of them.', uz: 'U oʻz filmlarini yozdi, suratga oldi, prodyuserlik qildi, musiqasini bastalab bosh rolni oʻynadi va 1919-yilda ular ustidan nazoratni saqlash uchun United Artists ga asos soldi.' },
    ],
    impact:
      { en: 'Chaplin proved that mass-audience comedy could carry social argument: Modern Times took on industrial labour and The Great Dictator satirised Hitler while the United States was still formally neutral. He was also among the first artists to fight for ownership of his own work.', uz: 'Chaplin ommaviy komediya ijtimoiy fikrni koʻtara olishini isbotladi: Modern Times sanoat mehnatiga qaratilgan, The Great Dictator esa AQSH hali rasman betaraf boʻlgan bir paytda Gitlerni masxara qilgan. U oʻz asarlariga egalik uchun kurashgan ilk sanʼatkorlardan biri ham edi.' },
    achievements: [
      { en: 'Co-founded United Artists in 1919', uz: '1919-yilda United Artists ga asos solgan' },
      { en: 'Honorary Academy Award in 1972 for his contribution to the century of film', uz: '1972-yilda kino asriga qoʻshgan hissasi uchun faxriy “Oskar” mukofoti' },
      { en: 'Academy Award for the score of Limelight', uz: 'Limelight filmi musiqasi uchun “Oskar” mukofoti' },
      { en: 'Wrote, directed, produced, scored and starred in his major features', uz: 'Asosiy filmlarini oʻzi yozgan, suratga olgan, prodyuserlik qilgan, musiqasini bastalagan va bosh rolni oʻynagan' },
    ],
    works: [
      { title: 'The Kid', year: '1921', note: { en: 'His first feature-length film as director.', uz: 'Rejissor sifatidagi ilk toʻliq metrajli filmi.' } },
      { title: 'City Lights', year: '1931', note: { en: 'Silent, by choice, four years into sound.', uz: 'Ovozli kino paydo boʻlganiga toʻrt yil boʻlsa-da, ataylab soqov.' } },
      { title: 'Modern Times', year: '1936', note: { en: 'The Tramp against the assembly line.', uz: 'Daydi konveyerga qarshi.' } },
      { title: 'The Great Dictator', year: '1940', note: { en: 'His first full sound film, and a direct satire of fascism.', uz: 'Uning ilk toʻliq ovozli filmi va fashizm ustidan ochiq satira.' } },
    ],
    timeline: [
      { year: '1914', event: { en: 'Enters film with Keystone Studios; the Tramp appears.', uz: 'Keystone Studios bilan kinoga kiradi; Daydi obrazi paydo boʻladi.' } },
      { year: '1919', event: { en: 'Co-founds United Artists.', uz: 'United Artists ga asos soladi.' } },
      { year: '1921', event: { en: 'The Kid is released.', uz: 'The Kid ekranga chiqadi.' } },
      { year: '1936', event: { en: 'Modern Times, the Tramp’s last appearance.', uz: 'Modern Times — Daydi obrazining soʻnggi chiqishi.' } },
      { year: '1940', event: 'The Great Dictator.' },
      { year: '1952', event: { en: 'Leaves the United States amid political pressure; settles in Switzerland.', uz: 'Siyosiy bosim ostida AQSHni tark etadi; Shveytsariyada qoʻnim topadi.' } },
      { year: '1972', event: { en: 'Returns to receive an honorary Academy Award.', uz: 'Faxriy “Oskar” mukofotini olish uchun qaytadi.' } },
    ],
    palette: ['#D9D9D9', '#2B2B2B'],
  },
];

export const ICON_BY_ID = Object.fromEntries(ICONS.map((i) => [i.id, i])) as Record<string, Icon>;

export function iconIndex(id: string) {
  return ICONS.findIndex((i) => i.id === id);
}
