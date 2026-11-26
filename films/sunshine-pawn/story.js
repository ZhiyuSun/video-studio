// 《典当》SUNSHINE PAWN — timeline. Every cut lands on a bar of the score (92 BPM, 4/4).
export const BPM = 92;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const bar = n => n * BAR;
export const beat = n => n * BEAT;
export const DUR = bar(24);                     // 62.61 s

// limited animation: characters on twos (12 fps), performance beats on threes (8 fps)
export const q12 = t => Math.floor(t * 12 + 1e-6) / 12;
export const q8 = t => Math.floor(t * 8 + 1e-6) / 8;
export const f12 = t => Math.floor(t * 12 + 1e-6);

// shots: [start, end, name]
export const SHOTS = [
  [0, bar(2), 'wrist'],
  [bar(2), bar(5), 'crane'],
  [bar(5), bar(7.5), 'counter'],
  [bar(7.5), bar(9.5), 'memory'],
  [bar(9.5), bar(11), 'price'],
  [bar(11), bar(13), 'extract'],
  [bar(13), bar(16), 'street'],
  [bar(16), bar(18.5), 'billboard'],
  [bar(18.5), bar(19.75), 'eye'],
  [bar(19.75), bar(21.5), 'crowd'],
  [bar(21.5), DUR, 'title'],
];
export function shotAt(t) { for (const s of SHOTS) if (t < s[1]) return s; return SHOTS[SHOTS.length - 1]; }

export const T = {
  signOn: bar(4),                 // 10.43 pawnshop sign strikes
  plug: bar(5) + BEAT * 2,        // 14.35 cable clicks into the neck port
  crtOn: bar(6),                  // 15.65 the small CRT powers on
  lens: bar(6) + BEAT * 2,        // 16.96 keeper's monocle lights up
  kite: bar(8.5),                 // 22.17 kite rises
  wave: bar(9),                   // 23.48 the woman waves
  price: bar(9.5) + BEAT,         // 25.43 price settles
  nod: bar(10.5),                 // 27.39 he nods
  impact: bar(11) + BEAT,         // 29.35 impact frame
  flash: bar(11) + BEAT + 2 / 24, // white flash
  bleach: bar(11.5),              // 30.00 the memory drains
  paid: bar(12),                  // 31.30 wrist turns green
  hush: bar(12.5),                // 32.61 one beat of true silence
  door: bar(13),                  // 33.91 door, rain comes back
  stop: bar(15),                  // 39.13 he stops
  hush2: bar(15.5),               // 40.43 near-silence
  power: bar(16),                 // 41.74 billboard powers on
  adText: bar(17),                // 44.35 ad copy appears
  hood: bar(19.75) + BEAT,        // 52.17 pulls the hood down
  leave: bar(20.25),              // 52.83 walks off
  title: bar(21.5),               // 56.09 title
  glint: bar(22),                 // 57.39 star glint
};
