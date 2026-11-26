// ===================== v4 tweaks =====================
// ---------- new-moon look: ashen earthshine disc + bright thin rim ----------
const _moonP = moonP;
moonP = function (x, y, r, ill, waning = false, glowA = .25, a = 1) {
  if (ill >= .03) return _moonP(x, y, r, ill, waning, glowA, a);
  if (a <= 0) return; g.save(); g.globalAlpha *= a;
  glw(x, y, r * 3.2, '170,180,255', glowA * .8);
  const gr2 = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); gr2.addColorStop(0, 'rgba(150,160,210,.75)'); gr2.addColorStop(1, 'rgba(60,66,120,.75)'); g.fillStyle = gr2; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
  g.fillStyle = 'rgba(40,44,90,.35)'; [[-.3, -.2, .25], [.25, .15, .18], [-.05, .4, .12]].forEach(([a1, b, c1]) => { g.beginPath(); g.arc(x + a1 * r, y + b * r, c1 * r, 0, 7); g.fill(); });
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.strokeStyle = '#fff1cc'; g.shadowColor = 'rgba(255,230,180,1)'; g.shadowBlur = r * .4; g.lineWidth = Math.max(2, r * .07); g.beginPath(); g.arc(x - r * .04, y, r * .99, -1.25, 1.25); g.stroke(); g.restore();
  g.restore();
};

// ---------- hotpot: it was lunch ----------
sHotpot = function (t, lt) {
  const S = V1L;
  put(L('hp_wall2', x => { x.fillStyle = grad(x, 0, H, [[0, '#4a2e3a'], [1, '#5e3a40']]); x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,220,180,.06)'; x.lineWidth = 2; for (let X = 0; X < W; X += 60) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, H); x.stroke(); } }, 'raw'));
  put(L('hp_winday', x => { x.save(); x.beginPath(); x.roundRect(430, 70, 1060, 500, 16); x.clip(); x.fillStyle = grad(x, 70, 570, [[0, '#8cc4ea'], [1, '#e2f1f8']]); x.fillRect(430, 70, 1060, 500);
    x.fillStyle = 'rgba(255,255,255,.85)'; [[620, 160, 90], [1250, 130, 70], [980, 210, 60]].forEach(([a, b, rr]) => { x.beginPath(); x.ellipse(a, b, rr, rr * .35, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(a + rr * .4, b - 12, rr * .5, rr * .3, 0, 0, 7); x.fill(); });
    const r = rng(9); let X = 430; while (X < 1490) { const w = 40 + r() * 70, h = 60 + r() * 120; bld(x, X, 570, w, h, '#b9c8d8', { topCol: '#d6e2ec', win: .6, dim: true, seed: X | 0, cw: 11, ch: 14 }); X += w + 4; }
    X = 410; while (X < 1500) { const w = 60 + r() * 90, h = 120 + r() * 200; bld(x, X, 570, w, h, '#8fa2b8', { topCol: '#aebdcd', win: .6, dim: true, seed: (X * 3) | 0, cw: 13, ch: 16 }); X += w + 8; } x.restore();
    x.lineWidth = 14; x.strokeStyle = '#6a4a50'; x.beginPath(); x.roundRect(430, 70, 1060, 500, 16); x.stroke(); x.lineWidth = 10; x.beginPath(); x.moveTo(960, 70); x.lineTo(960, 570); x.stroke(); }, { tex: .45, sh: [24, 8, 'rgba(0,0,0,.45)'] }));
  glw(960, 320, 700, '255,240,210', .18);
  [[300, 150], [1620, 150]].forEach(([x, y], i) => { const sw = Math.sin(t * .9 + i) * 3; g.strokeStyle = 'rgba(40,20,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + sw, y); g.stroke();
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 5; g.fillStyle = '#d8513e'; g.beginPath(); g.ellipse(x + sw, y + 40, 46, 40, 0, 0, 7); g.fill(); g.restore(); g.fillStyle = '#f2c14e'; g.fillRect(x + sw - 20, y, 40, 6); g.fillRect(x + sw - 20, y + 78, 40, 6); glw(x + sw, y + 40, 160, '255,170,100', .18); });
  const nerv = ramp(t, S.st[2], S.st[2] + .4) * clamp((S.st[3] - .2 - t) / .4); const sh = nerv * Math.sin(t * 40) * 2.5; const sun = ramp(t, S.st[3], S.st[3] + 1);
  if (sun > 0) { glw(1290, 560, 330, '255,214,120', .35 * sun); g.save(); g.translate(1290, 560); g.rotate(t * .25); g.strokeStyle = `rgba(255,214,130,${.5 * sun})`; g.lineWidth = 5; g.lineCap = 'round'; for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(190, 0); g.lineTo(220 + 10 * Math.sin(t * 4 + k), 0); g.stroke(); } g.restore(); }
  doll(640 + sh, 860, 330, 'he', { armR: [16, 14], armL: [-10, 22], light: '255,230,200' });
  doll(1290, 860, 305, 'she', { armL: [-18, 10], armR: sun > 0 ? [20, -30] : [10, 18], smile: sun > 0, light: '255,230,200' });
  hotpotTable();
  const intens = .55 + .45 * ramp(t, S.st[1], S.st[1] + 1.2);
  for (const p of STEAM) { const age = ((lt + p.born) * p.sp) % 9; const y = 760 - age * 75; const x = 960 + p.x * 120 + Math.sin(age * 1.3 + p.w) * 30 * (age / 3); const a = clamp(age / 1) * clamp((9 - age) / 1.5) * intens;
    g.fillStyle = `rgba(255,248,240,${a * .12})`; g.beginPath(); g.arc(x, y, 18 + age * 8, 0, 7); g.fill(); if (age > 3.5) glw(x, y, 8 * p.s, '255,230,170', a * .45 * clamp((age - 3.5) / 2)); }
  if (nerv > 0) { bubble(620, 470, 140, 66, '……', nerv, 40); g.fillStyle = `rgba(150,200,240,${nerv})`; g.beginPath(); g.ellipse(690, 600, 7, 11, 0, 0, 7); g.fill(); }
  if (sun > 0) [[1180, 430, 0], [1350, 380, .5], [1440, 470, 1], [1250, 330, 1.6], [1400, 290, 2.2]].forEach(([x, y, d]) => T('?', x + Math.sin(t * 2 + d) * 6, y - (t - S.st[3] - d) * 10, 58, '#ffe3a8', clamp((t - S.st[3] - d) / .4) * clamp((S.st[4] - .2 - t) / .5), { w: 600, glow: 'rgba(160,90,40,.8)' }));
  finish(.4);
  stampP(t, ramp(t, S.st[0], S.st[0] + 1) * clamp((S.st[4] - .5 - t) / .5), '2023.02.12 中午 · 人民广场 来福士', '第一次见面，一顿火锅');
};
function hotpotTable() {
  put(L('hp_table3', x => { x.fillStyle = grad(x, 740, H, [[0, '#8a5a44'], [1, '#5a3428']]); x.beginPath(); x.moveTo(140, 760); x.lineTo(1780, 760); x.lineTo(1920, H); x.lineTo(0, H); x.fill(); x.fillStyle = 'rgba(255,230,200,.15)'; x.fillRect(140, 756, 1640, 8);
    [[560, 830, '#d9826a'], [760, 880, '#9ccf8f'], [1160, 880, '#f0b6a6'], [1360, 830, '#f2c14e']].forEach(([px, py, f]) => { x.fillStyle = '#fff6ea'; x.beginPath(); x.ellipse(px, py, 80, 22, 0, 0, 7); x.fill(); x.fillStyle = f; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(px - 36 + k * 18, py - 4, 14, 8, .3, 0, 7); x.fill(); } });
    const px = 960, py = 800; x.fillStyle = '#5a5a66'; x.beginPath(); x.ellipse(px, py + 40, 190, 50, 0, 0, 7); x.fill(); x.fillStyle = '#9a9aa6'; x.beginPath(); x.ellipse(px, py, 190, 50, 0, 0, 7); x.fill();
    x.fillStyle = '#c83a2e'; x.beginPath(); x.ellipse(px, py - 2, 172, 42, 0, Math.PI / 2, Math.PI * 1.5); x.fill(); x.fillStyle = '#f2e4cc'; x.beginPath(); x.ellipse(px, py - 2, 172, 42, 0, -Math.PI / 2, Math.PI / 2); x.fill();
    x.strokeStyle = '#6a6a76'; x.lineWidth = 6; x.beginPath(); x.moveTo(px, py - 44); x.lineTo(px, py + 40); x.stroke(); const r = rng(2); for (let k = 0; k < 14; k++) { x.fillStyle = k % 2 ? 'rgba(255,200,120,.8)' : 'rgba(120,40,30,.6)'; x.beginPath(); x.arc(px - 150 + r() * 130, py - 10 + r() * 20, 4 + r() * 4, 0, 7); x.fill(); } }, { tex: .45, sh: [26, -6, 'rgba(0,0,0,.4)'] }));
}

// ---------- "walked a long way": afternoon Nanjing Rd → dinner → the Bund ----------
function sWalk(t) {
  const S = V1L, t0 = S.st[4] - .4, t1 = S.st[5] - .4, k = clamp((t - t0) / (t1 - t0));
  const lerpC = (c1, c2, p) => { const a = c1.match(/\w\w/g).map(h => parseInt(h, 16)), b = c2.match(/\w\w/g).map(h => parseInt(h, 16)); return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], p))).join(',')})`; };
  const ph = k < .5 ? k / .5 : (k - .5) / .5;
  const top = k < .5 ? lerpC('#7fb8e0', '#6a4a8a', ph) : lerpC('#6a4a8a', '#0c1030', ph), bot = k < .5 ? lerpC('#ffe0b0', '#f08a7a', ph) : lerpC('#f08a7a', '#3a2a5e', ph);
  const s = g.createLinearGradient(0, 0, 0, 820); s.addColorStop(0, top); s.addColorStop(1, bot); g.fillStyle = s; g.fillRect(0, 0, W, H);
  if (k > .55) { const r = rng(6); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(255,240,215,${(k - .55) * 2 * r()})`; g.beginPath(); g.arc(r() * W, r() * 500, r() * 1.4 + .3, 0, 7); g.fill(); } }
  if (k < .5) glw(1500, 260 + k * 600, 260, '255,220,160', .5 * (1 - k * 2));
  const pan = k * 3600; const night = clamp((k - .45) / .4);
  g.save(); g.translate(-pan, 0);
  // street of shops with vertical signboards
  const r = rng(31); const signs = ['南京东路', '老字号', '百货', '点心', '书店', '眼镜', '照相', '茶食', '晚饭', '外滩'];
  for (let i = 0; i < 26; i++) { const X = i * 210 - 100, w = 190, h = 330 + r() * 180;
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 16; g.shadowOffsetY = 6; g.fillStyle = lerpC(['e8d6c4', 'd9c2b0', 'efe0cc'][i % 3], '2a2850', night); g.fillRect(X, 860 - h, w, h); g.restore();
    for (let yy = 860 - h + 30; yy < 760; yy += 56) for (let xx = X + 20; xx < X + w - 30; xx += 50) { g.fillStyle = night > .3 ? `rgba(255,${200 + r() * 40 | 0},140,${.5 * night + .2})` : 'rgba(120,150,180,.5)'; g.fillRect(xx, yy, 28, 34); }
    const sc = ['#d8513e', '#3a6ab0', '#e0a020', '#9a3ab0', '#2a9a8a'][i % 5]; const sx = X + w - 34, sy = 860 - h + 40;
    g.fillStyle = sc; g.fillRect(sx, sy, 34, 170); if (night > .2) glw(sx + 17, sy + 85, 110, sc === '#d8513e' ? '255,80,90' : sc === '#3a6ab0' ? '90,160,255' : sc === '#9a3ab0' ? '220,100,255' : '255,200,90', .45 * night);
    g.fillStyle = '#fff4dc'; g.font = `600 24px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; [...signs[i % signs.length]].forEach((ch, j) => g.fillText(ch, sx + 17, sy + 26 + j * 30)); }
  // restaurant with warm window around 2/3 of the way
  g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 18; g.fillStyle = '#5a3040'; g.fillRect(2500, 520, 420, 340); g.restore(); g.fillStyle = `rgba(255,200,130,${.5 + .5 * night})`; g.fillRect(2540, 600, 340, 180); glw(2710, 690, 260, '255,190,120', .4 * night);
  g.fillStyle = '#d8513e'; g.fillRect(2600, 540, 220, 40); g.fillStyle = '#fff4dc'; g.font = `600 26px ${FONT}`; g.fillText('外滩边 · 晚饭', 2710, 561);
  g.restore();
  put(L('wk_ground', x => { x.fillStyle = grad(x, 860, H, [[0, '#b8a690'], [1, '#8a7a68']]); x.fillRect(0, 860, W, 220); }, { tex: .45, sh: [16, -6, 'rgba(0,0,0,.35)'] }));
  if (night > 0) { g.fillStyle = `rgba(10,10,40,${night * .55})`; g.fillRect(0, 860, W, 220); }
  // the two of them, side by side, a polite gap apart
  doll(520, 925, 250, 'he', { run: t * 8, bob: t * 8, light: '255,230,200' }); doll(645, 925, 230, 'she', { run: t * 8 + 2, bob: t * 8 + 2, smile: true, light: '255,230,200' });
  finish(.45);
  stampP(t, clamp(k / .1) * clamp((.48 - k) / .08), '下午 · 南京东路', '一路逛，一路聊');
  stampP(t, clamp((k - .52) / .08) * clamp((1 - k) / .08), '晚上 · 外滩附近', '吃完晚饭，再去江边走走');
}

// ---------- the Bund, neon + mist (cyberpunk-ish) ----------
const NEON = ['255,80,200', '90,170,255', '170,90,255', '255,70,90'];
bld = (function (orig) { return function (x, X, base, w, h, col, o = {}) { orig(x, X, base, w, h, col, o); if (o.edge) { x.save(); x.beginPath(); if (o.shape) o.shape(x, X, base - h, w, h, base); else x.rect(X, base - h, w, h); x.strokeStyle = `rgb(${o.edge})`; x.lineWidth = 2.5; x.shadowColor = `rgb(${o.edge})`; x.shadowBlur = 12; x.stroke(); x.stroke(); x.restore(); }
  if (o.screen) { x.save(); const top = base - h; const gs = x.createLinearGradient(0, top + h * .15, 0, top + h * .55); gs.addColorStop(0, `rgba(${o.screen[0]},.85)`); gs.addColorStop(1, `rgba(${o.screen[1]},.85)`); x.fillStyle = gs; x.shadowColor = `rgb(${o.screen[0]})`; x.shadowBlur = 16; x.fillRect(X + w * .12, top + h * .15, w * .76, h * .4); x.restore(); } }; })(bld);
bundMid = function (x, dim) {
  const C = '#1a1840', T = '#2a2660', o = (k, i) => ({ topCol: T, win: dim ? k * .6 : k, dim, edge: dim ? null : NEON[i % 4] });
  // Shanghai Tower with spiral light
  bld(x, 1300, BB, 120, 640, C, { ...o(.15, 1), seed: 11, shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); gg.bezierCurveTo(X + 4, b - h * .45, X + 18, b - h * .8, X + 34, top); gg.lineTo(X + 88, top + 14); gg.bezierCurveTo(X + 100, b - h * .7, X + 112, b - h * .35, X + w, b); } });
  if (!dim) { x.save(); x.strokeStyle = 'rgba(120,200,255,.8)'; x.shadowColor = 'rgb(90,170,255)'; x.shadowBlur = 14; x.lineWidth = 3; x.beginPath(); for (let k = 0; k <= 40; k++) { const p = k / 40, y = BB - p * 620, half = lerp(58, 26, p), cx2 = 1360 + lerp(0, 2, p); x.lineTo(cx2 + Math.sin(p * 9) * half * .9, y); } x.stroke(); x.restore(); }
  bld(x, 1180, BB, 86, 500, '#1e1c48', { ...o(.5, 2), seed: 12, cw: 13, ch: 16, shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); gg.lineTo(X + 8, top); gg.lineTo(X + w - 8, top); gg.lineTo(X + w, b); gg.closePath(); gg.moveTo(X + 26, top + 18); gg.lineTo(X + 26, top + 52); gg.lineTo(X + w - 26, top + 52); gg.lineTo(X + w - 26, top + 18); gg.closePath(); } });
  bld(x, 1040, BB, 80, 490, '#221c40', { ...o(.55, 3), topCol: '#3a2c50', seed: 13, cw: 12, ch: 15, edge: dim ? null : '255,190,110', shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); const st = [[0, 0], [4, .3], [8, .5], [13, .65], [18, .76], [24, .84], [30, .9], [37, .95]]; st.forEach(([d, k]) => { gg.lineTo(X + d, b - h * k); gg.lineTo(X + d + 4, b - h * k); }); gg.lineTo(X + 40, top - 40); st.slice().reverse().forEach(([d, k]) => { gg.lineTo(X + w - d - 4, b - h * k); gg.lineTo(X + w - d, b - h * k); }); gg.lineTo(X + w, b); gg.closePath(); } });
  const r = rng(14); BUND_MISC.forEach(([X, w, h], i) => bld(x, X, BB, w, h, i % 2 ? '#181638' : '#1e1b46', { ...o(.45 + r() * .25, i), seed: 20 + i, screen: !dim && i % 3 === 0 ? [NEON[i % 4], NEON[(i + 1) % 4]] : null }));
  // Oriental Pearl: glowing LED spheres
  const cx = 720; x.lineCap = 'round'; x.strokeStyle = '#2a2050'; x.lineWidth = 12; [-62, 62].forEach(dx => { x.beginPath(); x.moveTo(cx + dx, BB); x.lineTo(cx + dx * .18, BB - 260); x.stroke(); });
  x.lineWidth = 16; x.beginPath(); x.moveTo(cx, BB); x.lineTo(cx, BB - 500); x.stroke(); x.lineWidth = 5; x.beginPath(); x.moveTo(cx, BB - 500); x.lineTo(cx, BB - 590); x.stroke(); x.lineWidth = 7; [-14, 14].forEach(d => { x.beginPath(); x.moveTo(cx + d, BB - 230); x.lineTo(cx + d, BB - 420); x.stroke(); });
  if (!dim) { x.save(); x.strokeStyle = 'rgba(120,200,255,.9)'; x.shadowColor = 'rgb(90,170,255)'; x.shadowBlur = 10; x.lineWidth = 3; for (let k = 0; k < 9; k++) { const y = BB - 30 - k * 26; x.beginPath(); x.moveTo(cx - 8, y); x.lineTo(cx + 8, y); x.stroke(); } x.restore(); }
  [[BB - 180, 58], [BB - 405, 36], [BB - 485, 15]].forEach(([yy, rr]) => {
    const gr2 = x.createRadialGradient(cx - rr * .35, yy - rr * .35, 2, cx, yy, rr);
    if (dim) { gr2.addColorStop(0, '#5a4a7a'); gr2.addColorStop(1, '#2e2448'); } else { gr2.addColorStop(0, '#ffd6f6'); gr2.addColorStop(.35, '#ff7ad8'); gr2.addColorStop(.75, '#b02aa8'); gr2.addColorStop(1, '#4a1060'); }
    x.save(); if (!dim) { x.shadowColor = 'rgb(255,90,210)'; x.shadowBlur = 30; } x.fillStyle = gr2; x.beginPath(); x.arc(cx, yy, rr, 0, 7); x.fill(); x.restore();
    if (!dim) { x.save(); x.beginPath(); x.arc(cx, yy, rr, 0, 7); x.clip(); for (let k = -4; k <= 4; k++) { const y = yy + k * rr / 4.5; x.strokeStyle = k % 2 ? 'rgba(255,230,255,.55)' : 'rgba(255,160,230,.35)'; x.lineWidth = 1.6; x.beginPath(); x.ellipse(cx, y, Math.sqrt(Math.max(0, rr * rr - (k * rr / 4.5) ** 2)), rr * .08, 0, 0, Math.PI); x.stroke(); }
      const rr2 = rng(rr); for (let k = 0; k < rr * 1.2; k++) { const an = rr2() * 6.28, d = Math.sqrt(rr2()) * rr; x.fillStyle = 'rgba(255,240,255,.8)'; x.beginPath(); x.arc(cx + Math.cos(an) * d, yy + Math.sin(an) * d, 1.3, 0, 7); x.fill(); } x.restore();
      x.strokeStyle = 'rgba(160,220,255,.9)'; x.lineWidth = 3; x.shadowColor = 'rgb(90,170,255)'; x.shadowBlur = 10; x.beginPath(); x.ellipse(cx, yy, rr * 1.12, rr * .18, 0, 0, 7); x.stroke(); x.shadowBlur = 0; }
  });
};
function bundFX(t, panX, lit) {
  // pearl bloom, neon bloom, searchlights, reflections, mist
  if (lit <= 0) return; const P = 720 + panX * .5;
  g.save(); g.globalCompositeOperation = 'lighter';
  const pulse = .85 + .15 * Math.sin(t * 2.2);
  glw(P, BB - 180, 240, '255,90,210', .45 * lit * pulse); glw(P, BB - 405, 150, '255,110,220', .4 * lit * pulse); glw(P, BB - 485, 70, '255,200,255', .6 * lit);
  [[1360, BB - 640, '90,170,255'], [1222, BB - 500, '170,90,255'], [1080, BB - 530, '255,190,110']].forEach(([x, y, c2]) => glw(x + panX * .5, y, 160, c2, .3 * lit));
  [[1360, BB - 640, 0], [720, BB - 590, 1.7], [1222, BB - 500, 3.1]].forEach(([x, y, ph], i) => { const an = -Math.PI / 2 + Math.sin(t * .5 + ph) * .5; g.save(); g.translate(x + panX * .5, y); g.rotate(an + Math.PI / 2); const bg2 = g.createLinearGradient(0, 0, 0, -900); bg2.addColorStop(0, `rgba(${NEON[i]},${.22 * lit})`); bg2.addColorStop(1, `rgba(${NEON[i]},0)`); g.fillStyle = bg2; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-70, -900); g.lineTo(70, -900); g.lineTo(4, 0); g.fill(); g.restore(); });
  // coloured reflections on the river
  const r = rng(55); for (let i = 0; i < 70; i++) { const X = (r() * W + panX * .7), c2 = NEON[i % 4], w = 4 + r() * 10; for (let k = 0; k < 6; k++) { const yy = BB + 12 + k * 16 + Math.sin(t * 2 + i + k) * 2; g.fillStyle = `rgba(${c2},${(.25 - k * .035) * lit})`; g.fillRect(X + Math.sin(t * 1.5 + k + i) * 5, yy, w * (1 - k * .1), 3); } }
  [[P, '255,90,210'], [1360 + panX * .5, '90,170,255'], [1222 + panX * .5, '170,90,255']].forEach(([x, c2]) => { for (let k = 0; k < 9; k++) { g.fillStyle = `rgba(${c2},${(.4 - k * .04) * lit})`; g.fillRect(x - 20 + Math.sin(t * 2 + k) * 8, BB + 10 + k * 14, 40 - k * 2, 4); } });
  g.restore();
  // drifting mist bands
  for (let k = 0; k < 4; k++) { const y = [560, 650, 730, 800][k], c2 = ['200,130,255', '255,140,220', '130,170,255', '220,160,255'][k]; const off = ((t * (12 + k * 6)) % 800);
    for (let j = -1; j < 4; j++) { const cx = j * 800 + off - 200; const gg = g.createRadialGradient(cx, y, 0, cx, y, 420); gg.addColorStop(0, `rgba(${c2},${.13 * lit})`); gg.addColorStop(1, `rgba(${c2},0)`); g.fillStyle = gg; g.save(); g.translate(cx, y); g.scale(1, .22); g.translate(-cx, -y); g.beginPath(); g.arc(cx, y, 420, 0, 7); g.fill(); g.restore(); } }
}
bundDraw = function (t, panX, litFrom, ppl) {
  const B = bundLayers();
  put(B.sky, panX * .1 - 10, 0);
  g.save(); g.globalCompositeOperation = 'lighter'; glw(900, 640, 900, '160,60,200', .18); glw(300, 700, 500, '60,90,220', .15); glw(1600, 680, 500, '255,60,120', .12); g.restore();
  put(B.far, panX * .25, 0);
  haze(520, BB, '150,90,200', .3);
  put(B.midD, panX * .5, 0);
  const nLit = litFrom == null ? 99 : (t - litFrom) / (BEAT * .75);
  g.save(); g.beginPath(); BUND_ORDER.forEach(([a, b], i) => { if (i < nLit) g.rect(a + panX * .5, 0, b - a, BB + 2); }); g.clip(); put(B.midL, panX * .5, 0); g.restore();
  bundFX(t, panX, clamp(nLit / 4));
  put(B.water, panX * .7, 0, .85);
  bundFX2(t, clamp(nLit / 4));
  put(B.prom, panX, 0);
  [230, 1680].forEach(X => { glw(X + panX, 636, 120, '255,210,150', .5); glw(X + panX, 636, 26, '255,240,210', .9); });
  if (ppl) ppl(panX);
};
function bundFX2(t, lit) { if (lit <= 0) return; const r = rng(57); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 90; i++) { const X = r() * W, c2 = NEON[i % 4]; const yy = BB + 30 + r() * 80; g.fillStyle = `rgba(${c2},${.18 * lit * (.5 + .5 * Math.sin(t * 3 + i))})`; g.fillRect(X, yy, 10 + r() * 30, 2); } g.restore(); }
sBund = function (t, lt) {
  const S = V1L; const panX = -lerp(0, 40, ease(clamp((t - S.st[5]) / 14)));
  bundDraw(t, panX, S.st[5] + .1, px => {
    // first date: side by side, a polite gap, no hand holding
    const x = 520 + px; const look = t > S.st[7];
    doll(x, 925, 250, 'he', { light: '255,170,230', armL: [-6, 30], armR: [6, 30], lean: look ? .04 : 0 });
    doll(x + 125, 925, 230, 'she', { light: '170,200,255', smile: t > S.st[6], lean: look ? -.05 : 0 });
    const ha = ramp(t, S.st[7] + .4, S.st[7] + 1.2); if (ha > 0) { g.fillStyle = `rgba(255,140,190,${ha})`; heartPath(x, 925 - 250 * .98 - ha * 20, 16); g.fill(); glw(x, 925 - 250, 60, '255,140,190', .5 * ha); }
    const fs = ramp(t, S.st[7] + 1.2, S.st[7] + 2.8); if (fs > 0) { g.save(); g.strokeStyle = `rgba(255,220,150,${.5 * fs})`; g.setLineDash([5, 7]); g.beginPath(); g.moveTo(x + 62, 640); g.lineTo(x + 62, 640 - 260 * fs); g.stroke(); g.restore(); glowDot(x + 62, 380, 90 * fs, fs); }
  });
  const magic = ramp(t, S.st[6], S.st[6] + 2); if (magic > 0) { const r = rng(77); for (let k = 0; k < 70; k++) { const x = r() * W, y = r() * 600, ph = r() * 6.28; const a = magic * Math.max(0, Math.sin(t * 2.2 + ph)) ** 4; if (a > .02) glw(x, y, 16, NEON[k % 4], a * .8); } }
  finish(.6);
  stampP(t, ramp(t, S.st[5], S.st[5] + 1) * clamp((S.st[7] + 3 - t) / .6), '2023.02.12 晚上 · 外滩', '江上起了一点雾');
};

// ---------- "brave people enjoy the world first": a paper planet of their places ----------
function worldPlanet(t, u, V) {
  const cx = 960, cy = 1240, R = 640, rot = t * .1;
  glw(cx, 620, 760, V.tint || '255,220,160', .18);
  // orbiting clouds + plane (behind)
  g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 24; g.shadowOffsetY = -6;
  const og = g.createRadialGradient(cx - 200, cy - 500, 50, cx, cy, R); og.addColorStop(0, '#5aa8d8'); og.addColorStop(1, '#2a5a9a'); g.fillStyle = og; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); const r = rng(5);
  for (let i = 0; i < 9; i++) { const an = rot + i * .7 + r() * .3, d = R * (.5 + r() * .45); const x = cx + Math.cos(an - Math.PI / 2) * d * 1, y = cy + Math.sin(an - Math.PI / 2) * d; g.fillStyle = ['#7ac26a', '#a8d06a', '#e8c878', '#6aa860'][i % 4]; g.beginPath(); g.ellipse(x, y, 120 + r() * 90, 60 + r() * 40, an, 0, 7); g.fill(); }
  g.restore();
  g.strokeStyle = 'rgba(255,240,200,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
  // landmarks standing on the rim, rotating with the planet
  const marks = ['pearl', 'castle', 'sea', 'dunes', 'bell', 'pagoda', 'snowmt', 'arch', 'pearl', 'sea', 'castle', 'dunes', 'pagoda', 'snowmt'];
  marks.forEach((m, i) => { const an = ((i / marks.length) * Math.PI * 2 + rot) % (Math.PI * 2) - Math.PI; if (Math.abs(an + Math.PI / 2) < .12) return; const vis = Math.cos(an + Math.PI / 2); if (vis < .05) return;
    const x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R; g.save(); g.translate(x, y); g.rotate(an + Math.PI / 2); g.scale(1.35, 1.35); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 4; landmark(m, t); g.restore(); });
  // the couple on top, arms up
  doll(cx - 50, cy - R + 4, 210, 'he', { armL: [-18, -36], armR: [20, -36], smile: true, light: '255,235,190' }); doll(cx + 40, cy - R + 4, 195, 'she', { armL: [-18, -38], armR: [18, -38], smile: true, light: '255,235,190' });
  // paper plane with dotted trail + balloon
  const pa = t * .7; const px = cx + Math.cos(pa) * 820, py = 430 + Math.sin(pa) * 120; g.setLineDash([6, 10]); g.strokeStyle = 'rgba(255,240,210,.5)'; g.lineWidth = 2; g.beginPath(); for (let k = 0; k < 30; k++) { const a2 = pa - k * .03; g.lineTo(cx + Math.cos(a2) * 820, 430 + Math.sin(a2) * 120); } g.stroke(); g.setLineDash([]);
  g.save(); g.translate(px, py); g.rotate(Math.atan2(Math.cos(pa) * 120, -Math.sin(pa) * 820)); g.fillStyle = '#fffaf0'; g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.beginPath(); g.moveTo(30, 0); g.lineTo(-24, -16); g.lineTo(-14, 0); g.lineTo(-24, 16); g.closePath(); g.fill(); g.restore();
  const bx = 1560, by = 300 + Math.sin(t * .8) * 14; g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 12; const bgg = g.createLinearGradient(bx - 60, 0, bx + 60, 0); bgg.addColorStop(0, '#e9806e'); bgg.addColorStop(.5, '#f2c14e'); bgg.addColorStop(1, '#e9806e'); g.fillStyle = bgg; g.beginPath(); g.ellipse(bx, by, 60, 72, 0, 0, 7); g.fill(); g.restore(); g.strokeStyle = 'rgba(80,50,40,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(bx - 30, by + 60); g.lineTo(bx - 14, by + 104); g.moveTo(bx + 30, by + 60); g.lineTo(bx + 14, by + 104); g.stroke(); g.fillStyle = '#8a5a3a'; g.fillRect(bx - 16, by + 102, 32, 22);
  [[300, 330], [760, 300], [1300, 350]].forEach(([x, y], i) => { const xx = (x + t * (10 + i * 5)) % (W + 300) - 150; if (Math.abs(xx - 960) < 380 && y < 380) return; g.save(); g.shadowColor = 'rgba(0,0,0,.25)'; g.shadowBlur = 14; g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(xx, y, 90, 26, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(xx + 30, y - 16, 46, 24, 0, 0, 7); g.fill(); g.restore(); });
}
function landmark(m, t) {
  g.lineCap = 'round';
  if (m === 'pearl') { g.strokeStyle = '#5a3a7a'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -160); g.stroke(); g.fillStyle = '#ff7ad8'; [[-50, 22], [-128, 14], [-150, 6]].forEach(([y, r]) => { g.beginPath(); g.arc(0, y, r, 0, 7); g.fill(); }); }
  else if (m === 'castle') { g.fillStyle = '#a8d8f8'; [[-36, 60], [0, 90], [36, 60]].forEach(([x, h]) => { g.fillRect(x - 16, -h, 32, h); g.beginPath(); g.moveTo(x - 18, -h); g.lineTo(x, -h - 26); g.lineTo(x + 18, -h); g.fill(); }); }
  else if (m === 'sea') { g.fillStyle = '#ffdf9a'; g.beginPath(); g.arc(0, -40, 32, Math.PI, 0); g.fill(); g.fillStyle = '#e48a86'; g.fillRect(-60, -40, 120, 14); g.fillStyle = '#9a5a8e'; g.fillRect(-60, -26, 120, 26); }
  else if (m === 'dunes') { g.fillStyle = '#e0a868'; g.beginPath(); g.moveTo(-80, 0); g.quadraticCurveTo(-30, -80, 10, -40); g.quadraticCurveTo(40, -70, 80, 0); g.fill(); }
  else if (m === 'bell') { g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(-26, -10); g.quadraticCurveTo(-24, -60, 0, -66); g.quadraticCurveTo(24, -60, 26, -10); g.lineTo(32, 0); g.lineTo(-32, 0); g.fill(); }
  else if (m === 'pagoda') { g.fillStyle = '#c86a4a'; for (let k = 0; k < 5; k++) { const w = 60 - k * 9, y = -k * 26; g.fillRect(-w / 2 + 6, y - 22, w - 12, 22); g.fillStyle = '#7a3a2a'; g.fillRect(-w / 2, y - 26, w, 6); g.fillStyle = '#c86a4a'; } }
  else if (m === 'snowmt') { g.fillStyle = '#7a8ab0'; g.beginPath(); g.moveTo(-90, 0); g.lineTo(-20, -110); g.lineTo(20, -60); g.lineTo(50, -90); g.lineTo(90, 0); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-40, -78); g.lineTo(-20, -110); g.lineTo(0, -84); g.fill(); }
  else { g.strokeStyle = '#d8b07a'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 50, Math.PI, 0); g.stroke(); }
}
const _chorusShot = chorusShot;
chorusShot = function (k, t, u, V) {
  if (k === 2) { put(chorusSky(V)); worldPlanet(t, u, V);
    T('勇敢的人先享受世界', 960, 150, 38, 'rgba(255,230,180,.85)', ramp(u, .6, 1.6), { glow: 'rgba(255,200,120,.6)' }); T('—— 我们常挂在嘴边的话', 960, 205, 22, 'rgba(255,230,180,.6)', ramp(u, 1.2, 2.2)); finish(.45); return; }
  _chorusShot(k, t, u, V);
};
function milkyArch(t) { put(L('milky_arch', x => { const r = rng(71); for (let i = 0; i < 50; i++) { const p = r(), an = Math.PI + p * Math.PI, cx = 960 + Math.cos(an) * 900, cy = 900 + Math.sin(an) * 700, rr = 100 + r() * 140; const gg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); gg.addColorStop(0, `rgba(${r() < .5 ? '200,180,255' : '255,210,230'},.1)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
  for (let i = 0; i < 4000; i++) { const p = r(), an = Math.PI + p * Math.PI, spread = (r() - .5) * (r() < .7 ? 90 : 260); const cx = 960 + Math.cos(an) * (900 + spread), cy = 900 + Math.sin(an) * (700 + spread); x.fillStyle = `rgba(255,${235 + r() * 20 | 0},${215 + r() * 40 | 0},${r() * .85})`; x.fillRect(cx, cy, 1.6, 1.6); } }, 'raw')); }
// road draws its own sky: for the new-moon variant, redraw the arch after the sky inside roadP
const _roadP = roadP;
roadP = function (t, u, V, walkers = true, ill, wan) { if ((ill ?? V.ill) < .03) { const P = V.pal; put(chorusSky(V)); milkyArch(t); moonP(960, 450, 110, .01, false, .3);
    put(L('rd_far' + P[1], x => { x.fillStyle = shade(P[2], -.25); x.beginPath(); x.moveTo(0, 640); for (let X = 0; X <= W; X += 40) x.lineTo(X, 620 - Math.sin(X * .005) * 40 - Math.sin(X * .017) * 12); x.lineTo(W, 640); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }, { tex: .4, blur: 1.2, sh: [14, -4, 'rgba(0,0,0,.4)'] }));
    put(L('rd_road' + P[1], x => { x.fillStyle = shade(P[2], -.55); x.fillRect(0, 640, W, H); x.fillStyle = shade(P[2], -.35); x.beginPath(); x.moveTo(520, H); x.lineTo(945, 640); x.lineTo(975, 640); x.lineTo(1400, H); x.fill(); x.strokeStyle = 'rgba(255,215,150,.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(520, H); x.lineTo(945, 640); x.moveTo(1400, H); x.lineTo(975, 640); x.stroke(); }, { tex: .4, sh: [20, -6, 'rgba(0,0,0,.5)'] }));
    for (let k = 0; k < 14; k++) { const z = ((k / 14 + u * .12) % 1); const p = Math.pow(z, 2.2); const y = 640 + p * 440, w = 2 + p * 10, h = 4 + p * 40; g.fillStyle = `rgba(255,220,150,${.3 + p * .5})`; g.fillRect(960 - w / 2, y, w, h); }
    if (walkers) { const z = clamp(u / 6); const h = lerp(300, 120, z), y = lerp(1000, 800, z); couple(940 - h * .17, y, h, { run: t * 6, light: '255,230,190' }); } return; }
  _roadP(t, u, V, walkers, ill, wan); };

// ---------- finale: rice / oil-salt / everyday — hold, read, then fly ----------
const _finalShot = finalShot;
finalShot = function (k, t, u) {
  if (k !== 4) return _finalShot(k, t, u);
  FINV = .5; roadP(t, u, PF2, true, 1, false);
  [['rice', '柴米'], ['oil', '油盐'], ['salt', '日常']].forEach(([it, lab], j) => { const p = ease(clamp((u - 1.8 - j * .35) / 2.2)); if (p >= 1) return; const x0 = 420 + j * 540, y0 = 330; const x = lerp(x0, 960, p), y = lerp(y0, 460, p), s = lerp(1.1, .08, p); const pop = ease(clamp((u - j * .25) / .5));
    g.save(); g.translate(x, y); g.scale(s * pop, s * pop); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 5;
    if (it === 'rice') { g.fillStyle = '#f6efe2'; g.beginPath(); g.arc(0, 0, 70, 0, Math.PI); g.closePath(); g.fill(); g.shadowBlur = 0; g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(0, 0, 60, Math.PI, 0); g.fill(); g.strokeStyle = '#7fb3d5'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 66, .3, Math.PI - .3); g.stroke(); }
    else if (it === 'oil') { g.fillStyle = '#f2c14e'; g.beginPath(); g.roundRect(-70, -60, 60, 120, 14); g.fill(); g.fillRect(-52, -88, 24, 30); g.fillStyle = '#ffffff'; g.beginPath(); g.roundRect(20, -36, 50, 96, 18); g.fill(); g.fillStyle = '#c0c0c8'; g.fillRect(20, -36, 50, 18); }
    else { g.fillStyle = '#f2b6a6'; g.beginPath(); g.moveTo(0, -60); g.bezierCurveTo(-80, -100, -90, 10, 0, 60); g.bezierCurveTo(90, 10, 80, -100, 0, -60); g.fill(); }
    g.restore();
    const la = pop * (1 - clamp(p * 2.5)); if (la > 0) { g.save(); g.globalAlpha = la * .75; g.fillStyle = '#1a1230'; g.beginPath(); g.roundRect(x0 - 70, y0 + 92, 140, 58, 29); g.fill(); g.restore(); T(lab, x0, y0 + 121, 40, '#fff0d0', la, { w: 600 }); } });
  finish(FINV);
};

// ---------- timeline: hotpot → walk montage → Bund ----------
(function () {
  const v1 = SEC.v1.st; const i = SCENES.findIndex(sc => sc[2] && sc[2].toString().includes('sHotpot'));
  const j = SCENES.findIndex(sc => sc[2] && sc[2].toString().includes('sBund'));
  SCENES[i] = [v1[0] - .1, v1[4] - .4, tt => sHotpot(tt, tt - v1[0])];
  SCENES[j] = [v1[5] - .4, SCENES[j][1], tt => sBund(tt, tt - v1[5])];
  SCENES.splice(j, 0, [v1[4] - .4, v1[5] - .4, sWalk]);
})();
