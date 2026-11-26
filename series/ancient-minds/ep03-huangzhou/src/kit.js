// Shared drawing kit for 定风波 (苏轼在黄州): cached layers, inscriptions, subtitles, seals, rain, bamboo, huts, boats, birds, props.
import { mk, draw, drawSeq, mass, blot, TONE } from './ink.js';
import { ridgeFn, mountainLayer, cun, cliff, pine, reed, ripple, vn2 } from './land.js';
import { hero, POSE, mixPose, VERM } from './figure.js';
import { clamp, lerp, mulberry, vnoise, ss, eio, eo, ei } from '/core/lib.js';
export { mk, draw, drawSeq, mass, blot, TONE, ridgeFn, mountainLayer, cun, cliff, pine, reed, ripple, vn2, hero, POSE, mixPose, VERM, clamp, lerp, mulberry, vnoise, ss, eio, eo, ei };

// ---------- cached layers: {wet, dry, col} offscreen canvases drawn once ----------
const CACHE = {};
export function cached(key, W, H, fn) {
  if (CACHE[key]) return CACHE[key];
  const m = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const wet = m(), dry = m(), col = m();
  const L = { wet, dry, col, W, H, ink: { wet: wet.getContext('2d'), dry: dry.getContext('2d'), col: col.getContext('2d') } };
  fn(L.ink, L);
  return (CACHE[key] = L);
}
// paste a cached layer with camera {x, y, z} (world point x,y at screen centre) and world offset ox, oy
export function blit(A, lay, cam, am = 1, ox = 0, oy = 0) {
  const s = cam.z, tx = 960 - cam.x * s, ty = 540 - cam.y * s;
  for (const [k, c] of [['wet', A.cw], ['dry', A.cd], ['col', A.cc]]) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = am;
    c.drawImage(lay[k], tx + ox * s, ty + oy * s, lay.W * s, lay.H * s); c.restore();
  }
}
export const camXf = cam => ({ s: cam.z, tx: 960 - cam.x * cam.z, ty: 540 - cam.y * cam.z });
export function setCam(A, cam) { const { s, tx, ty } = camXf(cam); A.xf(s, tx, ty); return { s, tx, ty }; }
export const paperOf = cam => { const { s, tx, ty } = camXf(cam); return [-tx, -ty, s]; };

// ---------- mountains (per-pixel, cached) ----------
export function mtnInto(L, o) { L.wet.drawImage(mountainLayer({ W: o.W || 1920, H: o.H || 1080, ...o, ridge: ridgeFn(o.peaks, o.base, o.seed || 1, o.rough ?? 24) }), 0, 0); }

// ---------- inscriptions (题字): vertical columns, characters written in one by one, wet then dry ----------
// cols: array of strings, first column at x, the next ones to the left
export function columns(A, cols, x, y, p, o = {}) {
  if (p <= 0) return;
  const size = o.size || 64, gap = o.gap ?? size * 1.3, lead = o.lead ?? size * 1.08, font = o.font || 'MaShanZheng';
  const total = cols.reduce((a, c) => a + [...c].length, 0); let k = 0;
  const am = o.am ?? .92;
  for (let ci = 0; ci < cols.length; ci++) {
    const cx = x - ci * gap;
    [...cols[ci]].forEach((ch, i) => {
      const q = clamp(p * total * (o.speed || 1) - k); k++;
      if (q <= 0 || ch === ' ') return;
      const cy = y + i * lead + (o.stagger ? ci * o.stagger : 0);
      for (const [c, a] of [[A.cw, (1 - q) * .7 + .1], [A.cd, q * am]]) {
        c.save(); if (!o.world) c.setTransform(1, 0, 0, 1, 0, 0);
        c.globalAlpha = clamp(a * (o.fade ?? 1)); c.fillStyle = '#000'; c.font = `${size}px ${font}`; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(ch, cx, cy); c.restore();
      }
    });
  }
}
// boxes of columns for TEXTS (readcheck)
export function colBox(cols, x, y, o = {}) {
  const size = o.size || 64, gap = o.gap ?? size * 1.3, lead = o.lead ?? size * 1.08;
  const n = Math.max(...cols.map(c => [...c].length));
  return { x0: x - (cols.length - 1) * gap - size / 2, y0: y - size / 2, x1: x + size / 2, y1: y + (n - 1) * lead + size / 2 };
}

// ---------- subtitles as colophons (题跋): WenKai, ink, no box, vermilion square at the line start ----------
export function wrap(text, n = 17) {
  if (text.length <= n + 2) return [text];
  const mid = Math.ceil(text.length / 2); let best = mid, bd = 99;
  for (let i = 4; i < text.length - 3; i++) if ('，、：；。？！'.includes(text[i - 1]) && Math.abs(i - mid) < bd) { bd = Math.abs(i - mid); best = i; }
  if (bd > 6) best = mid;
  return [text.slice(0, best), text.slice(best)];
}
export function subtitle(A, text, x, y, a = 1, o = {}) {
  if (a <= 0) return;
  const size = o.size || 40, lines = wrap(text, o.n || 17);
  const wetK = clamp(1 - a) * .8, ink = o.quote ? .97 : .82;
  for (const [ctx, k] of [[A.cw, wetK], [A.cd, 1 - wetK * .6]]) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a * k * ink); ctx.fillStyle = '#000';
    ctx.font = `${size}px WenKai`; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '2px';
    lines.forEach((ln, i) => ctx.fillText(ln, x + size * .7, y + i * size * 1.42));
    ctx.restore();
  }
  const s = size * .3, cc = A.cc;
  cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalAlpha = clamp(a * .9); cc.fillStyle = `rgb(${VERM.join(',')})`;
  cc.fillRect(x, y - size * .36 - s / 2, s, s); cc.restore();
  return { lines, w: Math.max(...lines.map(l => l.length)) * (size + 2) + size * .7, h: lines.length * size * 1.42 };
}

// ---------- vermilion 白文 seal with characters knocked out ----------
export function seal(c, x, y, S, am = 1, text = '东坡', seed = 3) {
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
  c.globalCompositeOperation = 'destination-out'; c.fillStyle = '#000';
  const ch = [...text];
  c.font = `${S * (ch.length > 1 ? .44 : .72)}px MaShanZheng`; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (ch.length === 1) c.fillText(ch[0], S / 2, S * .53);
  else if (ch.length === 2) { c.fillText(ch[0], S / 2, S * .29); c.fillText(ch[1], S / 2, S * .73); }
  else { c.fillText(ch[0], S * .72, S * .29); c.fillText(ch[1], S * .72, S * .73); c.fillText(ch[2], S * .28, S * .29); c.fillText(ch[3] || '', S * .28, S * .73); }
  for (let i = 0; i < 70; i++) { const a = vnoise(seed + i * 3.7), b = vnoise(seed + 91 + i * 2.9); c.globalAlpha = .5 + .5 * vnoise(i * 1.1); c.beginPath(); c.arc(a * S, b * S, S * (.004 + .012 * vnoise(i * 5.3)), 0, 7); c.fill(); }
  c.restore();
}

// ---------- rain: fine slanted dry streaks in screen space (cheap, drawn per frame) ----------
export function rain(A, t, k = 1, o = {}) {
  if (k <= .01) return;
  const n = Math.round((o.n || 220) * k), ang = o.ang ?? .16, spd = o.spd ?? 1400, len = o.len ?? 46;
  const dx = Math.sin(ang), dy = Math.cos(ang);
  for (const [c, a0, w] of [[A.cd, .2, 1.1], [A.cw, .1, 2.2]]) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.strokeStyle = '#000'; c.lineCap = 'round'; c.lineWidth = w;
    for (let i = 0; i < n; i++) {
      const h1 = vnoise(i * 7.31 + 1.3) * 3.1 % 1, h2 = vnoise(i * 3.17 + 9.1) * 2.7 % 1, h3 = vnoise(i * 5.9 + 4.4);
      const sp = spd * (.75 + .5 * h3), L = len * (.6 + .8 * h3);
      const y = ((h2 * 1300 + t * sp) % 1300) - 120, x = (h1 * 2300 - 200) + y * dx / dy;
      c.globalAlpha = a0 * (o.am ?? 1) * (.5 + .7 * h3);
      c.beginPath(); c.moveTo(x, y); c.lineTo(x - dx * L, y - dy * L); c.stroke();
    }
    c.restore();
  }
}

// ---------- bamboo: jointed culm (loaded strokes) + 个/介 leaf clusters ----------
export function bamboo(L, x, y, h, s, seed = 1, lean = 0, tone = .55, o = {}) {
  const R = mulberry(seed), segs = Math.max(3, Math.round(h / (70 * s)));
  let px = x, py = y;
  const pts = [];
  for (let i = 0; i <= segs; i++) { const u = i / segs; pts.push([x + lean * h * u * u + (R() - .5) * 2 * s, y - h * u]); }
  for (let i = 0; i < segs; i++) {
    const a = pts[i], b = pts[i + 1];
    draw(L, mk([[a[0], a[1] - 3 * s], [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5)], [b[0], b[1] + 3 * s]], { w: (9 - i * 4 / segs) * s, tone, darkDir: [1, 0], side: .5, brWet: true, body: .5, dry: .28, wet: .7, prof: 'even', seed: seed * 100 + i }));
    draw(L, mk([[b[0] - 6 * s, b[1] + 1], [b[0], b[1] - 1.5 * s], [b[0] + 6 * s, b[1] + 1]], { w: 2.6 * s, tone: Math.min(.95, tone + .35), dry: .3, prof: 'tip', seed: seed * 100 + 50 + i }));
  }
  // leaves on the upper half: long slender blades hanging down and out in 个 / 介 clusters
  const nC = o.leaves ?? Math.max(2, Math.round(segs * .55));
  for (let c = 0; c < nC; c++) {
    const k = Math.floor(segs * (.4 + .6 * R())), node = pts[Math.min(segs, k + 1)], side = R() < .5 ? -1 : 1;
    const tw = [node[0] + side * (24 + R() * 40) * s, node[1] + (R() * 14 - 10) * s];
    draw(L, mk([node, [lerp(node[0], tw[0], .5), node[1] - 4 * s], tw], { w: 1.4 * s, tone: tone + .15, dry: .45, prof: 'tip', seed: seed * 300 + c }));
    const nl = 3 + Math.floor(R() * 2), wind = o.wind || 0;
    for (let j = 0; j < nl; j++) {
      const ang = Math.PI / 2 - side * (.5 + j * .32 + (R() - .5) * .2) + wind * .3, len = (62 + R() * 40) * s;
      const e = [tw[0] + Math.cos(ang) * len, tw[1] + Math.sin(ang) * len * .8];
      const m = [lerp(tw[0], e[0], .45) + side * 4 * s, lerp(tw[1], e[1], .45) - 3 * s];
      draw(L, mk([tw, m, e], { w: (6 + R() * 3) * s, tone: Math.min(.92, tone + .1 + R() * .15), dry: .25, wet: .5, prof: 'nail', seed: seed * 500 + c * 10 + j }));
    }
  }
}
export function grove(L, x0, x1, y, o = {}) {
  const R = mulberry(o.seed || 7), n = o.n || Math.round((x1 - x0) / 90);
  for (let i = 0; i < n; i++) {
    const far = R(), s = (o.s || 1) * (.55 + .5 * far), x = lerp(x0, x1, (i + R() * .8) / n);
    bamboo(L, x, y + far * 30, (o.h || 700) * (.6 + .5 * far), s, (o.seed || 7) * 31 + i, (R() - .5) * .12, (o.tone || .45) * (.55 + .6 * far));
  }
}

// ---------- ground path: a few pale dry strokes ----------
export function path(L, pts, w = 30, tone = .16, seed = 1) {
  draw(L, mk(pts, { w, tone, dry: .75, wet: .4, prof: 'even', seed }));
  draw(L, mk(pts.map(p => [p[0] + 8, p[1] + w * .5]), { w: w * .3, tone: tone * 1.6, dry: .7, prof: 'tip', seed: seed + 1 }));
}

// ---------- hut: thatched roof mass, pale walls, a dark doorway ----------
export function hut(L, x, y, s, seed = 4, o = {}) {
  const T = p => [x + p[0] * s, y + p[1] * s];
  mass(L.wet, [[-110, -60], [-20, -122], [30, -128], [120, -66], [100, -58], [-96, -54]].map(T), .5, 3 * s, seed, [x, y - 130 * s, x, y - 50 * s, 1.1, .6]);
  draw(L, mk([[-118, -58], [-22, -124], [32, -130], [126, -64]].map(T), { w: 7 * s, tone: .9, dry: .5, wet: .3, prof: 'brush', seed: seed * 7 }));
  for (let i = 0; i < 9; i++) draw(L, mk([[-90 + i * 24, -62 + Math.abs(i - 4) * -1], [-84 + i * 24, -52]].map(T), { w: 2 * s, tone: .8, dry: .7, prof: 'tip', seed: seed * 20 + i }));
  mass(L.wet, [[-88, -54], [88, -56], [86, 0], [-86, 0]].map(T), .12, 2 * s, seed + 1);
  draw(L, mk([[-88, -52], [-87, 0]].map(T), { w: 3 * s, tone: .7, dry: .5, prof: 'even', seed: seed * 30 }));
  draw(L, mk([[88, -54], [86, 0]].map(T), { w: 3 * s, tone: .7, dry: .5, prof: 'even', seed: seed * 31 }));
  if (o.door !== false) mass(L.wet, [[-20, -44], [14, -44], [14, 0], [-20, 0]].map(T), .62, 1.4 * s, seed + 2);
  if (o.window) mass(L.wet, [[34, -40], [70, -40], [70, -18], [34, -18]].map(T), .55, 1 * s, seed + 3);
  draw(L, mk([[-120, 2], [0, 6], [120, 2]].map(T), { w: 5 * s, tone: .5, dry: .65, prof: 'tip', seed: seed * 40 }));
}

// ---------- boat: one loaded crescent stroke + a pale canopy ----------
export function boat(L, x, y, s, seed = 3, o = {}) {
  const T = p => [x + p[0] * s, y + p[1] * s];
  mass(L.wet, [[-120, -6], [-80, 10], [70, 12], [128, -10], [70, 2], [-78, 0]].map(T), .32, 1.5 * s, seed);
  draw(L, mk([[-128, -12], [-70, 9], [60, 11], [132, -14]].map(T), { w: 9 * s, tone: .86, darkDir: [0, 1], side: .8, brWet: true, body: .3, dry: .35, wet: .8, prof: 'tip', seed: seed * 3 }));
  if (o.canopy) {
    mass(L.wet, [[-40, -4], [-34, -42], [10, -50], [48, -40], [50, -4]].map(T), .2, 2 * s, seed + 1);
    draw(L, mk([[-44, -38], [8, -54], [54, -38]].map(T), { w: 4 * s, tone: .75, dry: .5, prof: 'brush', seed: seed * 5 }));
  }
}
export function wake(L, x, y, s, t, a = .4, seed = 1) {
  for (let i = 0; i < 3; i++) {
    const u = ((t * .35 + i / 3) % 1);
    draw(L, mk([[x + 140 * s + u * 220 * s, y + 6 * s + u * 10 * s], [x + 200 * s + u * 340 * s, y + 10 * s + u * 18 * s]], { w: 3 * s, tone: .5, dry: .75, prof: 'tip', seed: seed * 10 + i }), 1, a * (1 - u));
  }
}

// ---------- moon left blank in a pale wash ----------
export function moonWash(L, cx, cy, r, a = .16, seed = 2, W = 1920, H = 1080) {
  const c = L.wet; c.save();
  const g = c.createRadialGradient(cx, cy, r * 1.05, cx, cy, r * 5.5);
  g.addColorStop(0, `rgba(0,0,0,${a * 1.25})`); g.addColorStop(.35, `rgba(0,0,0,${a})`); g.addColorStop(1, `rgba(0,0,0,${a * .35})`);
  c.fillStyle = g; c.fillRect(0, 0, W, H * .62);
  c.globalCompositeOperation = 'destination-out'; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.fill();
  c.restore();
}

// ---------- birds ----------
export function goose(L, x, y, s, t, dir = -1, seed = 5) {
  const f = Math.sin(t * 5.2), T = p => [x + p[0] * s * dir, y + p[1] * s];
  draw(L, mk([[-16, 1], [0, -1], [18, -3], [26, -6]].map(T), { w: 5 * s, tone: .82, dry: .3, wet: .4, prof: 'lens', seed }));
  draw(L, mk([[24, -6], [32, -5]].map(T), { w: 1.6 * s, tone: .95, dry: .2, prof: 'tip', seed: seed + 1 }));
  draw(L, mk([[2, -2], [-6, -14 - 12 * f], [-20, -20 - 18 * f]].map(T), { w: 6 * s, tone: .7, dry: .45, wet: .3, prof: 'nail', seed: seed + 2 }));
  draw(L, mk([[4, 0], [10, -10 - 8 * f], [2, -16 - 12 * f]].map(T), { w: 4.5 * s, tone: .45, dry: .5, wet: .4, prof: 'nail', seed: seed + 3 }));
  draw(L, mk([[-16, 1], [-26, 4]].map(T), { w: 3 * s, tone: .6, dry: .5, prof: 'tip', seed: seed + 4 }));
}
export function crow(L, x, y, s, t, dir = -1, seed = 9) {
  const f = Math.sin(t * 9 + seed), T = p => [x + p[0] * s * dir, y + p[1] * s];
  blot(L.wet, x, y, 6 * s, .9, 0, .55, seed);
  draw(L, mk([[0, 0], [-10, -8 - 9 * f], [-24, -10 - 14 * f]].map(T), { w: 6 * s, tone: .95, dry: .3, wet: .4, prof: 'nail', seed }));
  draw(L, mk([[0, 0], [8, -9 - 7 * f], [18, -12 - 10 * f]].map(T), { w: 5 * s, tone: .9, dry: .35, wet: .4, prof: 'nail', seed: seed + 1 }));
  draw(L, mk([[6, -1], [12, -2]].map(T), { w: 3 * s, tone: .96, dry: .2, prof: 'tip', seed: seed + 2 }));
}
// a scrap of paper money: pale square with a square hole (left white)
export function paperMoney(L, x, y, s, rot = 0) {
  const c = L.dry; c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = .55; c.strokeStyle = '#000'; c.lineWidth = 1.2 * s;
  c.strokeRect(-5 * s, -5 * s, 10 * s, 10 * s); c.strokeRect(-1.5 * s, -1.5 * s, 3 * s, 3 * s); c.restore();
}

// ---------- seated xieyi figure (side or front): one robe mound + two loaded strokes + head + headgear ----------
// o: {dir, front, hat:'cap'|'none', arm: [dx,dy] writing hand, tone, hunch}
export function seated(L, x, y, s, o = {}) {
  const dir = o.dir ?? 1, T = p => [x + p[0] * s * dir, y + p[1] * s], hn = o.hunch || 0, tone = o.tone ?? 1;
  const hx = 4 + hn * 6, hy = -64 + hn * 10;
  if (o.front) {
    mass(L.wet, [[-6, hy + 8], [-22, -30], [-36, -4], [-30, 2], [30, 2], [36, -4], [22, -30], [6, hy + 8]].map(T), .2 * tone, 1 * s, 3);
    draw(L, mk([[-5, hy + 8], [-18, -34], [-34, -6], [-24, 1]].map(T), { w: 7 * s, tone: .7 * tone, darkDir: [-dir, 0], side: .85, brWet: true, body: .2, dry: .4, wet: .9, prof: 'robe', seed: 11 }));
    draw(L, mk([[5, hy + 8], [18, -34], [34, -6], [24, 1]].map(T), { w: 6.5 * s, tone: .62 * tone, darkDir: [dir, 0], side: .85, brWet: true, body: .2, dry: .45, wet: .9, prof: 'robe', seed: 12 }));
    draw(L, mk([[-30, 1], [0, 4], [30, 1]].map(T), { w: 2 * s, tone: .7 * tone, dry: .6, prof: 'tip', seed: 13 }));
    draw(L, mk([[-12, -22], [0, -18], [12, -22]].map(T), { w: 3.4 * s, tone: .3 * tone, wet: .8, dry: .2, prof: 'lens', seed: 14 }));   // folded hands
    draw(L, mk([[0, hy - 1], [0, hy + 4]].map(T), { w: 7 * s, tone: .1, wet: 1, dry: 0, prof: 'lens', seed: 15 }));
    draw(L, mk([[-3.2, hy + 1], [-2, hy + 4], [0, hy + 5], [2, hy + 4], [3.2, hy + 1]].map(T), { w: 1 * s, tone: .8 * tone, dry: .45, prof: 'tip', seed: 16 }));
    draw(L, mk([[0, hy + 4.5], [.3, hy + 8.5]].map(T), { w: 1.1 * s, tone: .8 * tone, dry: .55, prof: 'tip', seed: 17 }));
  } else {
    mass(L.wet, [[hx - 3, hy + 8], [-14, -40], [-20, -6], [-14, 2], [34, 2], [30, -14], [12, -30], [hx + 4, hy + 9]].map(T), .2 * tone, 1 * s, 4);
    draw(L, mk([[hx - 4, hy + 7], [-10, -38], [-18, -10], [-12, 1]].map(T), { w: 8 * s, tone: .76 * tone, darkDir: [-dir, 0], side: .85, brWet: true, body: .2, dry: .42, wet: .9, prof: 'robe', seed: 21 }));
    draw(L, mk([[-12, 1], [10, 3], [34, 1]].map(T), { w: 4.5 * s, tone: .6 * tone, darkDir: [0, 1], side: .8, brWet: true, body: .2, dry: .45, wet: .9, prof: 'robe', seed: 22 }));
    const arm = o.arm || [18, -24], hand = [hx + arm[0], hy + 30 + arm[1] + 24];
    draw(L, mk([[hx + 2, hy + 12], [hx + 10, hy + 26], hand].map(T), { w: 6 * s, tone: .5 * tone, darkDir: [0, 1], side: .8, brWet: true, body: .2, dry: .45, wet: .9, prof: 'robe', seed: 23 }));
    if (o.brush) draw(L, mk([[hand[0] + 1, hand[1] - 9], [hand[0] + 1.5, hand[1] + 3]].map(T), { w: 1.6 * s, tone: .95, dry: .2, prof: 'tip', seed: 24 }));
    draw(L, mk([[hx + .5, hy - 1.5], [hx + 2.2, hy + 2.2], [hx + 1.2, hy + 4.8]].map(T), { w: 5.5 * s, tone: .1, wet: 1, dry: 0, prof: 'lens', seed: 25 }));
    draw(L, mk([[hx + 3.4, hy - 1.8], [hx + 4.6, hy + .8], [hx + 3.6, hy + 2], [hx + 4, hy + 3.6], [hx + 2.4, hy + 5.2]].map(T), { w: 1.2 * s, tone: .8 * tone, dry: .35, prof: 'tip', seed: 26 }));
    draw(L, mk([[hx + 3.2, hy + 4.3], [hx + 2.4, hy + 8.2]].map(T), { w: 1.1 * s, tone: .8 * tone, dry: .55, prof: 'tip', seed: 27 }));
  }
  const hd = o.front ? [0, hy] : [hx, hy];
  if (o.hat === 'cap') {
    const w0 = o.front ? 5.2 : 4.6, X = hd[0], Y = hd[1];
    mass(L.wet, [[X - w0, Y - 2.5], [X - w0 + .3, Y - 12.5], [X - w0 + 1.2, Y - 14], [X + w0 - 1, Y - 14.2], [X + w0, Y - 12.5], [X + w0 + .2, Y - 2.5]].map(T), .62 * tone, .5 * s, 5);
    draw(L, mk([[X - w0 - .5, Y - 2.4], [X + w0 + .6, Y - 2.4]].map(T), { w: 2.4 * s, tone: .95 * tone, dry: .3, wet: .2, prof: 'even', seed: 28 }));
  } else {
    draw(L, mk([[hd[0] - 3.5, hd[1] - 3], [hd[0], hd[1] - 5.5], [hd[0] + 3.5, hd[1] - 3]].map(T), { w: 4.2 * s, tone: .7 * tone, wet: .6, dry: .3, prof: 'lens', seed: 29 }));
    draw(L, mk([[hd[0] - .5, hd[1] - 5], [hd[0] - .5, hd[1] - 8.5]].map(T), { w: 3.4 * s, tone: .85 * tone, wet: .4, dry: .3, prof: 'dot', seed: 30 }));
  }
}

// ---------- poses for 苏轼 (no sword; bamboo staff with the red gourd) ----------
const nos = p => ({ ...p, sheath: null, sword: null });
export const SU = {
  walk1: { ...nos(POSE.walk1), staff: [7, 70] },
  walk2: { ...nos(POSE.walk2), staff: [7, 70] },
  stand: { ...nos(POSE.stand), staff: [6, 72] },
  back: { ...nos(POSE.back), staff: [2, 70] },
};
// a hurrying passer-by: bent forward, sleeves over the head
export const RUN = [
  { ...nos(POSE.walk1), hat: 'none', H: [2, -44], C: [12, -70], Hd: [17, -77], tilt: -.28, aF: [[11, -69], [18, -78], [14, -86]], aB: [[10, -69], [16, -80], [10, -86]], lF: [[3, -44], [14, -26], [18, 0]], lB: [[0, -44], [-10, -22], [-18, -4]], hemF: [14, -10], hemB: [-20, -14], flare: 1.1 },
  { ...nos(POSE.walk2), hat: 'none', H: [2, -46], C: [12, -72], Hd: [17, -79], tilt: -.28, aF: [[11, -71], [18, -80], [14, -88]], aB: [[10, -71], [16, -82], [10, -88]], lF: [[3, -46], [6, -24], [2, -2]], lB: [[0, -46], [2, -26], [8, -10]], hemF: [12, -10], hemB: [-18, -12], flare: 1 },
];
export function walker(L, t, x, y, s, o = {}) {
  const ph = Math.floor((t * (o.rate || 1.6) + (o.ph || 0)) % 2), base = o.poses || [SU.walk1, SU.walk2];
  const P = { ...base[ph], ...(o.extra || {}) };
  return hero(L, P, { x, y, s, dir: o.dir ?? 1, seed: o.seed ?? 2, t, am: o.am ?? 1, p: o.p ?? 1 });
}
