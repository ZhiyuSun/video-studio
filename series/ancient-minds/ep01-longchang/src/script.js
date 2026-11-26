// Calligraphy and inscriptions for 龙场.
// 1) writeGlyph: a large character written stroke by stroke with the brush engine, its skeleton traced from the OFL kaishu font
//    Ma Shan Zheng (font used as skeleton + slightly expanded clip, as in the style's glyph.js).
// 2) inscribe: small vertical inscriptions (原文 quotations, titles) in the same font, appearing character by character, wet then dry,
//    with dry-brush erosion so they sit in the paper rather than on it.
// 3) subZh: subtitles as 题跋 in LXGW WenKai, with the vermilion square at the start of each line.
import { mk, draw, TONE } from './ink.js';
import { clamp, lerp, mulberry, vnoise } from '/core/lib.js';
import { VERM } from './hero.js';

// Skeletons in pixel coords of an 800 px Ma Shan Zheng glyph whose ink bbox is BB (traced by eye over a grid); [x, y, pressure]
const GLYPHS = {
  '心': {
    BB: [190, 236, 848, 653],
    S: [
      { p: [[268, 376, .55], [256, 410, 1.0], [232, 455, 1.15], [218, 500, 1.1], [216, 538, .75]], w: 56 },                         // left dot
      { p: [[336, 432, .45], [356, 490, .8], [400, 552, 1.0], [470, 598, 1.1], [570, 618, 1.15], [660, 608, 1.1], [718, 580, 1.05], [736, 548, .9], [700, 490, .7], [660, 440, .45], [634, 410, .25]], w: 66 }, // lying hook
      { p: [[408, 244, .7], [440, 268, 1.1], [472, 300, 1.15], [500, 290, .8], [540, 252, .35]], w: 70 },                          // top dot
      { p: [[676, 302, .45], [730, 330, .85], [785, 370, 1.1], [818, 420, 1.15], [822, 455, .7]], w: 66 },                        // right dot
    ],
  },
};

const maskCache = {};
function glyphMask(ch, box, W = 1920, H = 1080) {
  const key = ch + box.join(',');
  if (maskCache[key]) return maskCache[key];
  const [x0, y0, S] = box, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d');
  c.font = `${S}px MaShanZheng`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  const m = c.measureText(ch), y = y0 + S / 2 + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
  c.fillStyle = '#000'; c.fillText(ch, x0 + S / 2, y);
  c.strokeStyle = '#000'; c.lineWidth = S * .016; c.lineJoin = 'round'; c.strokeText(ch, x0 + S / 2, y);
  // ink bbox of the mask (to map the traced skeleton onto it)
  const d = c.getImageData(0, 0, W, H).data; let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
  for (let yy = Math.max(0, y0 - S * .2) | 0; yy < Math.min(H, y0 + S * 1.2); yy += 2) for (let xx = Math.max(0, x0 - S * .2) | 0; xx < Math.min(W, x0 + S * 1.2); xx += 2) if (d[(yy * W + xx) * 4 + 3] > 128) { if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx; if (yy < by0) by0 = yy; if (yy > by1) by1 = yy; }
  cv.bb = [bx0, by0, bx1, by1];
  return (maskCache[key] = cv);
}

export function glyphStrokes(ch, box, o = {}) {
  const G = GLYPHS[ch], mask = glyphMask(ch, box), [a0, b0, a1, b1] = G.BB, [c0, d0, c1, d1] = mask.bb;
  const sx = (c1 - c0) / (a1 - a0), sy = (d1 - d0) / (b1 - b0);
  return G.S.map((st, i) => mk(st.p.map(p => [c0 + (p[0] - a0) * sx, d0 + (p[1] - b0) * sy, p[2]]), {
    w: st.w * sx * (o.wk ?? 1.25), tone: TONE.jiao, dry: o.dry ?? .2, wet: o.wet ?? .35, prof: 'even', rough: .07, nb: 56, solid: true, seed: (o.seed ?? 61) * 10 + i,
  }));
}

// prog[i] ∈ [0,1]: how far stroke i is written. T = temp layer set. Clipped by the glyph, pasted onto dst (a layer set).
export function writeGlyph(dst, T, ch, box, prog, o = {}) {
  const S = o.strokes || glyphStrokes(ch, box, o);
  for (const c of [T.ink.wet, T.ink.dry]) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, T.wet.width, T.wet.height); }
  let any = false;
  S.forEach((s, i) => { if ((prog[i] ?? 0) > 0) { draw(T.ink, s, prog[i], o.am ?? 1); any = true; } });
  if (!any) return S;
  const mask = glyphMask(ch, box, T.wet.width, T.wet.height);
  for (const key of ['wet', 'dry']) {
    const c = T.ink[key]; c.globalCompositeOperation = 'destination-in'; c.drawImage(mask, 0, 0); c.globalCompositeOperation = 'source-over';
    const d = dst.ink[key]; d.save(); const X = o.xf || [1, 0, 0]; d.setTransform(X[0], 0, 0, X[0], X[1], X[2]); d.globalAlpha = o.alpha ?? 1; d.drawImage(T[key], 0, 0); d.restore();
  }
  return S;
}

// Vertical inscription: columns right to left (cols = array of strings). k ∈ [0,1] reveals characters in reading order.
let TMPC = null;
function tmpc(n) { if (!TMPC || TMPC.width < n) { TMPC = document.createElement('canvas'); TMPC.width = TMPC.height = n; } const c = TMPC.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, TMPC.width, TMPC.height); return c; }
export function inscribe(A, cols, x, y, size, k = 1, o = {}) {
  if (k <= 0) return;
  const total = cols.reduce((a, s) => a + s.length, 0); let idx = 0;
  const gap = o.gap ?? size * 1.35, lead = o.lead ?? size * 1.08, tone = o.tone ?? .92;
  cols.forEach((col, ci) => {
    const cx = x - ci * gap;
    for (let j = 0; j < col.length; j++, idx++) {
      const ch = col[j]; if (ch === ' ') continue;
      const u = clamp(k * total * 1.0 - idx);           // this character's progress
      if (u <= 0) continue;
      const cy = y + j * lead, n = Math.ceil(size * 1.4), c = tmpc(n);
      c.font = `${size}px MaShanZheng`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#000';
      c.fillText(ch, n / 2, n / 2);
      // written top to bottom: wipe
      c.globalCompositeOperation = 'destination-in';
      const g = c.createLinearGradient(0, 0, 0, n); const e = clamp(u * 1.15);
      g.addColorStop(0, '#000'); g.addColorStop(Math.max(0, e - .08), '#000'); g.addColorStop(Math.min(1, e + .001), 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; c.fillRect(0, 0, n, n);
      // dry-brush erosion: thin streaks knocked out along the stroke direction
      c.globalCompositeOperation = 'destination-out'; c.strokeStyle = '#000'; c.lineCap = 'round';
      const R = mulberry((o.seed ?? 5) * 131 + idx * 17);
      for (let s = 0; s < 14; s++) {
        const yy = R() * n, x0 = R() * n, len = n * (.15 + R() * .4), ang = (R() - .5) * .5 + (R() < .5 ? 0 : Math.PI / 2);
        c.globalAlpha = .35 + R() * .5; c.lineWidth = .6 + R() * size * .025;
        c.beginPath(); c.moveTo(x0, yy); c.lineTo(x0 + Math.cos(ang) * len, yy + Math.sin(ang) * len); c.stroke();
      }
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      const wetK = clamp(1 - u) * .6 + .25;
      for (const [ctx, a] of [[A.cw, tone * wetK], [A.cd, tone * (1 - wetK * .5)]]) {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a); ctx.drawImage(TMPC, 0, 0, n, n, cx - n / 2, cy - n / 2, n, n); ctx.restore();
      }
    }
  });
}

// Subtitles (题跋): LXGW WenKai, ink colour, no box, vermilion square before each line; wet → dry as they appear
export function subZh(A, text, x, y, a = 1, o = {}) {
  if (a <= 0) return;
  const size = o.size || 44, lines = text.split('\n');
  if (o.light) {   // on a night wash: written in paper colour into the colour layer
    const cc = A.cc; cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalAlpha = clamp(a * .95); cc.fillStyle = 'rgb(240,233,218)';
    cc.font = `${size}px LXGW`; cc.letterSpacing = '2px'; lines.forEach((ln, i) => cc.fillText(ln, x + size * .72, y + i * size * 1.45));
    const s = size * .3; cc.fillStyle = `rgb(${VERM.join(',')})`; cc.fillRect(x, y - size * .38 - s / 2, s, s); cc.restore(); return;
  }
  const wetK = clamp(1 - a) * .8;
  for (const [ctx, k] of [[A.cw, wetK], [A.cd, 1 - wetK * .6]]) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = clamp(a * k * .88); ctx.fillStyle = '#000';
    ctx.font = `${size}px LXGW`; ctx.letterSpacing = '2px'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, x + size * .72, y + i * size * 1.45));
    ctx.restore();
  }
  const s = size * .3, cc = A.cc;
  cc.save(); cc.setTransform(1, 0, 0, 1, 0, 0); cc.globalAlpha = clamp(a * .92); cc.fillStyle = `rgb(${VERM.join(',')})`;
  cc.fillRect(x, y - size * .38 - s / 2, s, s); cc.restore();
}
export function subWidth(text, size = 44) { const c = tmpc(8); c.font = `${size}px LXGW`; return Math.max(...text.split('\n').map(l => c.measureText(l).width)) + size * .72; }
