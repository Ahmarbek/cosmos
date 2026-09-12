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

export interface TimelineEntry {
  year: string;
  event: string;
}

export interface Work {
  title: string;
  year: string;
  note: string;
}

export interface Icon {
  id: string;
  name: string;
  short: string;
  discipline: string;
  field: 'music' | 'sport' | 'science' | 'art' | 'technology' | 'film';
  origin: string;
  born: string;
  died?: string;
  /** one descriptive line — our words, never presented as a quote */
  line: string;
  bio: string[];
  impact: string;
  achievements: string[];
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
    discipline: 'Singer, songwriter, dancer',
    field: 'music',
    origin: 'Gary, Indiana, United States',
    born: '1958',
    died: '2009',
    line: 'He rebuilt what a pop record, a music video and a live performance were allowed to be.',
    bio: [
      'Michael Jackson began performing as a child with his brothers in the Jackson 5, who signed to Motown in 1968 and reached number one with their first four singles.',
      'His solo work with producer Quincy Jones — Off the Wall (1979), Thriller (1982) and Bad (1987) — fused pop, soul, funk and rock into a sound built for radio and for the new medium of the music video.',
      'Thriller became the best-selling album in history, and its long-form videos changed how music was made, marketed and watched.',
    ],
    impact:
      'Jackson turned the music video from promotional filler into a cinematic form, broke through the colour barrier in early MTV rotation, and set a standard for live pop choreography that performers still work against. His catalogue, stagecraft and silhouette remain among the most recognised in popular culture.',
    achievements: [
      'Thriller (1982) — the best-selling album of all time',
      'Thirteen Grammy Awards, including a record eight in a single night in 1984',
      'Inducted into the Rock and Roll Hall of Fame twice — with the Jackson 5 and as a solo artist',
      'First performed the moonwalk on Motown 25 in 1983, before a national audience',
    ],
    works: [
      { title: 'Off the Wall', year: '1979', note: 'The break from child stardom into adult disco-soul.' },
      { title: 'Thriller', year: '1982', note: 'Seven of its nine tracks were released as singles.' },
      { title: 'Bad', year: '1987', note: 'Five US number-one singles from a single album.' },
      { title: 'Dangerous', year: '1991', note: 'A harder new jack swing direction with Teddy Riley.' },
    ],
    timeline: [
      { year: '1964', event: 'Joins his brothers in the group that becomes the Jackson 5.' },
      { year: '1969', event: 'National breakthrough; the group signs to Motown.' },
      { year: '1979', event: 'Off the Wall establishes him as a solo artist.' },
      { year: '1982', event: 'Thriller is released.' },
      { year: '1983', event: 'The Motown 25 performance.' },
      { year: '1987', event: 'The Bad world tour reaches audiences across four continents.' },
      { year: '2009', event: 'Dies in Los Angeles at the age of fifty.' },
    ],
    palette: ['#C9A227', '#7C5CFF'],
  },
  {
    id: 'cristiano-ronaldo',
    name: 'Cristiano Ronaldo',
    short: 'Ronaldo',
    discipline: 'Footballer',
    field: 'sport',
    origin: 'Funchal, Madeira, Portugal',
    born: '1985',
    line: 'A career built less on natural gift than on a refusal to stop rebuilding himself.',
    bio: [
      'Cristiano Ronaldo left Madeira for Sporting CP as a boy and signed for Manchester United in 2003, arriving as a winger known more for trickery than for end product.',
      'Across Manchester United, Real Madrid, Juventus, a return to United and Al Nassr he remade his game repeatedly — from touchline dribbler to central scorer — sustaining an output measured in decades rather than seasons.',
      'With Portugal he captained the side that won UEFA Euro 2016 and the UEFA Nations League, and he is the all-time leading scorer in men’s international football.',
    ],
    impact:
      'Ronaldo made professional longevity a discipline in itself: conditioning, recovery and body composition became part of how the modern game is discussed because of him. His rivalry with Lionel Messi defined a fifteen-year era of football, and his following is among the largest of any person on social media.',
    achievements: [
      'Five Ballon d’Or awards',
      'Five UEFA Champions League titles — one with Manchester United, four with Real Madrid',
      'All-time leading scorer in the UEFA Champions League',
      'UEFA Euro 2016 and UEFA Nations League winner with Portugal',
      'Scored at five different FIFA World Cups',
    ],
    works: [
      { title: 'Manchester United', year: '2003–2009', note: 'Three league titles and the 2008 Champions League.' },
      { title: 'Real Madrid', year: '2009–2018', note: 'Four Champions League titles; the club’s all-time leading scorer.' },
      { title: 'Juventus', year: '2018–2021', note: 'Two Serie A titles.' },
      { title: 'Al Nassr', year: '2023–', note: 'A transfer that moved global attention onto the Saudi Pro League.' },
    ],
    timeline: [
      { year: '2002', event: 'Debuts for Sporting CP at seventeen.' },
      { year: '2003', event: 'Signs for Manchester United.' },
      { year: '2008', event: 'Wins the Champions League and a first Ballon d’Or.' },
      { year: '2009', event: 'Transfers to Real Madrid.' },
      { year: '2016', event: 'Captains Portugal to the European Championship.' },
      { year: '2018', event: 'Joins Juventus.' },
      { year: '2023', event: 'Signs for Al Nassr.' },
    ],
    palette: ['#5BC8FF', '#1B3A8C'],
  },
  {
    id: 'albert-einstein',
    name: 'Albert Einstein',
    short: 'Einstein',
    discipline: 'Theoretical physicist',
    field: 'science',
    origin: 'Ulm, German Empire',
    born: '1879',
    died: '1955',
    line: 'He took space and time — the stage everything else stood on — and made them part of the play.',
    bio: [
      'In 1905, working as a patent examiner in Bern, Einstein published four papers that reshaped physics: on the photoelectric effect, Brownian motion, special relativity, and the equivalence of mass and energy.',
      'A decade later he completed the general theory of relativity, describing gravity not as a force but as the curvature of spacetime by mass and energy.',
      'He left Germany in 1933 and spent the rest of his life at the Institute for Advanced Study in Princeton.',
    ],
    impact:
      'General relativity underpins modern cosmology and predicts the objects at the opening of this journey: black holes, gravitational lensing, the bending of starlight. Satellite navigation corrects for his time dilation every day. He also became the public face of scientific thought itself — a rare case of a physicist recognised on sight.',
    achievements: [
      'Nobel Prize in Physics, awarded for his explanation of the photoelectric effect',
      'Special relativity (1905) and general relativity (1915)',
      'The mass–energy equivalence relation E = mc²',
      'Predicted gravitational lensing, supported by observations of the 1919 solar eclipse',
    ],
    works: [
      { title: 'On the Electrodynamics of Moving Bodies', year: '1905', note: 'The special relativity paper.' },
      { title: 'The Field Equations of Gravitation', year: '1915', note: 'General relativity in its final form.' },
      { title: 'The Einstein–Podolsky–Rosen paper', year: '1935', note: 'Framed the questions that became entanglement research.' },
    ],
    timeline: [
      { year: '1905', event: 'The miracle year — four papers that reset physics.' },
      { year: '1915', event: 'Completes the general theory of relativity.' },
      { year: '1919', event: 'Eclipse observations support light bending; he becomes world-famous.' },
      { year: '1921', event: 'Awarded the Nobel Prize in Physics.' },
      { year: '1933', event: 'Leaves Germany for the United States.' },
      { year: '1955', event: 'Dies in Princeton, New Jersey.' },
    ],
    palette: ['#9AB4FF', '#2A2F5E'],
  },
  {
    id: 'leonardo-da-vinci',
    name: 'Leonardo da Vinci',
    short: 'Leonardo',
    discipline: 'Painter, engineer, anatomist',
    field: 'art',
    origin: 'Vinci, Republic of Florence',
    born: '1452',
    died: '1519',
    line: 'He refused the line between looking at the world and taking it apart.',
    bio: [
      'Trained in the Florentine workshop of Andrea del Verrocchio, Leonardo became a painter whose finished output was famously small and famously studied.',
      'He filled thousands of notebook pages with anatomy, hydraulics, optics, geology, flight and mechanics, written in mirror script and largely unpublished in his lifetime.',
      'He worked in Florence, Milan and Rome, and died at Amboise in France.',
    ],
    impact:
      'Leonardo is the reference point for the idea that art and science are a single act of attention. His anatomical drawings were centuries ahead of their eventual publication, his sfumato changed European painting, and the Mona Lisa is the most visited painting in the world.',
    achievements: [
      'The Mona Lisa and The Last Supper',
      'Anatomical studies based on direct human dissection',
      'Notebooks spanning engineering, hydrodynamics, optics and geology',
      'The Vitruvian Man, a study of human proportion',
    ],
    works: [
      { title: 'The Last Supper', year: 'c. 1495–1498', note: 'Mural in Santa Maria delle Grazie, Milan.' },
      { title: 'Mona Lisa', year: 'c. 1503–1519', note: 'Held at the Louvre, Paris.' },
      { title: 'Vitruvian Man', year: 'c. 1490', note: 'Proportion study after the Roman architect Vitruvius.' },
      { title: 'Codex Leicester', year: 'c. 1508–1510', note: 'Notebook on water, rock and celestial light.' },
    ],
    timeline: [
      { year: 'c. 1466', event: 'Apprenticed to Verrocchio in Florence.' },
      { year: '1482', event: 'Enters the service of Ludovico Sforza in Milan.' },
      { year: 'c. 1495', event: 'Begins The Last Supper.' },
      { year: 'c. 1503', event: 'Begins the Mona Lisa.' },
      { year: '1516', event: 'Accepts the invitation of Francis I to France.' },
      { year: '1519', event: 'Dies at Clos Lucé, Amboise.' },
    ],
    palette: ['#D8A76A', '#3A2A1B'],
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    short: 'Jobs',
    discipline: 'Entrepreneur, product designer',
    field: 'technology',
    origin: 'San Francisco, California, United States',
    born: '1955',
    died: '2011',
    line: 'He argued, relentlessly, that how a thing feels to use is not a detail.',
    bio: [
      'Steve Jobs co-founded Apple in 1976 with Steve Wozniak and Ronald Wayne, and led the Macintosh project that brought the graphical interface to a mass market in 1984.',
      'Forced out of Apple in 1985, he founded NeXT and bought the computer graphics division that became Pixar, which released Toy Story — the first fully computer-animated feature — in 1995.',
      'Apple acquired NeXT in 1996, returning him to the company. The iMac, iPod, iPhone and iPad followed over the next thirteen years.',
    ],
    impact:
      'Jobs made industrial design, typography and interface behaviour central to consumer technology rather than peripheral to it. The iPhone reorganised the phone, the camera, the music player and the map into one object, and the ecosystem built around it reshaped whole industries.',
    achievements: [
      'Co-founded Apple Computer in 1976',
      'Led the Macintosh, the first mass-market computer with a graphical interface',
      'Built Pixar into the studio behind Toy Story',
      'Introduced the iPod (2001), iPhone (2007) and iPad (2010)',
    ],
    works: [
      { title: 'Macintosh', year: '1984', note: 'Graphical computing for a general audience.' },
      { title: 'NeXTSTEP', year: '1989', note: 'Its descendants still run Apple’s operating systems.' },
      { title: 'iPod', year: '2001', note: 'Reframed the music library as something carried.' },
      { title: 'iPhone', year: '2007', note: 'Collapsed a dozen devices into one.' },
    ],
    timeline: [
      { year: '1976', event: 'Co-founds Apple in Los Altos, California.' },
      { year: '1984', event: 'Introduces the Macintosh.' },
      { year: '1985', event: 'Leaves Apple; founds NeXT.' },
      { year: '1986', event: 'Acquires the graphics group that becomes Pixar.' },
      { year: '1997', event: 'Returns to Apple as interim chief executive.' },
      { year: '2007', event: 'Introduces the iPhone.' },
      { year: '2011', event: 'Dies in Palo Alto, California.' },
    ],
    palette: ['#E8E8ED', '#4A4A55'],
  },
  {
    id: 'marilyn-monroe',
    name: 'Marilyn Monroe',
    short: 'Monroe',
    discipline: 'Actress, producer, model',
    field: 'film',
    origin: 'Los Angeles, California, United States',
    born: '1926',
    died: '1962',
    line: 'She played the persona the studios built for her, and then went to work on owning it.',
    bio: [
      'Born Norma Jeane Mortenson, she was photographed as a factory worker during the Second World War and moved from modelling into film contracts in the late 1940s.',
      'By the mid-1950s she was one of the highest-profile stars in the world, in comedies including Gentlemen Prefer Blondes, The Seven Year Itch and Some Like It Hot.',
      'In 1955 she suspended her studio contract and co-founded Marilyn Monroe Productions, an unusual assertion of control for a performer of the era, and studied at the Actors Studio in New York.',
    ],
    impact:
      'Monroe is among the most photographed people of the twentieth century, and her image has been recycled continuously by fine art, advertising and fashion since her death. Her fight for script approval and her own production company anticipated the creative control that leading actors negotiate today.',
    achievements: [
      'Golden Globe for Best Actress in a Musical or Comedy for Some Like It Hot',
      'Co-founded Marilyn Monroe Productions in 1955',
      'Named among the greatest female screen legends of classic Hollywood by the American Film Institute',
    ],
    works: [
      { title: 'Gentlemen Prefer Blondes', year: '1953', note: 'The performance that fixed her public image.' },
      { title: 'The Seven Year Itch', year: '1955', note: 'Source of the most reproduced image of her career.' },
      { title: 'Bus Stop', year: '1956', note: 'The dramatic turn that followed her Actors Studio year.' },
      { title: 'Some Like It Hot', year: '1959', note: 'Routinely ranked among the best comedies ever made.' },
    ],
    timeline: [
      { year: '1946', event: 'Signs a first film contract and takes the name Marilyn Monroe.' },
      { year: '1953', event: 'Breakthrough year with Niagara and Gentlemen Prefer Blondes.' },
      { year: '1955', event: 'Founds her own production company and moves to New York.' },
      { year: '1959', event: 'Some Like It Hot is released.' },
      { year: '1962', event: 'Dies in Los Angeles at the age of thirty-six.' },
    ],
    palette: ['#F2D4D8', '#5A2A3C'],
  },
  {
    id: 'muhammad-ali',
    name: 'Muhammad Ali',
    short: 'Ali',
    discipline: 'Boxer, activist',
    field: 'sport',
    origin: 'Louisville, Kentucky, United States',
    born: '1942',
    died: '2016',
    line: 'The most famous athlete alive, who accepted losing everything rather than fight a war he rejected.',
    bio: [
      'Born Cassius Clay, he won Olympic gold in Rome in 1960 and took the world heavyweight title from Sonny Liston in 1964, announcing his conversion to Islam and his new name soon after.',
      'In 1967 he refused induction into the United States military on religious grounds. He was stripped of his title and licence and did not fight for over three years; the Supreme Court overturned his conviction in 1971.',
      'He returned to win the title twice more, in Kinshasa against George Foreman in 1974 and against Leon Spinks in 1978.',
    ],
    impact:
      'Ali fused athletic dominance with a public voice on race, religion and war at a moment when athletes were expected to stay silent, and paid a career’s worth of prime years for it. He remains a reference point for sport as a stage for conscience, and for showmanship as part of the craft.',
    achievements: [
      'Olympic light heavyweight gold medal, Rome 1960',
      'Three-time world heavyweight champion',
      'Won the Rumble in the Jungle against George Foreman in 1974',
      'Presidential Medal of Freedom, 2005',
    ],
    works: [
      { title: 'Clay vs Liston', year: '1964', note: 'The upset that made him champion at twenty-two.' },
      { title: 'The Fight of the Century', year: '1971', note: 'His first professional defeat, to Joe Frazier.' },
      { title: 'The Rumble in the Jungle', year: '1974', note: 'Kinshasa; he regained the title against Foreman.' },
      { title: 'The Thrilla in Manila', year: '1975', note: 'The third and most brutal Frazier fight.' },
    ],
    timeline: [
      { year: '1960', event: 'Olympic gold in Rome.' },
      { year: '1964', event: 'Beats Sonny Liston for the world heavyweight title.' },
      { year: '1967', event: 'Refuses military induction; title and licence are stripped.' },
      { year: '1971', event: 'The Supreme Court overturns his conviction.' },
      { year: '1974', event: 'Regains the title in Kinshasa.' },
      { year: '1984', event: 'Diagnosed with Parkinson’s syndrome.' },
      { year: '2016', event: 'Dies in Scottsdale, Arizona.' },
    ],
    palette: ['#FFB877', '#6A1B1B'],
  },
  {
    id: 'lionel-messi',
    name: 'Lionel Messi',
    short: 'Messi',
    discipline: 'Footballer',
    field: 'sport',
    origin: 'Rosario, Argentina',
    born: '1987',
    line: 'Close control at full speed, in spaces that should not have been there.',
    bio: [
      'Messi moved from Rosario to Barcelona as a child, joining the La Masia academy, and debuted for the first team at seventeen.',
      'Over two decades he became Barcelona’s all-time leading scorer and the most decorated individual player in the sport, before spells at Paris Saint-Germain and Inter Miami.',
      'With Argentina he won the Copa América in 2021 and the FIFA World Cup in 2022, having led the team through three previous major final defeats.',
    ],
    impact:
      'Messi is the central argument in the modern debate about what a footballer can be: a player of extreme technical economy in an era of physical extremes. His move to Inter Miami redirected attention onto Major League Soccer, and his rivalry with Cristiano Ronaldo shaped how a generation followed the game.',
    achievements: [
      'A record eight Ballon d’Or awards',
      'FIFA World Cup winner with Argentina, 2022',
      'Four UEFA Champions League titles with Barcelona',
      'Barcelona’s all-time leading goalscorer',
      'Copa América champion in 2021 and 2024',
    ],
    works: [
      { title: 'FC Barcelona', year: '2004–2021', note: 'Ten league titles and four Champions Leagues.' },
      { title: 'Paris Saint-Germain', year: '2021–2023', note: 'Two Ligue 1 titles.' },
      { title: 'Inter Miami', year: '2023–', note: 'Won the Leagues Cup in his first season.' },
      { title: 'Argentina', year: '2005–', note: 'World Cup 2022; Copa América 2021 and 2024.' },
    ],
    timeline: [
      { year: '2000', event: 'Joins the Barcelona academy after moving from Rosario.' },
      { year: '2004', event: 'First-team debut at seventeen.' },
      { year: '2009', event: 'First Ballon d’Or; Barcelona win a historic sextuple of trophies.' },
      { year: '2021', event: 'Wins the Copa América, then leaves Barcelona for Paris.' },
      { year: '2022', event: 'Wins the World Cup in Qatar.' },
      { year: '2023', event: 'Joins Inter Miami.' },
    ],
    palette: ['#8FD6FF', '#123A5E'],
  },
  {
    id: 'nikola-tesla',
    name: 'Nikola Tesla',
    short: 'Tesla',
    discipline: 'Inventor, electrical engineer',
    field: 'science',
    origin: 'Smiljan, Austrian Empire (modern Croatia)',
    born: '1856',
    died: '1943',
    line: 'He designed the electrical system the modern world actually runs on.',
    bio: [
      'Tesla emigrated to the United States in 1884, worked briefly for Thomas Edison, and then developed the polyphase alternating-current system that George Westinghouse licensed.',
      'His induction motor and AC transmission designs won the practical argument over direct current, and were used to build the generating station at Niagara Falls.',
      'His later work on high-frequency currents, wireless transmission and the unfinished Wardenclyffe tower ran ahead of what could be financed or built.',
    ],
    impact:
      'Almost every wall socket on Earth carries alternating current in the form Tesla’s patents defined. The SI unit of magnetic flux density is named after him, and he has become the archetype of the inventor whose vision outpaced his century.',
    achievements: [
      'Invented the AC induction motor and the polyphase distribution system',
      'Around three hundred patents worldwide',
      'Engineering behind the Niagara Falls hydroelectric power station',
      'The tesla, the SI unit of magnetic flux density, is named for him',
    ],
    works: [
      { title: 'AC induction motor', year: '1888', note: 'The machine that made alternating current practical.' },
      { title: 'Tesla coil', year: '1891', note: 'Resonant transformer used in early radio work.' },
      { title: 'Niagara Falls power station', year: '1895', note: 'Large-scale AC generation and transmission.' },
      { title: 'Wardenclyffe Tower', year: '1901–1906', note: 'An unfinished wireless transmission experiment.' },
    ],
    timeline: [
      { year: '1884', event: 'Arrives in New York.' },
      { year: '1888', event: 'Patents the polyphase AC system; Westinghouse licenses it.' },
      { year: '1893', event: 'AC lights the Chicago World’s Columbian Exposition.' },
      { year: '1895', event: 'Niagara Falls generating station begins operation.' },
      { year: '1901', event: 'Begins construction of Wardenclyffe.' },
      { year: '1943', event: 'Dies in New York City.' },
    ],
    palette: ['#7CE7FF', '#1B2E4A'],
  },
  {
    id: 'charlie-chaplin',
    name: 'Charlie Chaplin',
    short: 'Chaplin',
    discipline: 'Filmmaker, actor, composer',
    field: 'film',
    origin: 'London, England',
    born: '1889',
    died: '1977',
    line: 'A silent figure who made poverty funny without ever making it weightless.',
    bio: [
      'Chaplin grew up in extreme poverty in south London and came to the United States with a touring music-hall company, entering film in 1914.',
      'The Tramp — bowler hat, cane, oversized shoes — appeared within his first year and became the most recognisable character in the world during the silent era.',
      'He wrote, directed, produced, scored and starred in his own features, and in 1919 co-founded United Artists so that he could keep control of them.',
    ],
    impact:
      'Chaplin proved that mass-audience comedy could carry social argument: Modern Times took on industrial labour and The Great Dictator satirised Hitler while the United States was still formally neutral. He was also among the first artists to fight for ownership of his own work.',
    achievements: [
      'Co-founded United Artists in 1919',
      'Honorary Academy Award in 1972 for his contribution to the century of film',
      'Academy Award for the score of Limelight',
      'Wrote, directed, produced, scored and starred in his major features',
    ],
    works: [
      { title: 'The Kid', year: '1921', note: 'His first feature-length film as director.' },
      { title: 'City Lights', year: '1931', note: 'Silent, by choice, four years into sound.' },
      { title: 'Modern Times', year: '1936', note: 'The Tramp against the assembly line.' },
      { title: 'The Great Dictator', year: '1940', note: 'His first full sound film, and a direct satire of fascism.' },
    ],
    timeline: [
      { year: '1914', event: 'Enters film with Keystone Studios; the Tramp appears.' },
      { year: '1919', event: 'Co-founds United Artists.' },
      { year: '1921', event: 'The Kid is released.' },
      { year: '1936', event: 'Modern Times, the Tramp’s last appearance.' },
      { year: '1940', event: 'The Great Dictator.' },
      { year: '1952', event: 'Leaves the United States amid political pressure; settles in Switzerland.' },
      { year: '1972', event: 'Returns to receive an honorary Academy Award.' },
    ],
    palette: ['#D9D9D9', '#2B2B2B'],
  },
];

export const ICON_BY_ID = Object.fromEntries(ICONS.map((i) => [i.id, i])) as Record<string, Icon>;

export function iconIndex(id: string) {
  return ICONS.findIndex((i) => i.id === id);
}
