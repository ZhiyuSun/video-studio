// ===================== v6: camera, parallax, transitions, richer scenes =====================
while (POOL.length < 6) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; POOL.push(cv); }
let CAMV = null, LAYER_I = 0;
const camSet = (x, c) => { if (!c) { x.setTransform(1, 0, 0, 1, 0, 0); return; } x.setTransform(c.z, 0, 0, c.z, 960 - 960 * c.z + c.ox, 540 - 540 * c.z + c.oy); };
// parallax: earlier (farther) layers move less than the camera
put = (function (orig) { return function (cv, dx = 0, dy = 0, a = 1) { const f = Math.min(1, .25 + .25 * LAYER_I); LAYER_I++; const c = CAMV;
  if (!c || (c.z === 1 && !c.ox && !c.oy)) return orig(cv, dx, dy, a);
  const zf = 1 + (c.z - 1) * f, sx = zf / c.z, tx = (960 * c.z - 960 * zf + c.ox * f - c.ox) / c.z, ty = (540 * c.z - 540 * zf + c.oy * f - c.oy) / c.z;
  g.save(); g.transform(sx, 0, 0, sx, tx, ty); orig(cv, dx, dy, a); g.restore(); }; })(put);
layer = function (fn, a) { if (a <= .002) return; if (a >= .998) { fn(); return; }
  const cv = POOL[depth++], prev = g, li = LAYER_I; g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H); camSet(g, CAMV); LAYER_I = 0;
  fn(); LAYER_I = li; g = prev; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(cv, 0, 0); g.restore(); depth--; };
// HUD text (date stamps) should not move with the camera
stampP = (function (orig) { return function (...a) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); orig(...a); g.restore(); }; })(stampP);

// ---------- camera plans ----------
const CHORUS_IDX = { 5: 'c1', 9: 'c2', 16: 'c3', 21: 'fin' };
function camMove(style, p, punch = 0) { const e = ease(clamp(p)); let z = 1.05, ox = 0, oy = 0;
  if (style === 'push') z = lerp(1.03, 1.09, e); else if (style === 'pull') z = lerp(1.09, 1.03, e);
  else if (style === 'panR' || style === 'panL') { z = 1.06; const M = (z - 1) * 960 * .75; ox = (style === 'panR' ? 1 : -1) * lerp(M, -M, e); }
  else if (style === 'rise') { z = 1.06; const M = (z - 1) * 540 * .7; oy = lerp(-M, M, e); }
  else if (style === 'still') z = 1.03;
  z += punch; return { z, ox, oy }; }
const STYLES = ['push', 'panR', 'pull', 'panL', 'rise'];
function sceneCam(k, t) {
  const sc = SCENES[k]; if (k === 22) return null;
  const barP = Math.pow(1 - (((t - T0) / BAR) % 1 + 1) % 1, 8);
  if (CHORUS_IDX[k]) { const S = SEC[CHORUS_IDX[k]]; let i = 0; for (let j = 0; j < S.st.length; j++) if (t >= S.st[j]) i = j; const s0 = S.st[i], s1 = S.st[i + 1] || (k === 21 ? SCENES[21][1] : s0 + 4.6);
    const u = t - s0; const punch = .035 * Math.pow(1 - clamp(u / .7), 3) + .01 * barP; if (i === 4 && k !== 21) return null;
    return camMove(STYLES[(i + k) % 5], (t - s0) / (s1 - s0), punch); }
  if (k === 2) return camMove('still', 0); if (k === 3) return camMove('push', (t - sc[0]) / (sc[1] - sc[0]));
  return camMove(STYLES[k % 5], (t - sc[0]) / (sc[1] - sc[0]));
}
function drawScene(k, t) { const c = sceneCam(k, t); CAMV = c; LAYER_I = 0; g.save(); camSet(g, c); SCENES[k][2](t); g.restore(); CAMV = null; g.setTransform(1, 0, 0, 1, 0, 0); }

// ---------- transitions ----------
const TRANS = { 1: ['iris', .9, 960, 540], 2: ['wipe', .8], 3: ['fade', .6], 4: ['iris', 1, 582, 380], 5: ['flash', .35], 6: ['dip', .9], 7: ['iris', .9, 800, 460], 8: ['wipe', .8], 9: ['flash', .35], 10: ['dipw', .8],
  11: ['fade', .5], 12: ['iris', .9, 935, 760], 13: ['fade', .6], 14: ['iris', .9, 960, 520], 15: ['dip', .8], 16: ['flash', .35], 17: ['dipw', 1], 18: ['fade', .6], 19: ['dip', .8], 20: ['dip', 1], 21: ['fade', .4], 22: ['fade', .7] };
function masked(k, t, mask) { const cv = POOL[depth++], prev = g; g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, W, H);
  drawScene(k, t); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'destination-in'; mask(g); g.globalCompositeOperation = 'source-over'; g = prev; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(cv, 0, 0); g.restore(); depth--; }
function render6(t) {
  NOW = t; evict(); g = mainG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  // which scenes are on screen
  let cur = 0; for (let k = 0; k < SCENES.length; k++) if (t >= SCENES[k][0]) cur = k;
  const nx = cur + 1 < SCENES.length ? cur + 1 : null; const tr = nx != null ? TRANS[nx] : null; const sB = nx != null ? SCENES[nx][0] : 1e9;
  const tc = TRANS[cur]; const sC = SCENES[cur][0];
  let overlay = 0, ocol = '0,0,0';
  // incoming dips/flashes (after the boundary)
  if (tc && (tc[0] === 'dip' || tc[0] === 'dipw') && t < sC + tc[1] / 2) { overlay = 1 - (t - sC) / (tc[1] / 2); ocol = tc[0] === 'dipw' ? '255,246,232' : '0,0,0'; }
  if (tc && tc[0] === 'flash' && t < sC + tc[1]) { overlay = Math.max(overlay, Math.pow(1 - (t - sC) / tc[1], 2) * .85); ocol = '255,240,210'; }
  drawScene(cur, t);
  if (tr && t >= sB - tr[1]) { const p = clamp((t - (sB - tr[1])) / tr[1]); const ty = tr[0];
    if (ty === 'dip' || ty === 'dipw') { if (t >= sB - tr[1] / 2) { overlay = Math.max(overlay, (t - (sB - tr[1] / 2)) / (tr[1] / 2)); ocol = ty === 'dipw' ? '255,246,232' : '0,0,0'; } }
    else if (ty === 'fade' || ty === 'flash') { const cv = POOL[depth++], prev = g; g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); drawScene(nx, t); g = prev; g.save(); g.globalAlpha = ease(p); g.drawImage(cv, 0, 0); g.restore(); depth--;
      if (ty === 'flash') { overlay = Math.max(overlay, Math.pow(p, 3) * .85); ocol = '255,240,210'; } }
    else if (ty === 'iris') { const cx = tr[2], cy = tr[3], R = ease(p) * 1500;
      masked(nx, t, x => { const gg = x.createRadialGradient(cx, cy, Math.max(0, R - 120), cx, cy, R + 1); gg.addColorStop(0, 'rgba(0,0,0,1)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(0, 0, W, H); });
      g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(255,225,170,${.55 * (1 - p)})`; g.lineWidth = 6; g.shadowColor = 'rgba(255,210,150,.9)'; g.shadowBlur = 30; g.beginPath(); g.arc(cx, cy, Math.max(1, R - 40), 0, 7); g.stroke(); g.restore(); }
    else if (ty === 'wipe') { const X = lerp(-300, W + 300, ease(p));
      masked(nx, t, x => { const gg = x.createLinearGradient(X - 300, 0, X, 0); gg.addColorStop(0, 'rgba(0,0,0,1)'); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(0, 0, W, H); });
      glw(X - 150, 540, 500, '255,220,170', .25 * Math.sin(p * Math.PI)); } }
  if (overlay > 0) { g.fillStyle = `rgba(${ocol},${clamp(overlay)})`; g.fillRect(0, 0, W, H); }
  caption(t); g.drawImage(grain, 0, 0);
  g.save(); g.globalAlpha = .18; g.globalCompositeOperation = 'overlay'; g.drawImage(PTEX, 0, 0); g.restore();
  const fin = clamp(t / 1.2), fout = clamp((window.END - t) / 1.5); const kk = Math.min(fin, fout); if (kk < 1) { g.fillStyle = `rgba(0,0,0,${1 - kk})`; g.fillRect(0, 0, W, H); }
}
// a dip transition means the incoming scene starts exactly at the boundary (not before)
window.render = render6;

// ---------- chorus backdrops by era ----------
V1.id = 'v1'; V2.id = 'v2'; V3.id = 'v3'; PF2.id = 'fin';
function backdrop(V, t) {
  if (V.id === 'v2') { const P = shengsiLayers(); put(P.sky); glw(1260, 640, 520, '255,200,140', .35); g.save(); g.beginPath(); g.rect(0, 0, W, 652); g.clip(); g.fillStyle = '#ffe4a8'; g.shadowColor = 'rgba(255,220,150,1)'; g.shadowBlur = 60; g.beginPath(); g.arc(1260, 690, 130, 0, 7); g.fill(); g.restore(); put(P.c1, -t * 4 % 40); put(P.c2, -t * 7 % 60); put(P.isl); put(P.sea); put(P.sand); g.fillStyle = 'rgba(40,10,60,.18)'; g.fillRect(0, 0, W, H); return 960; }
  if (V.id === 'v3') { dunesDraw(t, beatPulse(t) * .4, false); return 990; }
  if (V.id === 'v1') { const B = bundLayers(); put(chorusSky(V)); put(B.far, 0, 60, .8); haze(520, 900, '120,90,190', .35); put(B.water, 0, 60, .6);
    put(L('v1_hill', x => { x.fillStyle = '#1a1a44'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 930); x.quadraticCurveTo(600, 870, 1100, 900); x.quadraticCurveTo(1500, 925, W, 880); x.lineTo(W, H); x.fill(); x.fillStyle = '#7a6aa0'; const r = rng(3); for (let i = 0; i < 40; i++) { x.beginPath(); x.arc(r() * W, 880 + r() * 60, 2 + r() * 3, 0, 7); x.fill(); } }, { tex: .4, sh: [22, -6, 'rgba(0,0,0,.5)'] }));
    const r = rng(17); for (let i = 0; i < 26; i++) { const x = r() * W, y = 900 - r() * 40; glw(x, y - 30 - Math.sin(t + i) * 6, 8, '255,220,150', .6 * Math.sin(t * 2 + i) ** 2); } return 960; }
  const hl = finHills(); put(finSky()); put(hl[0]); put(hl[1]); return 960;
}
const _cs6 = chorusShot;
chorusShot = function (k, t, u, V) {
  const P = V.pal;
  if (k === 1) { const gy = backdrop(V, t); const m = ease(clamp(u / 2.6)); const hx = 960, hy = gy + 30, h = 420, chest = hy - h * .42;
    doll(hx, hy, h, 'he', { light: '255,230,190', armL: [-6, 18], armR: [6, 18], smile: u > 2.4 });
    moonP(lerp(1500, hx, m), lerp(180, chest, m), lerp(80, 30, m), V.ill, V.waning, .35);
    const ha = ramp(u, 2.2, 3); if (ha > 0) { glw(hx, chest, 160, '255,170,190', .5 * ha); g.strokeStyle = `rgba(255,200,210,${ha})`; g.lineWidth = 4; heartPath(hx, chest + 6, 46); g.stroke(); }
    if (V.id !== 'v2') { const r = rng(4); for (let i = 0; i < 18; i++) { const an = r() * 6.28, d = 120 + ((u * 60 + r() * 200) % 260); glw(hx + Math.cos(an) * d, chest + Math.sin(an) * d * .7, 8, '255,225,170', .6 * ha); } }
    finish(.5); return; }
  if (k === 3) { const gy = backdrop(V, t); glw(980, gy - 260, 360, '255,200,150', .2 + .1 * beatPulse(t)); couple(860, gy + 10, 380, { light: '255,230,190', smile: u > 2.2, heSmile: u > 2.2 });
    const pop = clamp((u - 1.6) / .5); const ba = clamp(u / .3) * (1 - pop); bubble(830, gy - 440, 150, 70, '……', ba, 40);
    if (pop > 0 && pop < 1) { const r = rng(8); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = pop * 130; glowDot(830 + Math.cos(a) * d, gy - 440 + Math.sin(a) * d, 14, 1 - pop); } }
    if (V.id !== 'v2') moonP(1580, 220, 66, V.ill, V.waning, .3); finish(.5); return; }
  if (k === 6) { const gy = backdrop(V, t); glw(960, gy - 250, 460, '255,170,180', .22); doll(960, gy + 50, 450, 'she', { smile: true, light: '255,230,200', armL: [-16, -20], armR: [16, -20] }); const a = t * 1.1; moonP(960 + Math.cos(a) * 190, gy - 420 + Math.sin(a) * 50, 40, V.ill, V.waning, .3); finish(.5); return; }
  if (k === 7 && V.id === 'v2') { backdrop(V, t); const z = clamp(u / 5.5); const x = lerp(520, 1240, z), h = lerp(260, 150, z), y = lerp(990, 880, z);
    g.fillStyle = 'rgba(160,90,80,.35)'; for (let s = 0; s < 16; s++) { const fx = x - 40 - s * 50 * lerp(1, .6, z); if (fx < 0) break; g.beginPath(); g.ellipse(fx, y + 20 + (s % 2) * 10, 8, 4, -.2, 0, 7); g.fill(); }
    couple(x, y, h, { run: t * 7, light: '255,220,170' }); finish(.45); return; }
  return _cs6(k, t, u, V);
};
// map: every city is there from the start, faint = not yet; red = been there together
const _mapCard = mapCard;
mapCard = function (t, u, n, note) {
  card(960, 500, 1560, 820, -.008, '#f4e6cc');
  g.save(); g.strokeStyle = 'rgba(150,110,80,.22)'; g.lineWidth = 1; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(200, 140 + k * 100); g.lineTo(1720, 140 + k * 100); g.stroke(); } for (let k = 0; k < 15; k++) { g.beginPath(); g.moveTo(220 + k * 110, 110); g.lineTo(220 + k * 110, 890); g.stroke(); } g.restore();
  T(note, 960, 140, 34, '#6b4a3a', ramp(u, .2, 1), { w: 600 });
  if (n < CITIES2.length) { g.save(); g.setLineDash([3, 9]); g.strokeStyle = 'rgba(140,120,100,.35)'; g.lineWidth = 2; g.beginPath(); for (let i = n - 1; i < CITIES2.length; i++) { const [x, y] = proj2(CITIES2[i][1], CITIES2[i][2]); i === n - 1 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.restore();
    for (let i = n; i < CITIES2.length; i++) { const [x, y] = proj2(CITIES2[i][1], CITIES2[i][2]); const a = ramp(u, .4 + i * .05, 1 + i * .05); g.fillStyle = `rgba(150,130,110,${.55 * a})`; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); T(CITIES2[i][0], x + CITIES2[i][3], y + CITIES2[i][4], 21, 'rgba(140,120,100,.7)', a, { align: CITIES2[i][3] < 0 ? 'right' : CITIES2[i][3] > 0 ? 'left' : 'center' }); }
    T('浅色的地方：以后一起去', 1560, 860, 22, '#9a7a6a', ramp(u, 1.5, 2.3)); }
  const reveal = clamp(u / 3.6) * n;
  for (let i = 1; i < n; i++) { const k = clamp(reveal - i + 1); if (k <= 0) continue; const [x1, y1] = proj2(CITIES2[i - 1][1], CITIES2[i - 1][2]), [x2, y2] = proj2(CITIES2[i][1], CITIES2[i][2]);
    g.strokeStyle = 'rgba(190,80,70,.75)'; g.lineWidth = 2.5; g.setLineDash([7, 7]); g.beginPath(); g.moveTo(x1, y1); const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 40 - Math.hypot(x2 - x1, y2 - y1) * .15; const p = k; g.quadraticCurveTo(lerp(x1, mx, p), lerp(y1, my, p), (1 - p) * (1 - p) * x1 + 2 * (1 - p) * p * mx + p * p * x2, (1 - p) * (1 - p) * y1 + 2 * (1 - p) * p * my + p * p * y2); g.stroke(); g.setLineDash([]); }
  for (let i = 0; i < n; i++) { const k = clamp(reveal - i + .6); if (k <= 0) continue; const [x, y] = proj2(CITIES2[i][1], CITIES2[i][2]); g.fillStyle = '#d8513e'; g.beginPath(); g.arc(x, y, 8 * eo(k), 0, 7); g.fill(); g.strokeStyle = '#fff6e6'; g.lineWidth = 2.5; g.stroke();
    T(CITIES2[i][0], x + CITIES2[i][3], y + CITIES2[i][4], 24, '#5a3a2e', k, { align: CITIES2[i][3] < 0 ? 'right' : CITIES2[i][3] > 0 ? 'left' : 'center', w: 600 }); if (n > 2) T(String(i + 1), x, y - 18, 14, '#a0604a', k * .8); }
};

// ---------- wedding (from her photo: rose-gold arcs, golden spiral, copper callas, mirror runway) ----------
function callaWall(x, side, dark) { const r = rng(side > 0 ? 11 : 12);
  const edge = u => lerp(330, 640, u); // top line of the hedge, lower toward the centre
  x.fillStyle = shade(dark, -.35); x.beginPath(); const x0 = side > 0 ? W : 0, x1 = side > 0 ? 1240 : 680; x.moveTo(x0, 900); for (let k = 0; k <= 20; k++) { const u = k / 20; x.lineTo(lerp(x0, x1, u), edge(u) + 40 + Math.sin(k * 1.7) * 14); } x.lineTo(x1, 900); x.fill();
  for (let i = 0; i < 260; i++) { const u = Math.pow(r(), .9), bx = lerp(x0, x1, u) + (r() - .5) * 30; const top = edge(u) + r() * (900 - edge(u)) * .85; const s2 = lerp(1.25, .8, u) * (.8 + r() * .4);
    x.strokeStyle = shade(dark, -.2); x.lineWidth = 2.5 * s2; x.beginPath(); x.moveTo(bx, top + 10); x.lineTo(bx + (r() - .5) * 8, top + 50 * s2); x.stroke();
    x.save(); x.translate(bx, top); x.rotate((r() - .5) * .8 - side * .15); x.scale(s2, s2); const c = r() < .5 ? dark : shade(dark, .15); x.fillStyle = c; x.beginPath(); x.moveTo(0, 10); x.quadraticCurveTo(-18, -10, -10, -38); x.quadraticCurveTo(0, -30, 14, -44); x.quadraticCurveTo(16, -12, 0, 10); x.fill();
    x.fillStyle = 'rgba(255,200,150,.28)'; x.beginPath(); x.moveTo(-10, -36); x.quadraticCurveTo(0, -30, 13, -42); x.lineTo(10, -36); x.quadraticCurveTo(0, -26, -8, -30); x.fill(); x.restore(); } }
sWedding = function (t) {
  const S = SEC.pre2, u = t - S.st[2]; const warm = ramp(t, S.st[3], S.st[3] + 1.5);
  put(L('wd2_bg', x => { x.fillStyle = grad(x, 0, H, [[0, '#3a2224'], [.45, '#8a5a48'], [.75, '#d8a888'], [1, '#6a4436']]); x.fillRect(0, 0, W, H); }, 'raw'));
  put(L('wd2_arcs', x => { for (let k = 0; k < 9; k++) { const rx = 1300 - k * 95, ry = 760 - k * 62; x.fillStyle = k % 2 ? 'rgba(120,70,60,.55)' : 'rgba(200,140,115,.55)'; x.beginPath(); x.ellipse(960, 760, rx, ry, 0, Math.PI, 0); x.ellipse(960, 760, rx - 48, ry - 32, 0, 0, Math.PI, true); x.fill();
      x.strokeStyle = 'rgba(255,225,200,.85)'; x.lineWidth = 2.5; x.shadowColor = 'rgba(255,220,190,1)'; x.shadowBlur = 12; x.beginPath(); x.ellipse(960, 760, rx, ry, 0, Math.PI, 0); x.stroke(); x.shadowBlur = 0; }
    x.fillStyle = 'rgba(255,230,210,.5)'; const r = rng(4); for (let i = 0; i < 160; i++) { const an = Math.PI + r() * Math.PI, k = r(); x.beginPath(); x.arc(960 + Math.cos(an) * (1300 - k * 700), 760 + Math.sin(an) * (760 - k * 450), 1.4, 0, 7); x.fill(); } }, { tex: .4, sh: [20, 8, 'rgba(40,10,10,.5)'] }));
  // golden spiral sculpture
  g.save(); g.translate(960, 330); g.rotate(Math.sin(t * .2) * .05); g.shadowColor = 'rgba(255,200,120,.8)'; g.shadowBlur = 14;
  for (let k = 0; k < 9; k++) { const r0 = 40 + k * 26; const gs = g.createLinearGradient(-r0, -r0, r0, r0); gs.addColorStop(0, '#fff0b8'); gs.addColorStop(.5, '#d8a040'); gs.addColorStop(1, '#8a5a20'); g.strokeStyle = gs; g.lineWidth = 6 - k * .3; g.beginPath(); g.arc(k * 6, -k * 4, r0, Math.PI * (.9 + k * .08), Math.PI * (2.4 + k * .1)); g.stroke(); }
  for (let k = 0; k < 7; k++) { g.strokeStyle = 'rgba(230,180,90,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(60 + k * 14, 150 + k * 22); g.lineTo(230 - k * 8, 120 + k * 30); g.stroke(); }
  g.restore(); glw(960, 340, 360, '255,210,150', .25 + .1 * warm);
  put(L('wd3_callaB', x => { callaWall(x, -1, '#8a4a30'); callaWall(x, 1, '#8a4a30'); }, { tex: .45, blur: 1.2, sh: [12, 4, 'rgba(30,10,10,.5)'] }), 0, -70);
  // mirror runway
  put(L('wd2_floor', x => { x.fillStyle = grad(x, 840, H, [[0, '#e8c8b0'], [1, '#5a3a2e']]); x.fillRect(0, 840, W, 240); x.fillStyle = 'rgba(255,240,225,.5)'; x.beginPath(); x.moveTo(820, 840); x.lineTo(1100, 840); x.lineTo(1320, H); x.lineTo(600, H); x.fill(); }, { tex: .35, sh: [16, -4, 'rgba(0,0,0,.3)'] }));
  put(L('wd3_callaF', x => { x.save(); x.translate(0, 0); callaWall(x, -1, '#5a2818'); callaWall(x, 1, '#5a2818'); x.restore(); }, { tex: .45, sh: [20, 8, 'rgba(20,5,5,.6)'] }), 0, 90);
  const nerv = 1 - ramp(u, 1, 2.2); const sh = Math.sin(t * 40) * 2 * nerv; const hx = 905 + sh, sx = 1005 - sh, fy = 845;
  // reflections
  g.save(); g.globalAlpha = .28; g.translate(0, fy * 2 + 4); g.scale(1, -1); doll(hx, fy, 290, 'he', { armR: [22, 6], noShadow: true }); doll(sx, fy, 272, 'she', { veil: true, armL: [-22, 10], noShadow: true }); g.restore();
  glw(955, 700, 300, '255,220,190', .3 * warm + .1);
  doll(hx, fy, 290, 'he', { armR: [22, 6], smile: warm > .3, light: '255,230,200' }); doll(sx, fy, 272, 'she', { veil: true, armL: [-22, 10], armR: [10, 8], smile: warm > .3, light: '255,230,200' });
  g.fillStyle = '#1a1a24'; g.beginPath(); g.moveTo(hx - 9, fy - 290 * .6); g.lineTo(hx, fy - 290 * .585); g.lineTo(hx - 9, fy - 290 * .57); g.fill(); g.beginPath(); g.moveTo(hx + 9, fy - 290 * .6); g.lineTo(hx, fy - 290 * .585); g.lineTo(hx + 9, fy - 290 * .57); g.fill();
  [[sx + 26, fy - 120, '#fff4e0'], [sx + 36, fy - 128, '#f7c6d6'], [sx + 30, fy - 136, '#f2c14e'], [sx + 20, fy - 128, '#fff']].forEach(([a, b, c2]) => { g.fillStyle = c2; g.beginPath(); g.arc(a, b, 8, 0, 7); g.fill(); });
  if (nerv > .05) { T('社恐 × 2', 955, 470, 32, 'rgba(255,240,220,.9)', nerv * clamp(u / .4)); g.fillStyle = `rgba(190,227,255,${nerv})`; g.beginPath(); g.ellipse(930, 590, 6, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(1040, 610, 6, 9, 0, 0, 7); g.fill(); }
  // golden bokeh in front, more as happiness arrives
  const r = rng(91); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 80; i++) { const x = r() * W, y = 820 + r() * 280 + Math.sin(t + i) * 6, rr = 6 + r() * 22; const a = (.25 + .5 * warm) * (.5 + .5 * Math.sin(t * 2 + i)); const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(255,225,150,${a})`); gg.addColorStop(.7, `rgba(255,200,110,${a * .5})`); gg.addColorStop(1, 'rgba(255,200,110,0)'); g.fillStyle = gg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); } g.restore();
  if (warm > 0) { const r2 = rng(83); for (let i = 0; i < 70; i++) { const x = r2() * W, y = (r2() * 1200 + (t - S.st[3]) * (50 + r2() * 70)) % 1150 - 60; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillStyle = `rgba(${['255,235,210', '255,210,140', '255,190,170'][i % 3]},${warm * .85})`; g.fillRect(-5, -3, 10, 6); g.restore(); } }
  finish(.45); stampP(t, ramp(u, 0, .8), '2025.05.25 · 婚礼', '两个社恐，站在了正中央');
};
SCENES[14][2] = sWedding;

// ---------- intro: a sea of paper clouds + drifting star dust ----------
const _sIntro = SCENES[0][2];
SCENES[0][2] = function (t) { _sIntro(t);
  const cl = (key, y, col, seed, amp) => L(key, x => { x.fillStyle = col; x.beginPath(); x.moveTo(-200, H); const r = rng(seed); let X = -200; x.lineTo(X, y); while (X < W + 400) { const w = 120 + r() * 180; x.quadraticCurveTo(X + w / 2, y - amp * (.5 + r()), X + w, y + (r() - .5) * 20); X += w; } x.lineTo(W + 400, H); x.fill(); }, { tex: .45, sh: [24, -6, 'rgba(0,0,10,.5)'] });
  const a = clamp(t / 3); put(cl('in_c1', 860, '#1c2050', 3, 70), 0, Math.sin(t * .4) * 6, a); put(cl('in_c2', 930, '#151840', 5, 60), 0, Math.sin(t * .4 + 1) * 8, a); put(cl('in_c3', 1010, '#0e1030', 7, 50), 0, Math.sin(t * .4 + 2) * 10, a);
  const r = rng(12); for (let i = 0; i < 40; i++) { const x = (r() * W + t * (8 + r() * 12)) % W, y = r() * 800 - t * (4 + r() * 6) % 800; glw(x, (y + 800) % 800, 5 + r() * 4, '255,230,180', .5 * a * Math.sin(t * 1.5 + i) ** 2); }
};
// ---------- rooms: more life ----------
const _dayRoom = dayRoom;
dayRoom = function (key, wallTop, wallBot, floor) {
  const fl = _dayRoom(key, wallTop, wallBot, floor);
  if (key === 'mr') put(L('mr_deco', x => { frameP(x, 260, 230, 150, 110, '#f2b6a6', 'heart'); frameP(x, 460, 260, 110, 140, '#bfe0f3', 'moon'); x.fillStyle = '#c99a72'; x.fillRect(700, 330, 260, 12); x.fillStyle = '#6fae7a'; x.beginPath(); x.arc(740, 310, 22, 0, 7); x.fill(); x.fillStyle = '#c96a4a'; x.fillRect(726, 310, 28, 22); x.fillStyle = '#e9806e'; x.fillRect(800, 286, 20, 46); x.fillStyle = '#7fb3d5'; x.fillRect(824, 296, 18, 36); x.fillStyle = '#f2c14e'; x.fillRect(846, 290, 16, 42); }, { tex: .45, sh: [12, 5, 'rgba(90,50,30,.3)'] }));
  if (key === 'sr') put(L('sr_deco', x => { frameP(x, 330, 200, 160, 120, '#f6d8b8', 'sun'); frameP(x, 560, 170, 120, 150, '#e9c7a0', 'heart'); x.fillStyle = '#b07a54'; x.fillRect(1770, 260, 140, 600); x.fillStyle = '#9a6a48'; for (let k = 0; k < 5; k++) x.fillRect(1770, 300 + k * 115, 140, 10); const cs = ['#e9806e', '#7fb3d5', '#f2c14e', '#9ccf8f', '#b39ddb']; for (let k = 0; k < 4; k++) for (let j = 0; j < 5; j++) { x.fillStyle = cs[(k + j) % 5]; x.fillRect(1782 + j * 24, 310 + k * 115 - 70 + (j % 2) * 6, 18, 70 - (j % 2) * 6); } }, { tex: .45, sh: [14, 6, 'rgba(90,50,30,.3)'] }));
  return () => { fl(); if (key === 'mr' || key === 'sr') put(L(key + '_rug', x => { x.fillStyle = key === 'mr' ? '#e8b4a0' : '#d9c2e0'; x.beginPath(); x.ellipse(860, 960, 520, 70, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(255,255,255,.5)'; x.lineWidth = 4; x.setLineDash([12, 10]); x.beginPath(); x.ellipse(860, 960, 480, 56, 0, 0, 7); x.stroke(); }, { tex: .45, sh: [8, 3, 'rgba(90,50,30,.25)'] }));
    if (key === 'sr') { const r = rng(5); for (let i = 0; i < 40; i++) { const p = r(), x = lerp(1060, 300, p) + r() * 500, y = lerp(660, 1000, p) - ((NOW * (6 + r() * 8)) % 200); glw(x, y, 4 + r() * 3, '255,240,200', .6 * Math.sin(NOW * 2 + i) ** 2); } } };
};
function frameP(x, X, Y, w, h, inner, motif) { x.fillStyle = '#b07a54'; x.fillRect(X - w / 2, Y - h / 2, w, h); x.fillStyle = inner; x.fillRect(X - w / 2 + 10, Y - h / 2 + 10, w - 20, h - 20); x.fillStyle = 'rgba(255,255,255,.8)';
  if (motif === 'heart') { x.save(); x.translate(X, Y); x.beginPath(); x.moveTo(0, 14); x.bezierCurveTo(-30, -6, -14, -30, 0, -14); x.bezierCurveTo(14, -30, 30, -6, 0, 14); x.fill(); x.restore(); }
  else if (motif === 'moon') { x.fillStyle = '#fbe6b6'; x.beginPath(); x.arc(X, Y, 26, 0, 7); x.fill(); x.fillStyle = inner; x.beginPath(); x.arc(X + 12, Y - 6, 22, 0, 7); x.fill(); }
  else { x.fillStyle = '#f2c14e'; x.beginPath(); x.arc(X, Y, 20, 0, 7); x.fill(); } }
// ---------- bridge: a window with the city and the rain ----------
const _homeNight = homeNight;
homeNight = function () { _homeNight();
  put(L('br_win', x => { x.fillStyle = '#0c1030'; x.fillRect(1560, 150, 300, 360); const r = rng(5); let X = 1560; while (X < 1860) { const w = 30 + r() * 50, h = 60 + r() * 160; x.fillStyle = '#1c1e48'; x.fillRect(X, 510 - h, w, h); for (let yy = 510 - h + 8; yy < 500; yy += 14) for (let xx = X + 4; xx < X + w - 6; xx += 10) if (r() < .4) { x.fillStyle = `rgba(255,${190 + r() * 50 | 0},130,.8)`; x.fillRect(xx, yy, 4, 6); } X += w + 3; }
    x.strokeStyle = '#3a2a40'; x.lineWidth = 16; x.strokeRect(1560, 150, 300, 360); x.lineWidth = 8; x.beginPath(); x.moveTo(1710, 150); x.lineTo(1710, 510); x.stroke(); }, { tex: .45, sh: [16, 6, 'rgba(0,0,0,.45)'] }));
  const S = SEC.br; const rain = ramp(NOW, S.st[5], S.st[5] + .5) * (1 - ramp(NOW, S.st[9], S.st[9] + 2)); if (rain > 0) { g.save(); g.beginPath(); g.rect(1568, 158, 284, 344); g.clip(); g.strokeStyle = `rgba(190,210,255,${.6 * rain})`; g.lineWidth = 1.5; const r = rng(7); for (let i = 0; i < 60; i++) { const x = 1560 + r() * 300, y = (r() * 400 + NOW * 700) % 400 + 140; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y + 18); g.stroke(); } g.restore(); }
  glw(1710, 330, 220, '120,140,255', .08);
};
