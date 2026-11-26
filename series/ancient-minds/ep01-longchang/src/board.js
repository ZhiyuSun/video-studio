// Storyboard key frames (?board=N), drawn with the real engine
import { mk, draw, mass, blot, TONE } from './ink.js';
import { ridgeFn, mountainLayer, cun, cliff, pine, reed, ripple } from './land.js';
import { VERM } from './hero.js';
import { seal, setSealText } from './seal.js';
import { writeGlyph, glyphStrokes, inscribe, subZh } from './script.js';
import * as S from './scenes.js';
import { mulberry } from '/core/lib.js';

export function board(n, A, TMP, comp, t) {
  A.clear(); const L = A.ink;
  const o = { bleed: 5, rim: 1 };
  if (n === 1) {   // 1 · low wide, the range towers, a tiny figure walks in rain
    const f = S.drawRange(A, { s: 1.08, tx: 0, ty: 40 });
    const [x, y] = f(905, 925);
    S.figure(L, S.walkPose(.25), { x, y, s: .95, dir: 1, seed: 3, t });
    S.rain(L, 11, 160, .13, t);
    subZh(A, '三十五岁那年，他丢了官，挨了廷杖，\n被贬到万山之中，一个连话都听不懂的地方。', 640, 150, 1, { size: 40 });
  }
  if (n === 2) {   // 2 · high wide, blank paper, title column + seal
    const R = mulberry(3);
    mass(L.wet, [[0, 820], [600, 780], [1300, 800], [1920, 760], [1920, 1080], [0, 1080]], .08, 30, 3, [0, 760, 0, 1080, .2, 1]);
    for (let i = 0; i < 14; i++) { const cl = [[300, 900], [1250, 860], [1700, 980]][i % 3], x = cl[0] + (R() - .5) * 160, y = cl[1] + (R() - .5) * 50; reed(L, x, y, 30 + R() * 40, .55, 100 + i, -.3 + (R() - .5) * .3, .4); }
    S.figure(L, S.P.stand, { x: 820, y: 760, s: .75, dir: 1, seed: 3, t });
    inscribe(A, ['龙场'], 1480, 260, 150, 1, { seed: 2 });
    setSealText('心'); seal(A.cc, 1432, 590, 92, .95, 5);
    subZh(A, '这个人叫王阳明。这个地方，叫龙场。', 170, 180, 1, { size: 42 });
  }
  if (n === 3) {   // 4 · the handscroll: palace eaves (a memory) → the road along the river → forest and miasma
    S.eaves(L, -80, 330, 760, 1.1, .8, 8);
    const far = ridgeFn([[900, 260, 160], [1250, 330, 190], [1600, 280, 170], [1950, 360, 200]], 620, 5, 24);
    const mid = ridgeFn([[1150, 180, 140], [1500, 250, 160], [1850, 210, 150]], 760, 9, 30);
    A.cw.drawImage(mountainLayer({ W: 1920, H: 1080, ridge: far, depth: 240, tone: .16, rim: .55, mist: .9, seed: 5, xmask: x => Math.min(1, Math.max(0, (x - 700) / 260)) }), 0, 0);
    A.cw.drawImage(mountainLayer({ W: 1920, H: 1080, ridge: mid, depth: 320, tone: .42, rim: .85, mist: .7, seed: 9, xmask: x => Math.min(1, Math.max(0, (x - 900) / 200)) }), 0, 0);
    cun(L, { x0: 1000, x1: 1920, ridge: mid, tone: .32, cun: 1.2, moss: 1.2, seed: 9 });
    ripple(L, 1200, 880, 80, .3, 2, .16, 2.2); ripple(L, 1500, 940, 140, .22, 3, .14, 2);
    draw(L, mk([[760, 860], [1000, 845], [1300, 830], [1700, 800], [2000, 790]], { w: 3, tone: .45, dry: .6, prof: 'tip', seed: 91 }));
    S.figure(L, S.walkPose(.6), { x: 1080, y: 842, s: .55, dir: 1, seed: 3, t });
    subZh(A, '正德元年，他上书替被关押的官员说话，\n得罪了权宦刘瑾。', 1060, 160, 1, { size: 40 });
  }
  if (n === 4) {   // 5 · the cave and the stone coffin
    const cl = ridgeFn([[200, 900, 520], [700, 780, 300]], 1080, 13, 30);
    A.cw.drawImage(mountainLayer({ W: 1920, H: 1080, ridge: cl, depth: 900, tone: .55, rim: .9, rimW: 26, mist: .25, seed: 13, xmask: x => Math.min(1, Math.max(0, (1050 - x) / 220)) }), 0, 0);
    mass(L.wet, [[230, 960], [250, 640], [380, 520], [540, 560], [610, 760], [600, 960]], .55, 14, 21, [0, 520, 0, 960, 1.2, .5]);   // cave mouth
    cun(L, { x0: 0, x1: 900, ridge: cl, tone: .3, cun: 1, moss: 1, seed: 13, cunLen: 1.6 });
    S.coffin(L, 780, 880, 520, 150, 1.1, 12);
    S.figure(L, { ...S.P.stand, Hd: [6, -79], C: [3, -74], tilt: .38, aF: [[3, -73], [5, -60], [6, -49]] }, { x: 1440, y: 985, s: 2.7, dir: -1, seed: 3, t });
    blot(L.wet, 420, 1000, 6, .8, 0, .7, 4);
    inscribe(A, ['吾惟俟命而已'], 1700, 150, 72, 1, { seed: 4 });
    subZh(A, '他给自己做了一口石棺，对着它说：', 820, 120, 1, { size: 40 });
  }
  if (n === 5) {   // 6 · work: chopping wood, the stove with the vermilion ember
    mass(L.wet, [[0, 930], [1920, 910], [1920, 1080], [0, 1080]], .14, 20, 5, [0, 900, 0, 1080, .6, 1]);
    const far = ridgeFn([[300, 200, 200], [900, 240, 220], [1500, 180, 200]], 700, 3, 20);
    A.cw.drawImage(mountainLayer({ W: 1920, H: 1080, ridge: far, depth: 200, tone: .12, rim: .5, mist: .9, seed: 3 }), 0, 0);
    const s = 3.6, x = 640, y = 930;
    S.figure(L, S.P.chopUp, { x, y, s, dir: 1, seed: 3, t });
    S.logAndAxe(L, x + 140, y, 1.6, false, 4, [x - 7 * s, y - 100.5 * s, -2.2]);
    S.stove(L, 1340, 925, 2.0, t, 1, 3);
    subZh(A, '跟着他的仆人都病倒了，\n他就自己砍柴，挑水，煮粥喂他们。', 1080, 180, 1, { size: 40 });
  }
  if (n === 6) {   // 8 · the question, written on blank paper
    inscribe(A, ['圣人处此', '更有何道'], 1060, 260, 128, 1, { seed: 6, gap: 190, lead: 140 });
    subZh(A, '如果是圣人在这里，会怎么做？', 1180, 900, 1, { size: 42 });
  }
  if (n === 7) {   // 9 · signature: the night, split by one flying-white stroke; 心 written in the white
    mass(L.wet, [[-50, -50], [1970, -50], [1970, 1130], [-50, 1130]], .78, 0, 1);
    for (const k of ['wet', 'dry']) { const c = A.ink[k]; c.globalCompositeOperation = 'destination-out'; }
    const path = [[-160, 820, .6], [300, 700, .95], [960, 580, 1.1], [1560, 470, 1], [2080, 380, .55]];
    const core = mk(path, { w: 380, tone: 1, dry: .06, wet: 0, prof: 'even', rough: .3, nb: 80, seed: 404, solid: true });
    draw({ wet: A.cw, dry: A.cd }, core, 1, 1); draw({ wet: A.cw, dry: A.cw }, core, 1, 1);
    for (const [off, w, sd] of [[-215, 120, 405], [210, 140, 406], [-300, 60, 407], [290, 70, 408]]) {   // ragged flying-white edges
      const e = mk(path.map(p => [p[0] + off * .18, p[1] + off, p[2]]), { w, tone: 1, dry: .75, wet: 0, prof: 'cone', rough: .35, nb: 40, seed: sd });
      draw({ wet: A.cw, dry: A.cd }, e, 1, 1); draw({ wet: A.cw, dry: A.cw }, e, 1, 1);
    }
    for (const k of ['wet', 'dry']) { const c = A.ink[k]; c.globalCompositeOperation = 'source-over'; }
    writeGlyph(A, TMP, '心', [650, 210, 640], [1, 1, 1, 1], { dry: .22 });
    inscribe(A, ['圣人之道', '吾性自足'], 460, 520, 50, 1, { seed: 7, gap: 66, lead: 56 });
    o.bleed = 6;
  }
  if (n === 8) {   // 11 · today: high angle on a tower, one window, a person at a desk
    S.tower(L, 1320, 1120, 560, 900, 1.5, 30);
    S.tower(L, 120, 1150, 420, 600, 1.5, 31);
    const win = S.tower(L, 680, 1100, 520, 820, 2.2, 32, [2, 3]);
    const [wx, wy, ww, wh] = win;
    S.figure(L, S.P.desk, { x: wx + ww * .5, y: wy + wh * .98, s: 1.25, cap: 'modern', seed: 9, t });
    mass(L.wet, [[wx + 6, wy + wh * .72], [wx + ww - 6, wy + wh * .72], [wx + ww - 6, wy + wh], [wx + 6, wy + wh]], .5, 1, 9);
    S.rain(L, 21, 120, .1, t);
    subZh(A, '人替别人出主意，往往比替自己想得更明白。', 150, 160, 1, { size: 40 });
  }
  if (n === 9) {   // 13 · the ending: the opening frame again; the figure carries a small vermilion flame
    const f = S.drawRange(A, { s: 1, tx: 0, ty: 0 }, { am: .85 });
    const [x, y] = f(1010, 880);
    S.figure(L, S.walkPose(.7), { x, y, s: .9, dir: 1, seed: 3, t });
    A.cc.save(); A.cc.fillStyle = `rgb(${VERM.join(',')})`; A.cc.globalAlpha = .9; A.cc.beginPath(); A.cc.ellipse(x + 14, y - 40, 4.5, 6.5, 0, 0, 7); A.cc.fill(); A.cc.restore();
    inscribe(A, ['古人的心理课', '第一课 龙场'], 720, 120, 58, 1, { seed: 9, gap: 84, lead: 66 });
    setSealText('阳明'); seal(A.cc, 610, 520, 64, .95, 7);
  }
  comp(A, null, o);
}
