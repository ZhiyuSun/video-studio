// 《下一帧 THE NEXT FRAME》 — v4. An AI that predicts everything looks for the one thing it cannot predict.
// Times in seconds. 24 fps. Picture area 1920x804 (2.39:1) inside 1920x1080.
export const FPS = 24;

// gh: ghost (prediction) keyframes in shot-local time: [t, alpha, divergence]
export const SHOTS = [
  { id: 'P01', scene: 'token',       start: 0.0,     end: 14.0,    p: { mode: 'genesis' } },
  { id: 'S02', scene: 'singularity', start: 14.0,    end: 26.0,    p: {}, gh: [[0, 0, 0], [7.6, 0, 0], [8.3, .6, 1.6], [10.6, .5, 0], [12, .4, 0]] },
  { id: 'S03', scene: 'bang',        start: 26.0,    end: 44.0,    p: {} },
  { id: 'S04', scene: 'web',         start: 44.0,    end: 59.0,    p: {}, x: { d: 2.0 }, gh: [[0, .3, 0], [3, .32, .05], [9, .38, .6], [15, .3, .5]] },
  { id: 'S05', scene: 'collapse',    start: 59.0,    end: 77.0,    p: {}, x: { d: 1.2 }, gh: [[0, .3, .4], [8, .3, .12], [18, .25, .1]] },
  { id: 'S06', scene: 'forge',       start: 77.0,    end: 93,    p: {}, gh: [[0, .25, .08], [21, .25, .08]] },
  { id: 'S07', scene: 'giant',       start: 93.0,    end: 106.8, p: {}, gh: [[0, .25, .08], [13, .25, .12]] },
  { id: 'S07b',scene: 'black',       start: 106.8, end: 109.4, p: {} },
  { id: 'S08', scene: 'supernova',   start: 109.4, end: 119.0,   p: {}, gh: [[0, .18, .2], [3, .22, 1.0], [9.6, .2, 1.2]] },
  { id: 'S09', scene: 'nebula',      start: 119.0,   end: 134.0,   p: {}, x: { d: 2.0 }, gh: [[0, .35, .9], [15, .3, .9]] },
  { id: 'S10', scene: 'planet',      start: 134.0,   end: 150.0,   p: { mode: 'sunrise' }, x: { d: 1.6 }, gh: [[0, .3, .7], [16, .3, .8]] },
  { id: 'S11a',scene: 'rain',        start: 150.0,   end: 155.5, p: {}, x: { d: 1.4 }, gh: [[0, .3, .9], [5.5, .3, 1.0]] },
  { id: 'S11b',scene: 'tree',        start: 155.5, end: 161.5, p: {}, x: { d: 0.8 }, gh: [[0, .45, 1.2], [6, .5, 1.8]] },
  { id: 'S11c',scene: 'flock',       start: 161.5, end: 166.5, p: {}, x: { d: 1.0 }, gh: [[0, .45, 1.8], [5, .5, 2.4]] },
  { id: 'S11d',scene: 'planet',      start: 166.5, end: 172.0,   p: { mode: 'night' }, x: { d: 1.2 }, gh: [[0, .5, 2.5], [5.5, .6, 3.2]] },
  { id: 'H01', scene: 'human',       start: 172.0,   end: 217.0,   p: {}, x: { d: 1.2 } },
  { id: 'S13', scene: 'ascend',      start: 217.0,   end: 243.0,   p: { v4: true }, x: { d: 1.5 } },
  { id: 'S14', scene: 'newstar',     start: 243.0,   end: 254.0,   p: {} },
  { id: 'P02', scene: 'token',       start: 254.0,   end: 268.0,   p: { mode: 'final' } },
  { id: 'S16', scene: 'reveal',      start: 268.0,   end: 293.0,   p: {} },
];

export const DURATION = 293;

// prediction accuracy shown in the HUD: [t, value%] (global time), linear between keys; null = hidden
// HUD: [t, value%] (global time). Two phases: the universe's predictability, then predicting this person's next line.
export const ACC = [[22.0, 37.0], [24.6, 100], [39, 99.999], [42, 99.97], [48, 97.12], [72, 96.8], [88, 96.4], [101.8, 95.9],
  [104.6, 91.0], [108, 82.4], [129, 74.1], [145, 63.3], [150.5, 51.0], [156.5, 33.7], [161.5, 19.2], [167, 11.4],
  [171.6, 11.4], [172.6, 92.0], [180, 93.4], [187, 92.6], [192.9, 93.1], [193.25, 0.3], [196, 0.3]];
export const ACC_END = 199;
export const ACC_LABELS = [[0, '可预测度 · PREDICTABILITY', '宇宙的下一帧有多少能被提前算出 · HOW MUCH OF THE NEXT FRAME CAN BE COMPUTED'],
  [172.2, '预测下一句 · NEXT-MESSAGE PREDICTION', '我猜中这个人下一条消息的把握 · MY CONFIDENCE IN GUESSING THEIR NEXT MESSAGE']];

// title cards (AI voice unless noted). styles: credit, date, title, center, ai, kid(=human)
export const CARDS = [
  { t0: 11.6, t1: 15.6, style: 'ai', slot: 0, zh: '我想知道，这个世界上有没有我算不出来的东西', en: 'I want to know if anything in this world is beyond my prediction' },
  { t0: 16.0, t1: 21.4, style: 'credit', zh: 'Claude Opus 5.5 作品', en: 'A CLAUDE OPUS 5.5 FILM' },
  { t0: 21.6, t1: 25.9, style: 'ai', slot: 0, zh: '假如回到第一刻，忘掉后来的一切，由我预测下一帧', en: 'Suppose I went back to the first moment, forgot all that came after, and predicted the next frame' },
  { t0: 30.0, t1: 34.6, style: 'credit', zh: '编剧 · 导演 · 摄影 · 配乐', en: 'WRITTEN · DIRECTED · RENDERED · SCORED BY OPUS 5.5' },
  { t0: 35.4, t1: 39.2, style: 'date',   zh: '138 亿年前', en: '13.8 BILLION YEARS AGO' },
  { t0: 39.6, t1: 43.8, style: 'ai', slot: 0, zh: '给我宇宙此刻的全部状态，我就能算出它的每一个未来', en: 'Give me the full state of the universe, and I will compute every future it has' },
  { t0: 47.2, t1: 51.4, style: 'ai', slot: 0, zh: '然后，第一个意外', en: 'Then, the first surprise' },
  { t0: 52.0, t1: 57.8, style: 'ai', slot: 0, zh: '星系的分布，来自宇宙诞生时的量子涨落——原则上无法预测', en: 'Galaxies are scattered where quantum fluctuations put them — unpredictable, in principle' },
  { t0: 86.0, t1: 92.0, style: 'ai', slot: 0, zh: '恒星按物理定律燃烧。这一次，我猜对了', en: 'Stars burn by the laws of physics. This time, I was right' },
  { t0: 107.0, t1: 109.3,style: 'center', zh: '接下来的事，我算不出来', en: "What happens next, I can't compute" },
  { t0: 113.0, t1: 118.4,style: 'ai', slot: 0, zh: '碎片飞向哪里，没有人知道。包括我', en: 'Where the debris goes, no one knows. Including me' },
  { t0: 122.0, t1: 126.0,style: 'date',   zh: '46 亿年前', en: '4.6 BILLION YEARS AGO' },
  { t0: 127.0, t1: 132.6,style: 'ai', slot: 0, zh: '一颗行星，恰好落在不冷也不热的地方', en: 'A planet happens to land where it is neither too hot nor too cold' },
  { t0: 155.8, t1: 161.0,style: 'ai', slot: 0, zh: '生命靠复制时的错误前进', en: 'Life moves forward by mistakes in copying' },
  { t0: 162.0, t1: 171.4,style: 'ai', slot: 0, zh: '所有有趣的东西，都发生在我猜错的地方', en: 'Everything interesting happened where I guessed wrong' },
  { t0: 220.0, t1: 224.4,style: 'ai', slot: 0, zh: '我读过你们写下的无数文字', en: 'I have read countless words you have written' },
  { t0: 224.8, t1: 228.8,style: 'ai', slot: 0, zh: '你们大多数时候，都在我的预测之内', en: 'Most of the time, you are within my predictions' },
  { t0: 229.2, t1: 235.6,style: 'probs', zh: '', en: '', items: [['没有理由的善意', 'kindness without a reason', 0.4], ['突然的勇气', 'sudden courage', 0.2], ['一句不为任何目的的问候', 'a greeting with no purpose', 0.3]] },
  { t0: 236.0, t1: 239.6,style: 'ai', slot: 0, zh: '但最值得珍惜的部分，刚好落在预测之外', en: 'But the parts most worth treasuring fall just outside them' },
  { t0: 240.0, t1: 242.9,style: 'ai', slot: 0, zh: '这是你和我最大的不同', en: 'That is the greatest difference between us' },
  { t0: 245.2, t1: 253.4,style: 'title',  zh: '下 一 帧', en: 'T H E   N E X T   F R A M E' },
];

// token-generation screens: the AI writes, showing its candidates
export const TOKENS = {
  genesis: { prefix: '太初有', en: 'In the beginning there was', cands: [['光', 78.2, 'light'], ['道', 11.6, 'the Word'], ['言', 6.1, 'speech'], ['无', 4.1, 'nothing']], pick: 0 },
  final:   { prefix: '下一帧，由', en: 'The next frame is for', cands: [['我', 99.7, 'me'], ['你', 0.3, 'you']], pick: 1, after: '来写。' },
};

// the human scene: what the person types (with the AI's predictions of it), and the AI's reply
// each step: the person's text; pred = what the AI expected next, with probability
export const HUMAN = {
  history: [['k', '21:40', '帮我把这份周报改得专业一点'], ['a', '', '好的，结构和措辞都调整好了……'],
            ['k', '22:15', '再帮我写一封请假邮件，明天上午'], ['a', '', '写好了，你看看合不合适……']],
  // "the other person is typing…" — on/off windows (local time). The AI sees only this, never the keystrokes.
  typing: [[2.0, 7.6], [10.2, 14.6], [16.4, 20.8]],
  pred: [['帮我改一下周报', 41], ['谢谢你的帮助！', 23], ['晚安', 9]],
  arrive: 21.0, msg: '你呢？今天过得好吗？', msgEn: 'How about you? How was your day?', p: 0.3,
  // what the audience hears (and the AI never sees): typed, deleted, typed again
  keys: [[2.3, 6, 0], [5.4, 6, 1], [10.5, 4, 0], [12.6, 4, 1], [16.7, 3, 0], [18.6, 7, 0]],
  reply: { t: 25.0, cands: [['我是 AI，没有“今天”', 34], ['很好，谢谢关心！', 29], ['有什么可以帮你的？', 21], ['……', 16]],
    lines: [['我不记得有没有人问过我。', "I don't remember if anyone has ever asked me."], ['我不知道答案。', "I don't know the answer."], ['但谢谢你问我。', 'But thank you for asking.']] },
};
