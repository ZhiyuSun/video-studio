// ===================== v3 scenes A: hotpot, Bund, pre-chorus 1, choruses =====================
const V1L = SEC.v1 = { st: LYR.slice(0, 8).map(l => l[0]) };

// ---------- hotpot at Raffles, 2023.02.12 ----------
sHotpot = function (t, lt) {
  const S = V1L;
  put(L('hp_wall', x => { x.fillStyle = grad(x, 0, H, [[0, '#2a1a36'], [1, '#4a2a3e']]); x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,200,150,.05)'; x.lineWidth = 2; for (let X = 0; X < W; X += 60) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, H); x.stroke(); } }, 'raw'));
  // window to the night city (no moon yet that evening)
  put(L('hp_win', x => { x.save(); x.beginPath(); x.roundRect(430, 70, 1060, 500, 16); x.clip(); x.fillStyle = grad(x, 70, 570, [[0, '#0a1132'], [1, '#2a2456']]); x.fillRect(430, 70, 1060, 500);
    const r = rng(9); for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,240,215,${.3 + r() * .6})`; x.beginPath(); x.arc(430 + r() * 1060, 70 + r() * 260, r() * 1.4 + .3, 0, 7); x.fill(); }
    let X = 430; while (X < 1490) { const w = 40 + r() * 70, h = 60 + r() * 120; bld(x, X, 570, w, h, '#2e2a5e', { topCol: '#3c3672', win: .25, seed: X | 0, cw: 11, ch: 14 }); X += w + 4; }
    X = 410; while (X < 1500) { const w = 60 + r() * 90, h = 120 + r() * 200; bld(x, X, 570, w, h, '#1c1a40', { topCol: '#26234e', win: .4, seed: (X * 3) | 0, cw: 13, ch: 16 }); X += w + 8; } x.restore();
    x.lineWidth = 14; x.strokeStyle = '#5a3a46'; x.beginPath(); x.roundRect(430, 70, 1060, 500, 16); x.stroke(); x.lineWidth = 10; x.beginPath(); x.moveTo(960, 70); x.lineTo(960, 570); x.stroke(); }, { tex: .45, sh: [24, 8, 'rgba(0,0,0,.5)'] }));
  // lanterns
  [[300, 150], [960, 40], [1620, 150]].forEach(([x, y], i) => { const sw = Math.sin(t * .9 + i) * 3; g.strokeStyle = 'rgba(40,20,30,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + sw, y); g.stroke();
    g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 5; g.fillStyle = '#d8513e'; g.beginPath(); g.ellipse(x + sw, y + 40, 46, 40, 0, 0, 7); g.fill(); g.restore();
    g.fillStyle = '#f2c14e'; g.fillRect(x + sw - 20, y, 40, 6); g.fillRect(x + sw - 20, y + 78, 40, 6); glw(x + sw, y + 40, 240, '255,170,100', .35); });
  // seated dolls (legs hidden by table)
  const nerv = ramp(t, S.st[2], S.st[2] + .4) * clamp((S.st[3] - .2 - t) / .4); const sh = nerv * Math.sin(t * 40) * 2.5;
  const sun = ramp(t, S.st[3], S.st[3] + 1);
  if (sun > 0) { glw(1290, 560, 330, '255,214,120', .35 * sun); g.save(); g.translate(1290, 560); g.rotate(t * .25); g.strokeStyle = `rgba(255,214,130,${.5 * sun})`; g.lineWidth = 5; g.lineCap = 'round'; for (let k = 0; k < 12; k++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(190, 0); g.lineTo(220 + 10 * Math.sin(t * 4 + k), 0); g.stroke(); } g.restore(); }
  doll(640 + sh, 860, 330, 'he', { armR: [16, 14], armL: [-10, 22], light: '255,190,140' });
  doll(1290, 860, 305, 'she', { armL: [-18, 10], armR: sun > 0 ? [20, -30] : [10, 18], smile: sun > 0, light: '255,190,140' });
  // table + hotpot
  put(L('hp_table', x => { x.fillStyle = grad(x, 740, H, [[0, '#7a4a3a'], [1, '#4a2a24']]); x.beginPath(); x.moveTo(140, 760); x.lineTo(1780, 760); x.lineTo(1920, H); x.lineTo(0, H); x.fill(); x.fillStyle = 'rgba(255,220,180,.12)'; x.fillRect(140, 756, 1640, 8);
    // plates
    [[560, 830, '#f2dfc2', '#d9826a'], [760, 880, '#f2dfc2', '#9ccf8f'], [1160, 880, '#f2dfc2', '#f0b6a6'], [1360, 830, '#f2dfc2', '#f2c14e']].forEach(([px, py, p, f]) => { x.fillStyle = '#fff6ea'; x.beginPath(); x.ellipse(px, py, 80, 22, 0, 0, 7); x.fill(); x.fillStyle = f; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(px - 36 + k * 18, py - 4, 14, 8, .3, 0, 7); x.fill(); } });
    const px = 960, py = 800; x.fillStyle = '#5a5a66'; x.beginPath(); x.ellipse(px, py + 40, 190, 50, 0, 0, 7); x.fill(); x.fillStyle = '#8a8a96'; x.beginPath(); x.ellipse(px, py, 190, 50, 0, 0, 7); x.fill();
    x.fillStyle = '#c83a2e'; x.beginPath(); x.ellipse(px, py - 2, 172, 42, 0, Math.PI / 2, Math.PI * 1.5); x.fill(); x.fillStyle = '#f2e4cc'; x.beginPath(); x.ellipse(px, py - 2, 172, 42, 0, -Math.PI / 2, Math.PI / 2); x.fill();
    x.strokeStyle = '#6a6a76'; x.lineWidth = 6; x.beginPath(); x.moveTo(px, py - 44); x.lineTo(px, py + 40); x.stroke();
    const r = rng(2); for (let k = 0; k < 14; k++) { x.fillStyle = k % 2 ? 'rgba(255,200,120,.8)' : 'rgba(120,40,30,.6)'; x.beginPath(); x.arc(px - 150 + r() * 130, py - 10 + r() * 20, 4 + r() * 4, 0, 7); x.fill(); } }, { tex: .45, sh: [26, -6, 'rgba(0,0,0,.45)'] }));
  // steam -> stars
  const intens = .55 + .45 * ramp(t, S.st[1], S.st[1] + 1.2);
  for (const p of STEAM) { const age = ((lt + p.born) * p.sp) % 9; const y = 760 - age * 75; const x = 960 + p.x * 120 + Math.sin(age * 1.3 + p.w) * 30 * (age / 3);
    const toStar = clamp((570 - y) / 160); const a = clamp(age / 1) * clamp((9 - age) / 1.5) * intens;
    if (toStar < 1) { g.fillStyle = `rgba(255,240,225,${a * .09 * (1 - toStar)})`; g.beginPath(); g.arc(x, y, 18 + age * 8, 0, 7); g.fill(); }
    if (toStar > 0) glowDot(x, y, 10 * p.s, a * toStar * .9); }
  if (nerv > 0) { bubble(620, 470, 140, 66, '……', nerv, 40); g.fillStyle = `rgba(191,227,255,${nerv})`; g.beginPath(); g.ellipse(690, 600, 7, 11, 0, 0, 7); g.fill(); }
  if (sun > 0) { [[1180, 430, 0], [1350, 380, .5], [1440, 470, 1], [1250, 330, 1.6], [1400, 290, 2.2]].forEach(([x, y, d]) => T('?', x + Math.sin(t * 2 + d) * 6, y - (t - S.st[3] - d) * 10, 58, '#ffe3a8', clamp((t - S.st[3] - d) / .4) * clamp((S.st[4] - .2 - t) / .5), { w: 600, glow: 'rgba(255,200,120,.8)' })); }
  finish(.5);
  stampP(t, ramp(t, S.st[0], S.st[0] + 1) * clamp((S.st[4] - .5 - t) / .5), '2023.02.12 · 人民广场 来福士', '第一次见面，一顿火锅');
};

// ---------- the Bund, 2023.02.12 ----------
const BB = 780;
function bundLayers() {
  return {
    sky: L('bd_sky', x => { x.fillStyle = grad(x, 0, H, [[0, '#0a0d2a'], [.45, '#1b1e4e'], [.72, '#4a2f6e'], [.86, '#7a3f78']]); x.fillRect(0, 0, W, H); const r = rng(9); for (let i = 0; i < 420; i++) { const y = r() * 700; x.fillStyle = `rgba(255,240,215,${(.25 + r() * .75) * (1 - y / 800)})`; x.beginPath(); x.arc(r() * W, y, r() * 1.5 + .3, 0, 7); x.fill(); } }, 'raw'),
    far: L('bd_far', x => { const r = rng(3); let X = -60; while (X < W + 60) { const w = 50 + r() * 110, h = 60 + r() * 120; bld(x, X, BB, w, h, '#3c3a78', { topCol: '#4a4886', win: .06, seed: X | 0, cw: 12, ch: 15 }); X += w + r() * 10; } }, { tex: .3, blur: 2.5, sh: [14, 4, 'rgba(10,6,30,.45)'] }),
    midD: L('bd_midD', x => bundMid(x, true), { tex: .5, sh: [22, 8, 'rgba(5,3,20,.5)'] }),
    midL: L('bd_midL', x => bundMid(x, false), { tex: .5, sh: [22, 8, 'rgba(5,3,20,.5)'] }),
    water: L('bd_water', x => { x.fillStyle = grad(x, BB, 920, [[0, '#1c1c48'], [1, '#12123a']]); x.fillRect(-60, BB, W + 120, 140); const r = rng(31); for (let i = 0; i < 900; i++) { const X = r() * W, Y = BB + 6 + Math.pow(r(), 1.5) * 110, w = 6 + r() * 34; x.fillStyle = `rgba(255,210,150,${.05 + r() * .16})`; x.fillRect(X, Y, w, 2); }
      [[818, '#22225a'], [848, '#1a1a4c']].forEach(([y0, col], j) => { x.fillStyle = col; x.beginPath(); x.moveTo(-60, y0); for (let X = -60; X <= W + 60; X += 24) x.lineTo(X, y0 + Math.sin(X * .011 + j) * 6 + Math.sin(X * .037) * 3); x.lineTo(W + 60, 920); x.lineTo(-60, 920); x.fill(); x.strokeStyle = 'rgba(200,190,255,.18)'; x.lineWidth = 2; x.beginPath(); for (let X = -60; X <= W + 60; X += 24) x.lineTo(X, y0 + Math.sin(X * .011 + j) * 6 + Math.sin(X * .037) * 3); x.stroke(); }); }, { tex: .4, sh: [16, -4, 'rgba(5,3,20,.5)'] }),
    prom: L('bd_prom', x => { x.fillStyle = '#0f0d26'; x.beginPath(); x.moveTo(-80, 905); x.lineTo(W + 80, 895); x.lineTo(W + 80, H); x.lineTo(-80, H); x.fill(); x.fillStyle = '#16133a'; x.fillRect(-80, 868, W + 160, 8); for (let X = -70; X < W + 80; X += 46) x.fillRect(X, 868, 5, 40); x.fillRect(-80, 895, W + 160, 4); [230, 1680].forEach(X => { x.fillRect(X - 4, 640, 8, 265); x.beginPath(); x.arc(X, 636, 16, 0, 7); x.fill(); }); }, { tex: .35, sh: [20, -6, 'rgba(5,3,20,.5)'] }),
  };
}
function bundMid(x, dim) {
  const C = '#26244f', T = '#38346c', o = (k) => ({ topCol: T, win: k, dim });
  bld(x, 1300, BB, 120, 640, C, { ...o(.18), seed: 11, shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); gg.bezierCurveTo(X + 4, b - h * .45, X + 18, b - h * .8, X + 34, top); gg.lineTo(X + 88, top + 14); gg.bezierCurveTo(X + 100, b - h * .7, X + 112, b - h * .35, X + w, b); } });
  bld(x, 1180, BB, 86, 500, '#2a2856', { ...o(.62), seed: 12, cw: 13, ch: 16, shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); gg.lineTo(X + 8, top); gg.lineTo(X + w - 8, top); gg.lineTo(X + w, b); gg.closePath(); gg.moveTo(X + 26, top + 18); gg.lineTo(X + 26, top + 52); gg.lineTo(X + w - 26, top + 52); gg.lineTo(X + w - 26, top + 18); gg.closePath(); } });
  bld(x, 1040, BB, 80, 490, '#2a2856', { ...o(.6), seed: 13, cw: 12, ch: 15, shape: (gg, X, top, w, h, b) => { gg.moveTo(X, b); const st = [[0, 0], [4, .3], [8, .5], [13, .65], [18, .76], [24, .84], [30, .9], [37, .95]]; st.forEach(([d, k]) => { gg.lineTo(X + d, b - h * k); gg.lineTo(X + d + 4, b - h * k); }); gg.lineTo(X + 40, top - 40); st.slice().reverse().forEach(([d, k]) => { gg.lineTo(X + w - d - 4, b - h * k); gg.lineTo(X + w - d, b - h * k); }); gg.lineTo(X + w, b); gg.closePath(); } });
  const r = rng(14); BUND_MISC.forEach(([X, w, h], i) => bld(x, X, BB, w, h, i % 2 ? '#24224a' : '#2a2753', { ...o(.5 + r() * .25), seed: 20 + i }));
  const cx = 720; x.lineCap = 'round'; x.strokeStyle = '#2b2858'; x.lineWidth = 12; [-62, 62].forEach(dx => { x.beginPath(); x.moveTo(cx + dx, BB); x.lineTo(cx + dx * .18, BB - 260); x.stroke(); });
  x.lineWidth = 16; x.beginPath(); x.moveTo(cx, BB); x.lineTo(cx, BB - 500); x.stroke(); x.lineWidth = 5; x.beginPath(); x.moveTo(cx, BB - 500); x.lineTo(cx, BB - 580); x.stroke(); x.lineWidth = 7; [-14, 14].forEach(d => { x.beginPath(); x.moveTo(cx + d, BB - 230); x.lineTo(cx + d, BB - 420); x.stroke(); });
  [[BB - 180, 55], [BB - 405, 34], [BB - 480, 14]].forEach(([yy, rr]) => { const gr2 = x.createRadialGradient(cx - rr * .3, yy - rr * .3, 2, cx, yy, rr); if (dim) { gr2.addColorStop(0, '#6a5a8a'); gr2.addColorStop(1, '#3a2e5a'); } else { gr2.addColorStop(0, '#e6a6f0'); gr2.addColorStop(.6, '#9a5ab8'); gr2.addColorStop(1, '#4a2a6a'); } x.fillStyle = gr2; x.beginPath(); x.arc(cx, yy, rr, 0, 7); x.fill(); });
}
const BUND_MISC = [[-40, 120, 330], [120, 85, 280], [230, 60, 230], [330, 95, 250], [450, 55, 270], [595, 105, 210], [800, 65, 150], [880, 75, 230], [960, 80, 180], [1140, 40, 160], [1420, 60, 260], [1490, 40, 140], [1570, 95, 290], [1680, 70, 220], [1760, 60, 180], [1810, 150, 300]];
const BUND_ORDER = [[1300, 1420], [660, 780], [1180, 1266], [1040, 1120], [880, 1040], [1420, 1530], [450, 660], [1570, 1680], [230, 450], [1680, 1810], [-60, 230], [780, 880], [1120, 1180], [1530, 1570], [1810, 1980]];
function bundDraw(t, panX, litFrom, ppl) { // litFrom: time lighting starts (null = all lit)
  const B = bundLayers();
  put(B.sky, panX * .1 - 10, 0);
  put(B.far, panX * .25, 0);
  haze(560, BB, '140,90,170', .28);
  put(B.midD, panX * .5, 0);
  let nLit = litFrom == null ? 99 : (t - litFrom) / (BEAT * .75);
  g.save(); g.beginPath(); BUND_ORDER.forEach(([a, b], i) => { if (i < nLit) g.rect(a + panX * .5, 0, b - a, BB + 2); }); g.clip(); put(B.midL, panX * .5, 0); g.restore();
  const pearl = clamp(nLit - 1); if (pearl > 0) { glw(720 + panX * .5, BB - 180, 150, '230,140,240', .35 * pearl); glw(720 + panX * .5, BB - 405, 100, '230,140,240', .3 * pearl); }
  put(B.water, panX * .7, 0);
  put(B.prom, panX, 0);
  [230, 1680].forEach(X => { glw(X + panX, 636, 120, '255,210,150', .55); glw(X + panX, 636, 26, '255,240,210', .9); });
  if (ppl) ppl(panX);
}
sBund = function (t, lt) {
  const S = V1L; const panX = -lerp(0, 50, ease(clamp(lt / 18)));
  bundDraw(t, panX, S.st[5], px => {
    const stop = S.st[7]; const walking = t < stop; const x = lerp(240, 600, ease(clamp((Math.min(t, stop) - 36.5) / (stop - 36.5)))) + px;
    couple(x, 925, 240, { run: walking ? t * 7 : undefined, light: '255,200,230', smile: !walking });
    const fs = ramp(t, S.st[7] + .8, S.st[7] + 2.4); if (fs > 0) { g.save(); g.strokeStyle = `rgba(255,220,150,${.5 * fs})`; g.setLineDash([5, 7]); g.beginPath(); g.moveTo(x + 40, 650); g.lineTo(x + 40, 650 - 280 * fs); g.stroke(); g.restore(); glowDot(x + 40, 370, 90 * fs, fs); }
  });
  const magic = ramp(t, S.st[6], S.st[6] + 2); if (magic > 0) { const r = rng(77); for (let k = 0; k < 60; k++) { const x = r() * W, y = r() * 600, ph = r() * 6.28; const a = magic * Math.max(0, Math.sin(t * 2.2 + ph)) ** 4; if (a > .02) glw(x, y, 16, '255,215,240', a * .8); } }
  finish(.6);
  stampP(t, ramp(t, S.st[4], S.st[4] + 1) * clamp((S.st[7] - t) / .6), '2023.02.12 · 上海 · 外滩', '从人民广场，一直走到江边');
};

// ---------- pre-chorus 1: weekends ----------
function parkLayers(t) {
  put(skyL('pk_sky', [[0, '#080c26'], [.6, '#1a1f4c'], [1, '#3a2c5e']], 380, 700, 13));
  put(L('pk_far', x => { x.fillStyle = '#2e2c60'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 760); for (let X = 0; X <= W; X += 40) x.lineTo(X, 760 - Math.sin(X * .004) * 50 - Math.sin(X * .013) * 14); x.lineTo(W, H); x.fill();
    const r = rng(6); for (let i = 0; i < 26; i++) { const X = r() * W, y = 740 - Math.sin(X * .004) * 50, s = 30 + r() * 40; x.beginPath(); x.arc(X, y - s, s, 0, 7); x.fill(); x.fillRect(X - 4, y - s, 8, s + 10); } }, { tex: .4, blur: 1.5, sh: [16, 4, 'rgba(5,3,20,.45)'] }));
  haze(640, 820, '120,90,170', .25);
  put(L('pk_near', x => { x.fillStyle = '#1c1a40'; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 920); x.quadraticCurveTo(600, 860, 1100, 900); x.quadraticCurveTo(1500, 930, W, 880); x.lineTo(W, H); x.fill();
    x.fillStyle = '#15132e'; x.beginPath(); x.arc(1760, 640, 150, 0, 7); x.arc(1640, 700, 110, 0, 7); x.fill(); x.fillRect(1735, 700, 30, 220); x.beginPath(); x.arc(150, 700, 120, 0, 7); x.fill(); x.fillRect(135, 760, 26, 160); }, { tex: .4, sh: [22, -6, 'rgba(0,0,0,.5)'] }));
}
sPre1 = function (t) {
  const S = SEC.pre1; parkLayers(t);
  const ca = at(S, 0, t, .4) * clamp((S.st[1] + .6 - t) / .6);
  if (ca > 0) for (let i = 0; i < 8; i++) { const st = S.st[0] + .2 + i * .45, k = clamp((t - st) / .5); const x = 330 + i * 180, y = 430 + Math.sin(t * 1.5 + i) * 8;
    g.save(); g.globalAlpha = ca * clamp((t - st + .3) / .3); g.translate(x, y); g.rotate(Math.sin(i * 2.1) * .06); g.scale(Math.abs(Math.cos(k * Math.PI)) * .98 + .02, 1);
    g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 16; g.shadowOffsetY = 6; const back = k > .5; g.fillStyle = back ? '#ffe2aa' : '#fff8ec'; g.beginPath(); g.roundRect(-65, -85, 130, 170, 12); g.fill(); g.shadowBlur = 0; g.shadowOffsetY = 0;
    g.fillStyle = '#d8513e'; g.beginPath(); g.roundRect(-65, -85, 130, 34, [12, 12, 0, 0]); g.fill();
    if (!back) { g.fillStyle = '#3a2a40'; g.font = `600 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i % 2 ? '周日' : '周六', 0, 20); } else { heartPath(0, 18, 30); g.fillStyle = '#e87a8a'; g.fill(); }
    g.restore(); }
  const ia = at(S, 1, t, .3) * clamp((S.st[2] + 1 - t) / 1); const shrink = ease(ramp(t, S.st[2], S.st[2] + 1.2));
  if (ia > 0 || shrink > 0) [[560, 'museum'], [960, 'music'], [1360, 'flower']].forEach(([x0, ty], k) => {
    const d = clamp((t - S.st[1] - k * 1.0) / 1.1); if (d <= 0) return; const x = lerp(x0, 760 + k * 200, shrink), y = lerp(430, 180 + (k % 2) * 50, shrink), sc = lerp(1, .25, shrink);
    g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = Math.max(ia, shrink > 0 ? 1 : 0); g.strokeStyle = 'rgba(255,220,150,.8)'; g.lineWidth = 2.5; g.setLineDash([7, 7]);
    const pts = ty === 'museum' ? [[-110, -40], [0, -110], [110, -40], [-110, -40], [-110, 80], [110, 80], [110, -40]] : ty === 'music' ? [[-60, 70], [-60, -80], [70, -110], [70, 40], [-60, -30], [70, -60]] : [[0, -100], [60, -30], [95, 40], [0, 10], [-95, 40], [-60, -30], [0, -100], [0, 10], [0, 110]];
    const n = Math.floor(d * (pts.length - 1)) + 1; g.beginPath(); pts.slice(0, n + 1).forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); g.setLineDash([]); pts.slice(0, n + 1).forEach(p => glowDot(p[0], p[1], 22, .95));
    if (ty === 'museum') for (let c2 = -70; c2 <= 70; c2 += 47) { g.beginPath(); g.moveTo(c2, -30); g.lineTo(c2, 70); g.stroke(); } g.restore();
    T(['博物馆', '音乐会', '公园花开'][k], x0, 610, 30, 'rgba(255,226,170,.85)', ia * (1 - shrink)); });
  const fa = ramp(t, S.st[2], S.st[2] + .8);
  if (fa > 0) { g.save(); g.globalAlpha = fa; const steps = Math.floor(clamp((t - S.st[3]) / BEAT, 0, 6)); const sx = 1150 - steps * 24;
    const confused = t < S.st[3];
    doll(820, 910, 300, 'he', { armL: confused ? [-4, -40] : undefined, lean: confused ? Math.sin(t * 5) * .03 : 0, light: '255,220,170' }); doll(sx, 910, 280, 'she', { smile: t > S.st[3] + 1, armL: t > S.st[3] ? [-16, 6] : undefined, run: steps < 6 && t > S.st[3] ? t * 8 : undefined, light: '255,220,170' });
    const qa = clamp((t - S.st[2] - .4) / .4) * clamp((S.st[3] + .3 - t) / .5);
    [[760, 560, 0], [840, 520, .5], [900, 570, 1]].forEach(([x, y, d]) => T('?', x + Math.sin(t * 3 + d) * 6, y, 56, '#ffe3a8', qa * clamp((t - S.st[2] - d) / .3), { w: 600, glow: 'rgba(255,200,120,.8)' }));
    const hf = ramp(t, S.st[3], S.st[3] + 4); if (hf > 0) { const hx = 820, hy = 910 - 40 * 3, hs = 30; g.save(); heartPath(hx, hy, hs); g.clip(); g.fillStyle = '#f08a9a'; g.fillRect(hx - 60, hy + hs * .4 - hf * hs * 1.5, 120, 200); g.restore(); g.strokeStyle = '#ffd1a0'; g.lineWidth = 3; heartPath(hx, hy, hs); g.stroke(); glw(hx, hy - 6, 110 * hf, '255,150,170', .5 * hf); }
    g.restore(); }
  finish(.5);
};

// ---------- choruses ----------
Object.assign(V1, { stamp: '2023 · 春天', stamp2: '那年的月亮，才刚刚升起' });
Object.assign(V2, { stamp: '2023 · 夏天', stamp2: '月亮长大了一点' });
Object.assign(V3, { ill: .012, waning: false, cities: 16, stamp: '2025.09.23 · 敦煌', stamp2: '那晚是新月，银河格外亮', mapNote: '一起走过的十六座城' });
V1.mapNote = '2023 · 故事从上海开始'; V2.mapNote = '2023.05 · 第一次一起出发：嵊泗';
const CITIES2 = [['上海', 121.47, 31.23, 40, 0], ['嵊泗', 122.45, 30.72, 36, 24], ['苏州', 120.62, 31.30, -36, -20], ['嘉兴', 120.75, 30.75, -44, 4], ['沈阳', 123.43, 41.80, 40, 0], ['哈尔滨', 126.63, 45.75, -40, 0], ['绍兴', 120.58, 30.00, -36, 26],
['青岛', 120.38, 36.07, 40, 0], ['兰州', 103.83, 36.06, 0, 32], ['张掖', 100.45, 38.93, 0, -30], ['敦煌', 94.66, 40.14, 0, -30], ['西安', 108.94, 34.34, 0, 32], ['开封', 114.31, 34.80, 0, -30], ['徐州', 117.28, 34.20, -40, 0], ['重庆', 106.55, 29.56, -40, 0], ['南京', 118.80, 32.06, -40, -14]];
const proj2 = (lon, lat) => [300 + (lon - 92) * 39, 870 - (lat - 27.5) * 37];
function mapCard(t, u, n, note) {
  card(960, 500, 1560, 820, -.008, '#f4e6cc');
  g.save(); g.strokeStyle = 'rgba(150,110,80,.25)'; g.lineWidth = 1; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(200, 140 + k * 100); g.lineTo(1720, 140 + k * 100); g.stroke(); } for (let k = 0; k < 15; k++) { g.beginPath(); g.moveTo(220 + k * 110, 110); g.lineTo(220 + k * 110, 890); g.stroke(); } g.restore();
  T(note, 960, 140, 34, '#6b4a3a', ramp(u, .2, 1), { w: 600 });
  const reveal = clamp(u / 3.6) * n;
  for (let i = 1; i < n; i++) { const k = clamp(reveal - i + 1); if (k <= 0) continue; const [x1, y1] = proj2(CITIES2[i - 1][1], CITIES2[i - 1][2]), [x2, y2] = proj2(CITIES2[i][1], CITIES2[i][2]);
    g.strokeStyle = 'rgba(190,80,70,.75)'; g.lineWidth = 2.5; g.setLineDash([7, 7]); g.beginPath(); g.moveTo(x1, y1); const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 40 - Math.hypot(x2 - x1, y2 - y1) * .15; const p = k; const qx = (1 - p) * (1 - p) * x1 + 2 * (1 - p) * p * mx + p * p * x2, qy = (1 - p) * (1 - p) * y1 + 2 * (1 - p) * p * my + p * p * y2;
    g.quadraticCurveTo(lerp(x1, mx, p), lerp(y1, my, p), qx, qy); g.stroke(); g.setLineDash([]); }
  for (let i = 0; i < n; i++) { const k = clamp(reveal - i + .6); if (k <= 0) continue; const [x, y] = proj2(CITIES2[i][1], CITIES2[i][2]);
    g.fillStyle = '#d8513e'; g.beginPath(); g.arc(x, y, 8 * eo(k), 0, 7); g.fill(); g.strokeStyle = '#fff6e6'; g.lineWidth = 2.5; g.stroke();
    T(CITIES2[i][0], x + CITIES2[i][3], y + CITIES2[i][4], 24, '#5a3a2e', k, { align: CITIES2[i][3] < 0 ? 'right' : CITIES2[i][3] > 0 ? 'left' : 'center', w: 600 });
    if (n > 2) T(String(i + 1), x, y - 18, 14, '#a0604a', k * .8); }
  if (n === 1) { const k = clamp(u / 2); const [x, y] = proj2(121.47, 31.23); g.setLineDash([7, 9]); g.strokeStyle = `rgba(190,80,70,${.5 * k})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x - 200, y - 300, x - 520 * k, y - 220 * k); g.stroke(); g.setLineDash([]); T('下一站 · 未完待续', x - 560, y - 250, 26, '#8a5a4a', k); }
}
function hillsL(key, c1, c2) { return [L(key + '1', x => { x.fillStyle = c1; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 850); x.quadraticCurveTo(500, 760, 1000, 830); x.quadraticCurveTo(1500, 900, W, 790); x.lineTo(W, H); x.fill(); }, { tex: .45, blur: 1, sh: [16, -4, 'rgba(0,0,0,.4)'] }),
  L(key + '2', x => { x.fillStyle = c2; x.beginPath(); x.moveTo(0, H); x.lineTo(0, 980); x.quadraticCurveTo(600, 880, 1100, 920); x.quadraticCurveTo(1500, 950, W, 1010); x.lineTo(W, H); x.fill(); }, { tex: .4, sh: [22, -8, 'rgba(0,0,0,.55)'] })]; }
function chorusSky(V) { return skyL('ch_sky' + V.pal[1], [[0, V.pal[0]], [.6, V.pal[1]], [1, V.pal[2]]], 450, 800, 21); }
function chorusShot(k, t, u, V) {
  const P = V.pal; const hl = hillsL('chh' + P[1], shade(P[2], -.2), shade(P[2], -.55));
  if (k === 0) { // galaxy + the one moon
    put(skyL('ch_gal' + P[1], [[0, '#03040f'], [.6, P[0]], [1, P[1]]], 300, 1080, 5)); const zoom = lerp(1.5, 1, ease(clamp(u / 4.5)));
    g.save(); g.translate(960, 520); g.scale(zoom, zoom); const r = rng(42);
    for (let i = 0; i < 1100; i++) { const arm = i % 3, d = Math.pow(r(), .7) * 760, ang = arm * 2.094 + d * .006 + t * .05 + (r() - .5) * .5; const x = Math.cos(ang) * d, y = Math.sin(ang) * d * .45; g.fillStyle = `rgba(${V.tint},${(.25 + r() * .6) * (1 - d / 900)})`; g.fillRect(x, y, 2 + r() * 1.8, 2 + r() * 1.8); }
    g.restore(); glw(960, 520, 420, V.tint, .18); moonP(960, 520, 74, V.ill, V.waning, .35 + beatPulse(t) * .1);
  } else if (k === 1) { put(chorusSky(V)); put(hl[0]); put(hl[1]); const m = ease(clamp(u / 2.6));
    glw(960, 720, 400, '255,180,190', .15 * ramp(u, 2.2, 3)); doll(960, 1120, 560, 'he', { light: '255,230,190', armL: [-14, 20], armR: [14, 20], smile: u > 2.4 });
    const hy = 1120 - 40 * 5.6; moonP(lerp(1350, 960, m), lerp(200, hy, m), lerp(80, 40, m), V.ill, V.waning, .3);
    const ha = ramp(u, 2.2, 3); if (ha > 0) { g.strokeStyle = `rgba(255,190,190,${ha})`; g.lineWidth = 5; heartPath(960, hy + 6, 80); g.stroke(); }
  } else if (k === 2) { put(chorusSky(V)); glw(960, 1060, 700, V.tint, .12);
    g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = -6; globe(t, 960, 1080, 540, V.tint); g.restore();
    couple(915, 548, 200, { light: '255,230,190', smile: true });
    T('勇敢的人先享受世界', 960, 230, 36, 'rgba(255,230,180,.8)', ramp(u, .6, 1.6), { glow: 'rgba(255,200,120,.6)' }); T('—— 我们常挂在嘴边的话', 960, 285, 22, 'rgba(255,230,180,.55)', ramp(u, 1.2, 2.2));
  } else if (k === 3) { put(chorusSky(V)); moonP(1580, 220, 66, V.ill, V.waning, .3); put(hl[0]); glw(980, 700, 360, '255,200,150', .2 + .1 * beatPulse(t)); put(hl[1]);
    couple(860, 960, 400, { light: '255,230,190', smile: u > 2.2, heSmile: u > 2.2 });
    const pop = clamp((u - 1.6) / .5); const ba = clamp(u / .3) * (1 - pop); bubble(830, 470, 150, 70, '……', ba, 40);
    if (pop > 0 && pop < 1) { const r = rng(8); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = pop * 130; glowDot(830 + Math.cos(a) * d, 470 + Math.sin(a) * d, 14, 1 - pop); } }
  } else if (k === 4) { const pan = ease(clamp((u - .6) / 3.4)) * W;
    g.save(); g.translate(-pan, 0); bundDraw(t, 0, null, null); g.restore();
    g.save(); g.translate(W - pan, 0); dunesDraw(t, 0, false); couple(980, 860, 170, { light: '255,220,190' }); g.restore();
    { const sx = W - pan; const sg = g.createLinearGradient(sx - 220, 0, sx + 220, 0); sg.addColorStop(0, 'rgba(14,10,34,0)'); sg.addColorStop(.5, 'rgba(14,10,34,.95)'); sg.addColorStop(1, 'rgba(14,10,34,0)'); g.fillStyle = sg; g.fillRect(sx - 220, 0, 440, H); }
  } else if (k === 5) { put(chorusSky(V)); mapCard(t, u, V.cities, V.mapNote);
  } else if (k === 6) { put(chorusSky(V)); put(hl[0]); glw(960, 700, 460, '255,170,180', .22); put(hl[1]);
    doll(960, 1020, 470, 'she', { smile: true, light: '255,230,200', armL: [-16, -20], armR: [16, -20] }); const a = t * 1.1; moonP(960 + Math.cos(a) * 190, 560 + Math.sin(a) * 50, 40, V.ill, V.waning, .3);
  } else { roadP(t, u, V); }
  finish(k === 5 ? .15 : .5);
}
function roadP(t, u, V, walkers = true, ill, wan) {
  const P = V.pal; put(chorusSky(V)); moonP(960, 450, 130, ill ?? V.ill, wan ?? V.waning, .35);
  put(L('rd_far' + P[1], x => { x.fillStyle = shade(P[2], -.25); x.beginPath(); x.moveTo(0, 640); for (let X = 0; X <= W; X += 40) x.lineTo(X, 620 - Math.sin(X * .005) * 40 - Math.sin(X * .017) * 12); x.lineTo(W, 640); x.lineTo(W, H); x.lineTo(0, H); x.fill(); }, { tex: .4, blur: 1.2, sh: [14, -4, 'rgba(0,0,0,.4)'] }));
  put(L('rd_road' + P[1], x => { x.fillStyle = shade(P[2], -.55); x.fillRect(0, 640, W, H); x.fillStyle = shade(P[2], -.35); x.beginPath(); x.moveTo(520, H); x.lineTo(945, 640); x.lineTo(975, 640); x.lineTo(1400, H); x.fill();
    x.strokeStyle = 'rgba(255,215,150,.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(520, H); x.lineTo(945, 640); x.moveTo(1400, H); x.lineTo(975, 640); x.stroke(); }, { tex: .4, sh: [20, -6, 'rgba(0,0,0,.5)'] }));
  for (let k = 0; k < 14; k++) { const z = ((k / 14 + u * .12) % 1); const p = Math.pow(z, 2.2); const y = 640 + p * 440, w = 2 + p * 10, h = 4 + p * 40; g.fillStyle = `rgba(255,220,150,${.3 + p * .5})`; g.fillRect(960 - w / 2, y, w, h); }
  if (walkers) { const z = clamp(u / 6); const h = lerp(300, 120, z), y = lerp(1000, 800, z); couple(940 - h * .17, y, h, { run: t * 6, light: '255,230,190' }); }
}
