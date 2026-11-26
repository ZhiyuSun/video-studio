// The little theatre: lacquered frame, the audience's heads, cut-letter hide plaques, the storyteller's placard, scenery pieces (tree, bird, ground strip)
import { piece, drawPiece, fill, cut, cutLine, ink, within, smooth, poly, cloud, beads, beadLine, plum, lattice, coin, meander, scalesOpen, cutTaper, DYE, canvas } from './carve.js';
import { mulberry, vnoise, clamp } from '/core/lib.js';
import { mul, T, R, S, ap } from './rig.js';
export const CW = 1920, CH = 804, GROUND = 742;     // cloth size (world units) and the line the puppets stand on
const set = (g, M) => g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);

// —— Frame around a cloth of size cw×ch (foreground layer); spill = light on the inner edges
export function drawFrame(g, Cam, spill = 1, cw = CW, ch = CH, tone = 1) {
  g.save(); set(g, Cam);
  const lac = '#2a0d08', lac2 = '#46140c', gold = '#8a6430';
  g.fillStyle = lac; g.fillRect(-900, -700, cw + 1800, 700);
  g.fillStyle = lac2; g.fillRect(-260, -170, cw + 520, 140);
  g.strokeStyle = gold; g.lineWidth = 3;
  for (let x = -220; x < cw + 180; x += 120) { g.beginPath(); for (let i = 0; i <= 30; i++) { const a = i / 30 * Math.PI * 2.1, r = 30 * (1 - i / 30 * .75); const px = x + 60 + Math.cos(a) * r, py = -100 + Math.sin(a) * r * .7; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.stroke(); }
  g.beginPath(); g.moveTo(-260, -170); g.lineTo(cw + 260, -170); g.moveTo(-260, -30); g.lineTo(cw + 260, -30); g.stroke();
  g.fillStyle = '#6a1a10'; g.fillRect(-260, -30, cw + 520, 30);
  for (const x of [-220, cw]) {
    const gr = g.createLinearGradient(x, 0, x + 220, 0); gr.addColorStop(0, '#1a0806'); gr.addColorStop(.5, '#3e110a'); gr.addColorStop(1, '#1a0806');
    g.fillStyle = gr; g.fillRect(x, -700, 220, ch + 1400);
    g.strokeStyle = gold; g.lineWidth = 2.5; g.strokeRect(x + 24, 50, 172, ch - 100);
  }
  g.fillStyle = '#120604'; g.fillRect(-1400, -700, 1180, ch + 1400); g.fillRect(cw + 220, -700, 1180, ch + 1400);
  g.fillStyle = lac; g.fillRect(-900, ch, cw + 1800, 700);
  g.fillStyle = '#5a170d'; g.fillRect(-260, ch, cw + 520, 40);
  g.strokeStyle = gold; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-260, ch + 40); g.lineTo(cw + 260, ch + 40); g.stroke();
  g.globalCompositeOperation = 'lighter';
  const sp = (x0, y0, x1, y1, gx0, gy0, gx1, gy1) => { const gr = g.createLinearGradient(gx0, gy0, gx1, gy1); gr.addColorStop(0, `rgba(255,170,90,${.3 * spill})`); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0); };
  sp(-260, -110, cw + 260, 0, 0, 0, 0, -110); sp(-260, ch, cw + 260, ch + 110, 0, ch, 0, ch + 110); sp(-150, -30, 0, ch + 30, 0, 0, -150, 0); sp(cw, -30, cw + 150, ch + 30, cw, 0, cw + 150, 0);
  g.restore();
}
// —— The audience: backs of heads (viewport coordinates, 1920×804). laugh 0..1 makes shoulders bob; stand 0..1 per head rises
const HEADS = [[150, 760, 78, 1], [400, 790, 92, 0], [650, 770, 80, 2], [900, 800, 96, 1], [1150, 775, 84, 0], [1420, 795, 90, 2], [1680, 770, 82, 1], [1880, 800, 88, 0]];
export function drawAudience(g, a = 1, t = 0, o = {}) {
  if (a <= 0) return;
  const laugh = o.laugh || 0, stand = o.stand || (() => 0), set2 = o.set || 0;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.fillStyle = '#070303'; g.filter = `blur(${o.blur ?? 3}px)`;
  HEADS.forEach(([x0, y0, r, kind], i) => {
    const rr = mulberry(i * 31 + set2 * 7)(), x = x0 + (set2 ? (rr - .5) * 60 : 0), rad = r * (set2 ? .9 + rr * .25 : 1);
    const bob = Math.sin(t * 1.3 + i * 2) * 2 + laugh * Math.abs(Math.sin(t * 9 + i * 1.7)) * 9 * (.6 + .4 * vnoise(t * 2 + i));
    const y = y0 - bob - stand(i) * 200;
    g.beginPath(); g.ellipse(x, y, rad * .76, rad, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(x, y + rad * 1.25, rad * 1.8, rad * .9, 0, 0, 7); g.fill();
    if (stand(i) > 0) { g.fillRect(x - rad * 1.6, y + rad * 1.2, rad * 3.2, 260); }
    const kd = (kind + set2) % 3;
    if (kd === 1) { g.beginPath(); g.arc(x + rad * .1, y - rad * .95, rad * .32, 0, 7); g.fill(); }
    if (kd === 2) { g.beginPath(); g.ellipse(x, y - rad * .7, rad * 1.05, rad * .28, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(x, y - rad * .9, rad * .6, rad * .4, 0, 0, 7); g.fill(); }
  });
  g.restore();
}
// —— Hide plaque with cut-out letters (glows through the cuts)
function plaque(w, h, lines, seed, sealText) {
  return piece([-w / 2 - 30, -h / 2 - 30, w / 2 + 30, h / 2 + 30], g => {
    const outer = q => { const r = 26; q.moveTo(-w / 2 + r, -h / 2); q.lineTo(w / 2 - r, -h / 2); q.quadraticCurveTo(w / 2 + 14, -h / 2 - 14, w / 2, -h / 2 + r); q.lineTo(w / 2, h / 2 - r); q.quadraticCurveTo(w / 2 + 14, h / 2 + 14, w / 2 - r, h / 2); q.lineTo(-w / 2 + r, h / 2); q.quadraticCurveTo(-w / 2 - 14, h / 2 + 14, -w / 2, h / 2 - r); q.lineTo(-w / 2, -h / 2 + r); q.quadraticCurveTo(-w / 2 - 14, -h / 2 - 14, -w / 2 + r, -h / 2); q.closePath(); };
    fill(g, '#3a1a10', outer);
    const band = q => { outer(q); q.rect(-w / 2 + 24, -h / 2 + 24, w - 48, h - 48); };
    fill(g, YDARK, band);
    within(g, band, () => { meander(g, -w / 2 + 30, -h / 2 + 18, w / 2 - 30, 5, 1.6); meander(g, -w / 2 + 30, h / 2 - 6, w / 2 - 30, 5, 1.6); for (let y = -h / 2 + 40; y < h / 2 - 30; y += 22) { coin(g, -w / 2 + 12, y, 6); coin(g, w / 2 - 12, y, 6); } });
    for (const [x, y] of [[-w / 2 + 12, -h / 2 + 12], [w / 2 - 12, -h / 2 + 12], [-w / 2 + 12, h / 2 - 12], [w / 2 - 12, h / 2 - 12]]) { fill(g, DYE.yellow, q => q.arc(x, y, 19, 0, 7)); cloud(g, x, y, 11, 0, 2, 1); ink(g, 2, q => q.arc(x, y, 19, 0, 7)); }
    ink(g, 2.5, outer); ink(g, 1.8, q => q.rect(-w / 2 + 24, -h / 2 + 24, w - 48, h - 48));
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const L of lines) { g.font = L.font; g.letterSpacing = (L.ls || 0) + 'px'; g.fillText(L.text, L.x || 0, L.y); }
    g.restore();
    if (sealText) { const sx = w / 2 - 120, sy = h / 2 - 118; fill(g, '#9a2016', q => q.rect(sx, sy, 76, 76)); g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = '900 30px "Noto Serif SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(sealText[0], sx + 38, sy + 21); g.fillText(sealText[1], sx + 38, sy + 55); g.restore(); ink(g, 2, q => q.rect(sx, sy, 76, 76)); }
  }, { ss: 2, seed: 70 + seed });
}
const YDARK = '#7a2414';
let P = null;
export function buildStage(credit) {
  if (P) return P;
  P = {
    title: plaque(760, 330, [{ text: '半拍', font: '900 190px "Noto Serif SC"', y: 4, ls: 40 }], 1, '皮影'),
    credit: plaque(980, 220, [{ text: credit || '', font: '600 64px "Noto Serif SC"', y: 2, ls: 6 }], 2),
    tree: tree(), bird: bird(), ground: groundStrip(), flowers: flowerPot()
  };
  return P;
}
export function drawPlaque(g, Cam, pc, x, y, sc = 1, o = {}) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.alpha ?? 1; if (o.blur) g.filter = `blur(${o.blur}px)`;
  set(g, mul(Cam, mul(T(x, y), S(sc)))); drawPiece(g, pc); g.restore();
}
// —— Storyteller's placard (viewport): dark lacquer board, thin gold line, small vermilion seal. Text in Noto Serif SC 600, no end punctuation
export function placard(g, text, a = 1, slide = 0, x = 70, yb = null, size = 44) {
  if (!text || a <= 0) return null;
  const Hc = g.canvas.height;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a;
  g.font = `600 ${size}px "Noto Serif SC"`; g.letterSpacing = '4px';
  const tw = g.measureText(text).width, seal = 40, padL = 20, padR = 30, gap = 18;
  const w = padL + seal + gap + tw + padR, h = 68, X = x - slide * 40, Y = (yb ?? Hc - 44) - h;
  g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 16; g.shadowOffsetY = 4;
  const gr = g.createLinearGradient(0, Y, 0, Y + h); gr.addColorStop(0, 'rgba(46,22,14,.95)'); gr.addColorStop(.5, 'rgba(30,14,9,.95)'); gr.addColorStop(1, 'rgba(22,10,7,.95)');
  g.fillStyle = gr; rr(g, X, Y, w, h, 6); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(168,129,63,.8)'; g.lineWidth = 1.5; rr(g, X + 6, Y + 6, w - 12, h - 12, 3); g.stroke();
  const sx = X + padL, sy = Y + (h - seal) / 2;
  g.fillStyle = '#a8261a'; rr(g, sx, sy, seal, seal, 3); g.fill();
  g.strokeStyle = 'rgba(255,220,190,.5)'; g.lineWidth = 1.1; rr(g, sx + 3, sy + 3, seal - 6, seal - 6, 2); g.stroke();
  g.font = '900 26px "Noto Serif SC"'; g.letterSpacing = '0px'; g.fillStyle = '#f6dcc0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('说', sx + seal / 2, sy + seal / 2 + 1);
  g.font = `600 ${size}px "Noto Serif SC"`; g.letterSpacing = '4px'; g.fillStyle = '#f3e2bf'; g.textAlign = 'left'; g.fillText(text, sx + seal + gap, Y + h / 2 + 2);
  g.restore();
  return [X, Y, X + w, Y + h];
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// —— Scenery pieces (pivot at the base)
function tree() {
  return piece([-170, -440, 170, 10], g => {
    const trunk = q => smooth(q, [[-18, 6], [-14, -120], [-24, -200], [-6, -260], [10, -200], [16, -120], [22, 6]]);
    fill(g, DYE.brown, trunk); within(g, trunk, () => { for (let k = 0; k < 6; k++) cutTaper(g, [[-6 + k * 2, -10 - k * 30], [-2 + k * 2, -40 - k * 30], [2, -60 - k * 32]], 2); }); ink(g, 1.8, trunk);
    const crownPts = []; for (let k = 0; k < 15; k++) { const a = k / 15 * Math.PI * 2, r = (k % 2 ? 150 : 175) + 10 * Math.sin(k * 2.3); crownPts.push([Math.cos(a) * r, -300 + Math.sin(a) * r * .72]); }
    const crown = q => smooth(q, crownPts);
    fill(g, DYE.green, crown);
    within(g, crown, () => { for (let k = 0; k < 120; k++) { const a = k * 2.399, rr2 = Math.sqrt(k / 120) * 150; const x = Math.cos(a) * rr2, y = -300 + Math.sin(a) * rr2 * .72; cut(g, q => { q.ellipse(x, y, 9, 3.6, a, 0, 7); }); } for (let k = 0; k < 5; k++) cloud(g, -100 + k * 50, -300 + (k % 2 ? 40 : -50), 14, k, 2.4, k % 2 ? 1 : -1); });
    fill(g, DYE.jade, q => smooth(q, crownPts.map(([x, y]) => [x * .45 + 30, (y + 300) * .45 - 330])));
    within(g, q => smooth(q, crownPts.map(([x, y]) => [x * .45 + 30, (y + 300) * .45 - 330])), () => lattice(g, -60, -400, 120, -260, 12, 2.4));
    ink(g, 2, crown);
  }, { seed: 81 });
}
function bird() {
  return piece([-30, -26, 34, 12], g => {
    const b = q => smooth(q, [[-26, -2], [-12, -12], [6, -14], [18, -20], [28, -18], [22, -12], [14, -4], [0, 6], [-16, 6]]);
    fill(g, DYE.orange, b); cut(g, q => q.arc(18, -16, 1.8, 0, 7)); cloud(g, -2, -4, 5, 0, 1.2); ink(g, 1.3, b);
    const w = q => smooth(q, [[-8, -8], [-20, -24], [4, -20], [6, -8]]); fill(g, DYE.blue, w); ink(g, 1.1, w);
  }, { seed: 82 });
}
function flowerPot() {
  return piece([-60, -120, 60, 6], g => {
    const pot = q => poly(q, [[-34, 0], [34, 0], [44, -50], [-44, -50]]);
    fill(g, DYE.blue, pot); within(g, pot, () => lattice(g, -46, -50, 46, 0, 9, 1.6)); ink(g, 1.6, pot);
    for (const [x, y] of [[-26, -84], [0, -104], [26, -84]]) { fill(g, DYE.red, q => q.arc(x, y, 14, 0, 7)); plum(g, x, y, 6); ink(g, 1.3, q => q.arc(x, y, 14, 0, 7)); ink(g, 2, q => { q.moveTo(x, y + 14); q.lineTo(0, -50); }, DYE.green); }
  }, { seed: 83 });
}
function groundStrip() {
  return piece([-20, -24, CW + 20, 70], g => {
    const s = q => { q.moveTo(-20, 0); for (let x = -20; x <= CW + 20; x += 40) q.lineTo(x, Math.sin(x * .013) * 4 - 2); q.lineTo(CW + 20, 70); q.lineTo(-20, 70); q.closePath(); };
    fill(g, DYE.brown, s); within(g, s, () => { meander(g, 0, 26, CW, 7, 1.8); for (let x = 30; x < CW; x += 60) coin(g, x, 50, 7); }); ink(g, 2, s);
  }, { seed: 84 });
}
export function drawScenePiece(g, Cam, pc, x, y, sc = 1, rot = 0, o = {}) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = o.alpha ?? 1; if (o.blur) g.filter = `blur(${o.blur}px)`;
  set(g, mul(Cam, mul(mul(T(x, y), R(rot)), S((o.flip || 1) * sc, sc)))); drawPiece(g, pc); g.restore();
}
