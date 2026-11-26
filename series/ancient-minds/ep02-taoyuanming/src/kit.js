// Shared drawing kit for 归去来: inscriptions, subtitles, seals, cached mountains and the props of the film.
import { mk, draw, mass, blot, TONE } from './ink.js';
import { ridgeFn, mountainLayer, cun, pine, reed, ripple } from './land.js';
import { hero, VERM } from './figure.js';
import { clamp, lerp, mulberry, vnoise, ss } from '/core/lib.js';
export { mk, draw, mass, blot, TONE, ridgeFn, cun, pine, reed, ripple, hero, VERM, clamp, lerp, mulberry, vnoise, ss };

// ---------- cached mountain layers (per-pixel, expensive: built once per key) ----------
const MC = {};
export function mtn(key, o) {
  if (!MC[key]) MC[key] = mountainLayer({ ...o, W: o.W || 1920, H: o.H || 1080, ridge: ridgeFn(o.peaks, o.base, o.seed || 1, o.rough ?? 24) });
  return MC[key];
}
export const ridgeOf = o => ridgeFn(o.peaks, o.base, o.seed || 1, o.rough ?? 24);

// ---------- calligraphy inscription: vertical columns, right to left, written character by character ----------
// cols: array of strings; x = right-most column centre; p ∈ [0,1] progress over all characters
export function inscribe(A, cols, x, y, size, p = 1, o = {}) {
  if (p <= 0) return;
  const gap = o.gap ?? size * 1.25, lead = o.lead ?? size * 1.08, font = o.font || 'MaShanZheng';
  const total = cols.reduce((a, c) => a + c.length, 0); let k = 0;
  for (let ci = 0; ci < cols.length; ci++) {
    const cx = x - ci * gap;
    [...cols[ci]].forEach((ch, i) => {
      const q = clamp(p * total * 1.0 - k); k++;
      if (q <= 0) return;
      const cy = y + i * lead + (o.stagger ? ci * o.stagger : 0);
      for (const [c, a] of [[A.cw, (1 - q) * .7 + .12], [A.cd, q * (o.am ?? .92)]]) {
        c.save(); if (!o.world) c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalAlpha = clamp(a); c.fillStyle = '#000'; c.font = `${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(ch, cx, cy); c.restore();
      }
    });
  }
}

// ---------- subtitles as colophons (题跋): WenKai, ink, no box, vermilion square at the line start ----------
export function wrap(text, n = 17) {
  if (text.length <= n + 2) return [text];
  // break near the middle, after punctuation if possible
  const mid = Math.ceil(text.length / 2); let best = mid, bd = 99;
  for (let i = 4; i < text.length - 3; i++) if ('，、：；。'.includes(text[i - 1]) && Math.abs(i - mid) < bd) { bd = Math.abs(i - mid); best = i; }
  if (bd > 6) best = mid;
  return [text.slice(0, best), text.slice(best)];
}
export function subtitle(A, text, x, y, a = 1, o = {}) {
  if (a <= 0) return;
  const size = o.size || 40, lines = wrap(text, o.n || 17);
  const wetK = clamp(1 - a) * .8;
  for (const [ctx, k] of [[A.cw, wetK], [A.cd, 1 - wetK * .6]]) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a * k * .9); ctx.fillStyle = '#000';
    ctx.font = `${size}px WenKai`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '2px';
    lines.forEach((ln, i) => ctx.fillText(ln, x + size * .7, y + i * size * 1.42));
    ctx.restore();
  }
  const s = size * .3, cc = A.cc;
  cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalAlpha = clamp(a * .9); cc.fillStyle = `rgb(${VERM.join(',')})`;
  cc.fillRect(x, y - size * .36 - s / 2, s, s); cc.restore();
}

// ---------- vermilion 白文 seal with characters knocked out ----------
export function seal(c, x, y, S, am = 1, text = '陶', seed = 3) {
  if (am <= 0) return;
  c.save(); c.translate(x, y);
  const jit = S * .018; c.beginPath();
  for (let i = 0; i < 28; i++) {
    const t = i / 28 * 4, side = Math.floor(t), u = t - side;
    let px, py; if (side === 0) { px = u * S; py = 0; } else if (side === 1) { px = S; py = u * S; } else if (side === 2) { px = S - u * S; py = S; } else { px = 0; py = S - u * S; }
    px += (vnoise(seed + i * 1.3) - .5) * jit * 2; py += (vnoise(seed + 40 + i * 1.3) - .5) * jit * 2;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath(); c.fillStyle = `rgba(${VERM.join(',')},${clamp(am)})`; c.fill();
  c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const ch = [...text];
  if (ch.length === 1) { c.font = `${S * .78}px MaShanZheng`; c.fillText(ch[0], S / 2, S * .53); }
  else { c.font = `${S * .46}px MaShanZheng`; ch.forEach((k, i) => c.fillText(k, S / 2, S * (.29 + i * .45))); }
  for (let i = 0; i < 60; i++) { const a = vnoise(seed + i * 3.7), b = vnoise(seed + 91 + i * 2.9); c.globalAlpha = .5 + .5 * vnoise(i * 1.1); c.beginPath(); c.arc(a * S, b * S, S * (.004 + .012 * vnoise(i * 5.3)), 0, 7); c.fill(); }
  c.restore();
}

// ---------- figures ----------
import { POSE } from './figure.js';
const B = p => ({ ...p, sheath: null, sword: null, rib: null });
export const P = {
  stand: B(POSE.stand), walk1: B(POSE.walk1), walk2: B(POSE.walk2), front: B(POSE.front), back: B(POSE.back),
  sit: B({ v: 'side', H: [0, -16], C: [2, -46], Hd: [4.5, -54], tilt: .02,
    aF: [[3, -45], [11, -33], [20, -31]], aB: null,
    lF: [[1, -16], [14, -5], [-6, -1]], lB: [[-1, -16], [12, -4], [-8, -1]],
    hemF: [16, -2], hemB: [-12, -1.5], flare: .1 }),
  sitChair: B({ v: 'side', H: [0, -40], C: [1.5, -69], Hd: [3.5, -77], tilt: .02,
    aF: [[2.5, -68], [9, -55], [19, -50]], aB: null,
    lF: [[1, -40], [17, -40], [18, -1]], lB: [[-1, -40], [15, -39], [14, 0]],
    hemF: [18, -36], hemB: [-10, -36], flare: 0 }),
  hoeUp: B({ v: 'side', H: [0, -45], C: [6, -72], Hd: [9.5, -80], tilt: -.08,
    aF: [[6, -71], [12, -80], [14, -92]], aB: [[5, -71], [11, -78], [13, -88]],
    lF: [[1, -45], [9, -22], [13, 0]], lB: [[-1, -45], [-6, -22], [-10, 0]],
    hemF: [13, -8], hemB: [-15, -8], flare: .3 }),
  hoeDown: B({ v: 'side', H: [0, -42], C: [11, -64], Hd: [16.5, -70], tilt: -.32,
    aF: [[11, -63], [19, -52], [26, -44]], aB: [[10, -63], [17, -54], [23, -47]],
    lF: [[1, -42], [10, -21], [13, 0]], lB: [[-1, -42], [-6, -21], [-10, 0]],
    hemF: [14, -8], hemB: [-15, -8], flare: .3 }),
  bend: B({ v: 'side', H: [0, -43], C: [13, -63], Hd: [19, -67], tilt: -.4,
    aF: [[13, -62], [20, -51], [25, -42]], aB: null,
    lF: [[1, -43], [6, -21], [8, 0]], lB: [[-1, -43], [-4, -21], [-7, 0]],
    hemF: [12, -8], hemB: [-15, -7], flare: .2 }),
  bow: B({ v: 'side', H: [0, -45], C: [12, -67], Hd: [18, -70], tilt: -.5,
    aF: [[12, -66], [17, -58], [22, -60]], aB: null,
    lF: [[1, -45], [2, -22], [3, 0]], lB: [[-1, -45], [-2, -22], [-3, 0]],
    hemF: [11, -6], hemB: [-13, -6], flare: .1 }),
  carry1: null, carry2: null,
  sitFront: B({ v: 'front', H: [0, -18], C: [0, -47], Hd: [0, -55], tilt: 0,
    aL: [[-8.5, -46], [-12, -34], [-5, -28]], aR: [[8.5, -46], [12, -34], [5, -28]],
    lL: [[-3, -18], [-14, -9], [3, -3]], lR: [[3, -18], [14, -9], [-3, -3]],
    hemL: [-19, -3], hemR: [19, -3] }),
};
P.carry1 = { ...P.walk1, aF: [[2, -74], [10, -64], [13, -70]] };
P.carry2 = { ...P.walk2, aF: [[2, -75], [10, -65], [13, -71]] };
export const modern = p => ({ ...p, head: 'modern', hemF: p.hemF ? [p.hemF[0] * .7, Math.min(p.hemF[1], p.H[1] + 4)] : p.hemF, hemB: p.hemB ? [p.hemB[0] * .7, Math.min(p.hemB[1], p.H[1] + 4)] : p.hemB, hemL: p.hemL ? [p.hemL[0] * .75, Math.min(p.hemL[1], p.H[1] + 6)] : p.hemL, hemR: p.hemR ? [p.hemR[0] * .75, Math.min(p.hemR[1], p.H[1] + 6)] : p.hemR, flare: 0 });
// walking: pose on twos, alternating every `beat` seconds
export const walkPose = (t, beat = .5, m = false) => { const p = Math.floor(t / beat) % 2 ? P.walk2 : P.walk1; return m ? modern(p) : p; };
export const step = t => Math.floor(t * 12) / 12;        // figures on twos
// a point of a pose in screen space (for props held in a hand)
export function at(pt, X) { const s = X.s ?? 1, d = X.dir ?? 1, r = X.rot || 0; const a = pt[0] * s * d, b = pt[1] * s; return [X.x + a * Math.cos(r) - b * Math.sin(r), X.y + a * Math.sin(r) + b * Math.cos(r)]; }
export function fig(L, pose, X) { return hero(L, pose, { seed: 3, ...X }); }

// ---------- props ----------
const S = (L, pts, o) => draw(L, mk(pts, o));
// boat: a crescent hull from two loaded strokes + a pole
export function boat(L, x, y, s, seed = 1, pole = true, t = 0) {
  S(L, [[x - 120 * s, y - 14 * s], [x - 60 * s, y + 6 * s], [x + 40 * s, y + 8 * s], [x + 120 * s, y - 18 * s]], { w: 16 * s, tone: .7, darkDir: [0, 1], side: .85, brWet: true, body: .3, dry: .45, wet: .9, prof: 'robe', seed: seed * 7 });
  S(L, [[x - 112 * s, y - 15 * s], [x, y - 6 * s], [x + 114 * s, y - 19 * s]], { w: 3 * s, tone: .9, dry: .4, prof: 'tip', seed: seed * 7 + 1 });
  if (pole) { const a = Math.sin(t * 1.4) * .08; S(L, [[x + 40 * s, y - 120 * s], [x + 40 * s + Math.sin(.5 + a) * 210 * s, y - 120 * s + Math.cos(.5 + a) * 210 * s]], { w: 2.6 * s, tone: .85, dry: .35, prof: 'even', seed: seed * 7 + 2 }); }
}
// water streaks
export function streaks(L, n, x0, x1, y0, y1, seed = 1, tone = .3) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, R()), y = lerp(y0, y1, R()), l = 40 + R() * 160; S(L, [[x, y], [x + l * .5, y + (R() - .5) * 2], [x + l, y]], { w: 3 + R() * 3, tone, dry: .7, wet: .2, prof: 'tip', seed: seed * 100 + i }); }
}
// a traditional roof: curved eave line with upturned corners, tiles as dry verticals, a dark wash under the eave
export function roof(L, x0, x1, y, h, s = 1, seed = 2, tiles = true) {
  const mid = (x0 + x1) / 2, w = x1 - x0;
  mass(L.wet, [[x0 - 20 * s, y + 6 * s], [x0 + w * .12, y - h * .55], [mid, y - h], [x1 - w * .12, y - h * .55], [x1 + 20 * s, y + 6 * s], [mid, y + 4 * s]], .34, 6 * s, seed, [0, y - h, 0, y + 10, .7, 1.1]);
  S(L, [[x0 - 34 * s, y - 18 * s], [x0, y + 2 * s], [mid, y + 10 * s], [x1, y + 2 * s], [x1 + 34 * s, y - 18 * s]], { w: 9 * s, tone: .9, dry: .35, wet: .4, prof: 'press', seed: seed * 3 });
  S(L, [[x0 + w * .1, y - h * .62], [mid, y - h - 4 * s], [x1 - w * .1, y - h * .62]], { w: 7 * s, tone: .85, dry: .4, wet: .3, prof: 'press', seed: seed * 3 + 1 });
  if (tiles) { const R = mulberry(seed); const n = Math.round(w / (26 * s)); for (let i = 1; i < n; i++) { const xx = x0 + w * i / n, top = y - h * (1 - Math.pow(Math.abs(xx - mid) / (w / 2), 1.6) * .45) + 8 * s; S(L, [[xx, top], [xx + (xx - mid) * .03, y - 4 * s]], { w: 2.2 * s, tone: .6, dry: .75, prof: 'tip', seed: seed * 50 + i }, 1, .8 + R() * .2); } }
}
export function pillar(L, x, y0, y1, s = 1, seed = 3) {
  S(L, [[x, y0], [x + 1, (y0 + y1) / 2], [x, y1]], { w: 22 * s, tone: .55, darkDir: [1, 0], side: .8, brWet: true, body: .3, dry: .45, wet: .85, prof: 'even', seed });
}
// thatched cottage
export function cottage(L, x, y, s = 1, seed = 4, am = 1) {
  const w = 300 * s, h = 150 * s;
  // walls: two dry verticals + base line + a door
  S(L, [[x - w * .42, y - h * .55], [x - w * .42, y]], { w: 4 * s, tone: .7 * am, dry: .55, prof: 'tip', seed: seed * 5 });
  S(L, [[x + w * .42, y - h * .55], [x + w * .42, y]], { w: 4 * s, tone: .7 * am, dry: .55, prof: 'tip', seed: seed * 5 + 1 });
  S(L, [[x - w * .48, y], [x + w * .48, y + 2 * s]], { w: 5 * s, tone: .6 * am, dry: .6, prof: 'tip', seed: seed * 5 + 2 });
  S(L, [[x - w * .08, y - h * .45], [x - w * .08, y]], { w: 3 * s, tone: .75 * am, dry: .5, prof: 'tip', seed: seed * 5 + 3 });
  S(L, [[x + w * .1, y - h * .45], [x + w * .1, y]], { w: 3 * s, tone: .75 * am, dry: .5, prof: 'tip', seed: seed * 5 + 4 });
  mass(L.wet, [[x - w * .42, y - h * .55], [x + w * .42, y - h * .55], [x + w * .42, y], [x - w * .42, y]], .1 * am, 3 * s, seed + 7);
  mass(L.wet, [[x - w * .06, y - h * .44], [x + w * .08, y - h * .44], [x + w * .08, y], [x - w * .06, y]], .3 * am, 2 * s, seed + 8);
  // thatch: a pale wet mass + rough loaded strokes along the top
  mass(L.wet, [[x - w * .6, y - h * .5], [x - w * .3, y - h * 1.05], [x + w * .32, y - h * 1.08], [x + w * .62, y - h * .52], [x, y - h * .44]], .3 * am, 8 * s, seed, [0, y - h, 0, y - h * .4, 1, .55]);
  S(L, [[x - w * .62, y - h * .5], [x - w * .3, y - h * 1.04], [x + w * .32, y - h * 1.08], [x + w * .64, y - h * .5]], { w: 10 * s, tone: .75 * am, darkDir: [0, -1], side: .7, brWet: true, body: .3, dry: .6, wet: .7, prof: 'press', seed: seed * 5 + 5 });
  const R = mulberry(seed); for (let i = 0; i < 16; i++) { const u = R(), xx = lerp(x - w * .55, x + w * .55, u); S(L, [[xx, y - h * (.95 - Math.abs(u - .5) * .8)], [xx + (u - .5) * 12 * s, y - h * .5]], { w: 2 * s, tone: .5 * am, dry: .8, prof: 'tip', seed: seed * 90 + i }); }
}
// willow: a trunk and hanging strands
export function willow(L, x, y, s = 1, seed = 6, t = 0) {
  S(L, [[x, y], [x - 6 * s, y - 120 * s], [x + 4 * s, y - 230 * s]], { w: 16 * s, tone: .7, darkDir: [1, 0], side: .8, brWet: true, body: .3, dry: .55, wet: .8, prof: 'press', seed: seed * 3 });
  const R = mulberry(seed);
  for (let i = 0; i < 22; i++) { const bx = x + (R() - .4) * 160 * s, by = y - (200 + R() * 60) * s, l = (120 + R() * 140) * s, sw = Math.sin(t * .9 + i) * 6 * s; S(L, [[bx, by], [bx + 10 * s + sw * .5, by + l * .5], [bx + 6 * s + sw, by + l]], { w: 2.4 * s, tone: .55, dry: .55, wet: .3, prof: 'tip', seed: seed * 40 + i }); }
}
// chrysanthemum clump: ink leaves; heads in vermilion (the one accent) when red
export function chrys(L, x, y, s = 1, seed = 8, red = false, bloom = 1) {
  const R = mulberry(seed);
  for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (R() - .5) * 1.3, l = (50 + R() * 50) * s; S(L, [[x, y], [x + Math.cos(a) * l * .5, y + Math.sin(a) * l * .5], [x + Math.cos(a) * l, y + Math.sin(a) * l]], { w: 2.2 * s, tone: .75, dry: .45, prof: 'tip', seed: seed * 30 + i });
    for (let k = 0; k < 2; k++) { const px = x + Math.cos(a) * l * (.35 + k * .3), py = y + Math.sin(a) * l * (.35 + k * .3); blot(L.wet, px + (k ? 7 : -7) * s, py, 6 * s, .45, a, .45, seed + i * 3 + k); }
    if (i < 4 && bloom > 0) { const hx = x + Math.cos(a) * l, hy = y + Math.sin(a) * l, r = 7 * s * bloom;
      if (red) { const c = L.col; c.save(); c.fillStyle = `rgb(${VERM.join(',')})`; for (let j = 0; j < 9; j++) { const b = j / 9 * 6.28; c.globalAlpha = .85; c.beginPath(); c.ellipse(hx + Math.cos(b) * r * .7, hy + Math.sin(b) * r * .45, r * .5, r * .22, b, 0, 7); c.fill(); } c.restore(); }
      else for (let j = 0; j < 7; j++) { const b = j / 7 * 6.28; S(L, [[hx, hy], [hx + Math.cos(b) * r, hy + Math.sin(b) * r * .6]], { w: 2 * s, tone: .7, dry: .4, prof: 'tip', seed: seed * 300 + i * 10 + j }); } }
  }
}
// bamboo fence
export function fence(L, x0, x1, y, s = 1, seed = 9) {
  const R = mulberry(seed), n = Math.round((x1 - x0) / (34 * s));
  for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n + (R() - .5) * 6 * s; S(L, [[x, y - (90 + R() * 30) * s], [x + 2, y]], { w: 4 * s, tone: .65, dry: .55, prof: 'nail', seed: seed * 20 + i }); }
  for (const k of [.35, .7]) S(L, [[x0 - 10 * s, y - 100 * s * (1 - k)], [x1 + 10 * s, y - 100 * s * (1 - k) + 4 * s]], { w: 3.4 * s, tone: .7, dry: .5, prof: 'tip', seed: seed * 7 + k * 10 });
}
// jar (缸): two loaded strokes for the body and an ellipse for the mouth
export function jar(L, x, y, s = 1, seed = 10, p = 1) {
  draw(L, mk([[x - 60 * s, y - 120 * s], [x - 80 * s, y - 60 * s], [x - 50 * s, y], [x, y + 6 * s]], { w: 16 * s, tone: .6, darkDir: [-1, 0], side: .8, brWet: true, body: .3, dry: .5, wet: .85, prof: 'robe', seed: seed }), p);
  draw(L, mk([[x + 60 * s, y - 120 * s], [x + 80 * s, y - 60 * s], [x + 50 * s, y], [x, y + 6 * s]], { w: 14 * s, tone: .5, darkDir: [1, 0], side: .8, brWet: true, body: .3, dry: .55, wet: .85, prof: 'robe', seed: seed + 1 }), p);
  const e = []; for (let i = 0; i <= 24; i++) { const a = Math.PI * .1 + i / 24 * Math.PI * 1.9; e.push([x + Math.cos(a) * 62 * s, y - 124 * s + Math.sin(a) * 14 * s]); }
  draw(L, mk(e, { w: 3.4 * s, tone: .85, dry: .45, prof: 'brush', seed: seed + 2 }), p);
}
// the official seal (官印) as an object: a block with a knob and a looping cord
export function guanyin(L, x, y, s = 1, seed = 11) {
  mass(L.wet, [[x - 44 * s, y - 64 * s], [x + 44 * s, y - 64 * s], [x + 46 * s, y + 20 * s], [x - 46 * s, y + 20 * s]], .5, 2 * s, seed, [0, y - 64 * s, 0, y + 20 * s, .8, 1.15]);
  S(L, [[x - 46 * s, y - 64 * s], [x + 46 * s, y - 64 * s]], { w: 6 * s, tone: .9, dry: .35, prof: 'even', seed: seed + 1 });
  S(L, [[x + 46 * s, y - 64 * s], [x + 48 * s, y + 20 * s]], { w: 12 * s, tone: .85, darkDir: [1, 0], side: .8, brWet: true, body: .3, dry: .4, wet: .8, prof: 'even', seed: seed + 2 });
  // the knob: a small crouching animal as two loaded blobs
  S(L, [[x - 26 * s, y - 66 * s], [x - 6 * s, y - 92 * s], [x + 20 * s, y - 86 * s], [x + 28 * s, y - 66 * s]], { w: 16 * s, tone: .75, darkDir: [0, -1], side: .8, brWet: true, body: .4, dry: .35, wet: .8, prof: 'lens', seed: seed + 3 });
  blot(L.wet, x - 18 * s, y - 92 * s, 9 * s, .7, 0, .9, seed);
  // cord (绶): from the knob, over the desk edge, hanging down with a tassel
  S(L, [[x + 8 * s, y - 84 * s], [x + 70 * s, y - 70 * s], [x + 96 * s, y + 10 * s], [x + 104 * s, y + 90 * s]], { w: 5 * s, tone: .6, dry: .45, wet: .3, prof: 'even', seed: seed + 4 });
  for (let i = 0; i < 5; i++) S(L, [[x + 104 * s, y + 90 * s], [x + (98 + i * 3) * s, y + 130 * s]], { w: 2 * s, tone: .6, dry: .5, prof: 'tip', seed: seed + 5 + i });
}
// flying bird: two strokes, wings on twos
export function bird(L, x, y, s = 1, t = 0, seed = 12) {
  const f = Math.floor(t * 8) % 2 ? .5 : -.25;
  S(L, [[x - 22 * s, y - 10 * s * f], [x - 8 * s, y - 2 * s], [x, y]], { w: 3 * s, tone: .9, dry: .3, prof: 'nail', seed });
  S(L, [[x, y], [x + 10 * s, y - 4 * s], [x + 26 * s, y - 12 * s * f]], { w: 3 * s, tone: .9, dry: .3, prof: 'tip', seed: seed + 1 });
}
export function fish(L, x, y, s = 1, seed = 13) {
  S(L, [[x - 24 * s, y], [x, y - 7 * s], [x + 22 * s, y]], { w: 7 * s, tone: .75, dry: .3, wet: .5, prof: 'lens', seed });
  S(L, [[x + 20 * s, y], [x + 32 * s, y - 7 * s]], { w: 3 * s, tone: .8, dry: .4, prof: 'tip', seed: seed + 1 });
  S(L, [[x + 20 * s, y], [x + 32 * s, y + 7 * s]], { w: 3 * s, tone: .8, dry: .4, prof: 'tip', seed: seed + 2 });
}
// army tent
export function tent(L, x, y, s = 1, seed = 14) {
  mass(L.wet, [[x - 90 * s, y], [x, y - 110 * s], [x + 90 * s, y]], .22, 4 * s, seed);
  S(L, [[x - 100 * s, y + 2 * s], [x, y - 112 * s], [x + 100 * s, y + 2 * s]], { w: 6 * s, tone: .8, dry: .45, prof: 'brush', seed: seed + 1 });
  S(L, [[x, y - 112 * s], [x, y - 190 * s]], { w: 3 * s, tone: .85, dry: .3, prof: 'tip', seed: seed + 2 });
  S(L, [[x, y - 188 * s], [x + 40 * s, y - 178 * s], [x + 70 * s, y - 186 * s]], { w: 10 * s, tone: .5, dry: .55, wet: .5, prof: 'lens', seed: seed + 3 });
}
// rice stalks with drooping heads
export function rice(L, x0, x1, y, s = 1, seed = 15, cut = 0) {
  const R = mulberry(seed), n = Math.round((x1 - x0) / (16 * s));
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * i / n + R() * 8 * s, h = (70 + R() * 40) * s; if (cut && x < cut) { S(L, [[x, y], [x, y - 10 * s]], { w: 2 * s, tone: .6, dry: .5, prof: 'tip', seed: seed * 50 + i }); continue; }
    S(L, [[x, y], [x + 4 * s, y - h * .6], [x + 14 * s, y - h]], { w: 2.4 * s, tone: .55, dry: .45, prof: 'tip', seed: seed * 50 + i });
    S(L, [[x + 14 * s, y - h], [x + 24 * s, y - h + 10 * s], [x + 28 * s, y - h + 26 * s]], { w: 5 * s, tone: .75, dry: .55, wet: .4, prof: 'lens', seed: seed * 90 + i }); }
}
export function grass(L, x0, x1, y, s = 1, seed = 16, n = 60, tone = .6) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) { const x = lerp(x0, x1, R()), yy = y + (R() - .5) * 60 * s, h = (25 + R() * 55) * s, b = (R() - .5) * 30 * s; S(L, [[x, yy], [x + b * .3, yy - h * .5], [x + b, yy - h]], { w: 2.4 * s, tone: tone * (.7 + R() * .5), dry: .5, wet: .2, prof: 'tip', seed: seed * 100 + i }); }
}
export function moon(L, x, y, r, seed = 17) {
  const e = []; for (let i = 0; i <= 30; i++) { const a = -1.2 + i / 30 * 6.1; e.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
  S(L, e, { w: 4, tone: .55, dry: .6, prof: 'brush', seed });
  blot(L.wet, x, y, r * .95, .05, 0, 1, seed);
}
// hoe held between the hands
export function hoe(L, h1, h2, len, s = 1, seed = 18) {
  const dx = h2[0] - h1[0], dy = h2[1] - h1[1], d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
  const end = [h1[0] - ux * len * .25, h1[1] - uy * len * .25], tip = [h1[0] + ux * len, h1[1] + uy * len];
  S(L, [end, tip], { w: 3 * s, tone: .85, dry: .3, prof: 'even', seed });
  S(L, [tip, [tip[0] - uy * 22 * s + ux * 6 * s, tip[1] + ux * 22 * s + uy * 6 * s]], { w: 9 * s, tone: .9, dry: .25, wet: .3, prof: 'nail', seed: seed + 1 });
}
// modern room: a frame (walls), window, floor; returns geometry
export function room(L, x0, y0, x1, y1, seed = 20, am = 1) {
  S(L, [[x0, y1], [x1, y1]], { w: 5, tone: .7 * am, dry: .55, prof: 'tip', seed });
  S(L, [[x0, y0], [x0, y1]], { w: 4, tone: .6 * am, dry: .6, prof: 'tip', seed: seed + 1 });
  S(L, [[x1, y0], [x1, y1]], { w: 4, tone: .6 * am, dry: .6, prof: 'tip', seed: seed + 2 });
  S(L, [[x0 - 10, y0], [x1 + 10, y0]], { w: 3, tone: .5 * am, dry: .7, prof: 'tip', seed: seed + 3 });
}
export function windowFrame(L, x, y, w, h, seed = 21, curtain = 0) {
  for (const [a, b, k] of [[[x, y], [x + w, y], 0], [[x + w, y], [x + w, y + h], 1], [[x + w, y + h], [x, y + h], 2], [[x, y + h], [x, y], 3], [[x + w / 2, y], [x + w / 2, y + h], 4]]) S(L, [a, b], { w: 3.4, tone: .75, dry: .45, prof: 'brush', seed: seed + k });
  if (curtain > 0) mass(L.wet, [[x - 8, y - 6], [x + w + 8, y - 6], [x + w + 8, y + h * curtain], [x - 8, y + h * curtain]], .5, 4, seed, [0, y, 0, y + h, 1.1, .8]);
}
export function bed(L, x, y, w, s = 1, seed = 22) {
  mass(L.wet, [[x, y - 40 * s], [x + w, y - 40 * s], [x + w, y], [x, y]], .16, 3, seed);
  S(L, [[x, y - 40 * s], [x + w, y - 40 * s]], { w: 5 * s, tone: .75, dry: .45, prof: 'tip', seed: seed + 1 });
  S(L, [[x, y - 90 * s], [x, y + 6 * s]], { w: 5 * s, tone: .8, dry: .4, prof: 'tip', seed: seed + 2 });
}
export function desk(L, x, y, w, s = 1, seed = 23) {
  S(L, [[x, y], [x + w, y]], { w: 8 * s, tone: .8, dry: .4, wet: .3, prof: 'even', seed });
  S(L, [[x + 14 * s, y], [x + 14 * s, y + 90 * s]], { w: 4 * s, tone: .7, dry: .5, prof: 'tip', seed: seed + 1 });
  S(L, [[x + w - 14 * s, y], [x + w - 14 * s, y + 90 * s]], { w: 4 * s, tone: .7, dry: .5, prof: 'tip', seed: seed + 2 });
}
export function chair(L, x, y, s = 1, dir = 1, seed = 24) {
  S(L, [[x - 22 * s * dir, y - 40 * s], [x + 22 * s * dir, y - 40 * s]], { w: 5 * s, tone: .75, dry: .45, prof: 'tip', seed });
  S(L, [[x - 22 * s * dir, y - 95 * s], [x - 22 * s * dir, y]], { w: 4 * s, tone: .75, dry: .45, prof: 'tip', seed: seed + 1 });
  S(L, [[x + 20 * s * dir, y - 40 * s], [x + 20 * s * dir, y]], { w: 3.4 * s, tone: .7, dry: .5, prof: 'tip', seed: seed + 2 });
}
// small pot with a vermilion flower (modern rhyme of the chrysanthemum)
export function pot(L, x, y, s = 1, seed = 25) {
  S(L, [[x - 18 * s, y - 30 * s], [x - 13 * s, y], [x + 13 * s, y], [x + 18 * s, y - 30 * s]], { w: 4 * s, tone: .8, dry: .45, prof: 'brush', seed });
  S(L, [[x, y - 30 * s], [x - 2 * s, y - 60 * s], [x + 3 * s, y - 80 * s]], { w: 2.2 * s, tone: .75, dry: .4, prof: 'tip', seed: seed + 1 });
  blot(L.wet, x - 9 * s, y - 52 * s, 7 * s, .5, .6, .45, seed); blot(L.wet, x + 9 * s, y - 62 * s, 7 * s, .5, -.6, .45, seed + 1);
  const c = L.col; c.save(); c.fillStyle = `rgb(${VERM.join(',')})`; c.globalAlpha = .88;
  for (let j = 0; j < 8; j++) { const b = j / 8 * 6.28; c.beginPath(); c.ellipse(x + 3 * s + Math.cos(b) * 6 * s, y - 84 * s + Math.sin(b) * 4 * s, 4.5 * s, 2 * s, b, 0, 7); c.fill(); }
  c.restore();
}
export function teapot(L, x, y, s = 1, seed = 26, t = 0) {
  mass(L.wet, [[x - 24 * s, y], [x - 30 * s, y - 24 * s], [x - 12 * s, y - 38 * s], [x + 12 * s, y - 38 * s], [x + 30 * s, y - 24 * s], [x + 24 * s, y]], .3, 2, seed);
  S(L, [[x + 28 * s, y - 22 * s], [x + 46 * s, y - 36 * s]], { w: 4 * s, tone: .8, dry: .4, prof: 'tip', seed: seed + 1 });
  for (let i = 0; i < 2; i++) { const ph = Math.floor(t * 12) / 12 + i * 1.7; S(L, [[x + 46 * s, y - 40 * s], [x + 52 * s + Math.sin(ph) * 8 * s, y - 70 * s], [x + 44 * s + Math.sin(ph * 1.3) * 10 * s, y - 104 * s]], { w: 3 * s, tone: .25, dry: .7, prof: 'tip', seed: seed + 5 + i }); }
}
export function tower(L, x0, x1, top, y, seed = 27, am = 1) {
  mass(L.wet, [[x0, y], [x0, top], [x1, top + 10], [x1, y]], .5 * am, 4, seed, [0, top, 0, y, 1, 1.1]);
  S(L, [[x0, top], [x0 + 2, y]], { w: 10, tone: .9 * am, darkDir: [-1, 0], side: .8, brWet: true, body: .3, dry: .4, wet: .8, prof: 'even', seed: seed + 1 });
  const R = mulberry(seed); for (let r = top + 40; r < y - 30; r += 46) for (let c = x0 + 24; c < x1 - 20; c += 40) if (R() < .7) blot(L.dry, c, r, 6, .3 * am, 0, .6, r + c);
}
