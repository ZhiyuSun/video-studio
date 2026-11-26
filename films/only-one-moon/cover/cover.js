// ===== Bilibili cover (16:9 master; the centre 1440×1080 is the 4:3 cover; key content stays inside x240–1680, y135–945) =====
window.render = function () {
  g = mainG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; NOW = 335; CAMV = null; CUR_K = -1;
  put(skyL('cv_sky', [[0, '#05061c'], [.55, '#151a4c'], [1, '#3a2a64']], 700, 1000, 77));
  // milky haze + bokeh
  g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(5);
  for (let i = 0; i < 40; i++) { const p = r(), x = p * W, y = 760 - p * 620 + (r() - .5) * 160, rr = 90 + r() * 140; const gg = g.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, `rgba(${r() < .5 ? '190,170,255' : '255,200,220'},.06)`); gg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gg; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
  g.restore(); twinkle(3.3, 40, 900, 9, 1);
  // the full moon
  moonP(1250, 410, 190, 1, false, .42);
  // a few memory moons along an arc (real phases)
  [[.21, 0, 760, 190], [.84, 0, 880, 140], [.71, 0, 1630, 160], [.38, 1, 1700, 270]].forEach(([ill, wn, x, y]) => moonP(x, y, 20, ill, !!wn, .2));
  // the little planet + the couple
  const cx = 1250, cy = 1560, R = 700; g.save(); const pg = g.createRadialGradient(cx - 180, cy - 660, 40, cx, cy, R); pg.addColorStop(0, '#8a8ae0'); pg.addColorStop(.5, '#4a4aa8'); pg.addColorStop(1, '#2a2870'); g.fillStyle = pg; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.restore();
  const r2 = rng(9); for (let i = 0; i < 20; i++) { const an = -Math.PI / 2 + (r2() - .5) * 1.4, d = R * (.6 + r2() * .35); g.fillStyle = 'rgba(30,30,90,.35)'; g.beginPath(); g.ellipse(cx + Math.cos(an) * d, cy + Math.sin(an) * d, 18 + r2() * 30, 8 + r2() * 12, 0, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(210,210,255,.55)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, Math.PI * 1.2, Math.PI * 1.8); g.stroke();
  glw(1250, 760, 300, '255,220,170', .16);
  doll(1195, 866, 250, 'he', { armR: [24, 2], light: '255,235,200', tilt: .1, smile: true });
  doll(1300, 869, 232, 'she', { lean: -.16, armL: [-24, 4], smile: true, light: '255,235,200' });
  g.fillStyle = 'rgba(255,140,180,.95)'; heartPath(1248, 560, 20); g.fill(); glw(1248, 550, 60, '255,140,180', .5);
  // title
  const title = (s, x, y, size) => { g.save(); g.font = `700 ${size}px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(20,12,40,.9)'; g.lineWidth = 16; g.strokeText(s, x, y);
    g.shadowColor = 'rgba(255,190,100,.9)'; g.shadowBlur = 30; g.fillStyle = '#ffe9b8'; g.fillText(s, x, y); g.shadowBlur = 0;
    const gr2 = g.createLinearGradient(0, y - size / 2, 0, y + size / 2); gr2.addColorStop(0, '#fff6dc'); gr2.addColorStop(1, '#f2bf62'); g.fillStyle = gr2; g.fillText(s, x, y); g.restore(); };
  title('宇宙只有', 270, 420, 150); title('一个月亮', 270, 590, 150);
  // tag pill
  g.save(); g.fillStyle = 'rgba(255,200,120,.92)'; g.beginPath(); g.roundRect(274, 245, 330, 62, 31); g.fill(); g.font = `700 34px ${FONT}`; g.fillStyle = '#2a1840'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('原创 · 生日 MV', 439, 277); g.restore();
  g.save(); g.font = `500 40px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,235,205,.95)'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 12; g.fillText('写给她的生日礼物', 276, 735); g.fillStyle = 'rgba(255,225,180,.75)'; g.font = `400 30px ${FONT}`; g.fillText('从相识那晚的月牙，到今天的满月', 276, 800); g.restore();
  finish(.4); g.save(); g.globalAlpha = .16; g.globalCompositeOperation = 'overlay'; g.drawImage(PTEX, 0, 0); g.restore();
};
