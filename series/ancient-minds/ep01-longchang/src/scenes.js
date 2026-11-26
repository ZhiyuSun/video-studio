// Scenes of 龙场. Each scene draws into one layer set A (wet / dry / col) in screen space, given a local time and parameters.
// Shared by the storyboard (board.js) and the film (film.js).
import { mk, draw, mass, blot, TONE } from './ink.js';
import { ridgeFn, mountainLayer, cun, cliff, pine, reed, ripple } from './land.js';
import { hero, POSE, mixPose, setCap, VERM } from './hero.js';
import { mulberry, clamp, lerp, vnoise, ss } from '/core/lib.js';

// ---------- poses (scholar: no sword, no sheath) ----------
const noSword = p => ({ ...p, sheath: null, sword: null, rib: [-1, .08, 0] });
export const P = {
  stand: noSword(POSE.stand),
  walk1: noSword(POSE.walk1),
  walk2: noSword(POSE.walk2),
  // seated on the ground, knees drawn up, hands on knees (side view)
  sit: {
    v: 'side', H: [-4, -18], C: [-1, -47], Hd: [1, -55], tilt: .02,
    aF: [[0, -46], [5, -33], [12, -24]], aB: null,
    lF: [[-3, -18], [10, -6], [12, -1]], lB: [[-5, -18], [-14, -4], [-16, -1]],
    hemF: [16, -1], hemB: [-20, -1], flare: 0, sheath: null, sword: null, rib: [-1, .1, 0],
  },
  // seated, head bowed (the stone coffin)
  sitBow: {
    v: 'side', H: [-2, -20], C: [3, -47], Hd: [8, -52], tilt: .35,
    aF: [[4, -46], [10, -34], [15, -26]], aB: null,
    lF: [[0, -20], [14, -27], [17, -2]], lB: [[-2, -20], [11, -24], [13, -1]],
    hemF: [19, -3], hemB: [-15, -2], flare: .2, sheath: null, sword: null, rib: [-1, .1, 0],
  },
  // axe raised overhead (side view)
  chopUp: {
    v: 'side', H: [-1, -45], C: [-2, -74], Hd: [0, -82], tilt: .06,
    aF: [[-1, -73], [-3, -88], [-6, -101]], aB: [[-2, -73], [-5, -87], [-8, -100]],
    lF: [[1, -45], [7, -23], [12, 0]], lB: [[-1, -45], [-6, -23], [-11, 0]],
    hemF: [13, -6], hemB: [-15, -5.5], flare: .4, sheath: null, sword: null, rib: [-1, .1, 0],
  },
  // axe down, blade in the log
  chopDown: {
    v: 'side', H: [2, -40], C: [10, -66], Hd: [15, -73], tilt: -.25,
    aF: [[10, -65], [17, -54], [25, -45]], aB: [[9, -65], [15, -55], [23, -46]],
    lF: [[3, -40], [11, -21], [14, 0]], lB: [[1, -40], [-6, -21], [-11, 0]],
    hemF: [16, -6], hemB: [-15, -5], flare: .4, sheath: null, sword: null, rib: [-1, .1, 0],
  },
  // seated at a desk, front view (modern)
  desk: {
    v: 'front', H: [0, -30], C: [0, -60], Hd: [0, -68], tilt: 0,
    aL: [[-8.5, -59], [-12, -46], [-5, -40]], aR: [[8.5, -59], [12, -46], [5, -40]],
    lL: [[-3, -30], [-4, -16], [-4.5, 0]], lR: [[3, -30], [4, -16], [4.5, 0]],
    hemL: [-12, -26], hemR: [12, -26], sheath: null, rib: [0, 1, 0],
  },
};
export const walkPose = ph => mixPose(P.walk1, P.walk2, .5 - .5 * Math.cos(ph * Math.PI * 2));
export function figure(L, pose, X) { setCap(X.cap || 'scholar'); return hero(L, pose, X); }

// ---------- small pieces ----------
export function rain(L, seed, n, tone = .14, t = 0, box = [0, 0, 1920, 1080]) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const x = box[0] + R() * (box[2] - box[0]), y0 = box[1] + ((R() * (box[3] - box[1]) + t * 900 * (.8 + R() * .4)) % (box[3] - box[1])), len = 40 + R() * 70;
    draw(L, mk([[x, y0], [x - len * .22, y0 + len]], { w: 1.4 + R() * 1.2, tone: tone * (.6 + R() * .8), dry: .7, prof: 'tip', seed: seed * 1000 + i }));
  }
}
export function stove(L, x, y, s, t = 0, flame = 1, seed = 3) {
  // three stones, a pot, a vermilion ember, steam rising into mist
  const R = mulberry(seed);
  for (let i = 0; i < 3; i++) { const sx = x + (i - 1) * 34 * s; mass(L.wet, [[sx - 14 * s, y], [sx - 11 * s, y - 20 * s], [sx + 10 * s, y - 22 * s], [sx + 14 * s, y]], .5, 2 * s, seed + i); }
  // pot: dark body + rim
  mass(L.wet, [[x - 46 * s, y - 24 * s], [x - 40 * s, y - 58 * s], [x + 40 * s, y - 58 * s], [x + 46 * s, y - 24 * s], [x + 20 * s, y - 14 * s], [x - 20 * s, y - 14 * s]], .52, 3 * s, seed + 9, [0, y - 60 * s, 0, y - 14 * s, .7, 1.1]);
  draw(L, mk([[x - 50 * s, y - 58 * s], [x, y - 62 * s], [x + 50 * s, y - 58 * s]], { w: 5 * s, tone: TONE.jiao, dry: .35, wet: .2, prof: 'tip', seed: seed * 7 }));
  // ember: a few vermilion tongues and sparks, flickering (never a solid cone)
  if (flame > 0) {
    const C = L.col; C.save(); C.fillStyle = `rgb(${VERM.join(',')})`;
    for (let i = 0; i < 5; i++) {
      const fx = x + (i - 2) * 9 * s + Math.sin(t * 3 + i) * 2 * s, h = (8 + 9 * vnoise(t * 6 + i * 3.1)) * s, wd = (3 + 2 * vnoise(i * 7.7)) * s;
      C.globalAlpha = (.55 + .35 * vnoise(t * 9 + i)) * flame;
      C.beginPath(); C.moveTo(fx - wd, y - 3 * s); C.quadraticCurveTo(fx - wd * .6, y - h * .55, fx + Math.sin(t * 7 + i) * 2.5 * s, y - h); C.quadraticCurveTo(fx + wd * .7, y - h * .45, fx + wd, y - 3 * s); C.fill();
    }
    for (let i = 0; i < 4; i++) { const ph = (t * .9 + i * .27) % 1; C.globalAlpha = (1 - ph) * .8 * flame; C.beginPath(); C.arc(x + (vnoise(i * 3.3 + t * .2) - .5) * 40 * s, y - 10 * s - ph * 40 * s, 1.3 * s, 0, 7); C.fill(); }
    C.restore();
  }
  // steam: pale wet wisps
  for (let i = 0; i < 4; i++) {
    const ph = (t * .35 + i / 4) % 1, sx = x + (R() - .5) * 40 * s, h = 60 + ph * 180;
    const pts = []; for (let k = 0; k <= 5; k++) { const u = k / 5; pts.push([sx + Math.sin(u * 4 + i + t) * 16 * s * u, y - 64 * s - u * h * s]); }
    draw(L, mk(pts, { w: 16 * s, tone: .12 * (1 - ph), dry: .1, wet: 1, prof: 'lens', seed: seed * 50 + i }));
  }
}
export function logAndAxe(L, x, y, s, down, seed = 4, hand = null) {
  // chopping block + log
  mass(L.wet, [[x - 40 * s, y], [x - 38 * s, y - 34 * s], [x + 38 * s, y - 36 * s], [x + 40 * s, y]], .3, 2 * s, seed, [0, y - 36 * s, 0, y, 1.1, .5]);
  draw(L, mk([[x - 40 * s, y - 34 * s], [x + 40 * s, y - 36 * s]], { w: 4 * s, tone: TONE.nong, dry: .5, prof: 'tip', seed: seed * 3 }));
  draw(L, mk([[x - 42 * s, y - 2], [x - 40 * s, y - 34 * s]], { w: 3 * s, tone: TONE.nong, dry: .5, prof: 'tip', seed: seed * 5 }));
  draw(L, mk([[x + 40 * s, y - 2], [x + 39 * s, y - 36 * s]], { w: 3 * s, tone: TONE.nong, dry: .5, prof: 'tip', seed: seed * 6 }));
  // split wood pieces
  for (let i = 0; i < 4; i++) draw(L, mk([[x + 70 * s + i * 22 * s, y], [x + 80 * s + i * 22 * s, y - 26 * s]], { w: 9 * s, tone: .45, dry: .5, wet: .5, prof: 'even', seed: seed * 11 + i }));
  if (hand) {   // axe: haft from hands + head
    const [hx, hy, ang] = hand, d = [Math.cos(ang), Math.sin(ang)], tip = [hx + d[0] * 70 * s, hy + d[1] * 70 * s];
    draw(L, mk([[hx - d[0] * 10 * s, hy - d[1] * 10 * s], tip], { w: 4 * s, tone: TONE.nong, dry: .3, prof: 'even', seed: seed * 13 }));
    const n = [-d[1], d[0]];
    mass(L.wet, [[tip[0] - n[0] * 4 * s, tip[1] - n[1] * 4 * s], [tip[0] + n[0] * 20 * s - d[0] * 6 * s, tip[1] + n[1] * 20 * s - d[1] * 6 * s], [tip[0] + n[0] * 22 * s + d[0] * 8 * s, tip[1] + n[1] * 22 * s + d[1] * 8 * s], [tip[0] + d[0] * 6 * s, tip[1] + d[1] * 6 * s]], .85, 1, seed);
  }
}
// palace roof (pale, a memory): straight ridge with end ornaments, slopes falling to a concave eave line whose corners flick up
export function eaves(L, x, y, w, s, am = 1, seed = 8) {
  const rx0 = x + w * .2, rx1 = x + w * .8, eY = y + 70 * s;
  draw(L, mk([[rx0, y], [rx1, y]], { w: 7 * s, tone: .6, dry: .4, wet: .3, prof: 'even', seed }), 1, am);
  for (const [ex, d] of [[rx0, -1], [rx1, 1]]) draw(L, mk([[ex, y + 2 * s], [ex + d * 6 * s, y - 14 * s], [ex + d * 14 * s, y - 16 * s]], { w: 5 * s, tone: .6, dry: .4, prof: 'tip', seed: seed + (d > 0 ? 3 : 5) }), 1, am);
  const eave = [[x - 10 * s, eY - 26 * s], [x + w * .08, eY - 4 * s], [x + w * .5, eY + 6 * s], [x + w * .92, eY - 4 * s], [x + w + 10 * s, eY - 26 * s]];
  mass(L.wet, [[rx0, y], [rx1, y], ...eave.slice().reverse()], .2 * am, 3, seed, [0, y, 0, eY, .6, 1.2]);
  draw(L, mk(eave, { w: 6 * s, tone: .7, dry: .45, wet: .3, prof: 'brush', seed: seed * 3 }), 1, am);
  for (let i = 1; i < 30; i++) { const u = i / 30, px = lerp(x + w * .06, x + w * .94, u), top = lerp(rx0, rx1, u); draw(L, mk([[lerp(px, top, .6), y + 8 * s], [px, eY - 6 * s + Math.pow(Math.abs(u - .5) * 2, 2) * -14 * s]], { w: 1.6 * s, tone: .32, dry: .75, prof: 'tip', seed: seed * 100 + i }), 1, am * .8); }
  // wall below, vanishing into mist
  mass(L.wet, [[x + w * .1, eY + 6 * s], [x + w * .9, eY + 6 * s], [x + w * .9, eY + 160 * s], [x + w * .1, eY + 160 * s]], .12 * am, 4, seed + 2, [0, eY, 0, eY + 160 * s, 1, 0]);
  for (let i = 0; i < 6; i++) { const px = x + w * (.14 + i * .144); draw(L, mk([[px, eY + 8 * s], [px, eY + 110 * s]], { w: 7 * s, tone: .3, dry: .5, wet: .6, prof: 'cone', seed: seed * 200 + i }), 1, am * .8); }
}
// stone coffin: a long block drawn with outline, axe-cut texture and wash
export function coffin(L, x, y, w, h, s = 1, seed = 12) {
  const top = [[x, y], [x + w * .08, y - h * .35], [x + w, y - h * .42], [x + w * .94, y - h * .02]];
  mass(L.wet, [[x, y], ...top.slice(1), [x + w * .94, y + h * .6], [x + w * .02, y + h * .62]], .22, 3 * s, seed, [0, y - h * .4, 0, y + h * .6, .7, 1.2]);
  const out = (pts, w2, sd) => draw(L, mk(pts, { w: w2 * s, tone: .9, dry: .5, wet: .25, prof: 'brush', seed: sd }));
  out([[x, y], [x + w * .08, y - h * .35], [x + w * .55, y - h * .4], [x + w, y - h * .42]], 4.5, seed * 3);
  out([[x, y], [x + w * .5, y - h * .02], [x + w * .94, y - h * .02], [x + w, y - h * .42]], 4, seed * 5);
  out([[x, y], [x + w * .01, y + h * .3], [x + w * .02, y + h * .62]], 4, seed * 7);
  out([[x + w * .94, y - h * .02], [x + w * .94, y + h * .6]], 4, seed * 9);
  const R = mulberry(seed);
  for (let i = 0; i < 14; i++) { const px = x + 30 * s + R() * (w - 60 * s), py = y + 10 * s + R() * h * .45; draw(L, mk([[px, py], [px - 14 * s, py + 12 * s], [px - 18 * s, py + 26 * s]], { w: (6 + R() * 6) * s, tone: .6, dry: .6, wet: .4, prof: 'nail', seed: seed * 50 + i }), 1, .8); }
  draw(L, mk([[x - 30 * s, y + h * .64], [x + w * .5, y + h * .66], [x + w + 40 * s, y + h * .62]], { w: 14 * s, tone: .3, dry: .4, wet: .9, prof: 'lens', seed: seed * 70 }));
}
// lying sick servant (side, a pale mass under a cover, a head)
export function lying(L, x, y, s, seed = 20) {
  mass(L.wet, [[x - 60 * s, y], [x - 58 * s, y - 16 * s], [x - 10 * s, y - 22 * s], [x + 50 * s, y - 18 * s], [x + 62 * s, y]], .2, 2 * s, seed, [0, y - 22 * s, 0, y, .8, 1.2]);
  draw(L, mk([[x - 58 * s, y - 16 * s], [x - 10 * s, y - 23 * s], [x + 50 * s, y - 19 * s], [x + 62 * s, y - 2 * s]], { w: 5 * s, tone: .6, darkDir: [0, -1], side: .8, brWet: true, body: .2, dry: .45, wet: .9, prof: 'robe', seed: seed * 3 }));
  blot(L.wet, x - 70 * s, y - 12 * s, 9 * s, .3, 0, .8, seed);
  draw(L, mk([[x - 78 * s, y - 16 * s], [x - 70 * s, y - 22 * s], [x - 62 * s, y - 16 * s]], { w: 3 * s, tone: TONE.jiao, dry: .4, prof: 'tip', seed: seed * 5 }));
  draw(L, mk([[x - 100 * s, y + 2], [x + 80 * s, y + 2]], { w: 3 * s, tone: .35, dry: .6, prof: 'tip', seed: seed * 7 }));
}
// a modern building, side elevation: pale wash body + window grid left as paper + dark edges
export function tower(L, x, y, w, h, s = 1, seed = 30, lit = null) {
  mass(L.wet, [[x, y], [x, y - h], [x + w, y - h], [x + w, y]], .26, 2, seed, [x, 0, x + w, 0, .8, 1.15]);
  draw(L, mk([[x, y], [x, y - h]], { w: 5 * s, tone: .85, dry: .4, wet: .2, prof: 'even', seed: seed * 3 }));
  draw(L, mk([[x + w, y], [x + w, y - h]], { w: 4 * s, tone: .75, dry: .5, wet: .2, prof: 'even', seed: seed * 5 }));
  draw(L, mk([[x - 6, y - h], [x + w + 6, y - h]], { w: 6 * s, tone: .9, dry: .4, wet: .2, prof: 'even', seed: seed * 7 }));
  const cols = Math.max(2, Math.round(w / (46 * s))), rows = Math.round(h / (62 * s)), cw = w / cols, rh = h / rows;
  for (const k of ['wet', 'dry']) {
    const c = L[k]; c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      if (lit && i === lit[0] && j === lit[1]) continue;
      const v = vnoise(seed * 3.3 + i * 1.7 + j * 2.9); c.globalAlpha = .55 + .4 * v;
      c.fillRect(x + i * cw + cw * .22, y - h + j * rh + rh * .22, cw * .56, rh * .5);
    }
    c.restore();
  }
  if (lit) {   // the one window we look into: fully cleared, slightly bigger
    const wx = x + lit[0] * cw + cw * .12, wy = y - h + lit[1] * rh + rh * .12;
    for (const k of ['wet', 'dry']) { const c = L[k]; c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.fillRect(wx, wy, cw * .76, rh * .7); c.restore(); }
    draw(L, mk([[wx, wy + rh * .7], [wx + cw * .76, wy + rh * .7]], { w: 3 * s, tone: .8, dry: .4, prof: 'even', seed: seed * 9 }));
    return [wx, wy, cw * .76, rh * .7];
  }
}

// ---------- the range of mountains used by shots 1 and 13 ----------
let RANGE = null;
export function rangeLayers() {
  if (RANGE) return RANGE;
  const far = ridgeFn([[300, 360, 160], [700, 420, 200], [1150, 380, 180], [1600, 460, 220], [1900, 300, 160]], 640, 2, 26);
  const midL = ridgeFn([[-60, 760, 260], [260, 620, 200], [520, 380, 160]], 1020, 4, 40);
  const midR = ridgeFn([[1500, 520, 200], [1760, 820, 260], [2050, 700, 220]], 1020, 6, 40);
  RANGE = {
    far, midL, midR,
    farC: mountainLayer({ W: 1920, H: 1080, ridge: far, depth: 260, tone: .16, rim: .55, rimW: 22, mist: .9, seed: 2 }),
    midLC: mountainLayer({ W: 1920, H: 1080, ridge: midL, depth: 620, tone: .62, rim: .95, rimW: 22, mist: .55, seed: 4, xmask: x => Math.max(0, Math.min(1, (900 - x) / 160)) }),
    midRC: mountainLayer({ W: 1920, H: 1080, ridge: midR, depth: 620, tone: .58, rim: .95, rimW: 22, mist: .55, seed: 6, xmask: x => Math.max(0, Math.min(1, (x - 1150) / 160)) }),
  };
  return RANGE;
}
// Draws the range; returns nothing. cam: {s, tx, ty} applied to the cached layers (scale about frame centre)
export function drawRange(A, cam = { s: 1, tx: 0, ty: 0 }, o = {}) {
  const R = rangeLayers();
  const put = (cv, par) => { const s = 1 + (cam.s - 1) * par; A.cw.save(); A.cw.setTransform(s, 0, 0, s, 960 - 960 * s + cam.tx * par, 540 - 540 * s + cam.ty * par); A.cw.globalAlpha = o.am ?? 1; A.cw.drawImage(cv, 0, 0); A.cw.restore(); };
  put(R.farC, .4);
  put(R.midLC, 1); put(R.midRC, 1);
  const s = cam.s, f = (x, y) => [960 + (x - 960) * s + cam.tx, 540 + (y - 540) * s + cam.ty];
  const L = A.ink;
  for (const c of [L.wet, L.dry, L.col]) c.setTransform(s, 0, 0, s, 960 - 960 * s + cam.tx, 540 - 540 * s + cam.ty);
  cun(L, { x0: 0, x1: 560, ridge: R.midL, tone: .36, cun: 1.4, moss: 1.2, seed: 4, cunLen: 1.3 });
  cun(L, { x0: 1380, x1: 1920, ridge: R.midR, tone: .34, cun: 1.4, moss: 1.2, seed: 6, cunLen: 1.3 });
  pine(L, 380, R.midL(380) + 8, 1.0, 5, o.t || 0, .4, 1);
  pine(L, 1560, R.midR(1560) + 8, .8, 9, o.t || 0, .4, -1);
  // path: one long pale dry stroke winding to the far gap
  draw(L, mk([[640, 1100], [760, 980], [900, 930], [1010, 880], [1060, 820]], { w: 26, tone: .2, dry: .65, wet: .5, prof: 'cone', seed: 77 }));
  for (const c of [L.wet, L.dry, L.col]) c.setTransform(1, 0, 0, 1, 0, 0);
  return f;
}

// bamboo: segmented stem (gaps at the nodes), node marks, a few twigs and 个/介-shaped leaf clusters
export function bamboo(L, x, y, h, s, seed = 40, lean = 0, tone = .85, t = 0, wind = 0) {
  const R = mulberry(seed), nSeg = 6 + Math.floor(R() * 3), sl = h / nSeg;
  const X = u => x + lean * h * u * u + Math.sin(t * 1.1 + seed) * wind * 6 * u * u;
  for (let i = 0; i < nSeg; i++) {
    const y0 = y - i * sl - 3 * s, y1 = y - (i + 1) * sl + 4 * s, u0 = i / nSeg, u1 = (i + 1) / nSeg;
    draw(L, mk([[X(u0), y0], [X((u0 + u1) / 2) + (R() - .5) * 2, (y0 + y1) / 2], [X(u1), y1]], { w: (10 - i * .7) * s, tone: tone * (1 - i * .04), dry: .35, wet: .45, prof: 'press', rough: .05, seed: seed * 50 + i }));
    if (i > 0) draw(L, mk([[X(u0) - 7 * s, y0 + 2 * s], [X(u0), y0 - 1 * s], [X(u0) + 7 * s, y0 + 2 * s]], { w: 2.4 * s, tone, dry: .4, prof: 'tip', seed: seed * 70 + i }));
  }
  const clusters = 2 + Math.floor(R() * 2);
  for (let c = 0; c < clusters; c++) {
    const u = .55 + R() * .4, cx = X(u), cy = y - u * h, side = R() < .5 ? -1 : 1, tw = 30 + R() * 30;
    const tx = cx + side * tw * s, ty = cy - 10 * s;
    draw(L, mk([[cx, cy], [tx, ty]], { w: 2 * s, tone, dry: .45, prof: 'tip', seed: seed * 90 + c }));
    const n = 3 + Math.floor(R() * 3);
    for (let k = 0; k < n; k++) {
      const a = (side > 0 ? .35 : Math.PI - .35) + (k - (n - 1) / 2) * .45 + Math.sin(t * 1.4 + k + c) * wind * .08, len = (48 + R() * 30) * s;
      const p1 = [tx + Math.cos(a) * len, ty + Math.sin(a) * len + len * .25];
      draw(L, mk([[tx, ty], [(tx + p1[0]) / 2, (ty + p1[1]) / 2 - 3 * s], p1], { w: 10 * s, tone: tone * (.8 + R() * .25), dry: .3, wet: .5, prof: 'nail', seed: seed * 300 + c * 20 + k }));
    }
  }
}
// thatched hut (草堂): two posts, a heavy thatch roof mass with dry strokes, a low platform
export function hut(L, x, y, w, s, seed = 50) {
  const top = y - 230 * s, eave = y - 150 * s;
  mass(L.wet, [[x - 30 * s, eave], [x + w * .25, top], [x + w * .75, top - 6 * s], [x + w + 30 * s, eave], [x + w + 10 * s, eave + 16 * s], [x - 10 * s, eave + 16 * s]], .4, 4 * s, seed, [0, top, 0, eave + 16 * s, .7, 1.1]);
  const R = mulberry(seed);
  for (let i = 0; i < 26; i++) { const u = R(), px = lerp(x - 20 * s, x + w + 20 * s, u), py = lerp(top, eave, R() * .6 + .3); draw(L, mk([[px, py], [px + (u - .5) * 30 * s, py + 26 * s]], { w: 2 * s, tone: .7, dry: .7, prof: 'tip', seed: seed * 10 + i })); }
  draw(L, mk([[x - 34 * s, eave + 12 * s], [x + w * .5, eave + 18 * s], [x + w + 34 * s, eave + 12 * s]], { w: 6 * s, tone: TONE.jiao, dry: .45, wet: .2, prof: 'tip', seed: seed * 3 }));
  for (const px of [x + 10 * s, x + w - 10 * s]) draw(L, mk([[px, eave + 16 * s], [px + 1, y]], { w: 6 * s, tone: .75, dry: .45, wet: .3, prof: 'even', seed: seed * 5 + px }));
  draw(L, mk([[x - 60 * s, y + 2], [x + w + 60 * s, y + 4]], { w: 8 * s, tone: .45, dry: .5, wet: .6, prof: 'lens', seed: seed * 7 }));
}
// tangled thoughts: loose looping strokes around a point; p = how much is drawn, am = opacity
export function tangle(L, x, y, r, n, seed, p = 1, am = 1, t = 0) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const pts = []; let a = R() * 6.28, rr = r * (.4 + R() * .6), cx = x + (R() - .5) * r * .6, cy = y + (R() - .5) * r * .4;
    for (let k = 0; k < 9; k++) { a += .9 + R() * .8; rr *= .92 + R() * .16; pts.push([cx + Math.cos(a + t * .3) * rr, cy + Math.sin(a + t * .3) * rr * .7]); }
    draw(L, mk(pts, { w: 2.6, tone: .8, dry: .5, wet: .2, prof: 'brush', seed: seed * 100 + i }), clamp(p * n - i), am);
  }
}
