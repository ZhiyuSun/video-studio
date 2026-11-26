// ===================== v3: paper-diorama toolkit =====================
function mkc(fn) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'); fn(x); return cv; }
const PTEX = mkc(x => { const r = rng(5); x.fillStyle = '#808080'; x.fillRect(0, 0, W, H);
  for (let i = 0; i < 26000; i++) { const px = r() * W, py = r() * H, l = 4 + r() * 26, a = r() * 6.28; x.strokeStyle = r() < .5 ? `rgba(255,255,255,${.05 + r() * .06})` : `rgba(0,0,0,${.05 + r() * .06})`; x.lineWidth = .6 + r(); x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  for (let i = 0; i < 120000; i++) { x.fillStyle = r() < .5 ? `rgba(255,255,255,${r() * .08})` : `rgba(0,0,0,${r() * .08})`; x.fillRect(r() * W, r() * H, 1.5, 1.5); } });
// paper layer: shape -> fibre texture -> baked drop shadow
function paperL(fn, o = {}) {
  const a = mkc(fn);
  const t = mkc(x => { x.drawImage(a, 0, 0); x.globalCompositeOperation = 'source-in'; x.drawImage(PTEX, 0, 0); });
  const tx = mkc(x => { x.drawImage(a, 0, 0); x.globalCompositeOperation = 'overlay'; x.globalAlpha = o.tex ?? .5; x.drawImage(t, 0, 0); });
  return mkc(x => { if (o.blur) x.filter = `blur(${o.blur}px)`; const s = o.sh === undefined ? [18, 6, 'rgba(5,3,20,.5)'] : o.sh;
    if (s) { x.shadowBlur = s[0]; x.shadowOffsetY = s[1]; x.shadowColor = s[2]; } x.drawImage(tx, 0, 0); });
}
const CACHE = {}; let NOW = 0;
function L(key, fn, o) { let e = CACHE[key]; if (!e) e = CACHE[key] = { cv: o === 'raw' ? mkc(fn) : paperL(fn, o) }; e.t = NOW; return e.cv; }
function evict() { for (const k in CACHE) if (Math.abs(CACHE[k].t - NOW) > 12) delete CACHE[k]; }
function put(cv, dx = 0, dy = 0, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha *= a; g.drawImage(cv, dx, dy); g.restore(); }
function glw(x, y, r, col, a) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(.35, `rgba(${col},${a * .35})`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore(); }
function haze(y0, y1, col, a) { const h = g.createLinearGradient(0, y0, 0, y1); h.addColorStop(0, `rgba(${col},0)`); h.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = h; g.fillRect(0, y0, W, y1 - y0); }
function finish(va = .55) { const v = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(0,0,12,${va})`); g.fillStyle = v; g.fillRect(0, 0, W, H); }
function grad(x, y0, y1, stops) { const s = x.createLinearGradient(0, y0, 0, y1); stops.forEach(([p, c]) => s.addColorStop(p, c)); return s; }
function skyL(key, stops, nStars = 400, starMaxY = 750, seed = 9) { return L(key, x => { x.fillStyle = grad(x, 0, H, stops); x.fillRect(0, 0, W, H); const r = rng(seed);
  for (let i = 0; i < nStars; i++) { const y = r() * starMaxY; x.fillStyle = `rgba(255,240,215,${(.25 + r() * .75) * (1 - y / (starMaxY * 1.2))})`; x.beginPath(); x.arc(r() * W, y, r() * 1.5 + .3, 0, 7); x.fill(); } }, 'raw'); }
function twinkle(t, n = 40, maxY = 700, seed = 3, a = 1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = r() * W, y = r() * maxY, ph = r() * 6.28, k = Math.sin(t * (1 + r() * 2) + ph) ** 2; glw(x, y, 10 + r() * 8, '255,240,215', .6 * k * a); } }
function moonP(x, y, r, ill, waning = false, glowA = .25, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha *= a; glw(x, y, r * 4, '255,220,160', glowA); g.translate(x, y); if (waning) g.scale(-1, 1);
  g.fillStyle = 'rgba(120,120,170,.22)'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill();
  if (ill < .03) { g.strokeStyle = 'rgba(255,230,180,.55)'; g.lineWidth = Math.max(1.5, r * .05); g.beginPath(); g.arc(0, 0, r, -1.1, 1.1); g.stroke(); g.restore(); return; }
  g.beginPath(); g.arc(0, 0, r, 0, 7); g.clip(); const k = 1 - 2 * Math.min(ill, .999); g.fillStyle = '#fbe6b6'; g.shadowColor = 'rgba(255,225,160,.9)'; g.shadowBlur = 30;
  g.beginPath(); g.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); g.ellipse(0, 0, r * Math.abs(k), r, 0, Math.PI / 2, -Math.PI / 2, k > 0); g.fill();
  if (ill > .9) { g.shadowBlur = 0; g.fillStyle = 'rgba(200,170,120,.10)'; [[-.3, -.2, .25], [.25, .15, .18], [-.05, .4, .12]].forEach(([a1, b, c1]) => { g.beginPath(); g.arc(a1 * r, b * r, c1 * r, 0, 7); g.fill(); }); }
  g.restore(); }
// override the old moon helpers so every scene uses the new moon
moon = (x, y, r, ph, a = 1, gl = 1) => moonP(x, y, r, ph, false, .18 * gl, a);
moonW = (x, y, r, ill, wan, a = 1, gl = 1) => moonP(x, y, r, ill, wan, .18 * gl, a);

// ---------- coloured paper dolls ----------
function shade(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = n >> 8 & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
function doll(x, y, h, who, o = {}) {
  const s = h / 100, col = o.col || (who === 'he' ? HE : SHE);
  g.save(); g.translate(x, y);
  if (!o.noShadow) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 22 * s, 5 * s, 0, 0, 7); g.fill(); }
  if (o.lean) g.rotate(o.lean); g.scale(s, s);
  if (o.bob) g.translate(0, -Math.abs(Math.sin(o.bob)) * 4);
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  const leg = shade(col, -.22); g.fillStyle = leg; const lg = o.run !== undefined ? Math.sin(o.run) * 7 : 0;
  if (!o.kneel && !o.sit) { g.beginPath(); g.roundRect(-8 - lg, -24, 7, 24, 3.5); g.fill(); g.beginPath(); g.roundRect(1 + lg, -24, 7, 24, 3.5); g.fill(); }
  if (o.kneel) { g.beginPath(); g.roundRect(-10, -8, 22, 8, 4); g.fill(); g.translate(0, 16); }
  if (o.sit) { g.beginPath(); g.roundRect(-10, -26, 26, 8, 4); g.fill(); g.translate(0, 4); }
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.strokeStyle = shade(col, -.05); g.lineWidth = 6.5; g.lineCap = 'round';
  const shy = who === 'he' ? -58 : -52;
  const arm = (side, tgt) => { if (tgt === null) return; const sx = side * (who === 'he' ? 13 : 9); const [dx, dy] = tgt || [side * 6, 30]; g.beginPath(); g.moveTo(sx, shy); g.quadraticCurveTo(sx + dx * .4 + side * 4, shy + dy * .5, sx + dx, shy + dy); g.stroke(); g.fillStyle = shade(col, .1); g.beginPath(); g.arc(sx + dx, shy + dy, 4.2, 0, 7); g.fill(); };
  arm(-1, o.armL); arm(1, o.armR);
  const body = g.createLinearGradient(-20, -70, 20, 0); body.addColorStop(0, shade(col, .25)); body.addColorStop(1, shade(col, -.12)); g.fillStyle = body;
  if (who === 'he') { g.beginPath(); g.moveTo(-15, -22); g.lineTo(-12, -58); g.quadraticCurveTo(0, -66, 12, -58); g.lineTo(15, -22); g.quadraticCurveTo(0, -18, -15, -22); g.fill(); }
  else { g.beginPath(); g.moveTo(-20, -20); g.quadraticCurveTo(-9, -34, -8, -50); g.quadraticCurveTo(0, -56, 8, -50); g.quadraticCurveTo(9, -34, 20, -20); g.quadraticCurveTo(0, -15, -20, -20); g.fill(); }
  if (o.veil) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(-4, -78); g.quadraticCurveTo(-30, -40, -26, -16); g.lineTo(6, -16); g.quadraticCurveTo(-6, -45, 8, -76); g.closePath(); g.fill(); }
  if (o.scarf) { g.fillStyle = o.scarf; g.beginPath(); g.roundRect(-12, -62, 24, 8, 4); g.fill(); g.fillRect(4, -56, 7, 16); }
  const hy = who === 'he' ? -77 : -68, hr = who === 'he' ? 14 : 13;
  const hg = g.createRadialGradient(-5, hy - 6, 2, 0, hy, hr * 1.2); hg.addColorStop(0, shade(col, .35)); hg.addColorStop(1, shade(col, -.06)); g.fillStyle = hg;
  g.beginPath(); g.arc(0, hy, hr, 0, 7); g.fill();
  if (who === 'she') { g.beginPath(); g.arc(8, hy - 12, 6.5, 0, 7); g.fill(); }
  if (o.ears) { g.beginPath(); g.moveTo(-10, hy - 7); g.lineTo(-10, hy - 21); g.lineTo(-2, hy - 12); g.fill(); g.beginPath(); g.moveTo(10, hy - 7); g.lineTo(10, hy - 21); g.lineTo(2, hy - 12); g.fill(); }
  if (o.light) { g.strokeStyle = `rgba(${o.light},.75)`; g.lineWidth = 1.6; g.beginPath(); g.arc(0, hy, hr - .5, -1.9, .3); g.stroke(); }
  if (o.smile) { g.strokeStyle = 'rgba(80,45,55,.85)'; g.lineWidth = 1.7; [-5, 5].forEach(dx => { g.beginPath(); g.arc(dx, hy + 1, 3, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); });
    g.fillStyle = 'rgba(240,110,120,.45)'; [-8, 8].forEach(dx => { g.beginPath(); g.arc(dx, hy + 5, 2.8, 0, 7); g.fill(); }); }
  if (o.sleep) { g.strokeStyle = 'rgba(80,45,55,.85)'; g.lineWidth = 1.7; [-5, 5].forEach(dx => { g.beginPath(); g.moveTo(dx - 3, hy + 1); g.lineTo(dx + 3, hy + 1); g.stroke(); }); }
  g.restore();
}
// old person() calls now draw paper dolls (old s≈ height/68)
person = function (x, y, s, who, o = {}) { doll(x, y, s * 72, who, { col: o.col, smile: o.smile, lean: o.lean, kneel: o.kneel, ears: o.ears, veil: o.veil, run: o.walk ? o.walk * Math.PI : undefined, bob: o.walk ? o.walk * Math.PI : undefined, noShadow: s < 1.2 }); };
handLink = () => { };
// a couple holding hands: he at x, she to the right
function couple(x, y, h, o = {}) {
  const gap = h * .34; const run = o.run;
  doll(x, y, h, 'he', { armR: [gap * 100 / h * .5 + 4, o.handUp ? -6 : 6], armL: o.heArmL, run, bob: run, smile: o.heSmile, light: o.light, kneel: o.kneel, scarf: o.scarf1 });
  doll(x + gap, y, h * .92, 'she', { armL: [-(gap * 100 / (h * .92) * .5 + 2), o.handUp ? -2 : 10], armR: o.sheArmR, run: run === undefined ? undefined : run + Math.PI, bob: run === undefined ? undefined : run + Math.PI, smile: o.smile, light: o.light, lean: o.lean, veil: o.veil, scarf: o.scarf2 });
}
function stampP(t, a, l1, l2) { stamp(t, a, l1, l2, 90, 92); }
function card(x, y, w, h, rot, fill = 'rgba(255,248,236,.97)') { g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 6; g.fillStyle = fill; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 10); g.fill(); g.restore(); }
// generic layered city skyline (cached), used in several scenes
function bld(x, X, base, w, h, col, o = {}) { const top = base - h; const gr2 = x.createLinearGradient(0, top, 0, base); gr2.addColorStop(0, o.topCol || col); gr2.addColorStop(1, col); x.fillStyle = gr2;
  x.beginPath(); if (o.shape) o.shape(x, X, top, w, h, base); else x.rect(X, top, w, h); x.fill('evenodd');
  if (o.win) { x.save(); x.clip(); const r = rng(o.seed || 1); const cw = o.cw || 14, ch = o.ch || 18; for (let yy = top + 12; yy < base - 6; yy += ch) for (let xx = X + 6; xx < X + w - 6; xx += cw) { if (r() < o.win) { const warm = r(); x.fillStyle = o.dim ? `rgba(120,110,170,${.25 + r() * .2})` : `rgba(255,${205 + warm * 40 | 0},${140 + warm * 70 | 0},${.55 + r() * .45})`; x.fillRect(xx, yy, cw * .42, ch * .5); } } x.restore(); } }
