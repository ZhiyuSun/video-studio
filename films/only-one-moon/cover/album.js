// ===== NetEase album cover, 3000×3000, designed in a 1080×1080 coordinate space =====
window.render = function () {
  const K = 3000 / 1080; g = mainG; g.setTransform(K, 0, 0, K, 0, 0); g.globalAlpha = 1; NOW = 335; CAMV = null; CUR_K = -1;
  const S = 1080;
  // night sky
  const sk = g.createLinearGradient(0, 0, 0, S); sk.addColorStop(0, '#04051a'); sk.addColorStop(.55, '#141a4a'); sk.addColorStop(1, '#3a2a64'); g.fillStyle = sk; g.fillRect(0, 0, S, S);
  const r = rng(17);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const p = r(), x = p * S, y = 820 - p * 760 + (r() - .5) * 120, rr = 60 + r() * 110; const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(${r() < .5 ? '190,170,255' : '255,200,225'},.07)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  for (let i = 0; i < 2600; i++) { const p = r(), spread = (r() - .5) * (r() < .7 ? 80 : 240); g.fillStyle = `rgba(255,${235 + r() * 20 | 0},${215 + r() * 40 | 0},${r() * .7})`; const s2 = r() < .92 ? .9 : 1.6; g.fillRect(p * S, 820 - p * 760 + spread, s2, s2); }
  g.restore();
  for (let i = 0; i < 260; i++) { const y = r() * 900; g.fillStyle = `rgba(255,240,215,${(.3 + r() * .7) * (1 - y / 1100)})`; g.beginPath(); g.arc(r() * S, y, r() * 1.2 + .3, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) glw(r() * S, r() * 800, 8 + r() * 8, '255,240,215', .5 + r() * .4);
  // the full moon with a ring of the real moons of their days
  const MX = 540, MY = 455, MR = 145;
  g.save(); g.setLineDash([3, 7]); g.strokeStyle = 'rgba(255,225,170,.4)'; g.lineWidth = 1.5; g.beginPath(); g.arc(MX, MY, 238, 0, 7); g.stroke(); g.restore();
  const ring = [[.21, 0], [.13, 0], [.84, 0], [.83, 1], [.71, 0], [.38, 1], [.04, 1], [.012, 0]];
  ring.forEach(([ill, wn], i) => { const a = -Math.PI / 2 + (i + .5) / ring.length * Math.PI * 2; moonP(MX + Math.cos(a) * 238, MY + Math.sin(a) * 238, 17, ill, !!wn, .22); });
  moonP(MX, MY, MR, 1, false, .45);
  // little planet + the two of them
  const cx = 540, cy = 1460, R = 600;
  const pg = g.createRadialGradient(cx - 160, cy - 560, 30, cx, cy, R); pg.addColorStop(0, '#8a8ae0'); pg.addColorStop(.5, '#4a4aa8'); pg.addColorStop(1, '#2a2870'); g.fillStyle = pg; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  const r2 = rng(9); for (let i = 0; i < 22; i++) { const an = -Math.PI / 2 + (r2() - .5) * 1.5, d = R * (.62 + r2() * .33); g.fillStyle = 'rgba(30,30,90,.35)'; g.beginPath(); g.ellipse(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 14 + r2() * 26, 6 + r2() * 10, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(210,210,255,.6)'; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
  glw(540, 780, 230, '255,220,170', .15);
  doll(505, 862, 190, 'he', { armR: [24, 2], light: '255,235,200', tilt: .1, smile: true });
  doll(585, 864, 176, 'she', { lean: -.16, armL: [-24, 4], smile: true, light: '255,235,200' });
  g.fillStyle = 'rgba(255,140,180,.95)'; heartPath(544, 652, 13); g.fill(); glw(544, 634, 40, '255,140,180', .45);
  // title
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `600 70px ${FONT}`; g.lineJoin = 'round';
  const title = '宇宙只有一个月亮'; const sp = 10; const chars = [...title]; const wsum = chars.reduce((a, c) => a + g.measureText(c).width + sp, -sp); let x = 540 - wsum / 2;
  chars.forEach(ch => { const w = g.measureText(ch).width; const key = ch === '宇' || ch === '月';
    g.shadowColor = key ? 'rgba(255,190,100,1)' : 'rgba(255,200,130,.6)'; g.shadowBlur = key ? 26 : 14; const tg = g.createLinearGradient(0, 70, 0, 130); tg.addColorStop(0, '#fff6dc'); tg.addColorStop(1, key ? '#f2b450' : '#f0cf90'); g.fillStyle = tg; g.fillText(ch, x + w / 2, 100); x += w + sp; });
  g.shadowBlur = 0; g.font = `400 20px ${FONT}`; g.fillStyle = 'rgba(255,230,190,.7)'; g.fillText('O N L Y   O N E   M O O N   I N   T H E   U N I V E R S E', 540, 160);
  g.restore();
  // vignette + paper grain
  const v = g.createRadialGradient(540, 540, 380, 540, 540, 780); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,12,.45)'); g.fillStyle = v; g.fillRect(0, 0, S, S);
  g.setTransform(1, 0, 0, 1, 0, 0); g.save(); g.globalAlpha = .16; g.globalCompositeOperation = 'overlay'; g.drawImage(PTEX, 0, 0); g.restore();
};
