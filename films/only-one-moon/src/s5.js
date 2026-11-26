// ===================== v5: one-take ending (酿成诗行 → 生日快乐) =====================
const WORLD = document.createElement('canvas'); WORLD.width = W; WORLD.height = 1800;
function endTimes() { const f = SEC.fin.st, o = SEC.out.st; return { E0: f[5], E1: f[6], E2: f[7], O0: o[0], O1: o[1], B: o[2] }; }
function planetL() { return L('end_planet', x => { const cx = 960, cy = 1560, R = 680;
  const gg = x.createRadialGradient(cx - 160, cy - 640, 40, cx, cy, R); gg.addColorStop(0, '#8a8ae0'); gg.addColorStop(.5, '#4a4aa8'); gg.addColorStop(1, '#2a2870'); x.fillStyle = gg; x.beginPath(); x.arc(cx, cy, R, 0, 7); x.fill();
  const r = rng(9); for (let i = 0; i < 24; i++) { const an = -Math.PI / 2 + (r() - .5) * 1.6, d = R * (.55 + r() * .4), px = cx + Math.cos(an) * d, py = cy + Math.sin(an) * d, rr = 14 + r() * 40; x.fillStyle = 'rgba(30,30,90,.35)'; x.beginPath(); x.ellipse(px, py, rr, rr * .45, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(190,190,255,.25)'; x.lineWidth = 2; x.beginPath(); x.ellipse(px, py - 2, rr, rr * .45, 0, Math.PI, 0); x.stroke(); }
  x.strokeStyle = 'rgba(210,210,255,.55)'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }, { tex: .45, sh: [30, -8, 'rgba(0,0,0,.5)'] }); }
const ARC = (i, n) => { const a = Math.PI * (1.12 + .76 * i / (n - 1)); return [960 + Math.cos(a) * 820, 980 + Math.sin(a) * 760]; };
function drawWorld(t) {
  const E = endTimes();
  put(skyL('end_sky', [[0, '#05061c'], [.6, '#141a4a'], [1, '#2a2460']], 650, 1000, 61)); twinkle(t, 60, 900, 61, 1);
  // memory arc of real moon phases
  const arcA = 1 - ramp(t, E.E1, E.E1 + 1.6);
  if (arcA > 0) { const n = MEM2.length; const shown = (t - E.E0 + .2) / .34;
    g.save(); g.globalAlpha = arcA; g.setLineDash([4, 9]); g.strokeStyle = 'rgba(255,225,170,.45)'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < Math.min(n, shown); i++) { const [x, y] = ARC(i, n); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
    MEM2.forEach(([d, s, ill, wn], i) => { const a = clamp(shown - i) ; if (a <= 0) return; const [x0, y0] = ARC(i, n); const conv = ease(ramp(t, E.E1, E.E1 + 1.6)); const x = lerp(x0, 960, conv), y = lerp(y0, 330, conv);
      moonP(x, y, 22 * (1 + .3 * (1 - a)), ill, !!wn, .22, a); T(d, x, y + 44, 17, 'rgba(255,230,190,.85)', a, { w: 500 }); T(s.split(' · ')[0], x, y + 66, 17, 'rgba(255,230,190,.7)', a); });
    g.restore(); }
  // the full moon of today
  const fm = ease(ramp(t, E.E1 + .3, E.E1 + 2.6)); if (fm > 0) { moonP(960, lerp(620, 330, fm), lerp(60, 120, fm), 1, false, .42 + beatPulse(t) * .06, fm);
    T('2026.11.24 · 今天的月亮 100%', 960, 500, 26, 'rgba(255,232,190,.9)', ramp(t, E.E1 + 1.6, E.E1 + 2.4), { glow: 'rgba(255,200,120,.6)' }); }
  glw(960, 700, 700, '160,150,255', .1);
  planetDraw();
  const lean = -.17 * ease(ramp(t, E.E2, E.E2 + 1.4));
  doll(905, 882, 230, 'he', { armR: [22, 2], light: '255,235,200', smile: t > E.E1 }); doll(1000, 884, 212, 'she', { lean, armL: [-22, 4], smile: true, light: '255,235,200' });
  if (t > E.E2 + 1) { const h = ramp(t, E.E2 + 1, E.E2 + 2); g.fillStyle = `rgba(255,140,180,${h * .9})`; heartPath(952, 600 - h * 16, 18); g.fill(); }
  const r = rng(7); for (let i = 0; i < 30; i++) { const x = r() * W, y = ((r() * 900 - t * (8 + r() * 10)) % 900 + 900) % 900; glw(x, y, 6, '255,225,170', .5 * Math.sin(t * 2 + i) ** 2); }
}
function bokeh(t, a) { if (a <= 0) return; const r = rng(301); g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 28; i++) { const x = (r() * W + Math.sin(t * .2 + i) * 30), y = r() * H + Math.cos(t * .15 + i) * 20, rr = 20 + r() * 70, c2 = ['255,190,120', '255,150,170', '200,170,255', '255,220,160'][i % 4]; const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(${c2},${.09 * a})`); gg.addColorStop(.7, `rgba(${c2},${.07 * a})`); gg.addColorStop(1, `rgba(${c2},0)`); g.fillStyle = gg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); }
  g.restore(); }
function sEnding(t) {
  const E = endTimes();
  // render the little world offscreen
  const prev = g; g = WORLD.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H); drawWorld(t); g = prev;
  const p = ease(ramp(t, E.O0 - .4, E.O0 + 3.4));
  const SX = 960, SY = 455, R = 300;
  // backdrop: deep night with warm bokeh
  g.fillStyle = grad(g, 0, H, [[0, '#06061a'], [1, '#1a1434']]); g.fillRect(0, 0, W, H); bokeh(t, p);
  // the world, shrinking into the sphere
  const cr = lerp(1250, R, p), ccx = lerp(960, SX, p), ccy = lerp(540, SY, p), s = lerp(1, .66, p);
  g.save(); g.beginPath(); g.arc(ccx, ccy, cr, 0, 7); g.clip(); g.translate(ccx, ccy); g.scale(s, s); g.translate(-960, -lerp(540, 600, p)); g.fillStyle = '#05061c'; g.fillRect(-3000, -3000, 8000, 3000); g.fillStyle = '#2a2460'; g.fillRect(-3000, 1080, 8000, 3000); const sk = CACHE['end_sky'] && CACHE['end_sky'].cv; if (sk) g.drawImage(sk, 0, 0, W, H, -3000, 0, 7920, H); g.drawImage(WORLD, 0, 0); g.restore();
  // base (behind lower part of the sphere)
  if (p > .7) { g.save(); g.globalAlpha = ramp(p, .7, 1); const by = SY + R - 18;
    g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.shadowOffsetY = 20; g.fillStyle = '#5a3420'; g.beginPath(); g.moveTo(SX - 230, by + 20); g.lineTo(SX + 230, by + 20); g.lineTo(SX + 270, by + 118); g.lineTo(SX - 270, by + 118); g.closePath(); g.fill(); g.restore();
    const wg = g.createLinearGradient(0, by, 0, by + 120); wg.addColorStop(0, '#b07a4a'); wg.addColorStop(1, '#6a4024'); g.fillStyle = wg; g.beginPath(); g.moveTo(SX - 230, by + 20); g.lineTo(SX + 230, by + 20); g.lineTo(SX + 270, by + 118); g.lineTo(SX - 270, by + 118); g.closePath(); g.fill();
    g.fillStyle = '#c8935e'; g.beginPath(); g.ellipse(SX, by + 20, 230, 22, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,220,170,.25)'; g.fillRect(SX - 268, by + 112, 536, 6);
    g.save(); g.font = `600 34px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(50,25,10,.85)'; g.fillText('宇  ·  月', SX, by + 73); g.fillStyle = '#ffd98e'; g.shadowColor = 'rgba(255,200,110,.8)'; g.shadowBlur = 10; g.fillText('宇  ·  月', SX, by + 71); g.restore();
    glw(SX, by + 10, 260, '255,220,160', .25); g.restore(); }
  if (p > 0) { g.save(); g.globalAlpha = p;
    // glass: inner edge shading, fresnel rim, highlights, gold dust inside
    const ig = g.createRadialGradient(SX, SY, R * .55, SX, SY, R); ig.addColorStop(0, 'rgba(160,180,255,0)'); ig.addColorStop(.85, 'rgba(160,180,255,.10)'); ig.addColorStop(1, 'rgba(210,225,255,.38)'); g.fillStyle = ig; g.beginPath(); g.arc(SX, SY, R, 0, 7); g.fill();
    g.strokeStyle = 'rgba(235,242,255,.65)'; g.lineWidth = 2.2; g.beginPath(); g.arc(SX, SY, R, 0, 7); g.stroke(); glw(SX, SY, R * 1.25, '170,190,255', .08);
    g.save(); g.beginPath(); g.arc(SX, SY, R, 0, 7); g.clip();
    const hg = g.createRadialGradient(SX - R * .42, SY - R * .5, 4, SX - R * .42, SY - R * .5, R * .55); hg.addColorStop(0, 'rgba(255,255,255,.32)'); hg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hg; g.beginPath(); g.ellipse(SX - R * .42, SY - R * .5, R * .5, R * .32, -.6, 0, 7); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.arc(SX, SY, R - 20, Math.PI * 1.12, Math.PI * 1.38); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 16; g.beginPath(); g.arc(SX, SY, R - 26, Math.PI * .12, Math.PI * .36); g.stroke();
    const sweep = ramp(t, E.O1 + .5, E.O1 + 2.5); if (sweep > 0 && sweep < 1) { g.save(); g.translate(SX, SY); g.rotate(-.6); const xs = lerp(-R * 1.4, R * 1.4, sweep); const sg = g.createLinearGradient(xs - 60, 0, xs + 60, 0); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(.5, 'rgba(255,255,255,.22)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sg; g.fillRect(xs - 60, -R * 1.5, 120, R * 3); g.restore(); }
    const r = rng(21); for (let i = 0; i < 70; i++) { const an = r() * 6.28, d = Math.sqrt(r()) * R * .95; const x = SX + Math.cos(an + t * .05) * d, y = SY + ((Math.sin(an) * d + t * (6 + r() * 8)) % (R * 1.9) + R * 1.9) % (R * 1.9) - R * .95; glw(x, y, 4 + r() * 4, '255,225,160', .55 * Math.sin(t * 3 + i) ** 2); }
    g.restore(); g.restore(); }
  // "生日快乐", written in gold
  const ba = ramp(t, E.B - .2, E.B + .4);
  if (ba > 0) { const chars = [...'生日快乐']; chars.forEach((ch, j) => { const a = clamp((t - E.B + .2 - j * .32) / .55) * clamp((358.3 - t) / 1); const x = 960 + (j - 1.5) * 108;
      g.save(); g.globalAlpha = a; g.font = `600 92px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(255,190,90,1)'; g.shadowBlur = 34; const tg = g.createLinearGradient(0, 930, 0, 1010); tg.addColorStop(0, '#fff2c8'); tg.addColorStop(1, '#f0b860'); g.fillStyle = tg; g.fillText(ch, x, 965 + (1 - eo(a)) * 14); g.restore(); });
    T('2023.01.26 的月亮 21%   →   2026.11.24 的月亮 100%', 960, 1040, 24, 'rgba(255,226,170,.8)', ramp(t, E.B + 1.2, E.B + 2) * clamp((358.3 - t) / 1)); }
  finish(.45);
}
(function () { const E = endTimes(); const i = SCENES.findIndex(sc => sc[2] === sFinal); SCENES[i] = [SCENES[i][0], E.E0, sFinal];
  const j = SCENES.findIndex(sc => sc[2] === sOutro); SCENES[j] = [E.E0, 400, sEnding];
  // the outro's lyric lines stay; nothing else to change
})();

function planetDraw() { const cx = 960, cy = 1560, R = 680;
  g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 30; g.shadowOffsetY = -8; const gg = g.createRadialGradient(cx - 160, cy - 640, 40, cx, cy, R); gg.addColorStop(0, '#8a8ae0'); gg.addColorStop(.5, '#4a4aa8'); gg.addColorStop(1, '#2a2870'); g.fillStyle = gg; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.restore();
  const r = rng(9); for (let i = 0; i < 30; i++) { const an = -Math.PI / 2 + (r() - .5) * 2.2, d = R * (.5 + r() * .45), px = cx + Math.cos(an) * d, py = cy + Math.sin(an) * d, rr = 14 + r() * 40; g.fillStyle = 'rgba(30,30,90,.35)'; g.beginPath(); g.ellipse(px, py, rr, rr * .45, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(190,190,255,.25)'; g.lineWidth = 2; g.beginPath(); g.ellipse(px, py - 2, rr, rr * .45, 0, Math.PI, 0); g.stroke(); }
  g.strokeStyle = 'rgba(210,210,255,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
