// ===================== v3 scenes B: verse 2, verse 3, pre-chorus 2 =====================
// ---------- cherry blossom night ----------
sCherry = function (t) {
  const S = SEC.v2; put(skyL('ch_sky2', [[0, '#1a1840'], [.6, '#3b2c5c'], [1, '#7a4a78']], 300, 700, 31));
  put(L('cy_hill', x => { x.fillStyle = '#4a3366'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 860); x.quadraticCurveTo(700, 780, 1300, 840); x.quadraticCurveTo(1600, 870, W, 820); x.lineTo(W, H); x.fill(); const r = rng(4); for (let i = 0; i < 18; i++) { const X = r() * W, y = 830 - Math.sin(X * .002) * 30, s = 40 + r() * 50; x.fillStyle = `rgba(${230 + r() * 25 | 0},${160 + r() * 40 | 0},${200 + r() * 30 | 0},.85)`; x.beginPath(); x.arc(X, y - s * .8, s, 0, 7); x.fill(); x.fillStyle = '#3a2850'; x.fillRect(X - 4, y - s * .4, 8, s * .6); } }, { tex: .45, blur: 1.5, sh: [16, 4, 'rgba(10,5,20,.45)'] }));
  haze(600, 880, '200,140,190', .22);
  put(L('cy_branch', x => { x.strokeStyle = '#3a2430'; x.lineCap = 'round'; const br = [[[0, 160], [420, 260], [760, 210], 22], [[300, 230], [420, 120], [560, 90], 11], [[520, 240], [640, 340], [800, 360], 10], [[160, 190], [230, 330], [330, 380], 9], [[W, 120], [1600, 230], [1350, 220], 18], [[1700, 180], [1640, 300], [1520, 340], 9]];
    br.forEach(([a0, c2, e, w]) => { x.lineWidth = w; x.beginPath(); x.moveTo(...a0); x.quadraticCurveTo(...c2, ...e); x.stroke(); });
    const r = rng(31); for (let i = 0; i < 90; i++) { const b = br[i % br.length], k = .2 + r() * .8; const px = (1 - k) ** 2 * b[0][0] + 2 * (1 - k) * k * b[1][0] + k * k * b[2][0] + (r() - .5) * 50, py = (1 - k) ** 2 * b[0][1] + 2 * (1 - k) * k * b[1][1] + k * k * b[2][1] + (r() - .5) * 50;
      x.fillStyle = `rgb(255,${190 + r() * 30 | 0},${205 + r() * 20 | 0})`; for (let p = 0; p < 5; p++) { const an = p * 1.257 + i; x.beginPath(); x.ellipse(px + Math.cos(an) * 9, py + Math.sin(an) * 9, 9, 5.5, an, 0, 7); x.fill(); } x.fillStyle = '#e0809a'; x.beginPath(); x.arc(px, py, 3, 0, 7); x.fill(); } }, { tex: .45, sh: [20, 8, 'rgba(10,5,20,.5)'] }));
  petals(t, t > S.st[1] ? 120 : 60, t > S.st[1] ? 1.6 : 1, 1);
  const fa = ramp(t, S.st[2] - .2, S.st[2] + .5);
  if (fa > 0) { g.save(); g.globalAlpha = fa; const c2 = ramp(t, S.st[2], S.st[3]); const r = rng(12);
    for (let i = 0; i < 18; i++) { const a = r() * 6.28, d0 = 520 + r() * 300, k = clamp(c2 * 1.6 - i / 18 * .6); const d = d0 * (1 - ease(k)); if (k < 1) glowDot(960 + Math.cos(a) * d, 760 + Math.sin(a) * d * .6, 20, .9); }
    glw(960, 760, 180 * c2 + 40, '255,220,150', .6 * c2); doll(960, 960, 330, 'he', { armL: [-10, 6], armR: [10, 6], light: '255,210,220' }); g.restore(); }
  finish(.5); stampP(t, ramp(t, S.st[0], S.st[0] + 1), '2023.03 · 樱花季', '她说：樱花的花期太短了');
};
// ---------- the glass dome: preserved sunflower + a figurine holding a rose ----------
function sunflowerP(cx, cy, R, t) {
  for (let p = 0; p < 26; p++) { const an = p / 26 * 6.283 + Math.sin(t * .6) * .01; g.save(); g.translate(cx, cy); g.rotate(an); g.fillStyle = p % 2 ? '#ffc93c' : '#f7b52e'; g.beginPath(); g.ellipse(R * 1.38, 0, R * .52, R * .17, 0, 0, 7); g.fill(); g.restore(); }
  for (let p = 0; p < 13; p++) { const an = p / 13 * 6.283 + .12; g.save(); g.translate(cx, cy); g.rotate(an); g.fillStyle = '#ffd866'; g.beginPath(); g.ellipse(R * 1.2, 0, R * .42, R * .14, 0, 0, 7); g.fill(); g.restore(); }
  const dg = g.createRadialGradient(cx - R * .3, cy - R * .3, 2, cx, cy, R); dg.addColorStop(0, '#7a4a2a'); dg.addColorStop(1, '#3e2414'); g.fillStyle = dg; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,200,120,.3)'; for (let i = 0; i < 220; i++) { const an = i * 2.39996, rr = Math.sqrt(i / 220) * R * .95; g.beginPath(); g.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 2.2, 0, 7); g.fill(); }
}
function roseP(x, y, s, a = 1) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s); g.strokeStyle = '#4f9a6a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 30); g.stroke(); g.fillStyle = '#4f9a6a'; g.beginPath(); g.ellipse(6, 16, 7, 3, -.5, 0, 7); g.fill();
  g.fillStyle = '#e0485e'; g.beginPath(); g.arc(0, -6, 11, 0, 7); g.fill(); g.strokeStyle = '#ff9fb0'; g.lineWidth = 1.6; g.beginPath(); for (let k = 0; k < 24; k++) { const an = k * .55, r = 1.5 + k * .38; g.lineTo(Math.cos(an) * r, -6 + Math.sin(an) * r); } g.stroke(); g.restore(); }
sSunflower = function (t) {
  const S = SEC.v2; const herShot = ramp(t, S.st[5] - .3, S.st[5] + .3);
  if (herShot < 1) layer(() => {
    put(L('sf_bg', x => { x.fillStyle = grad(x, 0, H, [[0, '#0c1233'], [.7, '#232a58'], [1, '#3a2e5a']]); x.fillRect(0, 0, W, H); const r = rng(8); for (let i = 0; i < 300; i++) { x.fillStyle = `rgba(255,240,215,${.2 + r() * .6})`; x.beginPath(); x.arc(r() * W, r() * 700, r() * 1.4 + .3, 0, 7); x.fill(); } }, 'raw'));
    // shelf / table
    put(L('sf_table', x => { x.fillStyle = grad(x, 830, H, [[0, '#6a4a5a'], [1, '#3a2638']]); x.fillRect(0, 830, W, 250); x.fillStyle = 'rgba(255,220,190,.12)'; x.fillRect(0, 828, W, 6); }, { tex: .45, sh: [20, -6, 'rgba(0,0,0,.5)'] }));
    const cx = 800, base = 850;
    glw(cx, 560, 420, '255,210,140', .22);
    domeGift(t, cx, base, ramp(t, S.st[3], S.st[3] + .8), ramp(t, S.st[4], S.st[4] + .8));
    const ca = ramp(t, S.st[4], S.st[4] + .6);
    if (ca > 0) { card(1430, 520, 520, 300, .04); ['于我而言', '你就是那一朵', '独一无二的玫瑰'].forEach((s, j) => T(s, 1430, 450 + j * 66, 42, '#5a3040', ca * clamp((t - S.st[4] - .3 - j * .5) / .5), { w: 500 })); }
    finish(.5); stampP(t, ramp(t, S.st[3], S.st[3] + 1), '2023.03.25 · 表白', '一束永生花向日葵，罩子里住着一个小王子');
  }, 1 - herShot);
  if (herShot > 0) layer(() => {
    put(skyL('sf_her', [[0, '#20173e'], [.6, '#3a2550'], [1, '#6a3d66']], 300, 800, 44)); const hl = hillsL('sfh', '#4a2d5a', '#2a1a38'); put(hl[0]); glw(960, 700, 460, '255,180,190', .25); put(hl[1]);
    doll(960, 1000, 460, 'she', { smile: true, armL: [-14, -6], armR: [18, -10], light: '255,220,210' });
    T('♪', 1180, 420, 64, '#ffe3a8', clamp((t - S.st[5] - .4) / .4), { glow: 'rgba(255,200,120,.8)' });
    T('她没说好，也没有拒绝', 960, 150, 30, 'rgba(255,226,170,.8)', ramp(t, S.st[5], S.st[5] + 1)); finish(.5);
  }, herShot);
};
// ---------- Shengsi ----------
function shengsiLayers() {
  const cloud = (x, cx, cy, w, h, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(cx - w / 2, cy); const r = rng(cx | 0); for (let k = 0; k <= 20; k++) { const px = cx - w / 2 + k * w / 20; x.lineTo(px, cy - h * (Math.sin(k / 20 * Math.PI) * (.6 + r() * .4))); } for (let k = 20; k >= 0; k--) { const px = cx - w / 2 + k * w / 20; x.lineTo(px, cy + h * .25 * Math.sin(k / 20 * Math.PI) + (r() - .5) * 4); } x.fill(); };
  return {
    sky: L('ss_sky', x => { x.fillStyle = grad(x, 0, 700, [[0, '#3b2a66'], [.35, '#8a4a86'], [.62, '#e2788e'], [.85, '#f9a86e'], [1, '#ffd08a']]); x.fillRect(0, 0, W, H); }, 'raw'),
    c1: L('ss_c1', x => { cloud(x, 360, 150, 760, 38, '#7a4f92'); cloud(x, 1300, 170, 640, 30, '#83519a'); cloud(x, 1000, 300, 980, 46, '#c8679a'); }, { tex: .55, sh: [18, 8, 'rgba(60,20,60,.35)'] }),
    c2: L('ss_c2', x => { cloud(x, 220, 420, 520, 34, '#ee8f86'); cloud(x, 1450, 450, 900, 40, '#f59b7e'); cloud(x, 820, 560, 700, 30, '#f8b07a'); }, { tex: .55, sh: [18, 8, 'rgba(120,40,60,.3)'] }),
    isl: L('ss_isl', x => { x.fillStyle = '#6a4482'; x.beginPath(); x.moveTo(120, 650); x.quadraticCurveTo(300, 560, 390, 572); x.quadraticCurveTo(500, 590, 600, 650); x.fill(); x.beginPath(); x.moveTo(1560, 650); x.quadraticCurveTo(1700, 600, 1920, 615); x.lineTo(1920, 650); x.fill(); }, { tex: .5, sh: [10, 4, 'rgba(40,10,40,.4)'] }),
    sea: L('ss_sea', x => { ['#e48a86', '#c8708a', '#9a5a8e', '#6e4a8a', '#4e3c7e'].forEach((c2, j) => { const y0 = 648 + j * 48; x.fillStyle = c2; x.beginPath(); x.moveTo(0, y0); for (let X = 0; X <= W; X += 20) x.lineTo(X, y0 + Math.sin(X * .008 + j * 1.3) * 7 + Math.sin(X * .03 + j) * 3); x.lineTo(W, 900); x.lineTo(0, 900); x.fill(); x.strokeStyle = 'rgba(255,235,230,.35)'; x.lineWidth = 2; x.beginPath(); for (let X = 0; X <= W; X += 20) x.lineTo(X, y0 + Math.sin(X * .008 + j * 1.3) * 7 + Math.sin(X * .03 + j) * 3); x.stroke(); });
      const r = rng(4); for (let k = 0; k < 26; k++) { const w = 200 * (1 - k / 30) * (.6 + r() * .5); x.fillStyle = `rgba(255,236,170,${.7 - k * .022})`; x.fillRect(1260 - w / 2 + (r() - .5) * 30, 660 + k * 9, w, 3); } }, { tex: .45, sh: [16, -4, 'rgba(60,20,60,.4)'] }),
    sand: L('ss_sand', x => { x.fillStyle = '#fbe9cf'; x.beginPath(); x.moveTo(0, 885); for (let X = 0; X <= W; X += 30) x.lineTo(X, 880 + Math.sin(X * .006) * 10); x.lineTo(W, 940); x.lineTo(0, 940); x.fill(); x.fillStyle = grad(x, 890, H, [[0, '#f2b98e'], [1, '#e09a7a']]); x.beginPath(); x.moveTo(0, 902); for (let X = 0; X <= W; X += 30) x.lineTo(X, 898 + Math.sin(X * .006 + 1) * 8); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }, { tex: .45, sh: [22, -8, 'rgba(80,30,40,.35)'] }),
  };
}
sShengsi = function (t) {
  const S = SEC.v2, P = shengsiLayers(); const sunY = lerp(600, 680, ramp(t, S.st[6], S.st[7] + 3));
  put(P.sky); glw(1260, sunY - 40, 520, '255,210,140', .45); moonP(1560, 160, 40, .84, false, .1, .7);
  g.save(); g.beginPath(); g.rect(0, 0, W, 652); g.clip(); g.fillStyle = '#fff0b8'; g.shadowColor = 'rgba(255,230,160,1)'; g.shadowBlur = 60; g.beginPath(); g.arc(1260, sunY, 150, 0, 7); g.fill(); g.restore();
  put(P.c1, -t * 4 % 40); put(P.c2, -t * 7 % 60); put(P.isl); put(P.sea); put(P.sand);
  [[610, 250], [655, 270], [1500, 210]].forEach(([x, y], i) => { const fx = x + Math.sin(t * .5 + i) * 30; g.strokeStyle = 'rgba(70,40,80,.7)'; g.lineWidth = 3; const fl = Math.sin(t * 6 + i) * 4; g.beginPath(); g.moveTo(fx - 14, y + fl); g.quadraticCurveTo(fx - 7, y - 8, fx, y); g.quadraticCurveTo(fx + 7, y - 8, fx + 14, y + fl); g.stroke(); });
  const run = t < S.st[7]; const x = run ? lerp(200, 640, ease(ramp(t, S.st[6] - .5, S.st[7]))) : 640;
  g.fillStyle = 'rgba(160,90,80,.35)'; for (let k = 0; k < 12; k++) { const fx = x - 60 - k * 46; if (fx < 0) break; g.beginPath(); g.ellipse(fx, 1000 + (k % 2) * 14, 9, 5, -.2, 0, 7); g.fill(); }
  if (run) { doll(x, 960, 260, 'he', { armR: [26, -4], armL: [-16, 18], run: t * 9, bob: t * 9, light: '255,220,170' }); doll(x + 95, 960, 238, 'she', { armL: [-24, -2], armR: [18, -30], run: t * 9 + Math.PI, bob: t * 9 + Math.PI, smile: true, light: '255,220,170' }); }
  else { couple(x, 960, 260, { smile: true, heSmile: true, light: '255,220,170' }); const ha = ramp(t, S.st[7] + .5, S.st[7] + 1.2); if (ha > 0) { g.fillStyle = `rgba(255,110,140,${ha})`; heartPath(x + 44, 640 - ha * 30, 34); g.fill(); glw(x + 44, 620, 90, '255,140,160', .5 * ha); } }
  finish(.45); stampP(t, ramp(t, S.st[6], S.st[6] + 1), '2023.05.01 · 嵊泗', '她说：就是追夕阳的那一刻');
};

// ---------- Harbin ----------
sHarbin = function (t) {
  const S = SEC.v3, u = t - S.st[0];
  put(skyL('hb_sky', [[0, '#06122c'], [.6, '#0f2a50'], [1, '#2a5a86']], 300, 600, 51));
  const r = rng(51); for (let i = 0; i < 5; i++) { const st = .6 + i * .55, k = clamp((u - st) / 1.2); if (k <= 0 || k >= 1) continue; const cx = 250 + r() * 1400, cy = 140 + r() * 220; for (let j = 0; j < 28; j++) { const an = j / 28 * 6.28; glw(cx + Math.cos(an) * k * 170, cy + Math.sin(an) * k * 170 + k * k * 40, 12, i % 2 ? '255,190,230' : '190,230,255', (1 - k) * .9); } }
  const castle = (x, towers, col, edge) => { towers.forEach(([X, w, h]) => { const y = 960 - h; x.fillStyle = grad(x, y, 960, [[0, col[0]], [1, col[1]]]); x.strokeStyle = edge; x.lineWidth = 2; x.beginPath(); x.moveTo(X - w / 2, 960); x.lineTo(X - w / 2, y); for (let k = 0; k < 5; k++) { const xx = X - w / 2 + k * w / 5; x.lineTo(xx, y - 14); x.lineTo(xx + w / 10, y - 14); x.lineTo(xx + w / 10, y); x.lineTo(xx + w / 5, y); } x.lineTo(X + w / 2, 960); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(X - w * .3, y - 14); x.lineTo(X, y - 14 - w * .7); x.lineTo(X + w * .3, y - 14); x.fill(); x.stroke(); }); };
  put(L('hb_far', x => castle(x, [[150, 120, 260], [330, 100, 340], [520, 160, 220], [1300, 160, 240], [1500, 110, 360], [1700, 140, 260]], ['rgba(120,170,230,.55)', 'rgba(60,110,180,.55)'], 'rgba(190,230,255,.5)'), { tex: .35, blur: 1.5, sh: [14, 4, 'rgba(0,10,40,.4)'] }));
  haze(560, 960, '120,170,230', .2);
  put(L('hb_near', x => castle(x, [[220, 150, 300], [420, 120, 420], [640, 190, 260], [860, 140, 520], [1080, 220, 380], [1300, 140, 540], [1520, 190, 300], [1740, 160, 420]], ['rgba(150,215,255,.75)', 'rgba(70,140,210,.75)'], 'rgba(220,245,255,.9)'), { tex: .4, sh: [20, 6, 'rgba(0,10,40,.5)'] }));
  [[860, 440], [1300, 420], [420, 540]].forEach(([x, y], i) => glw(x, y, 160, i % 2 ? '255,170,220' : '150,220,255', .25 + .1 * Math.sin(t * 2 + i)));
  const sw = Math.sin(u * 4.2) * .25 * clamp(u / .5); g.save(); g.translate(960, 150); g.rotate(sw); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = '#f2c14e'; g.beginPath(); g.moveTo(-60, 120); g.quadraticCurveTo(-55, 10, 0, 0); g.quadraticCurveTo(55, 10, 60, 120); g.lineTo(75, 140); g.lineTo(-75, 140); g.closePath(); g.fill(); g.shadowBlur = 0; g.fillStyle = '#ffe08a'; g.fillRect(-60, 100, 120, 10); g.restore();
  for (let k = 0; k < 3; k++) { const p = ((u - .3) * .9 - k * .33); if (p <= 0 || p > 1) continue; g.strokeStyle = `rgba(255,230,170,${(1 - p) * .7})`; g.lineWidth = 3; g.beginPath(); g.arc(960, 250, p * 600, 0, 7); g.stroke(); }
  put(L('hb_snowg', x => { x.fillStyle = '#e8f2ff'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 950); x.quadraticCurveTo(960, 900, W, 960); x.lineTo(W, H); x.fill(); }, { tex: .4, sh: [20, -6, 'rgba(0,20,60,.4)'] }));
  couple(860, 1000, 250, { light: '200,230,255', smile: true, heSmile: true, scarf1: '#d8513e', scarf2: '#f2c14e' });
  snow(t, .9); finish(.45); stampP(t, ramp(u, 0, 1), '2023.12.31 · 哈尔滨 · 冰雪大世界', '一起敲响新年的钟声');
};
// ---------- concert ----------
sConcert = function (t) {
  const S = SEC.v3, u = t - S.st[1];
  put(skyL('cc_bg', [[0, '#06040e'], [.6, '#120a24'], [1, '#1e1030']], 0, 1, 1));
  for (let k = 0; k < 6; k++) { const an = -.8 + k * .32 + Math.sin(t * .8 + k) * .12; g.save(); g.globalCompositeOperation = 'lighter'; g.translate(960, 150); g.rotate(an); const gr2 = g.createLinearGradient(0, 0, 0, 900); gr2.addColorStop(0, `rgba(${k % 2 ? '255,160,220' : '170,180,255'},.3)`); gr2.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr2; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-150, 900); g.lineTo(150, 900); g.lineTo(10, 0); g.fill(); g.restore(); }
  put(L('cc_stage', x => { x.fillStyle = '#2a1a3a'; x.beginPath(); x.moveTo(480, 330); x.lineTo(1440, 330); x.lineTo(1520, 380); x.lineTo(400, 380); x.fill(); x.fillStyle = '#3a2650'; x.fillRect(400, 380, 1120, 30); x.fillStyle = '#1a1028'; [[380, 100], [1540, 100]].forEach(([X, w]) => x.fillRect(X - w / 2, 120, w, 300)); }, { tex: .4, sh: [20, 8, 'rgba(0,0,0,.6)'] }));
  glw(960, 260, 200, '255,230,255', .7); doll(960, 335, 120, 'she', { col: '#f4f0ff', armR: [16, -36], noShadow: true });
  const r = rng(61); for (let i = 0; i < 1100; i++) { const x = r() * W, y = 480 + Math.pow(r(), .8) * 560, ph = r() * 6.28, sway = Math.sin(t * 3 + ph + x * .01) * 6; g.fillStyle = ['rgba(255,140,200,.9)', 'rgba(140,200,255,.9)', 'rgba(255,240,180,.9)'][i % 3]; g.beginPath(); g.arc(x + sway, y, 1.8 + (y - 480) / 260, 0, 7); g.fill(); }
  put(L('cc_crowd', x => { x.fillStyle = '#0c0818'; x.beginPath(); x.moveTo(0, H); for (let X = 0; X <= W; X += 30) x.lineTo(X, 960 + Math.sin(X * .05) * 14 + Math.sin(X * .13) * 8); x.lineTo(W, H); x.fill(); }, { tex: .3, sh: [20, -6, 'rgba(0,0,0,.6)'] }));
  couple(820, 1040, 330, { light: '255,190,230', smile: u > 1.9, heSmile: true, sheArmR: u > 1.9 ? [16, -36] : undefined });
  const k = ease(clamp((u - .5) / 1.4)); if (k > 0 && k < 1) { const x = lerp(960, 935, k), y = lerp(300, 740, k) - Math.sin(k * Math.PI) * 120; g.fillStyle = '#ff7f9c'; g.shadowColor = '#ff9fb5'; g.shadowBlur = 30; heartPath(x, y, lerp(22, 44, k)); g.fill(); g.shadowBlur = 0; }
  if (k >= 1) glw(935, 760, 120, '255,140,170', .5);
  finish(.5); stampP(t, ramp(u, 0, .8), '2024.10.13 · 张韶涵演唱会 · 内场', '她给了你一个比心');
};
// ---------- proposal ----------
sProposal = function (t) {
  const S = SEC.v3, u = t - S.st[2];
  put(L('pp_room', x => { x.fillStyle = grad(x, 0, H, [[0, '#0d0c26'], [1, '#1d1a3c']]); x.fillRect(0, 0, W, H); }, 'raw'));
  const sp = ease(clamp(u / 2)); put(L('pp_stars', x => { const r = rng(8); for (let i = 0; i < 800; i++) { const px = r() * W, py = r() * 800, d = Math.hypot(px - 1500, py - 900); x.fillStyle = `rgba(${200 + r() * 55 | 0},${200 + r() * 45 | 0},255,${(.3 + r() * .7) * Math.min(1, 1500 / (d + 300))})`; x.beginPath(); x.arc(px, py, r() * 2 + .5, 0, 7); x.fill(); }
    for (let k = 0; k < 7; k++) { const px = 300 + r() * 1300, py = 100 + r() * 500, rr = 200 + r() * 250; const gg = x.createRadialGradient(px, py, 0, px, py, rr); gg.addColorStop(0, `rgba(${k % 2 ? '150,120,255' : '255,130,200'},.12)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(px - rr, py - rr, rr * 2, rr * 2); } }, 'raw'), 0, 0, sp);
  twinkle(t, 30, 760, 8, sp);
  g.save(); g.globalCompositeOperation = 'lighter'; const pg = g.createLinearGradient(1500, 900, 1100, 200); pg.addColorStop(0, `rgba(150,160,255,${.28 * clamp(u / .4)})`); pg.addColorStop(1, 'rgba(150,160,255,0)'); g.fillStyle = pg; g.beginPath(); g.moveTo(1480, 880); g.lineTo(700, 0); g.lineTo(1900, 0); g.lineTo(1520, 880); g.fill(); g.restore();
  put(L('pp_win', x => { x.fillStyle = '#141235'; x.fillRect(120, 160, 360, 520); x.fillStyle = '#26214e'; x.fillRect(120, 160, 360, 14); x.fillRect(120, 666, 360, 14); x.fillRect(120, 160, 14, 520); x.fillRect(466, 160, 14, 520); x.fillRect(293, 160, 14, 520); x.fillStyle = '#3a2a5a'; x.beginPath(); x.moveTo(90, 140); x.quadraticCurveTo(140, 420, 100, 720); x.lineTo(60, 720); x.lineTo(60, 140); x.fill(); x.beginPath(); x.moveTo(510, 140); x.quadraticCurveTo(460, 420, 500, 720); x.lineTo(540, 720); x.lineTo(540, 140); x.fill(); }, { tex: .5, sh: [18, 6, 'rgba(0,0,0,.5)'] }));
  put(L('pp_floor', x => { x.fillStyle = grad(x, 780, H, [[0, '#2a2246'], [1, '#171230']]); x.fillRect(0, 780, W, 300); x.strokeStyle = 'rgba(255,220,170,.08)'; x.lineWidth = 2; for (let k = 0; k < 12; k++) { x.beginPath(); x.moveTo(k * 180 - 200, H); x.lineTo(960 + (k * 180 - 1100) * .35, 780); x.stroke(); }
    x.fillStyle = '#4a3a6a'; x.beginPath(); x.roundRect(1240, 640, 520, 170, 40); x.fill(); x.fillStyle = '#5a4a7e'; x.beginPath(); x.roundRect(1270, 700, 460, 90, 30); x.fill();
    x.fillStyle = '#7a6aa0'; x.beginPath(); x.roundRect(1300, 650, 110, 70, 18); x.fill(); x.fillStyle = '#c9a0c0'; x.beginPath(); x.roundRect(1600, 655, 100, 64, 18); x.fill();
    x.fillStyle = '#9aa0e0'; x.beginPath(); x.arc(1500, 905, 36, Math.PI, 0); x.fill(); x.fillStyle = '#6a6fb0'; x.fillRect(1460, 903, 80, 12); }, { tex: .45, sh: [20, -6, 'rgba(0,0,0,.5)'] }));
  const kneel = t >= S.st[4]; glw(950, 820, 330, '255,200,170', .18 + .1 * ramp(t, S.st[4], S.st[4] + 1));
  doll(860, 960, 250, 'he', { kneel, armR: kneel ? [30, -18] : [8, 22], armL: kneel ? [26, -10] : undefined, light: '200,200,255' });
  doll(1030, 960, 245, 'she', { armL: kneel ? [-14, -34] : undefined, armR: kneel ? [12, -36] : undefined, smile: kneel, light: '200,200,255' });
  if (kneel) { const b = ramp(t, S.st[4], S.st[4] + .5); g.save(); g.globalAlpha = b; [[935, 820, '#ff9fb5'], [955, 806, '#ffd27a'], [946, 792, '#fff4e0'], [972, 822, '#ff9fb5'], [962, 838, '#f7c6d6']].forEach(([a, b2, c2]) => { g.fillStyle = c2; g.beginPath(); g.arc(a, b2, 12, 0, 7); g.fill(); }); g.strokeStyle = '#6fbf8a'; g.lineWidth = 4; g.beginPath(); g.moveTo(950, 830); g.lineTo(925, 880); g.stroke(); g.restore(); }
  const ca = ramp(t, S.st[3], S.st[3] + .5); if (ca > 0) { const n = Math.round(lerp(1, 625, ease(clamp((t - S.st[3]) / 2.4)))); T(`在一起的第 ${n} 天`, 960, 200, 56, '#fff0d0', ca, { glow: 'rgba(255,210,140,.8)', w: 500 }); }
  const ra = ramp(t, S.st[5], S.st[5] + 1.2); if (ra > 0) { for (let i = 0; i < 40; i++) { const an = i / 40 * 6.28 + t * .2; glowDot(950 + Math.cos(an) * 300, 820 + Math.sin(an) * 150, 14, ra * .9); } ['爱你', '陪你', '支持你'].forEach((s, j) => T(s, 660 + j * 300, 330, 46, '#ffe7b8', clamp((t - S.st[5] - j * .6) / .5), { glow: 'rgba(255,200,120,.9)' })); }
  finish(.5); stampP(t, ramp(u, 0, .8), '2024.10.12 · 求婚', '我把家里变成了星空');
};

// ---------- pre-chorus 2 ----------
sXiaoman = function (t) {
  const S = SEC.pre2, u = t - S.st[0];
  put(skyL('xm_sky', [[0, '#1a1230'], [.6, '#3a2440'], [1, '#7a4a46']], 300, 600, 61)); moonP(1620, 190, 58, .38, true, .25);
  const fill = ramp(t, S.st[1], S.st[2]);
  put(L('xm_hill', x => { x.fillStyle = '#5a3a40'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 860); x.quadraticCurveTo(900, 780, W, 850); x.lineTo(W, H); x.fill(); }, { tex: .45, sh: [16, -4, 'rgba(0,0,0,.4)'] }));
  for (let i = 0; i < 30; i++) wheat(30 + i * 64, 1090, 230 + (i % 3) * 40 + fill * 40, fill, t);
  const op = ease(clamp(u / 1.2)); g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 24; g.shadowOffsetY = 10; booklet(960 - 130 * op, 480, 1, -.08 * op); booklet(960 + 130 * op, 480, 1, .08 * op); g.restore();
  const sa = clamp((u - 1.4) / .25); if (sa > 0) { const sc = lerp(1.8, 1, ease(sa)); g.save(); g.translate(1130, 590); g.rotate(-.2); g.scale(sc, sc); g.globalAlpha = sa * .9; g.strokeStyle = '#ff5a5a'; g.lineWidth = 5; g.beginPath(); g.roundRect(-110, -44, 220, 88, 14); g.stroke(); g.fillStyle = '#ff5a5a'; g.font = `700 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('持证上岗', 0, 2); g.restore(); }
  T('小得盈满 · 爱逢其时', 960, 170, 46, '#ffe7b8', ramp(t, S.st[1], S.st[1] + .8), { glow: 'rgba(255,200,120,.8)' });
  finish(.5); stampP(t, ramp(u, 0, .8), '2025.05.21 · 小满 · 领证', '那天的月亮：下弦 38%');
};
sWedding = function (t) {
  const S = SEC.pre2, u = t - S.st[2]; const warm = ramp(t, S.st[3], S.st[3] + 1.5);
  put(L('wd_bg', x => { x.fillStyle = grad(x, 0, H, [[0, '#120c22'], [.6, '#22163a'], [1, '#3a2448']]); x.fillRect(0, 0, W, H); }, 'raw'));
  g.save(); g.globalCompositeOperation = 'lighter'; const sg = g.createLinearGradient(960, 0, 960, 1000); sg.addColorStop(0, `rgba(255,230,190,${.3 + .2 * warm})`); sg.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = sg; g.beginPath(); g.moveTo(900, 0); g.lineTo(1020, 0); g.lineTo(1300, 1000); g.lineTo(620, 1000); g.fill(); g.restore();
  put(L('wd_arch', x => { x.strokeStyle = '#e8d6c0'; x.lineWidth = 18; x.beginPath(); x.arc(960, 760, 360, Math.PI, 0); x.stroke(); const r = rng(81); for (let i = 0; i < 70; i++) { const an = Math.PI + i / 69 * Math.PI; x.fillStyle = ['#ffb3c1', '#fff2d8', '#ffd27a', '#f7c6d6'][i % 4]; x.beginPath(); x.arc(960 + Math.cos(an) * 360 + (r() - .5) * 20, 760 + Math.sin(an) * 360 + (r() - .5) * 20, 14 + r() * 8, 0, 7); x.fill(); } x.fillStyle = '#5fae7a'; for (let i = 0; i < 30; i++) { const an = Math.PI + r() * Math.PI; x.beginPath(); x.ellipse(960 + Math.cos(an) * 380, 760 + Math.sin(an) * 380, 12, 5, an, 0, 7); x.fill(); } }, { tex: .45, sh: [22, 8, 'rgba(0,0,0,.5)'] }));
  put(L('wd_stage', x => { x.fillStyle = '#2a1a3a'; x.fillRect(0, 900, W, 180); x.fillStyle = '#e8d6e8'; x.beginPath(); x.moveTo(840, 900); x.lineTo(1080, 900); x.lineTo(1180, H); x.lineTo(740, H); x.fill(); for (let row = 0; row < 2; row++) for (let i = 0; i < 16; i++) { if (i > 5 && i < 10) continue; x.fillStyle = row ? '#3a2650' : '#4a3260'; x.beginPath(); x.roundRect(80 + i * 112, 960 + row * 50, 70, 60, 10); x.fill(); } }, { tex: .4, sh: [20, -6, 'rgba(0,0,0,.5)'] }));
  const nerv = 1 - ramp(u, 1, 2.2); const sh = Math.sin(t * 40) * 2 * nerv;
  glw(960, 760, 320, '255,200,170', .3 * warm);
  doll(900 + sh, 905, 300, 'he', { armR: [22, 6], smile: warm > .3, light: '255,230,200' }); doll(1010 - sh, 905, 280, 'she', { veil: true, armL: [-22, 10], smile: warm > .3, light: '255,230,200' });
  if (nerv > .05) { T('社恐 × 2', 960, 470, 32, 'rgba(255,226,170,.85)', nerv * clamp(u / .4)); g.fillStyle = `rgba(190,227,255,${nerv})`; g.beginPath(); g.ellipse(935, 650, 6, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(1045, 670, 6, 9, 0, 0, 7); g.fill(); }
  if (warm > 0) { const r2 = rng(83); for (let i = 0; i < 100; i++) { const x = r2() * W, y = (r2() * 1200 + (t - S.st[3]) * (60 + r2() * 80)) % 1150 - 60; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillStyle = `rgba(${['255,180,195', '255,242,216', '255,210,122'][i % 3]},${warm * .9})`; g.fillRect(-6, -3, 12, 6); g.restore(); } }
  finish(.5); stampP(t, ramp(u, 0, .8), '2025.05.25 · 婚礼', '两个社恐，站在了正中央');
};
// ---------- Dunhuang 2025.09.23 (new moon) ----------
function dunesDraw(t, clap, crowd = true) {
  put(L('dh_sky', x => { x.fillStyle = grad(x, 0, H, [[0, '#05061a'], [.6, '#15163e'], [1, '#3a2848']]); x.fillRect(0, 0, W, H); const r = rng(17);
    for (let i = 0; i < 60; i++) { const p = r(), cx = p * W, cy = 760 - p * 640 + (r() - .5) * 80, rr = 90 + r() * 140; const gg = x.createRadialGradient(cx, cy, 0, cx, cy, rr); gg.addColorStop(0, `rgba(${r() < .5 ? '200,180,255' : '255,210,220'},.09)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gg; x.fillRect(cx - rr, cy - rr, rr * 2, rr * 2); }
    for (let i = 0; i < 5000; i++) { const p = r(), spread = (r() - .5) * (r() < .7 ? 120 : 360); x.fillStyle = `rgba(255,${235 + r() * 20 | 0},${215 + r() * 40 | 0},${r() * .8})`; const s = r() < .9 ? 1.4 : 2.4; x.fillRect(p * W, 760 - p * 640 + spread, s, s); }
    x.strokeStyle = 'rgba(10,8,30,.35)'; x.lineWidth = 22; x.filter = 'blur(10px)'; x.beginPath(); x.moveTo(200, 700); x.bezierCurveTo(700, 520, 1100, 420, 1800, 150); x.stroke(); x.filter = 'none';
    for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(255,245,225,${.3 + r() * .7})`; x.beginPath(); x.arc(r() * W, r() * 760, r() * 1.6 + .3, 0, 7); x.fill(); } }, 'raw'));
  twinkle(t, 50, 700, 17, 1 + clap);
  if (clap > 0) { const r = rng(19); for (let i = 0; i < 40; i++) glw(r() * W, r() * 650, 14, '255,240,215', clap * .7); }
  g.save(); g.strokeStyle = 'rgba(255,230,180,.5)'; g.lineWidth = 2; g.beginPath(); g.arc(260, 560, 30, -1.2, 1.2); g.stroke(); g.fillStyle = 'rgba(80,80,120,.25)'; g.beginPath(); g.arc(260, 560, 30, 0, 7); g.fill(); g.restore();
  const dune = (x, y, amp, f, ph, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, H); const pts = []; for (let X = 0; X <= W; X += 20) { const Y = y + Math.sin(X * f + ph) * amp + Math.sin(X * f * 2.7 + ph) * amp * .25; pts.push([X, Y]); x.lineTo(X, Y); } x.lineTo(W, H); x.fill(); x.strokeStyle = 'rgba(255,210,170,.25)'; x.lineWidth = 2; x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); x.stroke(); };
  put(L('dh_d1', x => dune(x, 720, 60, .0035, .4, '#6a4c66'), { tex: .45, blur: 1, sh: [18, -4, 'rgba(10,5,20,.5)'] }));
  put(L('dh_d2', x => dune(x, 800, 80, .0028, 2.2, '#4e3650'), { tex: .45, sh: [22, -6, 'rgba(10,5,20,.55)'] }));
  if (crowd) { const lc = L('dh_lights', x => { const r = rng(23); for (let i = 0; i < 2600; i++) { const X = r() * W; const Y = 820 + Math.sin(X * .0028 + 2.2) * 80 + Math.sin(X * .0028 * 2.7 + 2.2) * 20 + 10 + Math.pow(r(), .6) * 160; if (Y > 990 - (X / W) * 90) continue; x.fillStyle = `rgba(255,${215 + r() * 40 | 0},${170 + r() * 70 | 0},${.5 + r() * .5})`; x.beginPath(); x.arc(X, Y, .9 + r() * 1.8, 0, 7); x.fill(); } }, 'raw');
    const lb = L('dh_lightsb', x => { x.filter = 'blur(6px)'; x.drawImage(lc, 0, 0); }, 'raw');
    g.save(); g.globalCompositeOperation = 'lighter'; g.drawImage(lc, Math.sin(t * 2.4) * 3, 0); g.globalAlpha = .6 + .3 * Math.sin(t * 2.4) ** 2; g.drawImage(lb, 0, 0); g.restore(); }
  put(L('dh_d3', x => { x.fillStyle = '#271b30'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 990); x.quadraticCurveTo(700, 930, 1180, 900); x.quadraticCurveTo(1500, 880, 1920, 820); x.lineTo(W, H); x.fill(); }, { tex: .4, sh: [26, -8, 'rgba(0,0,0,.6)'] }));
}
sDunhuang = function (t) {
  const S = SEC.pre2, u = t - S.st[4]; const clap = t > S.st[5] ? beatPulse(t) : 0;
  dunesDraw(t, clap, true);
  doll(1420, 900, 190, 'he', { armR: [20, 2], armL: t > S.st[5] ? [-12, -40 + Math.sin(t * 9) * 6] : undefined, light: '255,220,190' }); doll(1490, 892, 175, 'she', { armL: [-18, 6], armR: [16, -40 + Math.sin(t * 2.4) * 8], smile: true, light: '255,220,190' });
  T('那晚是新月，所以银河格外亮', 290, 615, 22, 'rgba(255,230,190,.6)', ramp(u, .5, 1.5));
  finish(.55); stampP(t, ramp(u, 0, .8), '2025.09.23 · 敦煌 · 鸣沙山', '万人合唱，热泪盈眶');
};

// ---------- the real gift, redrawn from her photos (figurine = his own little doll) ----------
function domeGift(t, cx, base, fig, roseOn) {
  const top = 150, dw = 250;
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 28; g.shadowOffsetY = 10; g.fillStyle = '#3e4649'; g.beginPath(); g.ellipse(cx, base + 34, 290, 46, 0, 0, 7); g.fill(); g.restore();
  g.fillStyle = '#4c5659'; g.fillRect(cx - 290, base - 4, 580, 38); g.beginPath(); g.ellipse(cx, base + 34, 290, 46, 0, 0, Math.PI); g.fill();
  g.fillStyle = '#5c676a'; g.beginPath(); g.ellipse(cx, base - 4, 290, 46, 0, 0, 7); g.fill(); g.fillStyle = '#3a4245'; g.beginPath(); g.ellipse(cx, base - 8, 262, 38, 0, 0, 7); g.fill();
  put(L('dome_in', x => {
    const r = rng(77);
    // moss mound
    x.fillStyle = '#76a444'; x.beginPath(); x.moveTo(cx - 230, base - 6); x.bezierCurveTo(cx - 240, base - 200, cx - 150, 400, cx - 20, 380); x.bezierCurveTo(cx + 120, 370, cx + 220, base - 260, cx + 230, base - 6); x.closePath(); x.fill();
    for (let i = 0; i < 2600; i++) { const a = r(), px = cx - 225 + a * 450, maxH = base - 10 - (Math.sin(a * Math.PI) * (base - 400)); const py = maxH + r() * (base - maxH); x.fillStyle = ['#98c858', '#62902f', '#b4d86c', '#4e7a28'][i % 4]; x.beginPath(); x.arc(px, py, 1.5 + r() * 2.2, 0, 7); x.fill(); }
    // dark leaves + fern
    x.fillStyle = '#2f6b4a'; [[cx + 110, 470, .4], [cx + 150, 520, -.3], [cx + 80, 430, .9], [cx - 160, 560, -.6]].forEach(([a, b, rot]) => { x.save(); x.translate(a, b); x.rotate(rot); x.beginPath(); x.ellipse(0, 0, 40, 22, 0, 0, 7); x.fill(); x.restore(); });
    x.strokeStyle = '#2f7a4a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx + 170, 700); x.quadraticCurveTo(cx + 200, 560, cx + 245, 420); x.stroke(); x.fillStyle = '#2f7a4a'; for (let k = 0; k < 11; k++) { const p = k / 11, px = lerp(cx + 170, cx + 245, p) + Math.sin(p * 3) * 10, py = lerp(700, 420, p); [-1, 1].forEach(sd => { x.save(); x.translate(px, py); x.rotate(sd * .9 - .3); x.beginPath(); x.ellipse(sd * 14, 0, 16, 5, 0, 0, 7); x.fill(); x.restore(); }); }
    // hydrangea florets
    const floret = (px, py, s) => { x.save(); x.translate(px, py); x.rotate(r() * 6); for (let k = 0; k < 4; k++) { x.rotate(Math.PI / 2); x.fillStyle = '#eef3d8'; x.beginPath(); x.ellipse(s * .8, 0, s * .8, s * .55, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(160,180,120,.5)'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 0); x.lineTo(s * 1.4, 0); x.stroke(); } x.fillStyle = '#d6e2a8'; x.beginPath(); x.arc(0, 0, s * .2, 0, 7); x.fill(); x.restore(); };
    [[cx - 150, 720, 60], [cx - 60, 780, 55], [cx + 60, 760, 50], [cx + 150, 650, 45], [cx - 120, 560, 45], [cx + 20, 600, 40], [cx - 30, 470, 35]].forEach(([a, b, rr]) => { for (let k = 0; k < 9; k++) floret(a + (r() - .5) * rr * 1.6, b + (r() - .5) * rr, 12 + r() * 6); });
    // red dried sprigs + berry cluster
    x.strokeStyle = '#8a2a2a'; x.lineWidth = 2.5; [[cx - 190, 560, cx - 240, 440], [cx - 175, 570, cx - 200, 430]].forEach(([a, b, c2, d]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d); x.stroke(); x.fillStyle = '#c8323a'; x.beginPath(); x.arc(c2, d, 13, 0, 7); x.fill(); x.fillStyle = 'rgba(255,255,255,.2)'; x.beginPath(); x.arc(c2 - 4, d - 4, 4, 0, 7); x.fill(); });
    for (let k = 0; k < 40; k++) { x.fillStyle = k % 3 ? '#b8323e' : '#d8505a'; x.beginPath(); x.arc(cx - 110 + (r() - .5) * 90, 790 + (r() - .5) * 60, 6 + r() * 3, 0, 7); x.fill(); }
    // white pompom + yellow rose
    x.fillStyle = '#f5efe0'; x.beginPath(); x.arc(cx - 40, 640, 34, 0, 7); x.fill(); x.fillStyle = 'rgba(200,190,160,.5)'; for (let k = 0; k < 60; k++) { const an = r() * 6.28, d = r() * 30; x.beginPath(); x.arc(cx - 40 + Math.cos(an) * d, 640 + Math.sin(an) * d, 2, 0, 7); x.fill(); }
    x.fillStyle = '#f7c02a'; x.beginPath(); x.arc(cx - 170, 640, 52, 0, 7); x.fill(); x.strokeStyle = '#d99a10'; x.lineWidth = 2.5; x.beginPath(); for (let k = 0; k < 30; k++) { const an = k * .55, rr = 4 + k * 1.5; x.lineTo(cx - 170 + Math.cos(an) * rr, 640 + Math.sin(an) * rr); } x.stroke();
  }, { tex: .4, sh: [10, 4, 'rgba(0,0,0,.35)'] }));
  // two gerbera-style sunflowers
  sunflowerP2(cx - 20, 360, 54, t, 0); sunflowerP2(cx + 70, 560, 44, t, 1);
  if (fig > 0) { g.save(); g.globalAlpha = fig; glw(cx + 120, base - 90, 120, '255,230,170', .18); doll(cx + 120, base - 18, 160, 'he', { armR: [4, -16], armL: [-2, -14], light: '255,230,170' }); g.restore();
    roseP(cx + 126, base - 90, 1.2, fig); if (roseOn > 0) glw(cx + 126, base - 96, 90, '255,120,140', .55 * roseOn); }
  // the bell-shaped glass
  g.save(); g.beginPath(); g.moveTo(cx - dw, base - 12); g.lineTo(cx - dw, top + dw * .9); g.bezierCurveTo(cx - dw, top - 10, cx + dw, top - 10, cx + dw, top + dw * .9); g.lineTo(cx + dw, base - 12);
  g.fillStyle = 'rgba(210,225,255,.06)'; g.fill(); g.strokeStyle = 'rgba(230,240,255,.5)'; g.lineWidth = 3; g.stroke();
  g.lineCap = 'round'; g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 14; g.beginPath(); g.moveTo(cx - dw + 30, base - 140); g.lineTo(cx - dw + 30, top + dw * .85); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 26; g.beginPath(); g.moveTo(cx + dw - 40, base - 200); g.lineTo(cx + dw - 40, top + 260); g.stroke();
  g.restore();
}
function sunflowerP2(cx, cy, R, t, seed) {
  const r = rng(seed + 3);
  for (let p = 0; p < 30; p++) { const an = p / 30 * 6.283 + r() * .1; g.save(); g.translate(cx, cy); g.rotate(an); g.fillStyle = ['#f9c623', '#f4b81c', '#fbd43c'][p % 3]; g.beginPath(); g.ellipse(R * 1.5, 0, R * .75, R * .15, 0, 0, 7); g.fill(); g.restore(); }
  for (let p = 0; p < 22; p++) { const an = p / 22 * 6.283 + .15; g.save(); g.translate(cx, cy); g.rotate(an); g.fillStyle = '#ffd94a'; g.beginPath(); g.ellipse(R * 1.15, 0, R * .5, R * .13, 0, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = '#e8b020'; g.beginPath(); g.arc(cx, cy, R * .78, 0, 7); g.fill(); const dg = g.createRadialGradient(cx, cy, 2, cx, cy, R * .55); dg.addColorStop(0, '#3a2410'); dg.addColorStop(1, '#6a4418'); g.fillStyle = dg; g.beginPath(); g.arc(cx, cy, R * .55, 0, 7); g.fill();
}
