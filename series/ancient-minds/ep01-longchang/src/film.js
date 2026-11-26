// 龙场 — the film. Timing comes from story.json (tools/timeline.py); every part is one painted scene, parts change by ink blooms.
import { mk, draw, mass, blot, TONE } from './ink.js';
import { ridgeFn, mountainLayer, cun, pine, reed, ripple } from './land.js';
import { VERM, mixPose } from './hero.js';
import { seal, setSealText } from './seal.js';
import { writeGlyph, glyphStrokes, inscribe, subZh } from './script.js';
import * as S from './scenes.js';
import { clamp, lerp, ss, eio, eo, seg, mulberry, vnoise } from '/core/lib.js';

const ST = await (await fetch(new URL('../story.json', import.meta.url))).json();
export const DUR = ST.dur;
const M = ST.marks, VO = Object.fromEntries(ST.vo.map(v => [v.id, v])), SH = Object.fromEntries(ST.shots.map(s => [s.id, s]));
const TR = 1.1;
const NOSUB = new URLSearchParams(location.search).has('nosub');                         // ink-bloom transition length
const q12 = t => Math.floor(t * 12) / 12;   // figures step on twos
const BEAT = 60 / 72;

// ---------- camera: world → screen = w*s + T ; zoom about focus F shown at screen C ----------
function cam(A, s, F = [960, 540], C = [960, 540]) {
  const tx = C[0] - F[0] * s, ty = C[1] - F[1] * s;
  for (const c of [A.cw, A.cd, A.cc]) c.setTransform(s, 0, 0, s, tx, ty);
  return { s, tx, ty, paper: [-tx, -ty, s], w2s: p => [p[0] * s + tx, p[1] * s + ty] };
}
const reset = A => { for (const c of [A.cw, A.cd, A.cc]) c.setTransform(1, 0, 0, 1, 0, 0); };

// inscriptions are also reported to readcheck (TEXTS)
let TXT = [];
function ins(A, id, cols, x, y, size, k, o = {}) {
  inscribe(A, cols, x, y, size, k, o);
  if (k >= 1) {
    const gap = o.gap ?? size * 1.35, lead = o.lead ?? size * 1.08, n = Math.max(...cols.map(c => c.length));
    TXT.push({ id, text: cols.join(''), x0: x - (cols.length - 1) * gap - size * .7, y0: y - size * .7, x1: x + size * .7, y1: y + (n - 1) * lead + size * .7 });
  }
}

// ---------- caches built once ----------
let C = {};
export async function init() {
  S.rangeLayers();
  // handscroll world (s4): 5200 px long
  const WW = 5200;
  C.sFar = ridgeFn([[300, 260, 200], [900, 330, 220], [1500, 300, 200], [2100, 360, 240], [2700, 280, 200], [3300, 320, 220], [3900, 240, 200]], 600, 5, 24);
  C.sMid = ridgeFn([[200, 420, 160], [600, 520, 180], [1000, 380, 150], [1700, 260, 160], [2300, 300, 170], [3000, 220, 160], [3600, 160, 140]], 820, 9, 30);
  C.sFarC = mountainLayer({ W: WW, H: 1080, ridge: C.sFar, depth: 260, tone: .16, rim: .55, mist: .9, seed: 5, xmask: x => clamp((4300 - x) / 400) });
  C.sMidC = mountainLayer({ W: WW, H: 1080, ridge: C.sMid, depth: 420, tone: .48, rim: .9, mist: .6, seed: 9, xmask: x => clamp((3900 - x) / 300) });
  // s3 / s10 courtyard wall + far hills
  C.cFar = mountainLayer({ W: 1920, H: 1080, ridge: ridgeFn([[300, 150, 220], [1000, 200, 260], [1700, 160, 220]], 560, 3, 20), depth: 200, tone: .1, rim: .5, mist: .9, seed: 3 });
  // s5 cave cliff
  C.cliffR = ridgeFn([[200, 900, 520], [700, 780, 300]], 1080, 13, 30);
  C.cliffC = mountainLayer({ W: 1920, H: 1080, ridge: C.cliffR, depth: 900, tone: .55, rim: .9, rimW: 26, mist: .25, seed: 13, xmask: x => clamp((1050 - x) / 220) });
  // s6 / s14 / s11 far hills
  C.lowFar = mountainLayer({ W: 2200, H: 1080, ridge: ridgeFn([[300, 200, 200], [900, 240, 220], [1500, 180, 200], [2000, 230, 200]], 700, 3, 20), depth: 200, tone: .12, rim: .5, mist: .9, seed: 3 });
  C.xin = null;
}

// ---------- scenes. Each: (A, lt, t, TMP) → comp options ----------
const SUB = {};   // subtitle place per part
function sceneRange(A, lt, t, end) {
  const sh = end ? SH.s15 : SH.s1, D = sh.t1 - sh.t0;
  const k = lt / D, s = end ? lerp(1.1, 1.0, eio(k)) : lerp(1.0, 1.12, ss(k));
  const f = S.drawRange(A, { s, tx: 0, ty: end ? 0 : 30 }, { am: end ? .85 : 1, t });
  const u = end ? clamp(lt / (M.end - sh.t0 + 2)) : clamp(lt / D);
  const wp = end ? [lerp(880, 1050, u), lerp(965, 822, eo(u))] : [lerp(840, 990, u), lerp(968, 880, u)];
  const [x, y] = f(wp[0], wp[1]), sc = .95 * s, tf = q12(lt);
  S.figure(A.ink, S.walkPose(tf * .55), { x, y, s: sc, dir: 1, seed: 3, t: tf, boil: tf * 12 });
  if (end) { A.cc.save(); A.cc.fillStyle = `rgb(${VERM.join(',')})`; A.cc.globalAlpha = .9 * (.85 + .15 * vnoise(t * 8)); A.cc.beginPath(); A.cc.ellipse(x + 14 * sc, y - 41 * sc, 4.6 * sc, 6.6 * sc, 0, 0, 7); A.cc.fill(); A.cc.restore(); }
  else S.rain(A.ink, 11, 150, .13, t);
  const o = { bleed: 5, rim: 1 };
  if (!end && lt < 3) o.rev = [x, y - 30, 40 + 2700 * ss(lt / 2.8), 1];
  if (end) {
    const ke = clamp((t - M.end - .4) / 1.8);
    ins(A, 'title-end', ['龙场'], 720, 150, 120, ke, { seed: 12, lead: 128 });
    if (t > M.end + 2.6) { setSealText('阳明'); seal(A.cc, 676, 430, 84, clamp((t - M.end - 2.6) / .12) * .95, 7); }
    o.fade = ss((t - (DUR - 1.6)) / 1.6);
  }
  return o;
}
function sceneField(A, lt, t) {
  const c = cam(A, lerp(1.06, 1.0, eio(lt / 12)), [960, 600], [960, 600]); const L = A.ink, R = mulberry(3);
  mass(L.wet, [[-200, 820], [600, 790], [1300, 805], [2100, 770], [2100, 1300], [-200, 1300]], .08, 30, 3, [0, 770, 0, 1080, .2, 1]);
  for (let i = 0; i < 11; i++) { const cl = [[300, 905], [1290, 870], [1700, 985]][i % 3]; reed(L, cl[0] + (R() - .5) * 150, cl[1] + (R() - .5) * 40, 26 + R() * 30, .5, 100 + i, -.35 + (R() - .5) * .3 + Math.sin(t * .9 + i) * .05, .38); }
  const tf = q12(lt), walk = clamp(lt / 3.2), x = lerp(640, 820, eo(walk));
  S.figure(L, walk < 1 ? S.walkPose(tf * .55) : mixPose(S.walkPose(3.2 * .55), S.P.stand, clamp((lt - 3.2) / .5)), { x, y: 760, s: .75, dir: 1, seed: 3, t: tf, boil: tf * 12 });
  reset(A);
  ins(A, 'title', ['龙场'], 1480, 260, 150, clamp((t - M.title - 1.4) / 1.8), { seed: 2 });
  if (t > M.title + 3.5) { setSealText('心'); seal(A.cc, 1432, 590, 92, clamp((t - M.title - 3.5) / .12) * .95, 5); }
  return { bleed: 5, rim: 1, paper: c.paper };
}
const SLUMP = { v: 'side', H: [-2, -20], C: [12, -37], Hd: [20, -35], tilt: .95, aF: [[12, -36], [18, -24], [24, -12]], aB: null, lF: [[0, -20], [14, -27], [17, -2]], lB: [[-2, -20], [11, -24], [13, -1]], hemF: [19, -3], hemB: [-15, -2], flare: .2, sheath: null, sword: null, rib: [-1, .1, 0] };
function courtyard(A, t, lt, o = {}) {
  const L = A.ink;
  A.cw.drawImage(C.cFar, 0, 0);
  // low wall
  mass(L.wet, [[-200, 700], [2100, 690], [2100, 740], [-200, 750]], .16, 6, 7, [0, 690, 0, 750, 1, .3]);
  draw(L, mk([[-200, 698], [900, 694], [2100, 688]], { w: 7, tone: .7, dry: .5, wet: .3, prof: 'even', seed: 71 }));
  mass(L.wet, [[-200, 930], [2100, 920], [2100, 1300], [-200, 1300]], .1, 20, 8, [0, 920, 0, 1080, .5, 1]);
  const tone = o.tone ?? .85;
  [[300, 960, 760, -.04], [400, 975, 640, .05], [520, 950, 700, .02], [210, 985, 520, -.08], [610, 990, 560, .07]].forEach(([x, y, h, lean], i) => S.bamboo(L, x, y, h, 1.15, 40 + i, lean, tone * (i % 2 ? .75 : 1), t, .6));
}
function sceneBamboo(A, lt, t) {   // s3: the seven days in front of the bamboo
  const sh = SH.s3, D = sh.t1 - sh.t0;
  const c = cam(A, lerp(1.0, 1.1, ss(lt / D)), [900, 700], [900, 640]); const L = A.ink;
  courtyard(A, t, lt);
  // moving leaf shadows on the ground: the days passing
  const day = clamp((t - VO.L05.t) / (VO.L05.dur * .55));
  for (let i = 0; i < 12; i++) { const ph = (i * .37 + lt * .05 + day * 1.4) % 1; const x = lerp(200, 1500, ph), y = 960 + (i % 3) * 18; draw(L, mk([[x, y], [x + 40, y + 6]], { w: 9, tone: .1, dry: .2, wet: 1, prof: 'lens', seed: 600 + i })); }
  const tf = q12(lt), fall = ss((t - M.fall + .5) / .7);
  S.figure(L, mixPose(S.P.sit, SLUMP, fall), { x: 1180, y: 975, s: 3.2, dir: -1, seed: 4, t: tf, boil: tf * 12 });
  // falling leaves after he falls
  if (t > M.fall) for (let i = 0; i < 4; i++) { const u = clamp((t - M.fall - .4 - i * .7) / 3.2); if (u <= 0 || u >= 1) continue; const x = 420 + i * 120 + Math.sin(u * 7 + i) * 40, y = 260 + u * 680; draw(L, mk([[x, y], [x + 22 * Math.cos(u * 5 + i), y + 10]], { w: 7, tone: .7 * (1 - u * .5), dry: .3, wet: .5, prof: 'nail', seed: 700 + i })); }
  reset(A);
  // tally of seven days, one dry stroke each
  for (let i = 0; i < 7; i++) { const p = clamp(day * 7 - i); if (p > 0) draw(A.ink, mk([[1800 - i * 26, 300], [1802 - i * 26, 380]], { w: 9, tone: .8, dry: .5, wet: .3, prof: 'brush', seed: 800 + i }), p); }
  return { bleed: 5, rim: 1, paper: c.paper };
}
function sceneScroll(A, lt, t) {   // s4: the handscroll, read right to left
  const sh = SH.s4, D = sh.t1 - sh.t0, WW = 5200;
  const X = lerp(WW - 1920, 0, eio(clamp(lt / D)));
  for (const c of [A.cw, A.cd, A.cc]) c.setTransform(1, 0, 0, 1, -X, 0);
  const L = A.ink, vis = (a, b) => b > X - 100 && a < X + 2020;
  A.cw.drawImage(C.sFarC, 0, 0); A.cw.drawImage(C.sMidC, 0, 0);
  if (vis(3000, 3900)) cun(L, { x0: Math.max(0, X - 100), x1: Math.min(3900, X + 2020), ridge: C.sMid, tone: .3, cun: 1.1, moss: 1.1, seed: 9 });
  if (vis(4100, 5200)) S.eaves(L, 4250, 330, 760, 1.1, .75, 8);
  // river and road
  for (let i = 0; i < 9; i++) { const x = 300 + i * 420; if (vis(x - 200, x + 200)) ripple(L, x, 905 + (i % 2) * 40, 90 + (i % 3) * 40, .25, i + 2, .14, 2.1); }
  draw(L, mk([[-100, 852], [1200, 846], [2600, 840], [3800, 832], [4300, 826]], { w: 3, tone: .42, dry: .6, prof: 'tip', seed: 91 }));
  // forest and miasma at the far (left) end
  [[120, 840, 1.6, 51], [380, 850, 1.2, 52], [700, 845, 1.45, 53], [980, 855, 1.0, 54], [1250, 850, 1.3, 55], [1550, 848, .9, 56]].forEach(([x, y, s, sd]) => { if (vis(x - 300, x + 300)) pine(L, x, y, s, sd, t, .3, sd % 2 ? 1 : -1); });
  for (let i = 0; i < 6; i++) { const x = (i * 330 + t * 14) % 2000 - 100, y = 560 + (i % 3) * 90; if (vis(x - 400, x + 400)) mass(L.wet, [[x - 360, y], [x - 120, y - 26], [x + 200, y - 18], [x + 380, y + 4], [x + 120, y + 26], [x - 200, y + 22]], .12, 20, 900 + i); }
  const tf = q12(lt), fx = X + 1220;
  S.figure(L, S.walkPose(tf * .55), { x: fx, y: 846, s: .62, dir: -1, seed: 3, t: tf, boil: tf * 12 });
  reset(A);
  return { bleed: 5, rim: 1, paper: [X, 0, 1] };
}
function sceneCave(A, lt, t) {   // s5
  const sh = SH.s5, D = sh.t1 - sh.t0;
  const c = cam(A, lerp(1.0, 1.1, ss(lt / D)), [1200, 820], [1150, 760]); const L = A.ink;
  A.cw.drawImage(C.cliffC, 0, 0);
  mass(L.wet, [[230, 960], [250, 640], [380, 520], [540, 560], [610, 760], [600, 960]], .55, 14, 21, [0, 520, 0, 960, 1.2, .5]);
  cun(L, { x0: 0, x1: 900, ridge: C.cliffR, tone: .3, cun: 1, moss: 1, seed: 13, cunLen: 1.6 });
  S.coffin(L, 780, 880, 520, 150, 1.1, 12);
  const tf = q12(lt), br = Math.sin(lt * 1.6) * .6;
  S.figure(L, { ...S.P.stand, Hd: [6, -79 + br * .3], C: [3, -74], tilt: .38, aF: [[3, -73], [5, -60], [6, -49]] }, { x: 1440, y: 985, s: 2.7, dir: -1, seed: 3, t: tf, boil: tf * 12 });
  reset(A);
  ins(A, 'wuwei', ['吾惟俟命而已'], 1700, 150, 72, clamp((t - VO.L10.t - 2.3) / 2.6), { seed: 4 });
  return { bleed: 5, rim: 1, paper: c.paper };
}
function chopPose(t0, t) {   // one chop every two beats
  const u = (((t - t0) / (BEAT * 2)) % 1 + 1) % 1;
  if (u < .5) return { k: 1 - eio(u / .5) * 1, strike: false };
  if (u < .78) return { k: 0, strike: false };
  if (u < .86) return { k: ss((u - .78) / .08), strike: false };
  return { k: 1, strike: true };
}
function sceneChop(A, lt, t, t0) {   // s6 (and recalled in s14)
  const c = cam(A, 1, [960 + lt * 9, 540]); const L = A.ink;
  A.cw.drawImage(C.lowFar, 0, 0);
  mass(L.wet, [[-200, 930], [2300, 910], [2300, 1300], [-200, 1300]], .14, 20, 5, [0, 900, 0, 1080, .6, 1]);
  const s = 3.6, x = 640, y = 930, tf = q12(lt), cp = chopPose(t0, tf);
  const pose = mixPose(S.P.chopUp, S.P.chopDown, cp.k);
  S.figure(L, pose, { x, y, s, dir: 1, seed: 3, t: tf, boil: tf * 12 });
  const hnd = pose.aF[2], ang = lerp(-2.2, .55, cp.k);
  S.logAndAxe(L, x + 140, y, 1.6, cp.k > .9, 4, [x + hnd[0] * s, y + hnd[1] * s, ang]);
  S.stove(L, 1340, 925, 2.0, t, 1, 3);
  reset(A);
  return { bleed: 5, rim: 1, paper: c.paper };
}
function sceneNightSong(A, lt, t) {   // s7
  const sh = SH.s7, D = sh.t1 - sh.t0;
  const c = cam(A, lerp(1.0, 1.08, ss(lt / D)), [960, 800], [960, 760]); const L = A.ink;
  mass(L.wet, [[-300, -300], [2300, -300], [2300, 1400], [-300, 1400]], .3, 0, 1);
  for (const k of ['wet', 'dry']) { const g = A.ink[k]; g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.beginPath(); g.arc(1500, 230, 62, 0, 7); g.fill(); g.restore(); }
  S.lying(L, 560, 900, 2.0, 20); S.lying(L, 860, 925, 1.8, 21);
  const tf = q12(lt);
  S.figure(L, S.P.sit, { x: 1180, y: 925, s: 3.0, dir: -1, seed: 3, t: tf, boil: tf * 12 });
  for (let i = 0; i < 3; i++) {   // the song: thin dry lines drifting toward the sleepers
    const u = (lt * .32 + i / 3) % 1, x0 = 1150 - u * 420, y0 = 760 - i * 22;
    const pts = []; for (let k = 0; k <= 8; k++) { const v = k / 8; pts.push([x0 - v * 160, y0 + Math.sin(v * 9 + lt * 2 + i) * 9]); }
    draw(L, mk(pts, { w: 2.2, tone: .55, dry: .7, prof: 'tip', seed: 950 + i }), 1, Math.sin(u * Math.PI) * .9);
  }
  reset(A);
  return { bleed: 5, rim: 1, paper: c.paper, vig: .35 };
}
function sceneQuestion(A, lt, t) {   // s8
  const c = cam(A, lerp(1.0, 1.035, lt / 12)); reset(A);
  ins(A, 'q', ['圣人处此', '更有何道'], 1060, 260, 128, clamp((t - VO.L14.t - 2.5) / 2.8), { seed: 6, gap: 190, lead: 140 });
  return { bleed: 5, rim: 1, paper: c.paper };
}
// s9 + s10a: the night, the stroke, 心
const LIFT = [[-160, 820, .6], [300, 700, .95], [960, 580, 1.1], [1560, 470, 1], [2080, 380, .55]];
let LIFTS = null;
function sceneNight(A, lt, t, TMP) {
  const sc = t < M.xin ? 1 : lerp(1.0, .9, eio((t - M.xin - 2.5) / 12));
  const c = cam(A, sc); const L = A.ink;
  mass(L.wet, [[-400, -400], [2400, -400], [2400, 1500], [-400, 1500]], .8, 0, 1);
  // moon pool where he sleeps — fades into the dark during the silence
  const pool = 1 - ss((t - M.hush) / 1.4);
  if (pool > 0) {
    for (const k of ['wet', 'dry']) { const g = A.ink[k]; g.save(); g.globalCompositeOperation = 'destination-out'; const gr = g.createRadialGradient(960, 820, 20, 960, 820, 300); gr.addColorStop(0, `rgba(0,0,0,${.75 * pool})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(560, 420, 800, 800); g.restore(); }
    const jump = ss((t - VO.L15.t - 1.9) / .25), tf = q12(lt);
    S.figure(L, mixPose(S.P.sit, S.P.stand, jump), { x: 960, y: 900, s: 1.6, dir: 1, seed: 3, t: tf, am: pool, boil: tf * 12 });
  }
  // the stroke: ink lifted off along a flying-white path
  const p = ss((t - M.stroke) / .42);
  if (p > 0) {
    if (!LIFTS) {
      LIFTS = [mk(LIFT, { w: 380, tone: 1, dry: .06, wet: 0, prof: 'even', rough: .3, nb: 80, seed: 404, solid: true })];
      for (const [off, w, sd] of [[-215, 120, 405], [210, 140, 406], [-300, 60, 407], [290, 70, 408]]) LIFTS.push(mk(LIFT.map(q => [q[0] + off * .18, q[1] + off, q[2]]), { w, tone: 1, dry: .75, wet: 0, prof: 'cone', rough: .35, nb: 40, seed: sd }));
    }
    for (const k of ['wet', 'dry']) A.ink[k].globalCompositeOperation = 'destination-out';
    for (const e of LIFTS) { draw({ wet: A.cw, dry: A.cd }, e, p, 1); draw({ wet: A.cw, dry: A.cw }, e, p, 1); }
    if (p < 1) {   // the brush head: a soft round lift at the moving tip (no square end)
      const e = LIFTS[0], m = (e.n - 1) * p, k = Math.floor(m), q = e.P[k], r = e.ws[k] * .55;
      for (const g of [A.cw, A.cd]) { const gr = g.createRadialGradient(q[0], q[1], r * .2, q[0], q[1], r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(.75, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(q[0], q[1], r, r * .9, -.2, 0, 7); g.fill(); }
    }
    for (const k of ['wet', 'dry']) A.ink[k].globalCompositeOperation = 'source-over';
  }
  // 心, stroke by stroke (written in screen space of the world camera)
  if (t > M.xin) {
    const box = [650, 210, 640];
    const prog = [0, 1, 2, 3].map(i => clamp((t - M.xin - [0, .62, 1.7, 2.3][i]) / [.5, .95, .45, .5][i]));
    writeGlyph(A, TMP, '心', box, prog, { dry: .22, xf: [c.s, c.tx, c.ty] });
  }
  reset(A);
  ins(A, 'xin-q', ['圣人之道', '吾性自足'], 460, 520, 50, clamp((t - VO.L16.t - 1.2) / 2.2), { seed: 7, gap: 66, lead: 56 });
  return { bleed: 6, rim: 1, paper: c.paper, vig: .3 };
}
function sceneRecall(A, lt, t) {   // s10b: the bamboo again; the camera travels from the bamboo to the person
  const D = VO.L18.t + VO.L18.dur - M.bamboo;
  const fx = lerp(470, 1200, eio(clamp((lt - 1.5) / (D - 1.5))));
  const c = cam(A, 1.22, [fx, 720], [960, 600]);
  courtyard(A, t, lt, { tone: .6 });
  const tf = q12(lt);
  S.figure(A.ink, S.P.sit, { x: 1180, y: 975, s: 3.2, dir: -1, seed: 4, t: tf, boil: tf * 12 });
  reset(A);
  return { bleed: 5, rim: 1, paper: c.paper };
}
function scenePoem(A, lt, t) {   // s10c: the poem, mist passing over it
  const c = cam(A, lerp(1.0, 1.04, lt / 14)); const L = A.ink;
  reset(A);
  ins(A, 'poem', ['个个人心有仲尼', '自将闻见苦遮迷'], 1080, 200, 84, clamp((t - VO.L19.t - 1.6) / 3.6), { seed: 8, gap: 130, lead: 92 });
  const mu = clamp((t - VO.L19.t - 6.0) / 5.5);   // mist drifts across, then clears
  if (mu > 0 && mu < 1) { const x = lerp(-600, 2300, mu); mass(L.wet, [[x - 420, 420], [x - 120, 360], [x + 260, 380], [x + 460, 460], [x + 180, 560], [x - 260, 540]], .22 * Math.sin(mu * Math.PI), 30, 77); }
  return { bleed: 7, rim: 1, paper: c.paper };
}
function sceneHut(A, lt, t) {   // s11: 龙冈书院
  const sh = SH.s11, D = sh.t1 - sh.t0;
  const c = cam(A, lerp(1.0, 1.08, ss(lt / D)), [1000, 760], [960, 640]); const L = A.ink;
  A.cw.drawImage(C.lowFar, 0, -40);
  S.hut(L, 980, 930, 560, 1.4, 50);
  const tf = q12(lt);
  S.figure(L, { ...S.P.desk, aL: [[-8.5, -59], [-14, -48], [-20, -52]] }, { x: 1300, y: 925, s: 2.4, seed: 5, t: tf, boil: tf * 12 });
  [[700, 940, 2.0, 61], [560, 950, 2.1, 62], [860, 950, 1.9, 63]].forEach(([x, y, s, sd]) => S.figure(L, S.P.sit, { x, y, s, dir: 1, seed: sd, t: tf, boil: tf * 12 }));
  reset(A);
  ins(A, 'zxhy', ['知行合一'], 1760, 200, 70, clamp((t - VO.L20.t - 1.8) / 1.8), { seed: 9 });
  return { bleed: 5, rim: 1, paper: c.paper };
}
function sceneTowers(A, lt, t) {   // s12a: today; push into one window
  const D = M.lab - SH.s12.t0, k = eio(clamp((lt - .5) / (D - .5)));
  const WIN = [868, 486];   // centre of the lit window (world)
  const c = cam(A, lerp(1.0, 2.0, k), WIN, [lerp(868, 960, k), lerp(486, 540, k)]); const L = A.ink;
  S.tower(L, 1320, 1120, 560, 900, 1.5, 30);
  S.tower(L, 120, 1150, 420, 600, 1.5, 31);
  const [wx, wy, ww, wh] = S.tower(L, 680, 1100, 520, 820, 2.2, 32, [2, 3]);
  const tf = q12(lt);
  S.figure(L, S.P.desk, { x: wx + ww * .5, y: wy + wh * .98, s: 1.25, cap: 'modern', seed: 9, t: tf, boil: tf * 12 });
  mass(L.wet, [[wx + 6, wy + wh * .72], [wx + ww - 6, wy + wh * .72], [wx + ww - 6, wy + wh], [wx + 6, wy + wh]], .5, 1, 9);
  S.rain(L, 21, 120, .1, t);
  reset(A);
  return { bleed: 5, rim: 1, paper: c.paper };
}
function underDesk(A, x0, y0, x1, y1) { for (const g of [A.cw, A.cd]) { g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.fillRect(x0, y0, x1 - x0, y1 - y0); g.restore(); } }
function label(A, text, x, y, a) { const c = A.cd; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = a * .8; c.fillStyle = '#000'; c.font = '34px LXGW'; c.textAlign = 'center'; c.fillText(text, x, y); c.restore(); }
function sceneLab(A, lt, t) {   // s12b: the experiment — your problem / a friend's problem
  const rise = eio(clamp((t - M.rise) / 4));
  const c = cam(A, lerp(1.0, .86, rise), [960, 640], [960, lerp(600, 560, rise)]); const L = A.ink;
  const tf = q12(lt);
  S.figure(L, S.P.desk, { x: 620, y: 960, s: 3.0, cap: 'modern', seed: 9, t: tf, boil: tf * 12 });
  S.figure(L, S.P.desk, { x: 1300, y: 960, s: 3.0, cap: 'modern', seed: 10, t: tf, boil: tf * 12 });
  underDesk(A, 400, 846, 1520, 1000);
  for (const [x, sd] of [[620, 1], [1300, 2]]) {
    mass(L.wet, [[x - 150, 820], [x + 150, 820], [x + 150, 846], [x - 150, 846]], .55, 1, sd);
    draw(L, mk([[x - 130, 846], [x - 128, 960]], { w: 5, tone: .7, dry: .4, prof: 'even', seed: sd * 3 }));
    draw(L, mk([[x + 130, 846], [x + 128, 960]], { w: 5, tone: .7, dry: .4, prof: 'even', seed: sd * 5 }));
  }
  // the tangle over one's own head; clears as the camera rises (seen from outside)
  const grow = clamp((t - VO.L23.t - .5) / 3);
  S.tangle(L, 620, 560, 150, 16, 31, grow, 1 - rise, t);
  // over the friend's problem: three calm strokes
  for (let i = 0; i < 3; i++) draw(L, mk([[1220, 520 + i * 34], [1380, 516 + i * 34]], { w: 4, tone: .5, dry: .6, prof: 'tip', seed: 960 + i }), clamp((t - VO.L23.t - 3.4 - i * .3) / .6));
  reset(A);
  const la = clamp((t - VO.L23.t - .2) / .6);
  const [lx, ly] = c.w2s([620, 1030]), [rx, ry] = c.w2s([1300, 1030]);
  label(A, '自己的难题', lx, ly, la); label(A, '朋友的难题', rx, ry, la);
  return { bleed: 5, rim: 1, paper: c.paper };
}
function sceneDesk(A, lt, t) {   // s13: at the desk; a figure one respects stands by (pale)
  const sh = SH.s13, D = sh.t1 - sh.t0;
  const c = cam(A, lerp(1.0, 1.07, ss(lt / D)), [960, 700], [960, 640]); const L = A.ink;
  draw(L, mk([[1450, 180], [1452, 900]], { w: 6, tone: .6, dry: .5, prof: 'even', seed: 1 }));
  draw(L, mk([[1450, 180], [1900, 182]], { w: 6, tone: .6, dry: .5, prof: 'even', seed: 2 }));
  draw(L, mk([[1675, 182], [1676, 900]], { w: 3, tone: .45, dry: .6, prof: 'even', seed: 3 }));
  mass(L.wet, [[640, 800], [1280, 800], [1280, 830], [640, 830]], .55, 1, 4);
  const tf = q12(lt);
  S.figure(L, S.P.desk, { x: 960, y: 940, s: 3.0, cap: 'modern', seed: 9, t: tf, boil: tf * 12 });
  underDesk(A, 600, 830, 1320, 1000);
  draw(L, mk([[680, 830], [678, 960]], { w: 5, tone: .7, dry: .4, prof: 'even', seed: 21 })); draw(L, mk([[1240, 830], [1242, 960]], { w: 5, tone: .7, dry: .4, prof: 'even', seed: 22 }));
  // paper on the desk with a line being written
  mass(L.wet, [[880, 786], [1040, 782], [1046, 798], [874, 800]], .06, 1, 5);
  draw(L, mk([[890, 790], [1020, 788]], { w: 2, tone: .8, dry: .5, prof: 'tip', seed: 6 }), clamp((t - VO.L27.t - 5) / 3));
  // the respected one: pale, standing at the side, appears as the line is spoken
  const g = ss((t - VO.L27.t - 6.5) / 2.5);
  if (g > 0) S.figure(L, S.P.stand, { x: 1560, y: 940, s: 3.4, dir: -1, seed: 3, t: tf, am: .42 * g, boil: tf * 12 });
  reset(A);
  return { bleed: 6, rim: 1, paper: c.paper };
}
function sceneTea(A, lt, t) {   // s14b: one small thing — boil water, make tea
  const D = SH.s14.t1 - M.tea;
  const c = cam(A, lerp(1.0, 1.06, ss(lt / D)), [1000, 760], [960, 640]); const L = A.ink;
  draw(L, mk([[300, 200], [302, 760]], { w: 6, tone: .55, dry: .5, prof: 'even', seed: 11 }));
  draw(L, mk([[300, 200], [760, 202]], { w: 6, tone: .55, dry: .5, prof: 'even', seed: 12 }));
  draw(L, mk([[530, 202], [531, 760]], { w: 3, tone: .4, dry: .6, prof: 'even', seed: 13 }));
  mass(L.wet, [[860, 930], [1700, 930], [1700, 960], [860, 960]], .5, 1, 14);
  S.stove(L, 1360, 928, 1.6, t, 1, 7);
  const tf = q12(lt), reach = ss((lt - 2) / 1) * (1 - ss((lt - 9) / 1));
  const pose = mixPose(S.P.stand, { ...S.P.stand, aF: [[2.5, -74], [12, -66], [22, -62]] }, reach);
  S.figure(L, pose, { x: 980, y: 1000, s: 3.4, dir: 1, cap: 'modern', seed: 9, t: tf, boil: tf * 12 });
  // a cup
  mass(L.wet, [[1120, 930], [1116, 896], [1158, 896], [1154, 930]], .45, 1, 15);
  reset(A);
  return { bleed: 5, rim: 1, paper: c.paper };
}

// ---------- parts ----------
const PARTS = [
  { t0: SH.s1.t0, f: (A, lt, t) => sceneRange(A, lt, t, false), sub: [620, 140], at: [960, 540] },
  { t0: SH.s2.t0, f: sceneField, sub: [170, 180], at: [820, 720] },
  { t0: SH.s3.t0, f: sceneBamboo, sub: [1000, 150], at: [500, 600] },
  { t0: SH.s4.t0, f: sceneScroll, sub: [640, 130], at: [1500, 500] },
  { t0: SH.s5.t0, f: sceneCave, sub: [760, 110], at: [400, 700] },
  { t0: SH.s6.t0, f: (A, lt, t) => sceneChop(A, lt, t, SH.s6.t0 + .6), sub: [1060, 170], at: [700, 700] },
  { t0: SH.s7.t0, f: sceneNightSong, sub: [170, 160], at: [1500, 230] },
  { t0: SH.s8.t0, f: sceneQuestion, sub: [1160, 900], at: [960, 540] },
  { t0: SH.s9.t0, f: sceneNight, sub: null, light: [150, 150], at: [960, 540] },
  { t0: M.bamboo, f: sceneRecall, sub: [1060, 150], at: [960, 300] },
  { t0: M.poem, f: scenePoem, sub: [1180, 920], at: [960, 540] },
  { t0: SH.s11.t0, f: sceneHut, sub: [150, 150], at: [1200, 700] },
  { t0: SH.s12.t0, f: sceneTowers, sub: [150, 140], at: [868, 486] },
  { t0: M.lab, f: sceneLab, sub: [560, 140], at: [960, 540] },
  { t0: SH.s13.t0, f: sceneDesk, sub: [150, 150], at: [960, 700] },
  { t0: SH.s14.t0, f: (A, lt, t) => sceneChop(A, lt, t, SH.s14.t0 + .3), sub: [1060, 170], at: [700, 700] },
  { t0: M.tea, f: sceneTea, sub: [980, 150], at: [1360, 860] },
  { t0: SH.s15.t0, f: (A, lt, t) => sceneRange(A, lt, t, true), sub: [620, 140], at: [1000, 860] },
];
const partAt = t => { let i = 0; while (i + 1 < PARTS.length && t >= PARTS[i + 1].t0) i++; return i; };

export function render(t, A, B, TMP, comp) {
  TXT = [];
  const i = partAt(t), P = PARTS[i], lt = t - P.t0;
  let o, target = A;
  A.clear();
  if (i > 0 && lt < TR) {   // ink bloom: the new part grows inside a spreading drop over the old one
    const Pp = PARTS[i - 1];
    const oa = Pp.f(A, t - Pp.t0, t, TMP);
    B.clear(); TXT = [];
    const ob = P.f(B, lt, t, TMP);
    const u = lt / TR;
    o = { ...oa, paperB: ob.paper, bleedB: ob.bleed, rimB: ob.rim, trans: [P.at[0], P.at[1], 20 + 2600 * ss(u), 1] };
    if (ob.vig) o.vig = lerp(oa.vig ?? .22, ob.vig, u);
    target = B;
  } else o = P.f(A, lt, t, TMP);
  // subtitles (题跋)
  if (!NOSUB) for (const sb of ST.subs) {
    if (t < sb.t0 || t > sb.t1) continue;
    const k = Math.min(clamp((t - sb.t0) / .3), clamp((sb.t1 - t) / .35));
    const Pi = PARTS[partAt(sb.t0 + .01)];
    if (Pi.light) subZh(target, sb.text, Pi.light[0], Pi.light[1], k, { size: 40, light: true });
    else subZh(target, sb.text, Pi.sub[0], Pi.sub[1], k, { size: 40 });
  }
  comp(A, B, o);
}

export function texts() { return TXT; }

// ---------- sound and music events (exported for mix.py) ----------
export function events() {
  const E = [];
  for (const v of ST.vo) E.push({ t: v.t, type: 'vo', id: v.id });
  PARTS.forEach((p, i) => { if (i) E.push({ t: p.t0, type: 'bloom', gain: .35 }); });
  const sh = SH;
  E.push({ type: 'amb', kind: 'rain', t0: 0, t1: sh.s2.t0 + 1 });
  E.push({ type: 'amb', kind: 'wind', t0: 0, t1: sh.s3.t0 + 1 });
  for (let k = 0; k < 14; k++) E.push({ t: .6 + k * .55 * 1.6, type: 'step', gain: .35 });
  E.push({ t: M.title + 1.4, type: 'brush', gain: .6, dur: 1.6 });
  E.push({ t: M.title + 3.5, type: 'seal', gain: 1 });
  E.push({ type: 'amb', kind: 'leaves', t0: sh.s3.t0, t1: sh.s4.t0 + .5 });
  E.push({ t: M.fall + .1, type: 'fall', gain: .8 });
  E.push({ type: 'silence', t0: M.fall + .35, t1: M.fall + 2.2 });
  E.push({ t: sh.s4.t0 + .2, type: 'bell', gain: .9 });
  E.push({ type: 'amb', kind: 'water', t0: sh.s4.t0 + 3, t1: sh.s4.t1 - 4 });
  E.push({ type: 'amb', kind: 'forest', t0: sh.s4.t1 - 8, t1: sh.s5.t0 + 1 });
  E.push({ type: 'amb', kind: 'cave', t0: sh.s5.t0, t1: sh.s6.t0 + .5 });
  for (let k = 0; k < 6; k++) E.push({ t: sh.s5.t0 + 1.3 + k * 2.3, type: 'drip', gain: .5 });
  E.push({ t: VO.L10.t + 2.3, type: 'brush', gain: .5, dur: 2.6 });
  E.push({ type: 'silence', t0: M.hush5 + .1, t1: sh.s5.t1 - .05 });
  E.push({ type: 'amb', kind: 'fire', t0: sh.s6.t0, t1: sh.s7.t1 });
  const chops = (t0, t1, s0) => { for (let tt = s0 + BEAT * 2 * .86; tt < t1; tt += BEAT * 2) if (tt > t0 + .2) E.push({ t: tt, type: 'chop', gain: .9 }); };
  chops(sh.s6.t0, sh.s7.t0, sh.s6.t0 + .6); chops(sh.s14.t0, M.tea, sh.s14.t0 + .3);
  E.push({ type: 'amb', kind: 'night', t0: sh.s7.t0, t1: M.hush });
  E.push({ t: VO.L14.t + 2.5, type: 'brush', gain: .6, dur: 2.8 });
  E.push({ type: 'silence', t0: M.hush, t1: M.stroke - .02 });
  E.push({ t: M.hush + 1.1, type: 'drip', gain: .8 });
  E.push({ t: M.stroke, type: 'feibai', gain: 1 });
  [0, .62, 1.7, 2.3].forEach((d, i) => E.push({ t: M.xin + d, type: 'brush', gain: .7, dur: [.5, .95, .45, .5][i] }));
  E.push({ t: VO.L16.t + 1.2, type: 'brush', gain: .45, dur: 2.2 });
  E.push({ type: 'amb', kind: 'leaves', t0: M.bamboo, t1: M.poem + .5 });
  E.push({ t: VO.L19.t + 1.6, type: 'brush', gain: .5, dur: 3.6 });
  E.push({ type: 'amb', kind: 'wind', t0: sh.s11.t0, t1: sh.s12.t0 + .5 });
  E.push({ t: VO.L20.t + 1.8, type: 'brush', gain: .5, dur: 1.8 });
  E.push({ type: 'amb', kind: 'city', t0: sh.s12.t0 - .5, t1: sh.s15.t0 });
  E.push({ t: VO.L27.t + 5, type: 'write', gain: .5, dur: 3 });
  E.push({ type: 'amb', kind: 'fire', t0: M.tea, t1: sh.s15.t0 });
  E.push({ t: M.tea + 4, type: 'pour', gain: .6 });
  E.push({ type: 'amb', kind: 'wind', t0: sh.s15.t0, t1: DUR });
  for (let k = 0; k < 40; k++) { const tt = sh.s15.t0 + 1 + k * .55 * 1.6; if (tt < M.end + 2) E.push({ t: tt, type: 'step', gain: .25 }); }
  E.push({ t: M.end + .4, type: 'brush', gain: .6, dur: 1.8 });
  E.push({ t: M.end + 2.6, type: 'seal', gain: 1 });
  return E;
}
