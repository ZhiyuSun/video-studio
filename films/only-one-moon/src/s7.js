// ===================== v7: acting + lighting on the dolls =====================
let CUR_K = -1;
drawScene = (function (orig) { return function (k, t) { const prev = CUR_K; CUR_K = k; orig(k, t); CUR_K = prev; }; })(drawScene);
// per-scene direction: extra options for a doll, by who / time / x
const DIRECT = {
  1: (who, t) => { const S = V1L; const nerv = t > S.st[2] && t < S.st[3] - .1; const cur = t > S.st[3];
    if (who === 'he' && nerv) return { armL: [-9 + Math.sin(t * 14) * 2, -33], tilt: -.1 };
    if (who === 'she' && cur) return { tilt: Math.sin((t - S.st[3]) * 2.2) * .14 }; return {}; },
  3: (who, t) => { const S = V1L; const o = { rimL: '255,80,200', rimR: '90,170,255' };
    if (who === 'he' && t > S.st[6]) o.tilt = .14 * ease(ramp(t, S.st[6], S.st[6] + .6)) * (t > S.st[7] + .8 ? .6 : 1);
    if (who === 'she' && t > S.st[7] + .3) o.tilt = -.14 * ease(ramp(t, S.st[7] + .3, S.st[7] + 1)); return o; },
  8: (who, t) => { const S = SEC.v2; const o = { longShadow: [-330, 80], rimR: '255,210,150' }; if (t > S.st[7]) o.tilt = (who === 'he' ? .13 : -.13) * ease(ramp(t, S.st[7], S.st[7] + .8)); return o; },
  11: (who, t) => { const u = t - SEC.v3.st[1]; if (who === 'she' && u > 1.9) return { hop: Math.max(0, Math.sin((u - 1.9) * 9)) * 14 * (1 - clamp((u - 1.9) / 1.6)), rimL: '255,140,200' }; return { rimL: '255,140,200' }; },
  12: (who, t) => { const S = SEC.v3; const o = { dapple: true }; if (who === 'she' && t > S.st[4] && t < S.st[4] + 1.3) { o.armL = [-3, -28]; o.armR = [3, -28]; o.tilt = -.05; } if (who === 'he' && t > S.st[4]) o.tilt = .12; return o; },
  14: (who, t) => { const S = SEC.pre2; const w = ease(ramp(t, S.st[3], S.st[3] + 1)); return { tilt: (who === 'he' ? .13 : -.13) * w, rimL: '255,220,180', rimR: '255,220,180' }; },
  15: (who, t) => { const S = SEC.pre2; if (who === 'she' && t > S.st[5]) return { hop: beatPulse(t) * 10, rimR: '255,220,190' }; return { rimR: '255,220,190' }; },
  20: (who, t) => ({ rimR: '255,200,140', rimL: '255,200,140' }),
  22: (who, t) => { const E = endTimes(); if (who === 'he') return { tilt: .1 * ease(ramp(t, E.E2 + .3, E.E2 + 1.5)) }; return {}; },
};
doll = function (x, y, h, who, o0 = {}) {
  const dir = DIRECT[CUR_K]; const o = dir ? Object.assign({}, o0, dir(who, NOW, x)) : o0;
  const s = h / 100, col = o.col || (who === 'he' ? HE : SHE), tt = NOW, seed = x * .013 + (who === 'he' ? 0 : 1.7);
  g.save(); g.translate(x, y);
  if (o.longShadow && !o.noShadow) { const [dx, dy] = o.longShadow; const gr2 = g.createLinearGradient(0, 0, dx, dy); gr2.addColorStop(0, 'rgba(70,25,50,.45)'); gr2.addColorStop(1, 'rgba(70,25,50,0)'); g.fillStyle = gr2; g.beginPath(); g.moveTo(-14 * s, 0); g.lineTo(14 * s, 0); g.lineTo(dx + 8 * s, dy); g.lineTo(dx - 8 * s, dy); g.closePath(); g.fill(); }
  if (!o.noShadow) { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(0, 2, 22 * s * (o.hop ? 1 - o.hop / 60 : 1), 5 * s, 0, 0, 7); g.fill(); }
  if (o.hop) g.translate(0, -o.hop * s);
  if (o.lean) g.rotate(o.lean);
  g.rotate(Math.sin(tt * 1.1 + seed) * .012);
  g.scale(s, s);
  if (o.bob) g.translate(0, -Math.abs(Math.sin(o.bob)) * 4);
  const breath = 1 + Math.sin(tt * 2.4 + seed) * .012;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 3;
  const leg = shade(col, -.22); g.fillStyle = leg; const lg = o.run !== undefined ? Math.sin(o.run) * 7 : 0;
  if (!o.kneel && !o.sit) { g.beginPath(); g.roundRect(-8 - lg, -24, 7, 24, 3.5); g.fill(); g.beginPath(); g.roundRect(1 + lg, -24, 7, 24, 3.5); g.fill(); }
  if (o.kneel) { g.beginPath(); g.roundRect(-10, -8, 22, 8, 4); g.fill(); g.translate(0, 16); }
  if (o.sit) { g.beginPath(); g.roundRect(-10, -26, 26, 8, 4); g.fill(); g.translate(0, 4); }
  g.shadowBlur = 0; g.shadowOffsetY = 0;
  g.translate(0, -22); g.scale(1, breath); g.translate(0, 22);
  g.strokeStyle = shade(col, -.05); g.lineWidth = 6.5; g.lineCap = 'round';
  const shy = who === 'he' ? -58 : -52;
  const arm = (side, tgt) => { if (tgt === null) return; const sx = side * (who === 'he' ? 13 : 9); const [dx, dy] = tgt || [side * 6, 30 + Math.sin(tt * 2.4 + seed + side) * 1.2]; g.beginPath(); g.moveTo(sx, shy); g.quadraticCurveTo(sx + dx * .4 + side * 4, shy + dy * .5, sx + dx, shy + dy); g.stroke(); g.fillStyle = shade(col, .1); g.beginPath(); g.arc(sx + dx, shy + dy, 4.2, 0, 7); g.fill(); };
  arm(-1, o.armL); arm(1, o.armR);
  const body = g.createLinearGradient(-20, -70, 20, 0); body.addColorStop(0, shade(col, .25)); body.addColorStop(1, shade(col, -.12)); g.fillStyle = body;
  const bodyPath = () => { g.beginPath(); if (who === 'he') { g.moveTo(-15, -22); g.lineTo(-12, -58); g.quadraticCurveTo(0, -66, 12, -58); g.lineTo(15, -22); g.quadraticCurveTo(0, -18, -15, -22); } else { g.moveTo(-20, -20); g.quadraticCurveTo(-9, -34, -8, -50); g.quadraticCurveTo(0, -56, 8, -50); g.quadraticCurveTo(9, -34, 20, -20); g.quadraticCurveTo(0, -15, -20, -20); } };
  bodyPath(); g.fill();
  // coloured rim light along the body edges
  const rimSide = (c, side) => { if (!c) return; g.save(); bodyPath(); g.clip(); g.strokeStyle = `rgba(${c},.6)`; g.lineWidth = 4; g.shadowColor = `rgba(${c},1)`; g.shadowBlur = 8; g.beginPath(); if (who === 'he') { g.moveTo(side * 15, -22); g.lineTo(side * 12, -58); } else { g.moveTo(side * 20, -20); g.quadraticCurveTo(side * 9, -34, side * 8, -50); } g.stroke(); g.restore(); };
  rimSide(o.rimL, -1); rimSide(o.rimR, 1);
  if (o.veil) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(-4, -78); g.quadraticCurveTo(-30, -40, -26, -16); g.lineTo(6, -16); g.quadraticCurveTo(-6, -45, 8, -76); g.closePath(); g.fill(); }
  if (o.scarf) { g.fillStyle = o.scarf; g.beginPath(); g.roundRect(-12, -62, 24, 8, 4); g.fill(); g.fillRect(4, -56, 7, 16); }
  const hy = who === 'he' ? -77 : -68, hr = who === 'he' ? 14 : 13;
  // head (tilts around the neck)
  g.save(); const nk = who === 'he' ? -63 : -56; g.translate(0, nk); g.rotate((o.tilt || 0) + Math.sin(tt * .9 + seed * 2) * .025); g.translate(0, -nk);
  const hg = g.createRadialGradient(-5, hy - 6, 2, 0, hy, hr * 1.2); hg.addColorStop(0, shade(col, .35)); hg.addColorStop(1, shade(col, -.06)); g.fillStyle = hg;
  g.beginPath(); g.arc(0, hy, hr, 0, 7); g.fill();
  if (who === 'she') { g.beginPath(); g.arc(8, hy - 12, 6.5, 0, 7); g.fill(); }
  if (o.ears) { g.beginPath(); g.moveTo(-10, hy - 7); g.lineTo(-10, hy - 21); g.lineTo(-2, hy - 12); g.fill(); g.beginPath(); g.moveTo(10, hy - 7); g.lineTo(10, hy - 21); g.lineTo(2, hy - 12); g.fill(); }
  if (o.light) { g.strokeStyle = `rgba(${o.light},.75)`; g.lineWidth = 1.6; g.beginPath(); g.arc(0, hy, hr - .5, -1.9, .3); g.stroke(); }
  if (o.rimL) { g.strokeStyle = `rgba(${o.rimL},.9)`; g.lineWidth = 2.2; g.beginPath(); g.arc(0, hy, hr - .8, 2.0, 4.0); g.stroke(); }
  if (o.rimR) { g.strokeStyle = `rgba(${o.rimR},.9)`; g.lineWidth = 2.2; g.beginPath(); g.arc(0, hy, hr - .8, -.9, 1.0); g.stroke(); }
  if (o.smile) { g.strokeStyle = 'rgba(80,45,55,.85)'; g.lineWidth = 1.7; [-5, 5].forEach(dx => { g.beginPath(); g.arc(dx, hy + 1, 3, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); });
    g.fillStyle = 'rgba(240,110,120,.45)'; [-8, 8].forEach(dx => { g.beginPath(); g.arc(dx, hy + 5, 2.8, 0, 7); g.fill(); }); }
  if (o.sleep) { g.strokeStyle = 'rgba(80,45,55,.85)'; g.lineWidth = 1.7; [-5, 5].forEach(dx => { g.beginPath(); g.moveTo(dx - 3, hy + 1); g.lineTo(dx + 3, hy + 1); g.stroke(); }); }
  g.restore();
  // starlight drifting over them (proposal)
  if (o.dapple) { g.save(); g.globalCompositeOperation = 'lighter'; const r = rng(Math.round(x)); for (let i = 0; i < 10; i++) { const px = -18 + ((r() * 36 + tt * (4 + r() * 6)) % 36), py = -90 + r() * 88; g.fillStyle = `rgba(190,200,255,${.55 * Math.sin(tt * 2 + i) ** 2})`; g.beginPath(); g.arc(px, py, 1.4, 0, 7); g.fill(); } g.restore(); }
  g.restore();
  // neon spill on the ground (Bund)
  if (o.rimL && CUR_K === 3) { glw(x - 30 * s, y, 60 * s, o.rimL, .12); glw(x + 30 * s, y, 60 * s, o.rimR, .12); }
};
