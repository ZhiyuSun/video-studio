// 归去来 — scenes, timing, subtitle placement and sound events. All times come from story.json (tools/timeline.py).
import * as K from './kit.js';
const { mk, draw, mass, blot, cun, pine, reed, ripple, clamp, lerp, ss, mulberry, vnoise, P, modern, walkPose, step, at, fig, inscribe, seal, mtn } = K;
import { eio } from '/core/lib.js';

let ST, V = {};
export let SC = [];
const seg = (t, a, b) => clamp((t - a) / (b - a));

export function init(st) {
  ST = st; for (const v of st.vo) V[v.id] = v;
  const S = {}; for (const s of st.shots) S[s.id] = s;
  const L = id => V[id];
  const cuts = [
    ['river'], ['title'], ['songshu'], ['yin', L('L05').t + L('L05').dur * .8, 'cut'], ['preface'], ['desk'], ['scroll'], ['lift', null, 'cut'],
    ['home'], ['weeds'], ['spring', null, 'cut'], ['moon', L('L20').t + 3.0], ['fire'], ['autumn'], ['village', L('L23').t - .3], ['rooms'],
    ['fork'], ['five'], ['write'], ['keep'], ['tea', L('L36').t + L('L36').dur * .6], ['help'], ['fence'],
  ];
  const parent = { yin: 'songshu', moon: 'spring', village: 'autumn', tea: 'keep' };
  SC = cuts.map(([id, t0, kind]) => ({ id, t0: t0 ?? S[id].t0, kind: kind || 'bloom' }));
  SC.forEach((s, i) => { s.t1 = i + 1 < SC.length ? SC[i + 1].t0 : st.dur; s.in = i && s.kind === 'bloom' ? { k: 'bloom', d: 1.4, at: FOCUS[s.id] || [960, 540] } : { k: 'cut' }; });
}
const FOCUS = { title: [820, 760], songshu: [960, 600], preface: [560, 760], desk: [760, 760], home: [900, 800], weeds: [960, 760], moon: [900, 800], fire: [960, 700], autumn: [1200, 820], village: [980, 860], rooms: [960, 560], fork: [700, 760], five: [1400, 560], write: [900, 560], keep: [800, 800], tea: [960, 760], help: [800, 760], fence: [960, 700] };
export function sceneIndex(t) { let i = 0; while (i + 1 < SC.length && t >= SC[i + 1].t0) i++; return i; }

function cam(L, s, fx, fy, dx = 0, dy = 0) { const tx = fx * (1 - s) + dx, ty = fy * (1 - s) + dy; L.xf(s, tx, ty); return [-tx, -ty, s]; }
const vt = (id, k = 0) => V[id].t + V[id].dur * k;
const pr = (t, id, k0, k1) => seg(t, vt(id, k0), vt(id, k1));
const FAR = (key, base, peaks, seed, o = {}) => mtn(key, { peaks, base, depth: o.depth ?? 220, tone: o.tone ?? .13, rim: .5, rimW: 20, mist: o.mist ?? .9, seed, W: o.W, rough: o.rough });
const S = (L, pts, o, p = 1, am = 1) => draw(L, mk(pts, o), p, am);

export function scene(sc, A, t, T, T2) {
  const u = t - sc.t0, D = sc.t1 - sc.t0, L = A.ink;
  return (SCN[sc.id] || (() => ({})))(A, L, u, D, t, T, T2);
}

const riverWorld = (A, L, t, x0 = 0) => {
  A.cw.drawImage(FAR('riverFar', 420, [[260, 140, 160], [520, 210, 200], [760, 120, 150], [1500, 90, 170], [1750, 150, 180]], 3), x0, 0);
  K.streaks(L, 14, x0 + 100, x0 + 1800, 560, 980, 5, .22);
  mass(L.wet, [[x0 + 1480, 1000], [x0 + 1700, 960], [x0 + 1960, 950], [x0 + 1960, 1080], [x0 + 1450, 1080]], .14, 10, 4);
  for (let i = 0; i < 9; i++) reed(L, x0 + 1640 + i * 30, 1010 + (i % 3) * 8, 70 + (i * 37) % 50, .7, 300 + i, -.25 + Math.sin(t * .8 + i) * .05, .55);
};

const SCN = {
  river(A, L, u, D, t) {
    const paper = cam(A, 1 + .02 * u / D, 960, 540);
    riverWorld(A, L, t);
    const x = 1560 - 560 * u / D, y = 700;
    for (let k = 1; k < 5; k++) S(L, [[x + 70 + k * 46, y + 2 + k * 3], [x + 100 + k * 52, y + 4 + k * 3]], { w: 2.4, tone: .35 - k * .05, dry: .6, prof: 'tip', seed: 40 + k });
    K.boat(L, x, y, .55, 1, true, step(t));
    fig(L, P.stand, { x: x + 4, y: y - 10, s: .78, dir: -1, t: step(t), seed: 5 });
    return { paper, bleed: 5, rim: 1 };
  },
  title(A, L, u, D, t) {
    const paper = cam(A, 1 + .05 * u / D, 820, 760);
    A.cw.drawImage(FAR('titleFar', 560, [[200, 160, 200], [520, 260, 230], [900, 180, 200], [1300, 120, 190]], 9, { depth: 260, tone: .16 }), 0, 0);
    K.streaks(L, 10, 100, 1500, 820, 1040, 9, .25);
    K.boat(L, 800, 880, 1.7, 2, true, step(t));
    fig(L, P.back, { x: 790, y: 852, s: 2.3, t: step(t), seed: 6 });
    inscribe(A, ['归去来'], 1560, 250, 128, ss((u - .8) / 2.2), { world: true });
    if (u > 3.4) seal(A.cc, 1515, 640, 88, 1, '陶', 5);
    return { paper, bleed: 5, rim: 1 };
  },
  songshu(A, L, u, D, t) {
    const paper = cam(A, 1 + .04 * u / D, 960, 520);
    S(L, [[80, 902], [960, 906], [1840, 900]], { w: 6, tone: .55, dry: .6, prof: 'tip', seed: 70 });
    mass(L.wet, [[700, 340], [1220, 340], [1220, 900], [700, 900]], .12, 6, 71);
    K.roof(L, 300, 1620, 320, 170, 1.6, 31);
    K.pillar(L, 560, 330, 900, 1.3, 32); K.pillar(L, 1360, 330, 900, 1.3, 33);
    fig(L, P.front, { x: 960, y: 900, s: 3.1, t: step(t), seed: 7 });
    // sedan chair and the bowing clerk
    mass(L.wet, [[1560, 650], [1760, 650], [1770, 830], [1550, 830]], .3, 4, 72, [0, 650, 0, 830, 1.2, .8]);
    S(L, [[1530, 640], [1660, 600], [1790, 640]], { w: 8, tone: .85, dry: .4, prof: 'press', seed: 73 });
    S(L, [[1440, 770], [1890, 770]], { w: 5, tone: .8, dry: .35, prof: 'even', seed: 74 });
    fig(L, P.bow, { x: 1300, y: 900, s: 2.9, dir: -1, t: step(t), seed: 8 });
    return { paper, bleed: 5, rim: 1 };
  },
  yin(A, L, u, D, t) {
    const paper = cam(A, 1 + .08 * clamp(u / D), 960, 560);
    S(L, [[-40, 720], [900, 712], [1960, 722]], { w: 26, tone: .55, darkDir: [0, 1], side: .8, brWet: true, body: .3, dry: .5, wet: .85, prof: 'even', seed: 80 });
    K.guanyin(L, 1020, 690, 2.6, 81);
    return { paper, bleed: 5, rim: 1 };
  },
  preface(A, L, u, D, t) {
    const push = seg(t, vt('L10'), vt('L10', 1) + 1);
    const paper = cam(A, 1 + .14 * ss(push), 1240, 420);
    inscribe(A, ['归去来兮辞序'], 1790, 150, 50, seg(u, .3, 1.8), { world: true, am: .8 });
    const pj = seg(t, vt('L07', .2), vt('L07', .2) + 1.4);
    if (pj > 0) K.jar(L, 560, 860, 1.5, 10, ss(pj));
    [[300, 880, 1.05], [400, 890, 1.15], [740, 880, 1.0], [830, 892, 1.1]].forEach(([x, y, s], i) => {
      const p = seg(t, vt('L07', .4) + i * .35, vt('L07', .4) + i * .35 + 1);
      if (p > 0) fig(L, P.front, { x, y, s, t: step(t), seed: 20 + i, p });
    });
    inscribe(A, ['质性自然', '非矫厉所得', '饥冻虽切', '违己交病'], 1520, 260, 80, pr(t, 'L09', 0, .95), { world: true, gap: 112, lead: 90 });
    return { paper, bleed: 5, rim: 1 };
  },
  desk(A, L, u, D, t) {
    const paper = cam(A, 1 + .05 * u / D, 760, 720);
    mass(L.wet, [[-20, -20], [1940, -20], [1940, 1100], [-20, 1100]], .06, 0, 1);
    S(L, [[-40, 110], [960, 124], [1960, 108]], { w: 34, tone: .8, darkDir: [0, -1], side: .7, brWet: true, body: .35, dry: .4, wet: .9, prof: 'even', seed: 90 });
    for (let i = 0; i < 14; i++) blot(L.wet, 80 + i * 140, 150, 9, .55, 0, .7, 90 + i);
    K.pillar(L, 250, 130, 1000, 1.4, 91);
    for (const [a, b, k] of [[[1340, 250], [1800, 250], 0], [[1340, 250], [1340, 900], 1], [[1800, 250], [1800, 900], 2]]) S(L, [a, b], { w: 6, tone: .7, dry: .5, prof: 'tip', seed: 92 + k });
    A.cw.save(); A.cw.beginPath(); A.cw.rect(1345, 255, 450, 640); A.cw.clip();
    A.cw.drawImage(FAR('deskFar', 560, [[1450, 140, 120], [1700, 190, 140]], 13, { tone: .12 }), 0, 0); A.cw.restore();
    K.rice(L, 1370, 1780, 890, .8, 93);
    K.desk(L, 860, 770, 440, 1.3, 94);
    K.guanyin(L, 1170, 760, .45, 95);
    fig(L, P.sit, { x: 720, y: 890, s: 3.4, t: step(t), seed: 9 });
    return { paper, bleed: 5, rim: 1 };
  },
  scroll(A, L, u, D, t) {
    const c = lerp(4640, 960, eio(u / D)), tx = 960 - c;
    A.xf(1, tx, 0); const paper = [-tx, 0, 1];
    A.cw.drawImage(FAR('scrollFar', 440, [[300, 160, 200], [800, 230, 230], [1500, 140, 200], [2200, 200, 260], [3000, 120, 220], [3700, 210, 240], [4400, 150, 200], [5100, 220, 260]], 7, { W: 5600, tone: .12 }), 0, 0);
    for (const [a, b] of [[0, 2480], [3180, 5600]]) S(L, [[a, 862], [(a + b) / 2, 858], [b, 864]], { w: 5, tone: .45, dry: .7, prof: 'tip', seed: 100 + a });
    K.roof(L, 4620, 5300, 540, 110, 1.1, 101); K.pillar(L, 4740, 545, 860, .9, 102); K.pillar(L, 5180, 545, 860, .9, 103);
    K.willow(L, 3820, 860, .8, 104, step(t)); K.cottage(L, 4020, 860, .85, 105);
    K.tent(L, 3340, 860, .85, 106); K.tent(L, 3560, 860, .75, 107);
    K.streaks(L, 18, 2480, 3180, 840, 1000, 108, .3);
    K.bird(L, 3000 - u * 6, 500 + Math.sin(u * 1.3) * 14, 1.2, t, 109);
    K.fish(L, 2760, 930 + Math.sin(u * 2.2) * 8, 1.2, 110); ripple(L, 2760, 940, 40, .35, 3, .2, 2);
    inscribe(A, ['望云惭高鸟', '临水愧游鱼'], 3120, 300, 62, pr(t, 'L14', .25, .95), { world: true, gap: 78 });
    K.willow(L, 1760, 860, .8, 111, step(t)); K.cottage(L, 1960, 860, .85, 112);
    K.roof(L, 180, 900, 540, 120, 1.15, 113); K.pillar(L, 300, 545, 860, .9, 114); K.pillar(L, 780, 545, 860, .9, 115);
    const fx = c + 90;
    if (fx > 2480 && fx < 3180) { K.boat(L, fx, 872, .55, 116, true, step(t)); fig(L, P.stand, { x: fx, y: 862, s: 1.2, dir: -1, t: step(t), seed: 10 }); }
    else fig(L, walkPose(t, .45), { x: fx, y: 862, s: 1.25, dir: -1, t: step(t), seed: 10 });
    return { paper, bleed: 5, rim: 1 };
  },
  lift(A, L, u, D, t, T) {
    const paper = cam(A, 1 + .04 * u / D, 1100, 700);
    // under the lifted ink: the road home
    const pr2 = ss(seg(u, 2.8, 5.6));
    if (pr2 > 0) {
      A.cw.save(); A.cw.globalAlpha = pr2; A.cw.drawImage(FAR('liftFar', 600, [[700, 160, 220], [1100, 240, 260], [1500, 150, 220]], 17, { tone: .15 }), 0, 0); A.cw.restore();
      S(L, [[800, 1100], [930, 860], [1010, 700], [1040, 620]], { w: 6, tone: .6, dry: .6, prof: 'tip', seed: 120 }, pr2);
      S(L, [[1160, 1100], [1080, 860], [1060, 700], [1050, 622]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 121 }, pr2);
      fig(L, P.stand, { x: 980, y: 1010, s: 2.9, t: step(t), seed: 11, p: seg(u, 3.4, 4.6) });
    }
    // the hall, drawn into T and lifted away from where the seal is put down
    T.clear(); T.xf(A.cw.getTransform().a, A.cw.getTransform().e, A.cw.getTransform().f); const M = T.ink;
    mass(M.wet, [[-40, -40], [1960, -40], [1960, 1120], [-40, 1120]], .34, 0, 2, [0, 0, 0, 1080, 1.3, .8]);
    S(M, [[-40, 100], [960, 118], [1960, 100]], { w: 60, tone: .9, darkDir: [0, -1], side: .7, brWet: true, body: .35, dry: .35, wet: .9, prof: 'even', seed: 122 });
    K.pillar(M, 300, 110, 1080, 2, 123); K.pillar(M, 1660, 110, 1080, 2, 124);
    K.desk(M, 860, 780, 640, 1.6, 125);
    K.guanyin(M, 1190, 770, .8, 126);
    const reach = ss(seg(u, 1.7, 2.4));
    const pose = { ...P.sit, aF: [[3, -45], [lerp(11, 17, reach), lerp(-33, -40, reach)], [lerp(20, 33, reach), lerp(-31, -42, reach)]] };
    fig(M, pose, { x: 760, y: 1000, s: 4.4, t: step(t), seed: 9 });
    const R = Math.pow(seg(u, 2.6, 5.6), 1.6) * 2600;
    if (R > 0) {
      for (const c of [T.cw, T.cd, T.cc]) {
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; c.globalAlpha = 1; c.fillStyle = '#000'; c.beginPath();
        const cx = 1190, cy = 760;
        c.ellipse(cx, cy, R * .86, R * .7, 0, 0, 6.2832); c.fill(); c.beginPath();
        for (let i = 0; i < 48; i++) { const a = i / 48 * 6.283, rr = R * (.18 + .14 * vnoise(i * 1.7 + 3)), x = cx + Math.cos(a) * R * .86, y = cy + Math.sin(a) * R * .7; c.moveTo(x + rr, y); c.arc(x, y, rr * (.6 + .5 * vnoise(i * .9 + R * .003)), 0, 6.2832); }
        c.fill(); c.restore();
      }
    }
    for (const k of ['cw', 'cd', 'cc']) { const c = A[k]; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(T[k === 'cw' ? 'wet' : k === 'cd' ? 'dry' : 'col'], 0, 0); c.restore(); }
    if (R > 0 && R < 2400) {   // flying-white streaks at the lifting front
      const Rr = mulberry(7);
      for (let i = 0; i < 10; i++) { const a = Rr() * 6.283, r0 = R * .9, x = 1190 + Math.cos(a) * r0, y = 760 + Math.sin(a) * r0 * .8; A.cd.save(); A.cd.setTransform(1, 0, 0, 1, 0, 0); draw({ wet: A.cw, dry: A.cd }, mk([[x, y], [x + Math.cos(a) * 140, y + Math.sin(a) * 110]], { w: 22, tone: .5, dry: .85, prof: 'tip', seed: 130 + i }), 1, .6 * (1 - R / 2400)); A.cd.restore(); }
    }
    return { paper, bleed: 5, rim: 1 };
  },
  home(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 1200, 700);
    A.cw.drawImage(FAR('homeFar', 560, [[900, 170, 220], [1300, 250, 240], [1750, 160, 200]], 19), 0, 0);
    S(L, [[100, 842], [960, 838], [1860, 844]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 140 });
    K.cottage(L, 1380, 830, 1.4, 141); pine(L, 1700, 846, .75, 142, step(t), .4);
    K.fence(L, 880, 1140, 846, .8, 143); K.chrys(L, 960, 846, .9, 144); K.chrys(L, 1060, 850, .8, 145);
    fig(L, P.front, { x: 1190, y: 840, s: 1.05, t: step(t), seed: 30, p: seg(u, .8, 2) });
    fig(L, P.front, { x: 1240, y: 844, s: .9, t: step(t), seed: 31, p: seg(u, 1.1, 2.3) });
    const w = clamp(u / 9), x = lerp(360, 980, w);
    fig(L, w < 1 ? walkPose(t, .5) : P.stand, { x, y: 842, s: 2.2, t: step(t), seed: 12 });
    inscribe(A, ['觉今是而昨非'], 250, 160, 72, pr(t, 'L17', .55, .95), { world: true });
    return { paper, bleed: 5, rim: 1 };
  },
  weeds(A, L, u, D, t) {
    const paper = cam(A, 1 + .02 * u / D, 960, 760);
    A.cw.drawImage(FAR('weedFar', 520, [[500, 120, 240], [1400, 160, 260]], 21, { tone: .09 }), 0, 0);
    K.grass(L, 260, 1660, 780, 1.1, 150, 170, .55);
    fig(L, P.stand, { x: 960, y: 784, s: 1.5, t: step(t), seed: 12 });
    return { paper, bleed: 5, rim: 1 };
  },
  spring(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 900, 760);
    A.cw.drawImage(FAR('springFar', 560, [[300, 180, 240], [800, 120, 200], [1500, 200, 260]], 23, { tone: .11, mist: 1.1 }), 0, 0);
    S(L, [[80, 866], [960, 860], [1860, 868]], { w: 6, tone: .5, dry: .6, prof: 'tip', seed: 160 });
    for (let i = 0; i < 8; i++) S(L, [[200 + i * 80, 880 + i * 18], [1700 - i * 40, 884 + i * 18]], { w: 3, tone: .25, dry: .75, prof: 'tip', seed: 161 + i });
    mass(L.wet, [[0, 640], [1920, 600], [1920, 700], [0, 720]], .05, 30, 162);
    const ph = (t - V.L19.t) % 1.0, down = ph > .45;
    const X = { x: 900, y: 864, s: 2.8, t: step(t), seed: 12 };
    const pose = down ? P.hoeDown : P.hoeUp; fig(L, pose, X);
    const h1 = at(pose.aB[2], X), h2 = at(pose.aF[2], X);
    K.hoe(L, h1, h2, down ? 160 : 150, 2.6, 163);
    inscribe(A, ['晨兴理荒秽'], 1620, 170, 70, pr(t, 'L20', 0, .25), { world: true });
    return { paper, bleed: 5, rim: 1 };
  },
  moon(A, L, u, D, t) {
    const paper = cam(A, 1 + .02 * u / D, 900, 760);
    A.cw.drawImage(FAR('moonFar', 600, [[400, 200, 260], [1100, 150, 240], [1700, 230, 260]], 25, { tone: .16 }), 0, 0);
    K.moon(L, 1540, 240, 66, 170);
    S(L, [[80, 826], [960, 818], [1860, 830]], { w: 6, tone: .55, dry: .6, prof: 'tip', seed: 171 });
    const x = lerp(560, 1060, clamp(u / D)), pose = Math.floor(t / .5) % 2 ? P.carry2 : P.carry1, X = { x, y: 824, s: 2.2, t: step(t), seed: 12 };
    fig(L, pose, X);
    const hnd = at(pose.aF[2], X), sh = at(pose.C, X); K.hoe(L, hnd, [sh[0] - 4, sh[1] - 4], 150, 2, 172);
    inscribe(A, ['带月荷锄归'], 300, 170, 70, seg(u, 0, 2), { world: true });
    return { paper, bleed: 5, rim: 1 };
  },
  fire(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 960, 700);
    S(L, [[80, 822], [960, 818], [1860, 826]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 180 });
    const col = seg(u, 6.4, 7.6), am = 1 - col;
    if (am > 0) K.cottage(L, 1060, 810, 1.6, 181, am);
    const st = Math.floor(u * 12) / 12, grow = seg(u, 1.4, 5.5) * (1 - seg(u, 8, 10.5) * .8);
    if (grow > 0) {
      const R = mulberry(182);
      // smoke: big pale blots drifting up
      for (let i = 0; i < 7; i++) { const k = (st * .12 + i / 7) % 1; blot(L.wet, 860 + i * 70 + Math.sin(st + i) * 30, 620 - k * 420, (70 + k * 120) * grow, .1 * (1 - k) * grow, i, .7, 400 + i); }
      // flames: a few tall tongues, each an S-curve of loaded ink narrowing upward, flickering on twos
      for (let i = 0; i < 5; i++) {
        const bx = 820 + i * 105 + R() * 30, by = 660 + Math.abs(i - 3) * 12 + col * 110, h = (140 + R() * 200) * grow * (1 - col * .55) * (.75 + .25 * Math.sin(st * 7 + i * 2.1));
        const fl = Math.sin(st * 8 + i * 1.7) * 30, w = (60 + R() * 40) * grow;
        blot(L.wet, bx, by - h * .3, w * 1.2, .08 * grow, 0, 1.3, 500 + i);
        S(L, [[bx - w * .2, by], [bx + fl * .4, by - h * .35], [bx - fl * .7, by - h * .7], [bx + fl * .3, by - h]], { w, tone: .4, darkDir: [i % 2 ? 1 : -1, 0], side: .55, brWet: true, body: .35, dry: .35, wet: 1, prof: 'cone', seed: 183 + i * 7 + Math.floor(st * 12) % 3 });
        if (i % 2 === 0) S(L, [[bx + 10, by - h * .2], [bx + 24 + fl * .5, by - h * .55], [bx + 14 - fl * .6, by - h * .85]], { w: w * .25, tone: .7, dry: .6, wet: .2, prof: 'cone', seed: 190 + i + Math.floor(st * 12) % 3 * 20 });
      }
    }
    if (col > 0) { const R = mulberry(185); for (let i = 0; i < 10; i++) { const x = 820 + R() * 500; S(L, [[x, 816], [x + (R() - .5) * 160, 816 - R() * 60]], { w: 9, tone: .9, dry: .4, wet: .4, prof: 'nail', seed: 186 + i }, col); blot(L.wet, x, 818, 20, .5 * col, 0, .4, i); } }
    fig(L, P.stand, { x: 400, y: 822, s: 2.0, t: step(t), seed: 12 });
    inscribe(A, ['一宅无遗宇'], 1720, 170, 70, seg(u, 7.2, 9.2), { world: true });
    return { paper, bleed: 5, rim: 1 };
  },
  autumn(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 1200, 760);
    A.cw.drawImage(FAR('autFar', 560, [[300, 150, 220], [900, 200, 240]], 27, { tone: .12 }), 0, 0);
    const cut = lerp(900, 1180, clamp(u / D));
    K.rice(L, 260, 1760, 880, 1.15, 190, cut);
    for (let i = 0; i < 4; i++) { const x = 330 + i * 120; mass(L.wet, [[x - 14, 880], [x - 22, 790], [x, 770], [x + 22, 790], [x + 14, 880]], .3, 3, 191 + i); S(L, [[x - 18, 830], [x + 18, 830]], { w: 4, tone: .85, dry: .3, prof: 'tip', seed: 195 + i }); }
    const X = { x: cut - 40, y: 882, s: 2.5, t: step(t), seed: 12 };
    fig(L, P.bend, X); const h = at(P.bend.aF[2], X);
    S(L, [h, [h[0] + 18, h[1] + 10], [h[0] + 34, h[1] - 4]], { w: 4, tone: .9, dry: .3, prof: 'tip', seed: 196 });
    inscribe(A, ['人生归有道', '衣食固其端'], 1720, 150, 66, pr(t, 'L22', .3, .6), { world: true, gap: 84 });
    return { paper, bleed: 5, rim: 1 };
  },
  village(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 980, 820);
    A.cw.drawImage(FAR('vilFar', 580, [[1300, 170, 240], [1750, 210, 220]], 29, { tone: .13 }), 0, 0);
    S(L, [[80, 900], [960, 896], [1860, 902]], { w: 5, tone: .45, dry: .65, prof: 'tip', seed: 200 });
    K.cottage(L, 380, 900, 1.1, 201); K.willow(L, 1640, 900, .9, 202, step(t));
    K.jar(L, 980, 890, .35, 203);
    fig(L, P.sit, { x: 780, y: 910, s: 2.3, dir: 1, t: step(t), seed: 12 });
    fig(L, P.sit, { x: 1190, y: 912, s: 2.3, dir: -1, t: step(t), seed: 40 });
    fig(L, P.sitFront, { x: 900, y: 860, s: 1.8, t: step(t), seed: 41 });
    fig(L, P.sitFront, { x: 1070, y: 862, s: 1.85, t: step(t), seed: 42 });
    inscribe(A, ['多素心人', '乐与数晨夕'], 1780, 160, 62, pr(t, 'L23', .3, .55), { world: true, gap: 80 });
    return { paper, bleed: 5, rim: 1 };
  },
  rooms(A, L, u, D, t) { return rooms(A, L, u, D, t, { label: true, dark: seg(u, 0, D) * .14 }); },
  fork(A, L, u, D, t) {
    const tx = -260 * eio(u / D); A.xf(1, tx, 0); const paper = [-tx, 0, 1];
    A.cw.drawImage(FAR('forkFar', 640, [[1750, 220, 220], [2050, 300, 240]], 31, { W: 2300, tone: .16 }), 0, 0);
    K.tower(L, 120, 460, 200, 870, 210);
    S(L, [[300, 872], [1200, 866], [2200, 874]], { w: 6, tone: .5, dry: .6, prof: 'tip', seed: 211 });
    const x = 560 + 33 * u;
    fig(L, walkPose(t, .5, true), { x, y: 870, s: 2.3, t: step(t), seed: 13 });
    inscribe(A, ['离开'], 620, 220, 66, pr(t, 'L28', .1, .3), { world: true });
    inscribe(A, ['走向'], 1960, 300, 66, pr(t, 'L28', .5, .75), { world: true });
    inscribe(A, ['违己交病'], 540, 420, 52, pr(t, 'L30', 0, .2), { world: true, am: .8 });
    inscribe(A, ['平生之志'], 1860, 300, 52, pr(t, 'L30', .55, .8), { world: true, am: .8 });
    return { paper, bleed: 5, rim: 1 };
  },
  five(A, L, u, D, t) {
    const L32 = V.L32, words = ['时间', '人', '有用', '有事做', '身份'], keys = [.46, .58, .72, .82, .96];
    const fadeL = pr(t, 'L34', 0, .45), firm = pr(t, 'L34', .5, .9);
    return rooms(A, L, u, D, t, { dark: .14 + fadeL * .14, words: words.map((w, i) => ({ w, p: seg(t, L32.t + L32.dur * keys[i] - .5, L32.t + L32.dur * keys[i] + .3) })), fadeL, firm });
  },
  write(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 900, 560);
    for (const [a, b, k] of [[[520, 250], [1420, 236]], [[1420, 236], [1440, 880]], [[1440, 880], [540, 892]], [[540, 892], [520, 250]]].map((x, i) => [...x, i])) S(L, [a, b], { w: k === 1 || k === 2 ? 7 : 3, tone: k === 1 || k === 2 ? .3 : .45, dry: .6, wet: .4, prof: 'tip', seed: 220 + k });
    for (const [a, b, k] of [[[40, 120], [300, 120], 0], [[300, 120], [300, 700], 1], [[40, 700], [300, 700], 2], [[170, 120], [170, 700], 3]]) S(L, [a, b], { w: 4, tone: .6, dry: .5, prof: 'tip', seed: 226 + k });
    K.pot(L, 1620, 840, 1.7, 230);
    const lines = [['我离开的是 ________', 640, 440, 62, pr(t, 'L35', .3, .48)], ['我想走向的是 ________', 640, 570, 62, pr(t, 'L35', .48, .62)], ['我想试试 ________', 640, 720, 50, pr(t, 'L35', .82, .97)]];
    let tip = null;
    for (const [s, x, y, size, p] of lines) {
      if (p <= 0) continue; const n = [...s].length, k = Math.ceil(p * n), txt = [...s].slice(0, k).join('');
      for (const [c, a] of [[A.cw, .25], [A.cd, .9]]) { c.save(); c.globalAlpha = a; c.fillStyle = '#000'; c.font = `${size}px WenKai`; c.fillText(txt, x, y); if (p < 1) tip = [x + c.measureText(txt).width, y]; c.restore(); }
    }
    if (tip) S(L, [[tip[0] + 6, tip[1] - 6], [tip[0] + 90, tip[1] - 120]], { w: 7, tone: .85, dry: .3, prof: 'nail', seed: 231 });
    return { paper, bleed: 5, rim: 1 };
  },
  keep(A, L, u, D, t) {
    const paper = cam(A, 1 + .02 * u / D, 900, 760);
    K.moon(L, 1500, 260, 52, 240);
    A.cw.drawImage(FAR('keepFar', 640, [[300, 170, 260], [900, 120, 220]], 33, { tone: .1 }), 0, 0);
    K.streaks(L, 10, 200, 1800, 880, 1040, 241, .2);
    S(L, [[80, 842], [960, 836], [1860, 846]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 242 });
    K.bird(L, 700 + u * 30, 300, .8, t, 243); K.bird(L, 760 + u * 30, 330, .7, t + .3, 245);
    fig(L, walkPose(t, .5, true), { x: lerp(420, 980, clamp(u / D)), y: 840, s: 1.7, t: step(t), seed: 13 });
    return { paper, bleed: 5, rim: 1 };
  },
  tea(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 960, 700);
    K.windowFrame(L, 820, 260, 280, 240, 250);
    K.desk(L, 760, 780, 400, 1.2, 251);
    K.teapot(L, 960, 772, 1.2, 252, t);
    blot(L.wet, 860, 768, 12, .5, 0, .5, 1); blot(L.wet, 1060, 768, 12, .5, 0, .5, 2);
    K.chair(L, 640, 900, 1.3, 1, 253); K.chair(L, 1280, 900, 1.3, -1, 254);
    fig(L, modern(P.sitChair), { x: 650, y: 900, s: 2.5, dir: 1, t: step(t), seed: 13 });
    fig(L, modern(P.sitChair), { x: 1270, y: 900, s: 2.5, dir: -1, t: step(t), seed: 43 });
    return { paper, bleed: 5, rim: 1 };
  },
  help(A, L, u, D, t) {
    const paper = cam(A, 1 + .03 * u / D, 900, 700);
    K.windowFrame(L, 1260, 260, 420, 400, 260);
    const st = Math.floor(t * 12) / 12, R = mulberry(261);
    for (let i = 0; i < 26; i++) { const x = 1270 + R() * 400, y0 = 270 + ((R() * 400 + st * 520) % 380); S(L, [[x, y0], [x - 8, y0 + 26]], { w: 1.6, tone: .4, dry: .6, prof: 'tip', seed: 262 + i }); }
    S(L, [[80, 902], [960, 898], [1860, 904]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 263 });
    K.chair(L, 620, 900, 1.3, 1, 264); K.chair(L, 1060, 900, 1.3, -1, 265);
    fig(L, modern(P.sitChair), { x: 630, y: 900, s: 2.5, dir: 1, t: step(t), seed: 13 });
    fig(L, modern(P.sitChair), { x: 1050, y: 900, s: 2.5, dir: -1, t: step(t), seed: 44 });
    S(L, [[1500, 900], [1490, 820], [1510, 760]], { w: 3, tone: .7, dry: .4, prof: 'tip', seed: 266 }); blot(L.wet, 1480, 800, 16, .4, .5, .4, 3); blot(L.wet, 1520, 780, 16, .4, -.5, .4, 4);
    return { paper, bleed: 5, rim: 1 };
  },
  fence(A, L, u, D, t) {
    const tx = -1920 * (1 - eio(seg(u, 2.2, 7.5))); A.xf(1, tx, 0); const paper = [-tx, 0, 1];
    riverWorld(A, L, t, 1920);
    A.cw.drawImage(FAR('fenceFar', 600, [[1350, 210, 230], [1700, 150, 200]], 35, { tone: .15 }), 0, 0);
    S(L, [[80, 866], [960, 862], [1860, 868]], { w: 5, tone: .5, dry: .65, prof: 'tip', seed: 270 });
    K.cottage(L, 380, 850, 1.2, 271);
    K.fence(L, 640, 1480, 866, 1, 272);
    [[800, 868, 1.1], [960, 872, 1.15], [1110, 866, 1.05], [1270, 870, 1.1]].forEach(([x, y, s], i) => K.chrys(L, x, y, s, 273 + i, true));
    const up = ss(pr(t, 'L39', .1, .45));
    const X = { x: 1200, y: 870, s: 2.6, dir: -1, t: step(t), seed: 12 };
    fig(L, up > .5 ? P.stand : P.bend, X);
    if (up <= .5) { const h = at(P.bend.aF[2], X); K.jar(L, h[0] + 6, h[1] + 30, .22, 280); for (let i = 0; i < 4; i++) { const yy = h[1] + 40 + ((t * 120 + i * 30) % 90); S(L, [[h[0] - 10, yy], [h[0] - 12, yy + 10]], { w: 2, tone: .45, dry: .5, prof: 'tip', seed: 281 + i }); } }
    inscribe(A, ['采菊东篱下', '悠然见南山'], 1790, 150, 70, pr(t, 'L38', .2, .55), { world: true, gap: 90 });
    if (u > D - 6.5) seal(A.cc, 1660, 590, 92, 1, '渊明', 7);
    return { paper, bleed: 5, rim: 1 };
  },
};

function rooms(A, L, u, D, t, o) {
  const paper = cam(A, 1 + .02 * u / D, 960, 560);
  // left room: curtain drawn, lying on the bed, a clock
  K.room(L, 140, 260, 900, 900, 300);
  K.windowFrame(L, 620, 360, 200, 200, 301, 1);
  K.bed(L, 200, 860, 420, 1, 302);
  fig(L, modern(P.stand), { x: 590, y: 818, s: 2.6, rot: -Math.PI / 2, t: step(t), seed: 13 });
  const cl = []; for (let i = 0; i <= 26; i++) { const a = i / 26 * 6.3; cl.push([250 + Math.cos(a) * 34, 560 + Math.sin(a) * 34]); }
  S(L, cl, { w: 3, tone: .7, dry: .4, prof: 'brush', seed: 303 }); S(L, [[250, 560], [250, 536]], { w: 3, tone: .85, dry: .3, prof: 'tip', seed: 304 }); S(L, [[250, 560], [270, 570]], { w: 3, tone: .85, dry: .3, prof: 'tip', seed: 305 });
  if (o.dark > 0) mass(L.wet, [[140, 260], [900, 260], [900, 900], [140, 900]], o.dark, 6, 306);
  // right room: open window to a far mountain, desk, book, the small red flower
  K.room(L, 1020, 260, 1780, 900, 310);
  K.windowFrame(L, 1100, 340, 240, 220, 311);
  S(L, [[1130, 520], [1190, 470], [1240, 500], [1300, 450], [1330, 520]], { w: 4, tone: .35, dry: .5, wet: .5, prof: 'tip', seed: 312 });
  K.desk(L, 1400, 740, 300, 1, 313);
  S(L, [[1500, 734], [1540, 724], [1580, 734]], { w: 3, tone: .8, dry: .4, prof: 'tip', seed: 314 }); S(L, [[1580, 734], [1620, 724], [1660, 734]], { w: 3, tone: .8, dry: .4, prof: 'tip', seed: 315 });
  K.chair(L, 1360, 880, 1.1, 1, 316);
  fig(L, modern(P.sitChair), { x: 1370, y: 880, s: 2.3, dir: 1, t: step(t), seed: 13 });
  K.pot(L, 1300, 582, .8, 317);
  if (o.label) {
    for (const [txt, x, a] of [['躺平', 520, seg(t, vt('L25', .15), vt('L25', .3))], ['gap', 1400, seg(t, vt('L25', .3), vt('L25', .45))]]) {
      for (const [c, k] of [[A.cw, .2], [A.cd, .85]]) { c.save(); c.globalAlpha = a * k; c.fillStyle = '#000'; c.font = '64px WenKai'; c.textAlign = 'center'; c.fillText(txt, x, 210); c.restore(); }
    }
  }
  if (o.words) o.words.forEach(({ w, p }, i) => {
    inscribe(A, [w], 1740 - i * 62, 300, 44, p, { world: true, am: .6 + .35 * (o.firm || 0) });
    inscribe(A, [w], 560 - i * 62, 300, 44, p * (1 - (o.fadeL || 0)), { world: true, am: .45 });
  });
  return { paper, bleed: 5, rim: 1 };
}

// subtitle position [x, y(, size)] by the scene showing at that time: always in the shot's empty paper
const SUBP = { river: [140, 200], title: [140, 200], songshu: [140, 1000], yin: [140, 200], preface: [120, 200], desk: [400, 300], scroll: [120, 180], lift: [120, 180], home: [140, 990], weeds: [140, 200], spring: [140, 200], moon: [140, 990], fire: [140, 200], autumn: [140, 200], village: [140, 200], rooms: [140, 1000], fork: [700, 1000], five: [140, 1000], write: [140, 1000], keep: [140, 200], tea: [140, 200], help: [140, 200], fence: [140, 1000] };
export function subPos(s, t) { return SUBP[SC[sceneIndex(t)].id] || [140, 990]; }

export function events() {
  const E = [];
  for (const v of ST.vo) E.push({ t: v.t, type: 'vo', id: v.id });
  const sc = id => SC.find(s => s.id === id);
  for (const s of SC) E.push({ t: s.t0, type: 'scene', id: s.id, cut: s.kind === 'cut' });
  // ambience beds
  const amb = (kind, a, b, g = 1) => E.push({ type: 'amb', kind, t0: a, t1: b, gain: g });
  amb('water', 0, sc('songshu').t0); amb('water', sc('scroll').t0, sc('scroll').t1, .6);
  amb('room', sc('songshu').t0, sc('scroll').t0, .7); amb('room', sc('lift').t0, sc('lift').t0 + 2.6, .4);
  amb('wind', sc('home').t0, sc('spring').t0); amb('birds', sc('spring').t0, sc('moon').t0); amb('insects', sc('moon').t0, sc('fire').t0);
  amb('fire', sc('fire').t0 + 1.4, sc('fire').t0 + 10, 1); amb('wind', sc('autumn').t0, sc('village').t0, .7); amb('insects', sc('village').t0, sc('rooms').t0, .8);
  amb('city', sc('rooms').t0, sc('fence').t0, .8); amb('rain', sc('help').t0, sc('fence').t0, 1); amb('birds', sc('keep').t0, sc('tea').t0, .6);
  amb('water', sc('fence').t0, ST.dur, .7); amb('wind', sc('fence').t0 + 6, ST.dur, .5);
  // foley
  for (let k = 0; k * 2.3 < sc('title').t1; k++) E.push({ t: 1.2 + k * 2.3, type: 'oar', gain: k * 2.3 > sc('title').t0 ? 1 : .6 });
  E.push({ t: sc('title').t0 + .8, type: 'brush', gain: .8 }); E.push({ t: sc('title').t0 + 3.4, type: 'seal', gain: 1 });
  E.push({ t: sc('yin').t0, type: 'thud', gain: 1 });
  E.push({ t: vt('L07', .2), type: 'jar', gain: .8 });
  E.push({ t: vt('L09'), type: 'brush', gain: .8 });
  E.push({ t: vt('L14', .25), type: 'brush', gain: .7 });
  const L0 = sc('lift').t0;
  E.push({ type: 'silence', t0: L0 + .05, t1: L0 + 2.38 }); E.push({ t: L0 + 2.4, type: 'thud', gain: .9 }); E.push({ t: L0 + 2.7, type: 'lift', gain: 1 });
  E.push({ t: vt('L17', .55), type: 'brush', gain: .7 });
  E.push({ type: 'silence', t0: sc('weeds').t0 + .3, t1: sc('weeds').t0 + 1.0 });
  for (let k = 0; V.L19.t + k + .45 < sc('moon').t0; k++) E.push({ t: V.L19.t + k + .45, type: 'hoe', gain: .9 });
  for (let k = 0; sc('moon').t0 + k * .5 < sc('moon').t1; k++) E.push({ t: sc('moon').t0 + k * .5, type: 'step', gain: .5 });
  E.push({ t: sc('fire').t0 + 6.5, type: 'collapse', gain: 1 }); E.push({ t: sc('fire').t0 + 7.2, type: 'brush', gain: .6 });
  E.push({ t: vt('L22', .3), type: 'brush', gain: .7 }); E.push({ t: vt('L23', .3), type: 'brush', gain: .6 });
  for (const k of [.6, 2.4, 4.1]) E.push({ t: sc('village').t0 + k, type: 'cup', gain: .6 });
  for (let k = 0; sc('rooms').t0 + k < sc('fork').t0; k++) E.push({ t: sc('rooms').t0 + k, type: 'tick', gain: .35 });
  for (let k = 0; sc('fork').t0 + k * .5 < sc('fork').t1; k++) E.push({ t: sc('fork').t0 + k * .5, type: 'step', gain: .45 });
  const L32 = V.L32; [.46, .58, .72, .82, .96].forEach(k => E.push({ t: L32.t + L32.dur * k, type: 'word', gain: 1 }));
  for (const [a, b] of [[.3, .48], [.48, .62], [.82, .97]]) E.push({ t0: vt('L35', a), t1: vt('L35', b), type: 'pen', gain: .7 });
  for (let k = 0; sc('keep').t0 + k * .5 < sc('tea').t0; k++) E.push({ t: sc('keep').t0 + k * .5, type: 'step', gain: .35 });
  E.push({ t: sc('tea').t0 + .6, type: 'pour', gain: .7 });
  E.push({ t0: sc('fence').t0 + 8, t1: vt('L39', .1), type: 'pour', gain: .45 });
  E.push({ t: sc('fence').t1 - 6.5, type: 'seal', gain: 1 });
  return E;
}
