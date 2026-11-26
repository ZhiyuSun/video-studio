// 《典当》 — the eleven shots. Each gets S = { t, lt, u, g, e, A } and draws the scene (g) and its emitters (e).
import { canvas, W, H, TAU, LWK, rgba, mix, vgrad, airbrush, rng, poly, path, cel, line, hash } from './cel.js';
import { PAL } from './pal.js';
import { heroProfile, heroBack, eyeECU, keeper, umbrellaPerson } from './chars.js';
import { rain, splashes, speedLines, flare, lamp, trail } from './fx.js';
import { neonText, neonRect, drawLoop } from './bg.js';
import { drawMemory } from './memory.js';
import { T, BEAT, BAR, bar, q12, q8, f12 } from './story.js';

const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
const eo = u => 1 - Math.pow(1 - u, 3);
const lerp = (a, b, u) => a + (b - a) * u;

// —— offscreen layers ——
const [LC, LG] = canvas(W, H), [MC, MG] = canvas(W, H);
export function celLayer(S, fn, o = {}) {
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.globalCompositeOperation = 'source-over'; LG.clearRect(0, 0, W, H); LG.globalAlpha = 1; LG.filter = 'none';
  fn(LG);
  S.g.save(); S.g.setTransform(1, 0, 0, 1, 0, 0); if (o.alpha != null) S.g.globalAlpha = o.alpha; S.g.drawImage(LC, 0, 0); S.g.restore();
  if (o.occlude !== false) {   // stamp the cel's silhouette into the emissive layer so glow never bleeds through it
    MG.setTransform(1, 0, 0, 1, 0, 0); MG.globalCompositeOperation = 'source-over'; MG.clearRect(0, 0, W, H); MG.drawImage(LC, 0, 0);
    MG.globalCompositeOperation = 'source-in'; MG.fillStyle = o.occCol || '#000'; MG.fillRect(0, 0, W, H); MG.globalCompositeOperation = 'source-over';
    S.e.save(); S.e.setTransform(1, 0, 0, 1, 0, 0); S.e.globalAlpha = o.occA ?? 1; S.e.drawImage(MC, 0, 0); S.e.restore();
  }
  return LC;
}
// light band sweeping across whatever is on the cel layer (move light, not drawings)
function band(c, x, w, col, a, ang = .35) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop';
  c.translate(x, H / 2); c.rotate(ang);
  const gr = c.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(.5, rgba(col, a)); gr.addColorStop(1, rgba(col, 0));
  c.fillStyle = gr; c.fillRect(-w, -1600, w * 2, 3200); c.restore();
}
// the memory, rendered each frame into its own canvases
const [QC, QG] = canvas(W, H), [QE, QEG] = canvas(W, H);
function memFrame(t, A, o = {}) {
  QG.setTransform(1, 0, 0, 1, 0, 0); QEG.setTransform(1, 0, 0, 1, 0, 0);
  QG.globalCompositeOperation = 'source-over'; QEG.globalCompositeOperation = 'source-over';
  QEG.fillStyle = '#000'; QEG.fillRect(0, 0, W, H);
  drawMemory(null, QG, QEG, t, A, o);
  return [QC, QE];
}
// cover-fit the memory into a rectangle (on scene + glow), optional power-on dot → line → picture
function memInto(S, x, y, w, h, o = {}) {
  const { g, e, t, A } = S;
  const [mc, me] = memFrame(o.mt ?? t, A, o);
  const p = o.power ?? 1;
  const sx = clamp(p / .3), sy = Math.max(.004, clamp((p - .3) / .7));
  const cw = w * sx, ch = h * sy, cx = x + w / 2, cy = y + h / 2;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#05070a'; g.fillRect(x, y, w, h);
  if (p > 0) {
    const k = Math.max(w / W, h / H);
    g.save(); g.beginPath(); g.rect(cx - cw / 2, cy - ch / 2, cw, ch); g.clip();
    g.globalAlpha = o.alpha ?? 1;
    g.drawImage(mc, cx - W * k / 2, cy - H * k / 2, W * k, H * k);
    if (p < 1) { g.fillStyle = rgba('#ffffff', Math.pow(1 - sy, 2)); g.fillRect(cx - cw / 2, cy - ch / 2, cw, ch); }
    g.restore();
    e.save(); e.beginPath(); e.rect(cx - cw / 2, cy - ch / 2, cw, ch); e.clip(); e.globalAlpha = (o.glow ?? .5) * (o.alpha ?? 1);
    e.drawImage(o.glowSrc === 'scene' ? mc : me, cx - W * k / 2, cy - H * k / 2, W * k, H * k);
    if (p < 1) { e.globalAlpha = 1; e.fillStyle = rgba('#ffffff', 1 - sy); e.fillRect(cx - cw / 2, cy - ch / 2, cw, ch); }
    e.restore();
  }
  // screen scanlines + glass highlight
  g.fillStyle = rgba('#000000', .16); for (let yy = y; yy < y + h; yy += 4) g.fillRect(x, yy, w, 1.5);
  g.restore();
}
// HUD text, emissive
function glowText(g, e, txt, x, y, font, col, o = {}) {
  for (const [c, pass] of [[g, 0], [e, 1]]) {
    if (!c) continue;
    c.save(); c.font = font; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
    if (pass) { c.globalAlpha = o.ga ?? .8; c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 16; c.fillText(txt, x, y); }
    else { c.fillStyle = mix(col, '#ffffff', .55); c.fillText(txt, x, y); }
    c.restore();
  }
}
const textW = (g, txt, font) => { g.save(); g.font = font; const w = g.measureText(txt).width; g.restore(); return w; };
const BIG = '900 96px HeiSC', MID = '900 64px HeiSC', MONO = '84px HUD', MONO2 = '56px HUD';

// ═════════ 1 · wrist display (cold open) ═════════
function wristDevice(S, o) {
  const { g, e, t } = S, P = PAL.night, fr = f12(t);
  // painted bokeh plate
  g.drawImage(S.A.bokeh.c, -40 + Math.sin(t * .3) * 20, -20); e.drawImage(S.A.bokeh.e, -40 + Math.sin(t * .3) * 20, -20);
  const z = o.z ?? 1;
  const tx = [];
  celLayer(S, c => {
    c.translate(960, 540); c.scale(z, z); c.rotate(-.07); c.translate(-960, -540);
    // sleeve from the lower right
    cel(c, [[2100, 1200], [2100, 500], [1500, 300], [1300, 360], [1180, 820], [1400, 1200]], { f: P.coat.f, s: P.coat.s, so: [0, 40], h: P.coat.h, ho: [0, -16], l: P.coat.l, lw: 3, rim: { c: '#ff5ab0', d: [4, -6] } });
    line(c, [[1420, 360], [1330, 820]], P.coat.l, 3);
    // gloved fist on the left
    cel(c, [[360, 520], [500, 440], [600, 470], [640, 640], [580, 760], [420, 760], [330, 660]], { f: P.lining.f, s: P.lining.s, so: [0, 30], h: P.lining.h, ho: [0, -10], l: P.lining.l, lw: 3 });
    for (let i = 0; i < 3; i++) line(c, [[380 + i * 10, 560 + i * 60], [540, 520 + i * 70]], P.lining.l, 2.5);
    // band + device body
    cel(c, [[560, 470], [1360, 400], [1380, 760], [580, 830]], { f: '#22222e', s: '#12121a', so: [0, 30], h: '#5a5a74', ho: [0, -10], l: '#05050a', lw: 3 });
    const scr = [[630, 500], [1300, 444], [1316, 716], [648, 772]];
    cel(c, scr, { f: '#120408', l: '#2a1018', lw: 2 });
  }, {});
  // screen content (scene + glow): same transform
  for (const c of [g, e]) { c.save(); c.translate(960, 540); c.scale(z, z); c.rotate(-.07); c.translate(-960, -540); }
  const col = o.col;
  o.draw(g, e, tx);
  for (const c of [g, e]) c.restore();
  // beads of rain on the glass (static, with a hard highlight) and drops sliding down on twos
  g.save(); g.translate(960, 540); g.scale(z, z); g.rotate(-.07); g.translate(-960, -540);
  const R = rng(41);
  for (let i = 0; i < 46; i++) {
    const x = 600 + R() * 760, y0 = 440 + R() * 360, r = 4 + R() * 9, slide = R() < .2 ? ((fr / 12 * 40 + R() * 300) % 300) : 0;
    const y = y0 + slide;
    g.fillStyle = rgba('#ffffff', .12); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.fillStyle = rgba('#ffffff', .7); g.beginPath(); g.arc(x - r * .35, y - r * .35, r * .3, 0, TAU); g.fill();
    g.strokeStyle = rgba('#000000', .25); g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, r, .2, 2.6); g.stroke();
  }
  g.restore();
  // a highlight sweeping across the device glass
  const bx = lerp(-200, 2200, seg(t % 5.2, 1.0, 4.4));
  g.save(); g.globalCompositeOperation = 'screen'; g.translate(bx, 540); g.rotate(.5);
  const gr = g.createLinearGradient(-90, 0, 90, 0); gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(.5, rgba('#ffffff', .1)); gr.addColorStop(1, rgba('#ffffff', 0));
  g.fillStyle = gr; g.fillRect(-90, -900, 180, 1800); g.restore();
  rain(g, e, fr, { n: 150, ang: .2, len: [60, 140], a: .3, w: 1.6, seed: 3 });
  return tx;
}
export function wrist(S) {
  const { t } = S, u = S.lt / (bar(2));
  const z = 1 + .07 * ease(u);
  let tx = [];
  wristDevice(S, { z, draw: (g, e) => {
    const red = '#ff2a3a', on = t > .25;
    if (!on) return;
    // warning triangle blinks on the beat
    const bl = Math.floor(t / BEAT) % 2 === 0;
    if (bl) { for (const c of [g, e]) { c.save(); c.fillStyle = c === g ? mix(red, '#ffffff', .4) : red; c.beginPath(); c.moveTo(712, 650); c.lineTo(760, 566); c.lineTo(808, 650); c.closePath(); c.fill(); c.fillStyle = '#120408'; c.fillRect(756, 596, 8, 30); c.fillRect(756, 632, 8, 8); c.restore(); } }
    glowText(g, e, '余额 ¥0.00', 690, 530, '900 66px HeiSC', red);
    if (t > .8) {
      glowText(g, e, '断电倒计时', 840, 612, '900 50px HeiSC', red);
      const left = 59 - Math.floor((t - .8) / BEAT);
      glowText(g, e, '23:59:' + String(Math.max(0, left)).padStart(2, '0'), 840, 690, '64px HUD', red);
    }
  } });
  // reading boxes (screen-space, approximate; the device is near the centre)
  return { power: Math.min(1, t / .6), texts: [
    t > .25 && { id: 'w1', text: '余额 ¥0.00', x0: 640, y0: 470, x1: 1080, y1: 590 },
    t > .8 && { id: 'w2', text: '断电倒计时', x0: 780, y0: 560, x1: 1150, y1: 650 },
    t > .8 && { id: 'w3', text: 'clock', x0: 780, y0: 640, x1: 1150, y1: 740, pass: true },
  ].filter(Boolean) };
}

// ═════════ 2 · crane down the tower canyon to the pawnshop sign ═════════
export function crane(S) {
  const { g, e, A, t, u } = S;
  const k = ease(clamp(u * 1.06));
  const F = A.tallFar, N = A.tallNear;
  const yF = -k * (F.h - H), yN = -k * (N.h - H);
  g.drawImage(F.c, 0, yF); e.drawImage(F.e, 0, yF);
  // flying cars crossing between the layers
  for (let i = 0; i < 4; i++) {
    const py = 900 + i * 520 + yF * .2 + yN * .0, sp = (i % 2 ? -1 : 1), x = ((t * 420 * (1 + i * .3) + i * 700) % 2600) - 340;
    const X = sp > 0 ? x : W - x, Y = py + yN * .25;
    if (Y < -50 || Y > H + 50) continue;
    trail(g, e, Array.from({ length: 10 }, (_, j) => [X - sp * j * 30, Y]), i % 2 ? '#ff3a4a' : '#9fe8ff', 4);
  }
  g.drawImage(N.c, 0, yN); e.drawImage(N.e, 0, yN);
  // the pawnshop: door + sign (plate coordinates on the near layer)
  const base = N.base + yN;
  const sx = 470, sy = N.base - 760 + yN;
  // door: green-lit doorway under the sign
  g.fillStyle = '#0a1612'; g.fillRect(sx - 90, base - 230, 180, 230);
  vgrad(g, sx - 70, base - 210, 140, 210, [[0, '#2a7a5a'], [1, '#5affb0']]);
  e.fillStyle = rgba('#3dff9a', .35); e.fillRect(sx - 70, base - 210, 140, 210);
  airbrush(g, sx, base, 260, 60, '#3dff9a', .18);
  // sign strikes on the bar
  const on = signOn(t);
  g.fillStyle = '#0c1a16'; g.fillRect(sx - 72, sy, 144, 4 * 118 + 60);
  if (on > 0) {
    g.save(); g.globalAlpha = on; neonText(g, e, '记忆典当', sx, sy + (4 * 118 + 60) / 2, 104, '#3dff9a', true); neonRect(g, e, sx - 62, sy + 8, 124, 4 * 118 + 44, '#3dff9a', 8); g.restore();
    airbrush(g, sx, sy + 270, 260, 320, '#3dff9a', .16 * on);
  } else {   // unlit tube: pale glass
    g.save(); g.font = '104px HeiSC'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.strokeStyle = rgba('#a0c0b8', .35); g.lineWidth = 4;
    [...'记忆典当'].forEach((ch, i) => g.strokeText(ch, sx, sy + (4 * 118 + 60) / 2 + (i - 1.5) * 109)); g.restore();
  }
  // the hero, small, walking towards the door
  const fr = f12(t);
  if (base < H + 300) {
    const hx = lerp(820, 600, seg(t, bar(3.5), bar(5)));
    celLayer(S, c => { c.translate(hx, base + 40); c.scale(.32, .32); heroBack(c, PAL.night, { ph: (fr % 8) / 8, walk: 1, rim: { c: '#3dff9a', d: [-5, 0] } }); });
  }
  rain(g, e, fr, { n: 200, ang: .06, len: [70, 150], a: .26, w: 1.4, seed: 5 });
  if (u > .7) splashes(g, fr % 3, base + 10, H, 18, '#bfb0ff');
  const vis = sy > -10 && sy + 532 < H;
  return { texts: on > .5 && vis ? [{ id: 'sign', text: '记忆典当', x0: sx - 70, y0: sy, x1: sx + 70, y1: sy + 532 }] : [] };
}
function signOn(t) {
  if (t < T.signOn) return 0;
  const d = t - T.signOn, pat = [1, 0, 1, 1, 0, 0, 1];
  if (d < .58) return pat[Math.floor(d * 12)] ? .9 : 0;
  return 1;
}

// ═════════ 3 · the counter (locked side two-shot) ═════════
function shopBack(S, o = {}) {
  const { g, e, A, t } = S;
  g.drawImage(A.shop.c, o.dx || 0, 0); e.drawImage(A.shop.e, o.dx || 0, 0);
  // rain running down the window (on twos)
  const fr = f12(t), R = rng(70 + fr % 3);
  g.save(); g.beginPath(); g.rect(1180 + (o.dx || 0), 60, 640, 380); g.clip();
  for (let i = 0; i < 40; i++) { const x = 1180 + (o.dx || 0) + R() * 640, y = 60 + R() * 380; g.strokeStyle = rgba('#ffb0e0', .35); g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y + 30 + R() * 40); g.stroke(); }
  g.restore();
}
export function shopPlate() {
  const [c, g] = canvas(W, H), [ec, e] = canvas(W, H), R = rng(12);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  vgrad(g, 0, 0, W, H, [[0, '#0d1418'], [.6, '#16222a'], [1, '#0a1014']]);
  // window, top right: neon outside in the rain
  vgrad(g, 1180, 60, 640, 380, [[0, '#2a0a3a'], [1, '#5a1a5a']]);
  for (let i = 0; i < 7; i++) { const x = 1220 + R() * 560, y = 120 + R() * 260, col = ['#ff3fa4', '#35e7ff', '#ffd23f'][i % 3]; airbrush(g, x, y, 50 + R() * 60, 40 + R() * 50, col, .5); airbrush(e, x, y, 50 + R() * 60, 40 + R() * 50, col, .35); }
  g.strokeStyle = '#05080a'; g.lineWidth = 16; g.strokeRect(1180, 60, 640, 380); g.lineWidth = 10; g.beginPath(); g.moveTo(1500, 60); g.lineTo(1500, 440); g.moveTo(1180, 250); g.lineTo(1820, 250); g.stroke();
  airbrush(g, 1500, 520, 520, 220, '#ff3fa4', .1);
  // shelves of memories: small jars, each with its own little glow
  for (let s = 0; s < 4; s++) {
    const y = 150 + s * 150;
    g.fillStyle = '#2a1a22'; g.fillRect(40, y + 70, 1060, 14); g.fillStyle = '#4a3040'; g.fillRect(40, y + 70, 1060, 4);
    for (let i = 0; i < 14; i++) {
      if (R() < .2) continue;
      const x = 80 + i * 74 + R() * 10, h = 40 + R() * 24, col = ['#ffd27a', '#7ae8ff', '#ff8ac0', '#a0ff9a', '#c8a0ff'][Math.floor(R() * 5)];
      g.fillStyle = rgba(col, .55); g.fillRect(x, y + 70 - h, 36, h);
      g.fillStyle = rgba('#ffffff', .5); g.fillRect(x + 4, y + 70 - h + 4, 5, h - 10);
      g.fillStyle = '#6a6070'; g.fillRect(x - 2, y + 70 - h - 8, 40, 9);
      e.fillStyle = rgba(col, .4); e.fillRect(x, y + 70 - h, 36, h);
      g.fillStyle = '#e8e0c8'; g.fillRect(x + 6, y + 50, 24, 10);   // price tags
    }
  }
  // hanging lamp, low, cool
  g.fillStyle = '#1a2a2a'; g.fillRect(598, 0, 4, 120);
  cel(g, [[540, 150], [660, 150], [630, 110], [570, 110]], { f: '#3a5050', s: '#203030', so: [0, 8], l: '#0a1212', lw: 2 });
  airbrush(g, 600, 160, 160, 60, '#c8fff0', .3); airbrush(e, 600, 156, 70, 26, '#d0fff0', .6);
  return { c, e: ec };
}
function counterFG(g, e, P, y = 770) {
  cel(g, [[-20, y], [1940, y], [1940, 1100], [-20, 1100]], { f: P.counter.f, s: P.counter.s, sh: [[[-20, y + 40], [1940, y + 40], [1940, 1100], [-20, 1100]]], l: P.counter.l, lw: 3 });
  g.fillStyle = mix(P.counter.h, '#7affd0', .3); g.fillRect(-20, y, 1960, 6);
}
function crtSet(S, x, y, w, h, o = {}) {
  const { g, e, t } = S, P = PAL.shop;
  // body
  const bw = w * 1.25, bh = h * 1.32;
  cel(g, [[x - bw / 2, y - bh / 2], [x + bw / 2, y - bh / 2], [x + bw / 2, y + bh / 2], [x - bw / 2, y + bh / 2]].map(p => [p[0], p[1], 1]), { f: P.crt.f, s: P.crt.s, so: [-w * .05, 0], h: P.crt.h, ho: [0, h * .03], l: P.crt.l, lw: 3 });
  // knobs
  for (let i = 0; i < 2; i++) { const kp = new Path2D(); kp.arc(x + w * .55, y - h * .25 + i * h * .3, w * .035, 0, TAU); cel(g, kp, { f: P.metal.f, s: P.metal.s, so: [0, 3], l: P.metal.l, lw: 2 }); }
  g.fillStyle = '#05070a'; g.beginPath(); g.roundRect(x - w / 2 - w * .06, y - h / 2, w, h, w * .05); g.fill();
  const p = o.power ?? 1;
  if (p > 0) {
    if (o.static) {   // a moment of snow before the picture
      const R = rng(f12(t) * 7);
      g.save(); g.beginPath(); g.roundRect(x - w / 2 - w * .06, y - h / 2, w, h, w * .05); g.clip();
      for (let i = 0; i < 400; i++) { const v = R(); g.fillStyle = `rgb(${v * 200},${v * 220},${v * 210})`; g.fillRect(x - w / 2 - w * .06 + R() * w, y - h / 2 + R() * h, 6, 3); }
      g.restore(); e.fillStyle = rgba('#a0ffd0', .2); e.fillRect(x - w / 2, y - h / 2, w, h);
    } else memInto(S, x - w / 2 - w * .06, y - h / 2, w, h, { power: p, glow: .7, alpha: o.alpha, bleach: o.bleach });
  }
  // glass highlight
  g.fillStyle = rgba('#ffffff', .08); g.fill(poly([[x - w * .5, y - h * .48], [x - w * .1, y - h * .48], [x - w * .5, y]]));
}
export function counter(S) {
  const { g, e, t, lt } = S, P = PAL.shop;
  shopBack(S);
  // the keeper, backlit by the lamp, monocle lights up
  const lens = seg(t, T.lens, T.lens + .25), lean = ease(seg(t, T.lens, T.lens + 1.2)) * 20;
  celLayer(S, c => { c.translate(430 + lean, 600); keeper(c, null, P, { lens, hands: [[620 - lean, 180], [520 - lean, 200]], fingers: q8(t) * .3, rim: { c: '#9affe0', d: [-6, -6] } }); });
  if (lens > 0) { const mx = 430 + lean + 92, my = 600 - 152; const gr = e.createRadialGradient(mx, my, 0, mx, my, 100); gr.addColorStop(0, rgba('#7dffb0', .9 * lens)); gr.addColorStop(1, rgba('#3dff90', 0)); e.fillStyle = gr; e.beginPath(); e.arc(mx, my, 100, 0, TAU); e.fill(); }
  counterFG(g, e, P);
  // CRT on the counter
  const pw = seg(t, T.crtOn, T.crtOn + .5);
  crtSet(S, 930, 640, 300, 228, { power: pw, static: t > T.crtOn + .5 && t < T.crtOn + .9 });
  if (pw > 0) airbrush(e, 930, 640, 260, 200, '#a0ffe0', .18);
  // the hero: lifts the cable to his neck port, clicks it in, lowers the hand
  const qt = q12(t);
  const up = ease(seg(qt, bar(5) + .4, T.plug)), down = ease(seg(qt, T.plug + .5, T.plug + 1.4));
  const X = 1420, Y = 430, s = 1.55;
  celLayer(S, c => { c.translate(X, Y); c.scale(s, s);
    heroProfile(c, P, { arm: up * (1 - down), cableEnd: [(1080 - X) / s, (700 - Y) / s], rim: { c: '#ff6ac0', d: [5, -3] }, nod: -.06 * seg(t, T.crtOn, T.crtOn + .5) });
  });
  // a spark at the click
  if (t > T.plug && t < T.plug + 3 / 24) lamp(g, e, X + 74 * s, Y + 66 * s, 16, '#a0fff0', 1);
  if (pw > 0) { airbrush(g, 1300, 520, 160, 200, '#7affd0', .08 * pw); }   // monitor light on his face
  return {};
}

// ═════════ 4 · through the CRT into the memory ═════════
export function memory(S) {
  const { g, e, t, u } = S, P = PAL.shop;
  const z = 1 + 1.35 * ease(clamp(u * 1.1));
  g.save(); e.save();
  for (const c of [g, e]) { c.translate(960, 520); c.scale(z, z); c.translate(-960, -520); }
  shopBack(S);
  counterFG(g, e, P, 900);
  crtSet(S, 960, 520, 880, 668, {});
  g.restore(); e.restore();
  return {};
}

// ═════════ 5 · the price (light band over a held cel, then a nod) ═════════
export function price(S) {
  const { g, e, t, lt } = S, P = PAL.shop;
  g.drawImage(S.A.shop.c, -600, -200, W * 1.6, H * 1.6); e.drawImage(S.A.shop.e, -600, -200, W * 1.6, H * 1.6);
  g.fillStyle = rgba('#05080a', .55); g.fillRect(0, 0, W, H);
  // terminal on the left
  cel(g, poly([[90, 260], [760, 230], [780, 800], [110, 830]]), { f: '#1c2420', s: '#0c120f', so: [0, 20], h: '#4a5a52', l: '#020403', lw: 3 });
  cel(g, poly([[140, 300], [720, 276], [736, 760], [156, 784]]), { f: '#03140b', l: '#0a2a18', lw: 2 });
  const green = '#3dff8a', settled = t >= T.price;
  glowText(g, e, '估价', 200, 390, '900 64px HeiSC', green);
  let num;
  if (!settled) { const R = rng(f12(t)); num = '¥ ' + Math.floor(R() * 9 + 1) + ' ' + String(Math.floor(R() * 1000)).padStart(3, '0'); }
  else num = '¥ 8 800';
  glowText(g, e, num, 200, 560, '120px HUD', green);
  for (let i = 0; i < 6; i++) { g.fillStyle = rgba(green, .25); g.fillRect(200, 640 + i * 22, 300 + (i * 97 % 200), 8); }
  e.fillStyle = rgba(green, .1); e.fillRect(140, 290, 580, 480);
  // the hero, held in close profile, the nod at T.nod
  const nt = q12(t) - T.nod;
  const nod = nt < 0 ? 0 : nt < .17 ? .05 * (nt / .17) : nt < .5 ? lerp(.05, -.24, ease((nt - .17) / .33)) : lerp(-.24, -.08, ease(clamp((nt - .5) / .5)));
  const X = 1330, Y = 470, s = 3.1;
  celLayer(S, c => { c.translate(X, Y); c.scale(s, s); LWK.k = .7;
    heroProfile(c, P, { arm: 0, nod, cableEnd: [-200, 300], rim: { c: '#ff6ac0', d: [4, -2] },
      visorGlow: (c2, vis) => { c2.save(); c2.clip(path(vis)); c2.fillStyle = rgba(green, .35); c2.fillRect(-110, -14, 60, 6); c2.fillRect(-100, -4, 40, 4); c2.restore(); } });
    LWK.k = 1;
    // green light band sweeps across the held drawing
    const bx = lerp(400, 2200, seg(t, T.price + .6, T.price + 2.0));
    band(c, bx, 160, '#7affb0', .35, .25);
  });
  return { texts: [
    { id: 'p1', text: '估价', x0: 190, y0: 340, x1: 340, y1: 440 },
    settled ? { id: 'p2', text: '¥ 8 800', x0: 190, y0: 490, x1: 640, y1: 630 } : { id: 'p0', text: 'roll', x0: 190, y0: 490, x1: 640, y1: 630, pass: true },
  ] };
}

// ═════════ 6 · extraction: eye → impact frame → white → the memory drains → paid ═════════
export function extract(S) {
  const { g, e, t, A } = S;
  if (t < T.impact) {
    const z = 1 + .05 * seg(t, bar(11), T.impact);
    g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960, -540);
    eyeECU(g, e, { P: PAL.shop, open: 1, look: [-.25, 0], dil: 1.15, visorA: .34,
      reflect: (c, IR, ix, iy, iw, ih) => { c.fillStyle = rgba('#3dff8a', .35); c.fillRect(ix - iw * .5, iy - ih * .2, iw * .6, ih * .12); } });
    g.restore();
    // green numbers reflected on the visor
    glowText(g, e, '8 800', 360, 260, '120px HUD', '#3dff8a', { ga: .4 });
    return {};
  }
  if (t < T.flash) {   // impact frame: 2 frames, inverted monochrome silhouette over radial lines
    g.fillStyle = '#f4f0ff'; g.fillRect(0, 0, W, H);
    speedLines(g, f12(t), { type: 'radial', cx: 1240, cy: 380, n: 120, col: '#120a1e', a: .95, r0: 120 });
    const [cc, cg] = [LC, LG]; cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, W, H); cg.translate(1330, 470); cg.scale(3.1, 3.1);
    heroProfile(cg, PAL.shop, { arm: 0, nod: -.1, cableEnd: [-200, 300] });
    cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalCompositeOperation = 'source-in'; cg.fillStyle = '#120a1e'; cg.fillRect(0, 0, W, H); cg.globalCompositeOperation = 'source-over';
    g.drawImage(cc, 0, 0);
    e.fillStyle = rgba('#ffffff', .5); e.fillRect(0, 0, W, H);
    return { track: 1 };
  }
  if (t < T.paid) {   // the memory, full frame: white flash decays, then the colour drains out
    const b = ease(seg(t, T.bleach, T.paid - .15));
    const [mc, me] = memFrame(t, A, { bleach: b });
    const z = 1 - .06 * b;
    g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960, -540); g.drawImage(mc, 0, 0); g.restore();
    e.save(); e.globalAlpha = .6; e.translate(960, 540); e.scale(z, z); e.translate(-960, -540); e.drawImage(me, 0, 0); e.restore();
    // drain: horizontal tearing bands sliding upwards
    if (b > 0) { const R = rng(f12(t)); for (let i = 0; i < 8; i++) { const y = (R() * H - b * 600 + H) % H; g.fillStyle = rgba('#c8d0e0', .25 * b); g.fillRect(0, y, W, 3 + R() * 12); } }
    const wf = 1 - seg(t, T.flash, T.flash + .45);
    if (wf > 0) { g.fillStyle = rgba('#ffffff', wf); g.fillRect(0, 0, W, H); e.fillStyle = rgba('#ffffff', wf * .8); e.fillRect(0, 0, W, H); }
    return { track: t < T.flash + 4 / 24 ? 1 - (t - T.flash) * 6 : 0 };
  }
  // paid: the wrist again, now green (an echo of the opening)
  const z = 1.07 - .03 * seg(t, T.paid, bar(13));
  wristDevice(S, { z, draw: (g2, e2) => {
    const gr = '#3dff8a';
    for (const c of [g2, e2]) { c.save(); c.strokeStyle = c === g2 ? mix(gr, '#ffffff', .4) : gr; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(712, 612); c.lineTo(742, 644); c.lineTo(800, 572); c.stroke(); c.restore(); }
    glowText(g2, e2, '已到账', 840, 612, '900 64px HeiSC', gr);
    glowText(g2, e2, '余额 ¥8 800', 690, 520, '900 56px HeiSC', gr);
  } });
  return { texts: [
    { id: 'e1', text: '已到账', x0: 780, y0: 560, x1: 1100, y1: 660 },
    { id: 'e2', text: '余额 ¥8 800', x0: 640, y0: 470, x1: 1080, y1: 570 },
  ] };
}

// ═════════ 7 · out into the street, from behind ═════════
function streetScene(S, o) {
  const { g, e, A, t } = S;
  const night = o.mode !== 'sun';
  const P = night ? PAL.night : PAL.sun;
  const sky = night ? A.sky : A.skySun, st = night ? A.street : A.streetSun, rf = night ? A.refl : A.reflSun;
  const z = o.z ?? 1, dim = o.dim ?? 1;
  g.save(); e.save();
  for (const c of [g, e]) { c.translate(960, 640); c.scale(z, z); c.translate(-960, -640); }
  const ox = o.ox ?? -1400;
  drawLoop(g, sky.c, sky.w, ox * .5, 0); drawLoop(e, sky.e, sky.w, ox * .5, 0);
  const sy = 560 - st.h + 140;
  drawLoop(g, st.c, st.w, ox, sy); drawLoop(e, st.e, st.w, ox, sy);
  // road + wet reflection
  vgrad(g, -400, sy + st.h, W + 800, H, [[0, night ? '#1a1030' : '#4a3048'], [1, night ? '#07040e' : '#20141e']]);
  g.save(); g.globalAlpha = .9; drawLoop(g, rf.c, rf.w, ox, sy + st.h); g.restore();
  drawLoop(e, rf.e, rf.w, ox, sy + st.h);
  g.fillStyle = night ? '#4a3d66' : '#c8a080'; g.fillRect(-400, sy + st.h, W + 800, 5);
  g.restore(); e.restore();
  if (dim < 1) {   // the street's signs brown out while the big screen draws power
    g.fillStyle = rgba('#05030a', (1 - dim) * .55); g.fillRect(0, 0, W, H);
    e.save(); e.globalCompositeOperation = 'multiply'; const v = Math.round(255 * dim); e.fillStyle = `rgb(${v},${v},${v})`; e.fillRect(0, 0, W, H); e.restore();
  }
  return { P, groundY: 560 + 140 };
}
export function street(S) {
  const { g, e, t, lt } = S;
  const walking = 1 - ease(seg(t, T.stop - .4, T.stop + .2));
  const travel = lt * 90 - Math.max(0, t - T.stop) * 90 * .8;
  // brown-out: flicker then dim at hush2
  let dim = 1;
  if (t > T.hush2) { const d = t - T.hush2; dim = d < .4 ? ([.3, 1, .2, .6, .1][Math.floor(d * 12)] ?? .15) : .15; }
  const { P } = streetScene(S, { z: 1 + lt * .012, ox: -1400 - travel * .6, dim });
  const fr = f12(t);
  // umbrellas passing at the sides (mid layer, getting bigger as we pass them)
  const ppl = [[-1, 0, 0], [1, 1.5, 2], [-1, 3.2, 1], [1, 4.6, 0], [-1, 6.0, 2]];
  for (const [side, t0, ui] of ppl) {
    const k = (lt - t0 * .9) / 3.2; if (k < 0 || k > 1) continue;
    const s = .45 + k * .9, x = 960 + side * (220 + k * 900), y = 760 + k * 420;
    celLayer(S, c => { c.translate(x, y); c.scale(s, s); umbrellaPerson(c, P, { umb: [P.umb, P.umb2, P.umb3][ui], tilt: side * .1, rim: { c: '#ff6ac0', d: [side * -4, -4] } }); });
  }
  // the hero, walking away, camera follows
  const lookUp = ease(seg(t, T.hush2 + .5, T.power));
  celLayer(S, c => { c.translate(960, 1060); c.scale(1.0, 1.0); heroBack(c, P, { ph: (fr % 8) / 8, walk: walking, rim: { c: dim < 1 ? '#6a6aa0' : '#ff6ac0', d: [5, -4] }, lookUp }); });
  rain(g, e, fr, { n: 220, ang: .12, len: [50, 120], a: .3 * (dim < 1 ? .7 : 1), w: 1.5, seed: 8 });
  splashes(g, fr % 3, 760, H, 30, '#c8b8ff');
  return {};
}

// ═════════ 8 · the billboard powers on (low angle, tilt up) — the signature shot ═════════
export function towerPlate() {
  const Hh = 2400, [c, g] = canvas(W, Hh), [ec, e] = canvas(W, Hh), R = rng(55);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, Hh);
  vgrad(g, 0, 0, W, Hh, [[0, '#050418'], [.5, '#120c30'], [1, '#2a1240']]);
  // side towers converge slightly (low angle)
  for (const side of [0, 1]) {
    const pts = side ? [[1920, 0], [1640, 0], [1560, Hh], [1920, Hh]] : [[0, 0], [280, 0], [360, Hh], [0, Hh]];
    g.fillStyle = side ? '#1a1434' : '#161230'; g.fill(poly(pts));
    for (let y = 40; y < Hh; y += 70) for (let i = 0; i < 4; i++) { if (R() > .3) continue; const xx = side ? 1600 + i * 70 + (Hh - y) * -.03 : 30 + i * 70 + (Hh - y) * .03; g.fillStyle = R() < .7 ? '#ffd28a' : '#8fdcff'; g.fillRect(xx, y, 30, 34); e.fillStyle = rgba(g.fillStyle, .3); e.fillRect(xx, y, 30, 34); }
  }
  // the main tower face
  vgrad(g, 340, 0, 1240, Hh, [[0, '#20183e'], [1, '#2e2050']]);
  for (let y = 1300; y < Hh - 300; y += 64) for (let x = 380; x < 1540; x += 60) { if (R() > .2) continue; g.fillStyle = '#ffd28a'; g.fillRect(x, y, 26, 30); e.fillStyle = rgba('#ffd28a', .25); e.fillRect(x, y, 26, 30); }
  // screen frame (the picture is drawn per frame)
  g.fillStyle = '#0a0812'; g.fillRect(250, 260, 1420, 880);
  g.fillStyle = '#3a3450'; g.fillRect(250, 260, 1420, 10); g.fillRect(250, 1130, 1420, 10);
  // banner box under the screen
  g.fillStyle = '#0c0a14'; g.fillRect(380, 1170, 1160, 120);
  // aircraft lights on the roof edges
  for (const x of [300, 960, 1620]) { g.fillStyle = '#ff5050'; g.beginPath(); g.arc(x, 220, 6, 0, TAU); g.fill(); e.fillStyle = '#ff2a2a'; e.beginPath(); e.arc(x, 220, 12, 0, TAU); e.fill(); }
  return { c, e: ec, w: W, h: Hh };
}
export function billboard(S) {
  const { g, e, A, t, lt } = S;
  const Tw = A.tower, tilt = ease(seg(lt, .3, 3.6));
  const yoff = lerp(-(Tw.h - H), -230, tilt) - seg(lt, 3.6, 6.5) * 30;
  const zz = 1 + seg(lt, 3.6, 6.5) * .04;
  const pw = seg(t, T.power, T.power + .6), lit = seg(t, T.power + .35, T.power + 1.2);
  g.save(); e.save();
  for (const c of [g, e]) { c.translate(960, 540); c.scale(zz, zz); c.translate(-960, -540); c.translate(0, yoff); }
  g.drawImage(Tw.c, 0, 0); e.drawImage(Tw.e, 0, 0);
  // noon light spilling down the tower face
  if (lit > 0) { airbrush(g, 960, 1200, 1100, 900, '#ffe6a8', .32 * lit); airbrush(g, 960, 700, 900, 600, '#fff4d0', .2 * lit); }
  const SS = { ...S, g, e };
  memInto(SS, 260, 270, 1400, 860, { power: pw, glow: .9 });
  const adOn = t >= T.adText;
  if (adOn) {
    glowText(g, e, '真实阳光 · 二手回忆', 960, 1230, '900 84px HeiSC', '#fff2c8', { align: 'center' });
    g.fillStyle = '#ff3a4a'; g.fillRect(1250, 990, 380, 110); e.fillStyle = rgba('#ff3a4a', .5); e.fillRect(1250, 990, 380, 110);
    glowText(g, e, '每分钟 ¥9.9', 1440, 1046, '900 64px HeiSC', '#ffffff', { align: 'center', ga: .5 });
  }
  // crowd at the foot of the tower, looking up (silhouettes lit from above once the screen is on)
  const P = lit > .5 ? PAL.sun : PAL.night;
  const baseY = Tw.h + 60;
  const R = rng(9);
  for (let i = 0; i < 11; i++) {
    const x = 80 + i * 180 + R() * 60, s = 1.1 + R() * .3;
    if (i === 5) continue;
    celLayer({ g, e }, c => { c.setTransform(g.getTransform()); c.translate(x, baseY + R() * 40); c.scale(s, s); umbrellaPerson(c, P, { umb: [P.umb, P.umb2, P.umb3][i % 3], up: ease(lit), tilt: (R() - .5) * .3, rim: lit > .5 ? { c: '#fff0b0', d: [0, 6] } : { c: '#6a5aa0', d: [0, 4] } }); }, { occA: .8 });
  }
  celLayer({ g, e }, c => { c.setTransform(g.getTransform()); c.translate(960, baseY + 20); c.scale(1.25, 1.25); heroBack(c, P, { walk: 0, lookUp: 1, rim: lit > .5 ? { c: '#fff0b0', d: [0, 6] } : { c: '#6a5aa0', d: [0, 4] } }); });
  g.restore(); e.restore();
  // the sun's flare from the screen
  if (lit > 0) flare(e, 960 + (1480 - 960) * 1400 / 1920 * zz, (270 + 230 * 860 / 1080 + yoff) * zz + 540 * (1 - zz), .7 * lit, '#fff0c0', { ghostA: .6 });
  rain(g, e, f12(t), { n: 200, ang: .1, len: [60, 130], a: .3, w: 1.5, seed: 11, col: lit > .5 ? '#ffe8c0' : '#cfe3ff' });
  const Y = v => (v + yoff) * zz + 540 * (1 - zz);
  const texts = [];
  if (adOn) {
    texts.push({ id: 'ad1', text: '真实阳光 · 二手回忆', x0: 560, y0: Y(1180), x1: 1360, y1: Y(1280) });
    texts.push({ id: 'ad2', text: '每分钟 ¥9.9', x0: 1250, y0: Y(990), x1: 1630, y1: Y(1100) });
  }
  return { texts, bloom: .85 + .3 * lit };
}

// ═════════ 9 · the eye, with the sun in it ═════════
export function eye(S) {
  const { g, e, t, A, lt, u } = S;
  const z = 1 + .06 * u;
  // one slow blink in three drawings
  const bt = q8(t) - (T.hood - .9);
  const open = bt < 0 ? 1 : bt < .125 ? .45 : bt < .25 ? 0 : bt < .375 ? .5 : 1;
  const [mc] = memFrame(t, A, {});
  g.save(); g.translate(960, 540); g.scale(z, z); g.translate(-960, -540);
  eyeECU(g, e, { P: PAL.sun, open, look: [.1, -.35], dil: .82, visorA: .18,
    reflect: (c, IR, ix, iy, iw, ih) => {
      c.save(); c.globalAlpha = .6; c.globalCompositeOperation = 'screen';
      const rw = iw * 1.3, rh = rw * .56; c.translate(ix, iy - ih * .2); c.scale(1, 1);
      c.drawImage(mc, -rw / 2, -rh / 2, rw, rh); c.restore();
    } });
  g.restore();
  airbrush(e, 960 + 100, 540 - 120, 260, 200, '#fff0c0', .25);
  return {};
}

// ═════════ 10 · the crowd, he lowers his hood and leaves ═════════
export function crowd(S) {
  const { g, e, t, A, lt } = S;
  const { P } = streetScene(S, { mode: 'sun', z: 1.0, ox: -2100 - lt * 6 });
  // billboard light pouring from above-left + the bottom edge of the screen
  airbrush(g, 700, -100, 1300, 700, '#ffe6a8', .3);
  const [mc, me] = memFrame(t, A, {});
  g.save(); g.beginPath(); g.rect(200, -40, 1300, 200); g.clip(); g.drawImage(mc, 200, -560, 1300, 732); g.restore();
  e.save(); e.globalAlpha = .9; e.beginPath(); e.rect(200, -40, 1300, 200); e.clip(); e.drawImage(me, 200, -560, 1300, 732); e.restore();
  g.fillStyle = '#0a0812'; g.fillRect(180, 160, 1340, 16);
  g.fillStyle = '#ff3a4a'; g.fillRect(1120, 40, 360, 104); e.fillStyle = rgba('#ff3a4a', .5); e.fillRect(1120, 40, 360, 104);
  glowText(g, e, '每分钟 ¥9.9', 1300, 92, '900 60px HeiSC', '#ffffff', { align: 'center', ga: .5 });
  const fr = f12(t), R = rng(31);
  const back = [], front = [];
  for (let i = 0; i < 14; i++) { const x = 40 + i * 140 + R() * 60, depth = R(); (depth < .5 ? back : front).push([x, depth, i]); }
  const drawP = ([x, d, i]) => { const s = .62 + d * .35, y = 900 + d * 140;
    celLayer(S, c => { c.translate(x, y); c.scale(s, s); umbrellaPerson(c, P, { umb: [P.umb, P.umb2, P.umb3][i % 3], up: 1, tilt: (hash(i) - .5) * .3, rim: { c: '#fff0b0', d: [-3, 6] } }); }, { occA: .7 }); };
  back.forEach(drawP);
  // the hero: lowers the hood, turns away and walks out of frame right
  const hood = ease(seg(q12(t), T.hood, T.hood + .5)), hold = seg(q12(t), T.hood + .5, T.hood + .8);
  const armUp = hood * (1 - hold);
  const lookUp = 1 - hood;
  const wk = seg(t, T.leave, T.leave + .3), hx = 980 + Math.max(0, t - T.leave) * 360;
  celLayer(S, c => { c.translate(hx, 1010); c.scale(.82, .82); heroBack(c, P, { ph: (fr % 8) / 8, walk: wk, lookUp, armUp, rim: { c: '#fff0b0', d: [-3, 6] } }); });
  front.forEach(drawP);
  rain(g, e, fr, { n: 200, ang: .1, len: [50, 120], a: .3, w: 1.5, seed: 13, col: '#ffe8c0' });
  splashes(g, fr % 3, 860, H, 26, '#ffe8c0');
  return { texts: [{ id: 'ad3', text: '每分钟 ¥9.9', x0: 1120, y0: 40, x1: 1480, y1: 144 }] };
}

// ═════════ 11 · title ═════════
export function title(S) {
  const { g, e, t, A, lt } = S;
  vgrad(g, 0, 0, W, H, [[0, '#04031a'], [.7, '#140c30'], [1, '#2a1238']]);
  // the billboard, far away, still glowing over the rooftops
  g.drawImage(A.sky.c, -300, H - A.sky.h + 60); e.drawImage(A.sky.e, -300, H - A.sky.h + 60);
  airbrush(g, 1500, 900, 400, 160, '#ffe6a8', .3); airbrush(e, 1500, 900, 300, 120, '#ffe6a8', .4);
  g.fillStyle = '#fff2c8'; g.fillRect(1440, 820, 120, 74); e.fillStyle = rgba('#fff2c8', .8); e.fillRect(1440, 820, 120, 74);
  const fr = f12(t);
  // letters flicker on at 12 fps
  const d = t - T.title, pat = [1, 0, 0, 1, 0, 1, 1, 0, 1];
  const on = d < 0 ? 0 : d < .75 ? pat[Math.floor(d * 12)] : 1;
  if (on) {
    const cx = 960, cy = 430;
    for (const [c, pass] of [[g, 0], [e, 1]]) {
      c.save(); c.font = '230px HeiSC'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      if (pass) { c.strokeStyle = '#ff3fa4'; c.lineWidth = 26; c.strokeText('典当', cx, cy); c.fillStyle = rgba('#ffb0e0', .5); c.fillText('典当', cx, cy); }
      else {
        c.strokeStyle = '#ff3fa4'; c.lineWidth = 22; c.strokeText('典当', cx, cy);
        c.strokeStyle = '#1a0828'; c.lineWidth = 12; c.strokeText('典当', cx, cy);
        const gr = c.createLinearGradient(0, cy - 115, 0, cy + 115);
        for (const [o, col] of [[0, '#5ab8ff'], [.46, '#e8f6ff'], [.5, '#ffffff'], [.54, '#7a5ac8'], [.75, '#ff6ab0'], [1, '#ffd27a']]) gr.addColorStop(o, col);
        c.fillStyle = gr; c.fillText('典当', cx, cy);
      }
      c.font = 'italic 900 92px Kanit';
      if (pass) { c.strokeStyle = '#35e7ff'; c.lineWidth = 14; c.strokeText('SUNSHINE PAWN', cx, cy + 210); }
      else {
        c.strokeStyle = '#35e7ff'; c.lineWidth = 12; c.strokeText('SUNSHINE PAWN', cx, cy + 210);
        c.strokeStyle = '#1a0828'; c.lineWidth = 7; c.strokeText('SUNSHINE PAWN', cx, cy + 210);
        const gr = c.createLinearGradient(0, cy + 170, 0, cy + 250);
        for (const [o, col] of [[0, '#5ab8ff'], [.48, '#ffffff'], [.52, '#7a5ac8'], [1, '#ffd27a']]) gr.addColorStop(o, col);
        c.fillStyle = gr; c.fillText('SUNSHINE PAWN', cx, cy + 210);
      }
      c.restore();
    }
    // light sweep through the letters
    const sx = lerp(400, 1600, seg(t, T.title + .9, T.title + 1.9));
    if (t > T.title + .9 && t < T.title + 1.9) { e.save(); e.translate(sx, cy); e.rotate(.3); const gr = e.createLinearGradient(-60, 0, 60, 0); gr.addColorStop(0, rgba('#ffffff', 0)); gr.addColorStop(.5, rgba('#ffffff', .6)); gr.addColorStop(1, rgba('#ffffff', 0)); e.fillStyle = gr; e.fillRect(-60, -300, 120, 600); e.restore(); }
    if (t > T.glint) { const k = seg(t, T.glint, T.glint + .5); flare(e, 1170, 330, .5 * Math.sin(Math.PI * k) + .05, '#ffffff', { ghosts: false, streak: 500 }); }
  }
  rain(g, e, fr, { n: 160, ang: .1, len: [50, 120], a: .22, w: 1.3, seed: 17 });
  // the tape runs out: the picture collapses to a line, then a dot
  const end = seg(t, S.DUR - .55, S.DUR - .05);
  return { power: 1 - end, texts: on && d >= .75 ? [
    { id: 't1', text: '典当', x0: 700, y0: 310, x1: 1220, y1: 550 },
    { id: 't2', text: 'SUNSHINE PAWN', x0: 560, y0: 590, x1: 1360, y1: 690 },
  ] : [] };
}

// bokeh plate for the cold open
export function bokehPlate() {
  const [c, g] = canvas(W + 80, H + 40), [ec, e] = canvas(W + 80, H + 40), R = rng(4);
  e.fillStyle = '#000'; e.fillRect(0, 0, W + 80, H + 40);
  vgrad(g, 0, 0, W + 80, H + 40, [[0, '#0a0620'], [1, '#1a0a2a']]);
  for (let i = 0; i < 40; i++) {
    const x = R() * (W + 80), y = R() * (H + 40), r = 40 + R() * 110, col = ['#ff3fa4', '#35e7ff', '#ffd23f', '#b36bff'][i % 4];
    g.fillStyle = rgba(col, .18 + R() * .2); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
    g.strokeStyle = rgba(col, .25); g.lineWidth = 3; g.stroke();
    e.fillStyle = rgba(col, .12); e.beginPath(); e.arc(x, y, r, 0, TAU); e.fill();
  }
  return { c, e: ec };
}
