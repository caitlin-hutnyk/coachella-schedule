export type Stage = 'coachella' | 'outdoor' | 'sonora' | 'gobi' | 'mojave' | 'sahara' | 'yuma' | 'quasar' | 'dolab';

export const STAGE_LABELS: Record<Stage, string> = {
  coachella: 'Coachella Stage',
  outdoor: 'Outdoor Theatre',
  sonora: 'Sonora',
  gobi: 'Gobi',
  mojave: 'Mojave',
  sahara: 'Sahara',
  yuma: 'Yuma',
  quasar: 'Quasar',
  dolab: 'Do LaB',
};

// Ordered north → south matching the grounds layout
// Coachella+OT (north) → Sonora (central) → Gobi+Mojave (east) → Quasar+Yuma+Sahara (south)
// Far left to far right = longest walk (~20 min)
export const STAGES: Stage[] = ['coachella', 'outdoor', 'sonora', 'gobi', 'mojave', 'quasar', 'yuma', 'dolab', 'sahara'];

export interface Act {
  id: string;
  name: string;
  stage: Stage;
  start: number;
  end: number;
  picked?: 'caitlin' | 'violet' | 'both';
  priority?: 'must' | 'want';
  locked?: boolean;
  tentative?: boolean;
}

export interface ItineraryBlock {
  type: 'act' | 'meander' | 'walk' | 'gametime' | 'food' | 'subheader';
  actId?: string;
  title: string;
  subtitle?: string;
  start: number;
  end: number;
  stage?: string;
  note?: string;
  options?: ItineraryOption[];
  who?: string;
}

export interface ItineraryOption {
  actId: string;
  name: string;
  stage: string;
  time: string;
  who: string;
  tentative?: boolean;
}

export type Day = 'friday' | 'saturday' | 'sunday';

function t(hour: number, min: number): number {
  return hour * 60 + min;
}

// ============================================================
// FRIDAY — Gemini-verified data
// ============================================================
export const fridayActs: Act[] = [
  // Coachella Stage
  { id: 'f-jim-smith', name: 'Jim Smith', stage: 'coachella', start: t(13, 0), end: t(13, 40) },
  { id: 'f-february', name: 'February', stage: 'coachella', start: t(13, 40), end: t(14, 10) },
  { id: 'f-jacek-glam', name: 'Jaqck Glam', stage: 'coachella', start: t(16, 10), end: t(17, 10) },
  { id: 'f-teddy-swims', name: 'Teddy Swims', stage: 'coachella', start: t(17, 20), end: t(18, 10) },
  { id: 'f-the-xx', name: 'The xx', stage: 'coachella', start: t(19, 0), end: t(19, 55), picked: 'caitlin', priority: 'want' },
  { id: 'f-sabrina', name: 'Sabrina Carpenter', stage: 'coachella', start: t(21, 0), end: t(22, 40), picked: 'both', priority: 'want' },
  { id: 'f-anyma', name: 'Anyma', stage: 'coachella', start: t(24, 0), end: t(25, 0), picked: 'caitlin', priority: 'want', tentative: true },

  // Outdoor Theatre
  { id: 'f-jeremiah-red', name: 'Jeremiah Red', stage: 'outdoor', start: t(14, 50), end: t(15, 50) },
  { id: 'f-dabeull', name: 'Dabeull', stage: 'outdoor', start: t(16, 0), end: t(16, 50), picked: 'both', priority: 'want', locked: true },
  { id: 'f-lykke-li', name: 'Lykke Li', stage: 'outdoor', start: t(17, 20), end: t(18, 10) },
  { id: 'f-dijon', name: 'Dijon', stage: 'outdoor', start: t(18, 40), end: t(19, 30) },
  { id: 'f-turnstile', name: 'Turnstile', stage: 'outdoor', start: t(20, 5), end: t(21, 0) },
  { id: 'f-disclosure', name: 'Disclosure', stage: 'outdoor', start: t(22, 40), end: t(23, 55), picked: 'caitlin', priority: 'want', tentative: true },

  // Sonora
  { id: 'f-carolina-durante', name: 'Carolina Durante', stage: 'sonora', start: t(14, 35), end: t(15, 15) },
  { id: 'f-wednesday', name: 'Wednesday', stage: 'sonora', start: t(15, 40), end: t(16, 20), picked: 'caitlin', priority: 'want' },
  { id: 'f-fleshwater', name: 'Fleshwater', stage: 'sonora', start: t(16, 50), end: t(17, 30) },
  { id: 'f-two-lips', name: 'The Two Lips', stage: 'sonora', start: t(18, 0), end: t(18, 40) },
  { id: 'f-ninajirachi', name: 'Ninajirachi', stage: 'sonora', start: t(19, 10), end: t(20, 0), picked: 'caitlin', priority: 'want' },
  { id: 'f-cachirula', name: 'Cachirula & Loojan', stage: 'sonora', start: t(20, 25), end: t(21, 5) },
  { id: 'f-hot-mulligan', name: 'Hot Mulligan', stage: 'sonora', start: t(22, 10), end: t(22, 55) },

  // Gobi
  { id: 'f-cahuilla', name: 'Cahuilla Bird Singers and Dancers', stage: 'gobi', start: t(14, 15), end: t(14, 45) },
  { id: 'f-bob-baker', name: 'Bob Baker Marionettes', stage: 'gobi', start: t(14, 55), end: t(15, 35) },
  { id: 'f-newdad', name: 'NewDad', stage: 'gobi', start: t(16, 0), end: t(16, 40) },
  { id: 'f-joyce-manor', name: 'Joyce Manor', stage: 'gobi', start: t(17, 10), end: t(17, 50) },
  { id: 'f-cmat', name: 'CMAT', stage: 'gobi', start: t(18, 15), end: t(18, 55) },
  { id: 'f-fakemink', name: 'fakemink', stage: 'gobi', start: t(19, 20), end: t(20, 0) },
  { id: 'f-holly', name: 'Holly Humberstone', stage: 'gobi', start: t(20, 25), end: t(21, 10) },
  { id: 'f-joost', name: 'Joost', stage: 'gobi', start: t(21, 50), end: t(22, 35), picked: 'both', priority: 'want', locked: true },
  { id: 'f-creepy-nuts', name: 'Creepy Nuts', stage: 'gobi', start: t(23, 5), end: t(23, 55) },

  // Mojave
  { id: 'f-el-ethos', name: 'El Ethos', stage: 'mojave', start: t(14, 0), end: t(14, 50) },
  { id: 'f-slayyyter', name: 'Slayyyter', stage: 'mojave', start: t(15, 0), end: t(15, 45), picked: 'both', priority: 'want', locked: true },
  { id: 'f-bini', name: 'BINI', stage: 'mojave', start: t(16, 15), end: t(17, 0) },
  { id: 'f-central-cee', name: 'Central Cee', stage: 'mojave', start: t(17, 30), end: t(18, 15), picked: 'violet', priority: 'want' },
  { id: 'f-devo', name: 'Devo', stage: 'mojave', start: t(18, 45), end: t(19, 40) },
  { id: 'f-moby', name: 'Moby', stage: 'mojave', start: t(20, 10), end: t(21, 0) },
  { id: 'f-ethel-cain', name: 'Ethel Cain', stage: 'mojave', start: t(22, 45), end: t(23, 35), picked: 'violet', priority: 'want' },
  { id: 'f-blood-orange', name: 'Blood Orange', stage: 'mojave', start: t(24, 0), end: t(24, 55), picked: 'caitlin', priority: 'want' },

  // Sahara
  { id: 'f-bad-gal-gali', name: 'Bad Gal Gali', stage: 'sahara', start: t(14, 30), end: t(15, 35) },
  { id: 'f-youna', name: 'Youna', stage: 'sahara', start: t(15, 45), end: t(16, 35) },
  { id: 'f-hugel', name: 'HUGEL', stage: 'sahara', start: t(16, 50), end: t(17, 50) },
  { id: 'f-marlon', name: 'Marlon Hoffstadt', stage: 'sahara', start: t(18, 15), end: t(19, 15), picked: 'caitlin', priority: 'want' },
  { id: 'f-katseye', name: 'KATSEYE', stage: 'sahara', start: t(20, 0), end: t(20, 45), picked: 'both', priority: 'want' },
  { id: 'f-levity', name: 'Levity', stage: 'sahara', start: t(21, 15), end: t(22, 20), picked: 'caitlin', priority: 'want', locked: true },
  { id: 'f-swae-lee', name: 'Swae Lee', stage: 'sahara', start: t(22, 50), end: t(23, 40) },
  { id: 'f-sexyy-red', name: 'Sexyy Red', stage: 'sahara', start: t(24, 5), end: t(24, 55), picked: 'violet', priority: 'want' },

  // Yuma
  { id: 'f-sahar-z', name: 'Sahar Z', stage: 'yuma', start: t(13, 0), end: t(13, 45) },
  { id: 'f-jessica-brankka', name: 'Jessica Brankka', stage: 'yuma', start: t(13, 45), end: t(14, 45) },
  { id: 'f-arodes', name: 'Arodes', stage: 'yuma', start: t(14, 45), end: t(15, 45) },
  { id: 'f-groove-armada', name: 'Groove Armada', stage: 'yuma', start: t(15, 45), end: t(17, 0) },
  { id: 'f-rossi', name: 'Rossi. x Chloé Caillet', stage: 'yuma', start: t(17, 0), end: t(18, 15) },
  { id: 'f-kettama', name: 'Kettama', stage: 'yuma', start: t(18, 15), end: t(19, 30), picked: 'caitlin', priority: 'want' },
  { id: 'f-prospa', name: 'Prospa', stage: 'yuma', start: t(19, 30), end: t(20, 45), picked: 'caitlin', priority: 'want' },
  { id: 'f-max-dean', name: 'Max Dean x Luke Dean', stage: 'yuma', start: t(20, 45), end: t(22, 0) },
  { id: 'f-max-styler', name: 'Max Styler', stage: 'yuma', start: t(22, 0), end: t(23, 15) },
  { id: 'f-gordo', name: 'Gordo', stage: 'yuma', start: t(23, 15), end: t(24, 55) },

  // Quasar
  { id: 'f-darco', name: 'Darco', stage: 'quasar', start: t(17, 0), end: t(19, 0) },
  { id: 'f-franky', name: 'Franky Rizardo', stage: 'quasar', start: t(19, 0), end: t(21, 0) },
  { id: 'f-armin', name: 'Armin van Buuren x Adam Beyer', stage: 'quasar', start: t(21, 0), end: t(23, 0), picked: 'caitlin', priority: 'want' },

  // Do LaB
  { id: 'f-dl-patricio', name: 'Patricio', stage: 'dolab', start: t(13, 0), end: t(14, 0) },
  { id: 'f-dl-arthi', name: 'Arthi', stage: 'dolab', start: t(14, 0), end: t(15, 0) },
  { id: 'f-dl-sam-alfred', name: 'Sam Alfred', stage: 'dolab', start: t(15, 0), end: t(16, 10) },
  { id: 'f-dl-alisha', name: 'ALISHA', stage: 'dolab', start: t(16, 10), end: t(17, 10) },
  { id: 'f-dl-brothers-mack', name: 'The Brothers Macklovitch', stage: 'dolab', start: t(17, 10), end: t(18, 10) },
  { id: 'f-dl-sbtrkt', name: 'SBTRKT', stage: 'dolab', start: t(18, 10), end: t(19, 10) },
  { id: 'f-dl-aeon-mode', name: 'Aeon:Mode x Blossom', stage: 'dolab', start: t(19, 10), end: t(20, 25), picked: 'caitlin', priority: 'want' },
  { id: 'f-dl-level-up', name: 'Level Up x Mary Droppinz', stage: 'dolab', start: t(20, 25), end: t(21, 40), picked: 'caitlin', priority: 'want' },
  { id: 'f-dl-lyny', name: 'LYNY', stage: 'dolab', start: t(21, 40), end: t(22, 40) },
  { id: 'f-dl-surprise-1', name: 'SURPRISE', stage: 'dolab', start: t(22, 40), end: t(23, 50) },
  { id: 'f-dl-surprise-2', name: 'SURPRISE', stage: 'dolab', start: t(23, 50), end: t(25, 0) },
];

// ============================================================
// SATURDAY — Gemini-verified data
// ============================================================
export const saturdayActs: Act[] = [
  // Coachella Stage
  { id: 's-record-safari', name: 'Record Safari', stage: 'coachella', start: t(16, 10), end: t(17, 15) },
  { id: 's-addison-rae', name: 'Addison Rae', stage: 'coachella', start: t(17, 25), end: t(18, 20), picked: 'violet', priority: 'want' },
  { id: 's-giveon', name: 'GIVĒON', stage: 'coachella', start: t(19, 0), end: t(19, 50), picked: 'violet', priority: 'want' },
  { id: 's-the-strokes', name: 'The Strokes', stage: 'coachella', start: t(21, 0), end: t(22, 10), picked: 'both', priority: 'must', locked: true },
  { id: 's-justin-bieber', name: 'Justin Bieber', stage: 'coachella', start: t(23, 25), end: t(24, 30) },

  // Outdoor Theatre
  { id: 's-blondshell', name: 'Blondshell', stage: 'outdoor', start: t(14, 40), end: t(15, 25) },
  { id: 's-los-hermanos', name: 'Los Hermanos Flores', stage: 'outdoor', start: t(15, 55), end: t(16, 45) },
  { id: 's-alex-g', name: 'Alex G', stage: 'outdoor', start: t(17, 10), end: t(18, 0) },
  { id: 's-sombr', name: 'SOMBR', stage: 'outdoor', start: t(19, 5), end: t(19, 55) },
  { id: 's-labrinth', name: 'Labrinth', stage: 'outdoor', start: t(20, 30), end: t(21, 25) },
  { id: 's-david-byrne', name: 'David Byrne', stage: 'outdoor', start: t(22, 25), end: t(23, 25) },

  // Sonora
  { id: 's-buster-jarvis', name: 'Buster Jarvis', stage: 'sonora', start: t(13, 0), end: t(14, 0) },
  { id: 's-die-spitz', name: 'Die Spitz', stage: 'sonora', start: t(14, 0), end: t(14, 40) },
  { id: 's-freak-slug', name: 'Freak Slug', stage: 'sonora', start: t(15, 10), end: t(15, 50) },
  { id: 's-ecca-vandal', name: 'Ecca Vandal', stage: 'sonora', start: t(16, 20), end: t(17, 0) },
  { id: 's-ceremony', name: 'Ceremony', stage: 'sonora', start: t(17, 30), end: t(18, 10) },
  { id: 's-rusowsky', name: 'rusowsky', stage: 'sonora', start: t(18, 40), end: t(19, 20) },
  { id: 's-54-ultra', name: '54 Ultra', stage: 'sonora', start: t(19, 50), end: t(20, 30) },
  { id: 's-mind-enterprises', name: 'Mind Enterprises', stage: 'sonora', start: t(21, 45), end: t(22, 35) },

  // Gobi
  { id: 's-noga-erez', name: 'Noga Erez', stage: 'gobi', start: t(14, 5), end: t(14, 50) },
  { id: 's-whatmore', name: 'WHATMORE', stage: 'gobi', start: t(16, 0), end: t(16, 40) },
  { id: 's-luisa-sonza', name: 'Luísa Sonza', stage: 'gobi', start: t(17, 10), end: t(17, 50) },
  { id: 's-geese', name: 'Geese', stage: 'gobi', start: t(18, 15), end: t(19, 0), picked: 'violet', priority: 'must', locked: true },
  { id: 's-davido', name: 'Davido', stage: 'gobi', start: t(19, 50), end: t(20, 35) },
  { id: 's-bia', name: 'BIA', stage: 'gobi', start: t(21, 0), end: t(21, 45) },
  { id: 's-morat', name: 'Morat', stage: 'gobi', start: t(22, 10), end: t(23, 0) },

  // Mojave
  { id: 's-kacey', name: 'Kacey Musgraves', stage: 'mojave', start: t(15, 0), end: t(15, 50), picked: 'violet', priority: 'want' },
  { id: 's-fujii-kaze', name: 'Fujii Kaze', stage: 'mojave', start: t(16, 30), end: t(17, 20) },
  { id: 's-royel-otis', name: 'Royel Otis', stage: 'mojave', start: t(17, 50), end: t(18, 35), picked: 'both', priority: 'want' },
  { id: 's-taemin', name: 'Taemin', stage: 'mojave', start: t(19, 30), end: t(20, 20) },
  { id: 's-pinkpantheress', name: 'PinkPantheress', stage: 'mojave', start: t(20, 55), end: t(21, 45), picked: 'both', priority: 'want' },
  { id: 's-interpol', name: 'Interpol', stage: 'mojave', start: t(22, 15), end: t(23, 15) },

  // Sahara
  { id: 's-fundido', name: 'Fundido', stage: 'sahara', start: t(14, 0), end: t(14, 45) },
  { id: 's-teed', name: 'TEED', stage: 'sahara', start: t(14, 50), end: t(15, 50) },
  { id: 's-zulan', name: 'ZULAN', stage: 'sahara', start: t(16, 0), end: t(16, 50) },
  { id: 's-hamdi', name: 'Hamdi', stage: 'sahara', start: t(17, 0), end: t(17, 55) },
  { id: 's-yuki', name: '¥ØUSUK€ ¥UK1MAT$U', stage: 'sahara', start: t(18, 15), end: t(19, 10), picked: 'both', priority: 'want' },
  { id: 's-nine-inch', name: 'Nine Inch Noize', stage: 'sahara', start: t(20, 0), end: t(20, 45), picked: 'caitlin', priority: 'want' },
  { id: 's-adriatique', name: 'Adriatique', stage: 'sahara', start: t(21, 15), end: t(22, 10) },
  { id: 's-worship', name: 'Worship', stage: 'sahara', start: t(22, 35), end: t(23, 35), picked: 'caitlin', priority: 'must', locked: true },

  // Yuma
  { id: 's-yamagucci', name: 'Yamagucci', stage: 'yuma', start: t(13, 0), end: t(14, 0) },
  { id: 's-genesi', name: 'GENESI', stage: 'yuma', start: t(14, 0), end: t(15, 0) },
  { id: 's-riordan', name: 'Riordan', stage: 'yuma', start: t(15, 0), end: t(16, 15), picked: 'caitlin', priority: 'want' },
  { id: 's-mahmut', name: 'Mahmut Orhan', stage: 'yuma', start: t(16, 15), end: t(17, 30) },
  { id: 's-ben-sterling', name: 'Ben Sterling', stage: 'yuma', start: t(17, 30), end: t(18, 45) },
  { id: 's-sosa', name: 'SOSA', stage: 'yuma', start: t(18, 45), end: t(20, 15), picked: 'caitlin', priority: 'want' },
  { id: 's-bedouin', name: 'Bedouin', stage: 'yuma', start: t(20, 15), end: t(21, 45) },
  { id: 's-boys-noize', name: 'Boys Noize', stage: 'yuma', start: t(21, 45), end: t(23, 0), picked: 'caitlin', priority: 'want' },
  { id: 's-armin-sat', name: 'Armin van Buuren x Adam Beyer', stage: 'yuma', start: t(23, 0), end: t(24, 55) },

  // Quasar
  { id: 's-devault', name: 'Devault', stage: 'quasar', start: t(17, 0), end: t(19, 0) },
  { id: 's-madeon', name: 'Madeon', stage: 'quasar', start: t(19, 0), end: t(20, 15) },
  { id: 's-dj-snake-rl', name: 'DJ Snake x RL Grime x Flosstradamus', stage: 'quasar', start: t(20, 15), end: t(21, 45) },
  { id: 's-dj-snake-knock2', name: 'DJ Snake x Knock2', stage: 'quasar', start: t(21, 45), end: t(23, 0), picked: 'caitlin', priority: 'want' },

  // Do LaB
  { id: 's-dl-strawbry', name: 'STRAWBRY', stage: 'dolab', start: t(13, 0), end: t(14, 0) },
  { id: 's-dl-sam-binga', name: 'Sam Binga x Jialing', stage: 'dolab', start: t(14, 0), end: t(15, 15) },
  { id: 's-dl-champion', name: 'Champion', stage: 'dolab', start: t(15, 15), end: t(16, 15) },
  { id: 's-dl-eliza-rose', name: 'Eliza Rose', stage: 'dolab', start: t(16, 15), end: t(17, 15) },
  { id: 's-dl-sarz', name: 'Sarz', stage: 'dolab', start: t(17, 15), end: t(18, 15) },
  { id: 's-dl-habibeats', name: 'Dj Habibeats x Zainab', stage: 'dolab', start: t(18, 15), end: t(19, 25) },
  { id: 's-dl-ape-drums', name: 'Ape Drums x Bontan', stage: 'dolab', start: t(19, 25), end: t(20, 35) },
  { id: 's-dl-gudfella', name: 'GUDFELLA', stage: 'dolab', start: t(20, 35), end: t(21, 35) },
  { id: 's-dl-seth-troxler', name: 'Seth Troxler', stage: 'dolab', start: t(21, 35), end: t(22, 35) },
  { id: 's-dl-after-midnight', name: 'AFTER MIDNIGHT (Matroda x San Pacho)', stage: 'dolab', start: t(22, 35), end: t(23, 45) },
  { id: 's-dl-surprise', name: 'SURPRISE', stage: 'dolab', start: t(23, 50), end: t(25, 0) },
];

// ============================================================
// SUNDAY — Gemini-verified data
// ============================================================
export const sundayActs: Act[] = [
  // Coachella Stage
  { id: 'su-gabe-real', name: 'Gabe Real', stage: 'coachella', start: t(14, 45), end: t(15, 30) },
  { id: 'su-tijuana', name: 'Tijuana Panthers', stage: 'coachella', start: t(15, 40), end: t(16, 15) },
  { id: 'su-wet-leg', name: 'Wet Leg', stage: 'coachella', start: t(16, 45), end: t(17, 30) },
  { id: 'su-major-lazer', name: 'Major Lazer', stage: 'coachella', start: t(18, 10), end: t(19, 10) },
  { id: 'su-young-thug', name: 'Young Thug', stage: 'coachella', start: t(19, 50), end: t(20, 40), picked: 'violet', priority: 'must', locked: true },
  { id: 'su-karol-g', name: 'KAROL G', stage: 'coachella', start: t(22, 10), end: t(23, 15), picked: 'caitlin', priority: 'want' },

  // Outdoor Theatre
  { id: 'su-juicewon', name: 'Juicewon', stage: 'outdoor', start: t(15, 0), end: t(15, 50) },
  { id: 'su-gigi-perez', name: 'Gigi Perez', stage: 'outdoor', start: t(16, 0), end: t(16, 45) },
  { id: 'su-clipse', name: 'CLIPSE', stage: 'outdoor', start: t(17, 15), end: t(18, 10), picked: 'violet', priority: 'want' },
  { id: 'su-foster', name: 'Foster the People', stage: 'outdoor', start: t(18, 45), end: t(19, 40), picked: 'both', priority: 'want', locked: true },
  { id: 'su-laufey', name: 'Laufey', stage: 'outdoor', start: t(20, 45), end: t(21, 45), picked: 'both', priority: 'must', locked: true },
  { id: 'su-bigbang', name: 'BIGBANG', stage: 'outdoor', start: t(22, 30), end: t(23, 30) },

  // Sonora
  { id: 'su-bulletballet', name: 'Bulletballet', stage: 'sonora', start: t(13, 0), end: t(14, 0) },
  { id: 'su-glitterer', name: 'Glitterer', stage: 'sonora', start: t(14, 0), end: t(14, 40) },
  { id: 'su-model-actriz', name: 'Model/Actriz', stage: 'sonora', start: t(15, 10), end: t(15, 50) },
  { id: 'su-jane-remover', name: 'Jane Remover', stage: 'sonora', start: t(16, 20), end: t(17, 0), picked: 'both', priority: 'want' },
  { id: 'su-los-retros', name: 'Los Retros', stage: 'sonora', start: t(17, 30), end: t(18, 10) },
  { id: 'su-roz', name: 'RØZ', stage: 'sonora', start: t(18, 40), end: t(19, 30) },
  { id: 'su-drain', name: 'DRAIN', stage: 'sonora', start: t(20, 0), end: t(20, 40) },
  { id: 'su-french-police', name: 'French Police', stage: 'sonora', start: t(21, 10), end: t(22, 0) },

  // Gobi
  { id: 'su-flowerovlove', name: 'flowerovlove', stage: 'gobi', start: t(14, 5), end: t(14, 35) },
  { id: 'su-the-chats', name: 'The Chats', stage: 'gobi', start: t(15, 0), end: t(15, 40) },
  { id: 'su-cobrah', name: 'COBRAH', stage: 'gobi', start: t(16, 5), end: t(16, 50) },
  { id: 'su-oklou', name: 'Oklou', stage: 'gobi', start: t(17, 15), end: t(18, 0) },
  { id: 'su-black-flag', name: 'Black Flag', stage: 'gobi', start: t(18, 30), end: t(19, 5) },
  { id: 'su-tomora', name: 'TOMORA', stage: 'gobi', start: t(19, 45), end: t(20, 35) },
  { id: 'su-rapture', name: 'The Rapture', stage: 'gobi', start: t(21, 5), end: t(21, 55) },

  // Mojave
  { id: 'su-megatone', name: 'Megatone', stage: 'mojave', start: t(14, 30), end: t(15, 10) },
  { id: 'su-samia', name: 'Samia', stage: 'mojave', start: t(15, 15), end: t(15, 55) },
  { id: 'su-little-simz', name: 'Little Simz', stage: 'mojave', start: t(16, 25), end: t(17, 10), picked: 'violet', priority: 'want' },
  { id: 'su-suicidal', name: 'Suicidal Tendencies', stage: 'mojave', start: t(17, 35), end: t(18, 25) },
  { id: 'su-iggy-pop', name: 'Iggy Pop', stage: 'mojave', start: t(19, 10), end: t(20, 10) },
  { id: 'su-fka-twigs', name: 'FKA twigs', stage: 'mojave', start: t(20, 45), end: t(22, 0), picked: 'violet', priority: 'want' },

  // Sahara
  { id: 'su-gingee', name: 'GINGEE', stage: 'sahara', start: t(14, 30), end: t(15, 30) },
  { id: 'su-girl-math', name: 'Girl Math (VNSSA x NALA)', stage: 'sahara', start: t(15, 35), end: t(16, 35) },
  { id: 'su-bunt', name: 'BUNT.', stage: 'sahara', start: t(16, 45), end: t(17, 45), picked: 'both', priority: 'want' },
  { id: 'su-duke-dumont', name: 'Duke Dumont', stage: 'sahara', start: t(18, 10), end: t(19, 10), picked: 'caitlin', priority: 'want', tentative: true },
  { id: 'su-mochakk', name: 'Mochakk', stage: 'sahara', start: t(19, 25), end: t(20, 25) },
  { id: 'su-subtronics', name: 'Subtronics', stage: 'sahara', start: t(21, 5), end: t(22, 5), picked: 'caitlin', priority: 'want' },
  { id: 'su-kaskade', name: 'Kaskade', stage: 'sahara', start: t(22, 50), end: t(23, 55), picked: 'caitlin', priority: 'want', tentative: true },

  // Yuma
  { id: 'su-le-yora', name: 'LE YORA', stage: 'yuma', start: t(13, 0), end: t(14, 0) },
  { id: 'su-azzecca', name: 'AZZECCA', stage: 'yuma', start: t(14, 0), end: t(15, 0) },
  { id: 'su-friends', name: '&friends', stage: 'yuma', start: t(15, 0), end: t(16, 15) },
  { id: 'su-mestiza', name: 'MËSTIZA', stage: 'yuma', start: t(16, 15), end: t(17, 30) },
  { id: 'su-carlita', name: 'Carlita x Josh Baker', stage: 'yuma', start: t(17, 30), end: t(19, 0) },
  { id: 'su-royksopp', name: 'Röyksopp', stage: 'yuma', start: t(19, 0), end: t(20, 30) },
  { id: 'su-whomadewho', name: 'WhoMadeWho', stage: 'yuma', start: t(20, 30), end: t(22, 0) },
  { id: 'su-green-velvet', name: 'Green Velvet x AYYBO', stage: 'yuma', start: t(22, 0), end: t(23, 55) },

  // Quasar
  { id: 'su-linska', name: 'Linska', stage: 'quasar', start: t(16, 0), end: t(18, 0) },
  { id: 'su-lp-giobbi', name: 'LP Giobbi', stage: 'quasar', start: t(18, 0), end: t(20, 0) },
  { id: 'su-sara-landry', name: "Sara Landry's Blood Oath", stage: 'quasar', start: t(20, 0), end: t(22, 0), picked: 'caitlin', priority: 'want' },

  // Do LaB
  { id: 'su-dl-alex-chapman', name: 'Alex Chapman x Zoe Gitter', stage: 'dolab', start: t(15, 5), end: t(16, 20) },
  { id: 'su-dl-silva-bumpa', name: 'Silva Bumpa', stage: 'dolab', start: t(16, 20), end: t(17, 25) },
  { id: 'su-dl-drama', name: 'Drama (dj)', stage: 'dolab', start: t(17, 25), end: t(18, 25) },
  { id: 'su-dl-natascha', name: 'Natascha Polké', stage: 'dolab', start: t(18, 30), end: t(19, 30) },
  { id: 'su-dl-maxi-meraki', name: 'Maxi Meraki', stage: 'dolab', start: t(19, 30), end: t(20, 35) },
  { id: 'su-dl-surprise-1', name: 'SURPRISE', stage: 'dolab', start: t(20, 35), end: t(21, 40) },
  { id: 'su-dl-x-club', name: 'X Club.', stage: 'dolab', start: t(21, 40), end: t(22, 45) },
  { id: 'su-dl-surprise-2', name: 'SURPRISE', stage: 'dolab', start: t(22, 45), end: t(24, 0) },
];

// ============================================================
// ITINERARIES
// ============================================================
export const fridayItinerary: ItineraryBlock[] = [
  {
    type: 'subheader',
    title: 'Aim to arrive for Slayyyter at 3. Quick explore.',
    start: t(14, 30),
    end: t(15, 0),
  },
  {
    type: 'act',
    actId: 'f-slayyyter',
    title: 'Slayyyter',
    stage: 'Mojave',
    start: t(15, 0),
    end: t(15, 45),
    who: 'both',
  },
  {
    type: 'act',
    actId: 'f-dabeull',
    title: 'Dabeull',
    stage: 'Outdoor Theatre',
    start: t(16, 0),
    end: t(16, 50),
    who: 'both',
    note: '~15 min walk from Mojave',
  },
  {
    type: 'meander',
    title: 'Explore + eat + Yuma',
    subtitle: 'Hang in Yuma for house/techno\nEat by 8:30 — Levity at 9:15\nHead toward Sahara by 9',
    start: t(16, 50),
    end: t(21, 15),
    options: [
      { actId: 'f-central-cee', name: 'Central Cee', stage: 'Mojave', time: '5:30 PM', who: 'violet' },
      { actId: 'f-kettama', name: 'Kettama', stage: 'Yuma', time: '6:15 PM', who: 'caitlin' },
      { actId: 'f-marlon', name: 'Marlon Hoffstadt', stage: 'Sahara', time: '6:15 PM', who: 'caitlin' },
      { actId: 'f-the-xx', name: 'The xx', stage: 'Main', time: '7:00 PM', who: 'caitlin' },
      { actId: 'f-ninajirachi', name: 'Ninajirachi', stage: 'Sonora', time: '7:10 PM', who: 'caitlin' },
      { actId: 'f-dl-aeon-mode', name: 'Aeon:Mode x Blossom', stage: 'Do LaB', time: '7:10 PM', who: 'caitlin' },
      { actId: 'f-prospa', name: 'Prospa', stage: 'Yuma', time: '7:30 PM', who: 'caitlin' },
      { actId: 'f-katseye', name: 'KATSEYE', stage: 'Sahara', time: '8:00 PM', who: 'both' },
      { actId: 'f-dl-level-up', name: 'Level Up x Mary Droppinz', stage: 'Do LaB', time: '8:25 PM', who: 'caitlin' },
    ],
  },
  {
    type: 'act',
    actId: 'f-levity',
    title: 'Levity',
    stage: 'Sahara',
    start: t(21, 15),
    end: t(21, 50),
    who: 'caitlin',
    note: 'Leave early for Joost (~10 min walk to Gobi)',
  },
  {
    type: 'act',
    actId: 'f-joost',
    title: 'Joost',
    stage: 'Gobi',
    start: t(21, 50),
    end: t(22, 35),
    who: 'both',
  },
  {
    type: 'gametime',
    title: 'Pick a closer or head home',
    start: t(22, 35),
    end: t(25, 0),
    options: [
      { actId: 'f-disclosure', name: 'Disclosure', stage: 'OT', time: '10:40 PM', who: 'caitlin', tentative: true },
      { actId: 'f-ethel-cain', name: 'Ethel Cain', stage: 'Mojave', time: '10:45 PM', who: 'violet' },
      { actId: 'f-anyma', name: 'Anyma', stage: 'Main', time: '12:00 AM', who: 'caitlin', tentative: true },
      { actId: 'f-blood-orange', name: 'Blood Orange', stage: 'Mojave', time: '12:00 AM', who: 'caitlin' },
      { actId: 'f-sexyy-red', name: 'Sexyy Red', stage: 'Sahara', time: '12:05 AM', who: 'violet' },
    ],
  },
];

export const saturdayItinerary: ItineraryBlock[] = [
  {
    type: 'meander',
    title: 'Arrive + explore',
    subtitle: 'Light day — save energy\nHang in Yuma or explore\nHead to Gobi by 5:45 for Geese',
    start: t(15, 0),
    end: t(18, 15),
    options: [
      { actId: 's-kacey', name: 'Kacey Musgraves', stage: 'Mojave', time: '3:00 PM', who: 'violet' },
      { actId: 's-riordan', name: 'Riordan', stage: 'Yuma', time: '3:00 PM', who: 'caitlin' },
      { actId: 's-addison-rae', name: 'Addison Rae', stage: 'Main', time: '5:25 PM', who: 'violet' },
      { actId: 's-royel-otis', name: 'Royel Otis', stage: 'Mojave', time: '5:50 PM', who: 'both' },
    ],
  },
  {
    type: 'act',
    actId: 's-geese',
    title: 'Geese',
    stage: 'Gobi',
    start: t(18, 15),
    end: t(19, 0),
    who: 'violet',
    note: 'Arrive early',
  },
  {
    type: 'food',
    title: 'Eat + head to Main',
    subtitle: 'Eat by 8:30 — Strokes at 9\nGet a good spot at Main',
    start: t(19, 0),
    end: t(21, 0),
    options: [
      { actId: 's-sosa', name: 'SOSA', stage: 'Yuma', time: '6:45 PM', who: 'caitlin' },
      { actId: 's-giveon', name: 'GIVĒON', stage: 'Main', time: '7:00 PM', who: 'violet' },
      { actId: 's-nine-inch', name: 'Nine Inch Noize', stage: 'Sahara', time: '8:00 PM', who: 'caitlin' },
    ],
  },
  {
    type: 'act',
    actId: 's-the-strokes',
    title: 'THE STROKES',
    stage: 'Main',
    start: t(21, 0),
    end: t(22, 5),
    who: 'both',
    note: 'Leave ~5 min early for Worship',
  },
  {
    type: 'act',
    actId: 's-worship',
    title: 'Worship',
    stage: 'Sahara',
    start: t(22, 35),
    end: t(23, 35),
    who: 'caitlin',
    note: '~20 min walk from Main — tight!',
  },
  {
    type: 'gametime',
    title: 'Pick a closer or head home',
    start: t(23, 35),
    end: t(24, 30),
    options: [
      { actId: 's-armin-sat', name: 'Armin van Buuren x Adam Beyer', stage: 'Yuma', time: '11:00 PM', who: 'caitlin' },
      { actId: 's-justin-bieber', name: 'Justin Bieber', stage: 'Main', time: '11:25 PM', who: 'caitlin' },
    ],
  },
];

export const sundayItinerary: ItineraryBlock[] = [
  {
    type: 'meander',
    title: 'Arrive + explore + eat',
    subtitle: 'Day 3 — Yuma, wander, catch acts\nEat by 6 — FTP at 6:45\nHead toward Sahara/OT by 6',
    start: t(15, 30),
    end: t(18, 10),
    options: [
      { actId: 'su-jane-remover', name: 'Jane Remover', stage: 'Sonora', time: '4:20 PM', who: 'both' },
      { actId: 'su-little-simz', name: 'Little Simz', stage: 'Mojave', time: '4:25 PM', who: 'violet' },
      { actId: 'su-bunt', name: 'BUNT.', stage: 'Sahara', time: '4:45 PM', who: 'both' },
      { actId: 'su-clipse', name: 'CLIPSE', stage: 'OT', time: '5:15 PM', who: 'violet' },
      { actId: 'su-duke-dumont', name: 'Duke Dumont', stage: 'Sahara', time: '6:10 PM', who: 'caitlin', tentative: true },
    ],
  },
  {
    type: 'act',
    actId: 'su-foster',
    title: 'Foster the People',
    stage: 'Outdoor Theatre',
    start: t(18, 45),
    end: t(19, 40),
    who: 'both',
    note: '~15 min walk from Sahara',
  },
  {
    type: 'act',
    actId: 'su-young-thug',
    title: 'Young Thug',
    stage: 'Main',
    start: t(19, 50),
    end: t(20, 30),
    who: 'violet',
    note: '~8 min walk from OT. Leave ~8:30 for Laufey.',
  },
  {
    type: 'act',
    actId: 'su-laufey',
    title: 'Laufey',
    stage: 'Outdoor Theatre',
    start: t(20, 45),
    end: t(21, 45),
    who: 'both',
    note: '~8 min walk from Main',
  },
  {
    type: 'gametime',
    title: 'Pick a closer or head home',
    start: t(21, 45),
    end: t(24, 0),
    options: [
      { actId: 'su-subtronics', name: 'Subtronics', stage: 'Sahara', time: '9:05 PM', who: 'caitlin' },
      { actId: 'su-karol-g', name: 'KAROL G', stage: 'Main', time: '10:10 PM', who: 'caitlin' },
      { actId: 'su-kaskade', name: 'Kaskade', stage: 'Sahara', time: '10:50 PM', who: 'caitlin', tentative: true },
    ],
  },
];

export const allData: Record<Day, { acts: Act[]; itinerary: ItineraryBlock[] }> = {
  friday: { acts: fridayActs, itinerary: fridayItinerary },
  saturday: { acts: saturdayActs, itinerary: saturdayItinerary },
  sunday: { acts: sundayActs, itinerary: sundayItinerary },
};
