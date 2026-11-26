// ===================== v3 scenes C: verse 4, bridge, finale, outro, timeline =====================
// ---------- daylight paper rooms ----------
const INK2 = '#6b4a3a';
function dayRoom(key, wallTop, wallBot, floor) {
  put(L(key + '_wall', x => { x.fillStyle = grad(x, 0, H, [[0, wallTop], [1, wallBot]]); x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(160,110,80,.06)'; x.lineWidth = 3; for (let X = 0; X < W; X += 70) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, 860); x.stroke(); } }, 'raw'));
  return () => put(L(key + '_floor', x => { x.fillStyle = grad(x, 860, H, [[0, floor], [1, shade(floor, -.15)]]); x.fillRect(0, 860, W, 220); x.strokeStyle = 'rgba(120,70,40,.15)'; x.lineWidth = 2; for (let k = 0; k < 14; k++) { x.beginPath(); x.moveTo(k * 160 - 200, H); x.lineTo(960 + (k * 160 - 1100) * .4, 860); x.stroke(); } }, { tex: .45, sh: [18, -6, 'rgba(90,50,30,.3)'] }));
}
function bedP(key, x0, y0, w, quilt) { return L(key, x => { x.fillStyle = '#b07a54'; x.beginPath(); x.roundRect(x0 - w / 2, y0 - 120, 30, 220, 8); x.fill(); x.beginPath(); x.roundRect(x0 + w / 2 - 30, y0 - 40, 30, 140, 8); x.fill();
  x.fillStyle = '#e8d6c4'; x.beginPath(); x.roundRect(x0 - w / 2 + 20, y0, w - 40, 60, 14); x.fill(); x.fillStyle = '#fffaf2'; x.beginPath(); x.roundRect(x0 - w / 2 + 40, y0 - 34, 150, 44, 20); x.fill();
  x.fillStyle = quilt; x.beginPath(); x.moveTo(x0 - w / 2 + 160, y0 + 30); x.quadraticCurveTo(x0, y0 - 80, x0 + w / 2 - 20, y0 + 10); x.lineTo(x0 + w / 2 - 20, y0 + 70); x.lineTo(x0 - w / 2 + 160, y0 + 70); x.fill(); }, { tex: .45, sh: [22, 8, 'rgba(90,50,30,.35)'] }); }
function plushP(x, y, s, type) { g.save(); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 3; plush(x, y, s, type); g.restore(); }
sMorning = function (t) {
  const S = SEC.v4;
  if (t < S.st[1] + .3) { layer(() => {
    const fl = dayRoom('mr', '#fff1dc', '#f6d8b8', '#e9c7a0');
    put(L('mr_win', x => { x.fillStyle = '#fffaf0'; x.fillRect(1220, 140, 460, 420); x.fillStyle = grad(x, 160, 540, [[0, '#cfe6f5'], [1, '#fff2d6']]); x.fillRect(1240, 160, 420, 380); x.fillStyle = '#c99a72'; x.fillRect(1440, 160, 20, 380); x.fillRect(1240, 340, 420, 16); x.fillStyle = '#f2b6a6'; x.beginPath(); x.moveTo(1180, 120); x.quadraticCurveTo(1230, 350, 1190, 600); x.lineTo(1150, 600); x.lineTo(1150, 120); x.fill(); x.beginPath(); x.moveTo(1720, 120); x.quadraticCurveTo(1670, 350, 1710, 600); x.lineTo(1750, 600); x.lineTo(1750, 120); x.fill(); }, { tex: .5, sh: [18, 6, 'rgba(90,50,30,.3)'] }));
    fl(); put(bedP('mr_bed', 760, 760, 760, '#f2b6a6'));
    doll(500, 790, 170, 'she', { sleep: true, armL: null, armR: null, noShadow: true, lean: -1.45 });
    T('z', 620 + Math.sin(t * 2) * 6, 620, 42, INK2, .7); T('z', 660, 570 - Math.sin(t * 2) * 6, 54, INK2, .55); T('Z', 710, 510, 70, INK2, .4);
    const k = clamp((t - S.st[0]) / 2.4); g.save(); g.shadowColor = 'rgba(90,50,30,.35)'; g.shadowBlur = 16; g.shadowOffsetY = 6; clock(1450, 700, 110, lerp(8, 12, ease(k))); g.restore();
    T(lerp(8, 12, ease(k)) > 11.9 ? '周末的上午：不存在' : '周末 · 上午', 1450, 860, 34, INK2, 1, { w: 600 });
  }, clamp((S.st[1] + .3 - t) / .3)); }
  if (t >= S.st[1] - .1) layer(() => {
    put(skyL('ms_sky', [[0, '#cfe6f5'], [1, '#fff0dc']], 0, 1, 1));
    put(L('ms_far', x => { const r = rng(4); let X = -20; while (X < W) { const w = 120 + r() * 160, h = 200 + r() * 260; bld(x, X, 820, w, h, '#e9d6c8', { topCol: '#f6e8dc', win: .5, dim: true, seed: X | 0, cw: 24, ch: 30 }); X += w + 20; } }, { tex: .4, blur: 1.5, sh: [16, 6, 'rgba(120,80,60,.25)'] }));
    put(L('ms_museum', x => { x.save(); x.translate(1450, 860); x.scale(1.4, 1.4); x.fillStyle = '#fffaf0'; x.beginPath(); x.moveTo(-190, -170); x.lineTo(0, -270); x.lineTo(190, -170); x.closePath(); x.fill(); x.fillStyle = '#f2e4d2'; x.fillRect(-180, -170, 360, 22); for (let c2 = -140; c2 <= 140; c2 += 70) { x.fillStyle = '#fffaf0'; x.fillRect(c2 - 14, -148, 28, 148); x.fillStyle = 'rgba(160,120,90,.18)'; x.fillRect(c2 + 6, -148, 8, 148); } x.fillStyle = '#e8d6c0'; x.fillRect(-200, 0, 400, 20); x.restore(); }, { tex: .45, sh: [22, 8, 'rgba(120,80,60,.35)'] }));
    T('展览 · 讲座', 1450, 450, 38, INK2, 1, { w: 600 });
    put(L('ms_ground', x => { x.fillStyle = grad(x, 860, H, [[0, '#d9c2a6'], [1, '#c4a888']]); x.fillRect(0, 860, W, 220); }, { tex: .45, sh: [18, -6, 'rgba(90,50,30,.3)'] }));
    const tired = t > S.st[2]; const x = lerp(380, 820, ease(clamp((t - S.st[1]) / 5)));
    doll(x + 110, 930, 300, 'he', { col: '#e8bf7a', armL: [-28, -2], run: t * 7, bob: t * 7, smile: true });
    doll(x, 930, 280, 'she', { col: '#ee9a8a', lean: -.2, armR: [26, -8], run: t * 4, smile: false });
    bubble(x - 30, 560, 200, 76, '好累～', tired ? clamp((t - S.st[2]) / .3) : 0, 38, '#fff', 'rgba(233,128,110,.95)');
  }, clamp((t - S.st[1] + .1) / .4));
};
function sunroomP(t) {
  const fl = dayRoom('sr', '#fff1dc', '#f6d8b8', '#e2bd94');
  put(L('sr_win', x => { x.fillStyle = '#fffaf0'; x.fillRect(1040, 80, 700, 600); x.fillStyle = grad(x, 100, 660, [[0, '#bfe0f3'], [1, '#fff5dc']]); x.fillRect(1060, 100, 660, 560); x.fillStyle = '#c99a72'; x.fillRect(1380, 100, 20, 560); x.fillRect(1060, 370, 660, 16);
    x.fillStyle = '#6fae7a'; x.beginPath(); x.arc(940, 720, 70, 0, 7); x.arc(900, 640, 50, 0, 7); x.arc(990, 650, 46, 0, 7); x.fill(); x.fillStyle = '#c96a4a'; x.fillRect(900, 740, 80, 110); }, { tex: .5, sh: [20, 6, 'rgba(90,50,30,.3)'] }));
  glw(1560, 230, 220, '255,220,140', .6);
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,205,120,.35)'; g.beginPath(); g.moveTo(1060, 660); g.lineTo(1720, 660); g.lineTo(1240, 1080); g.lineTo(180, 1080); g.fill(); g.restore();
  fl(); glw(800, 900, 500, '255,220,150', .18);
  T('百万阳光房', 1390, 720, 30, INK2, ramp(t, SEC.v4.st[3], SEC.v4.st[3] + .6), { w: 600 });
}
sSunroom = function (t) {
  const S = SEC.v4; sunroomP(t);
  if (t < S.st[4]) { doll(560, 960, 300, 'he', { col: '#e8bf7a' }); doll(720, 960, 280, 'she', { col: '#ee9a8a', smile: true, armR: [18, -30] }); }
  else if (t < S.st[5]) { // cat in the sun
    g.save(); g.shadowColor = 'rgba(90,50,30,.3)'; g.shadowBlur = 12; g.shadowOffsetY = 4; g.fillStyle = '#ee9a8a'; g.beginPath(); g.ellipse(840, 930, 150, 46, 0, 0, 7); g.fill(); g.restore();
    doll(680, 930, 210, 'she', { col: '#ee9a8a', ears: true, smile: true, armL: null, armR: null, noShadow: true, lean: -1.2 });
    T('喵～', 600, 760, 44, INK2, clamp((t - S.st[4] - .5) / .3)); doll(380, 960, 300, 'he', { col: '#e8bf7a', smile: true });
  } else { const tidy = ease(ramp(t, S.st[6], S.st[6] + 1.2)); const r = rng(93);
    put(L('sr_shelf', x => { x.fillStyle = '#b07a54'; x.fillRect(180, 440, 660, 18); x.fillRect(190, 458, 14, 30); x.fillRect(816, 458, 14, 30); }, { tex: .45, sh: [12, 6, 'rgba(90,50,30,.35)'] }));
    ['sock', 'book', 'cup', 'book', 'sock', 'shirt', 'book', 'cup'].forEach((it, i) => { const mx = 260 + r() * 700, my = 900 + r() * 60, mr = (r() - .5) * 2; const tx = 230 + i * 78, ty = 400; const x = lerp(mx, tx, tidy), y = lerp(my, ty, tidy), rot = lerp(mr, 0, tidy);
      g.save(); g.translate(x, y); g.rotate(rot); g.shadowColor = 'rgba(90,50,30,.3)'; g.shadowBlur = 8; g.shadowOffsetY = 3; g.fillStyle = ['#7fb3d5', '#e9806e', '#ffffff', '#9ccf8f', '#f2c14e', '#b39ddb', '#e9806e', '#fff'][i];
      if (it === 'book') { g.fillRect(-18, -40, 36, 80); } else if (it === 'cup') { g.fillRect(-20, -24, 40, 48); g.shadowBlur = 0; g.strokeStyle = '#ddd'; g.lineWidth = 5; g.beginPath(); g.arc(24, 0, 10, -1.4, 1.4); g.stroke(); }
      else if (it === 'sock') { g.beginPath(); g.moveTo(-10, -36); g.lineTo(10, -36); g.lineTo(10, 10); g.lineTo(28, 22); g.lineTo(18, 36); g.lineTo(-10, 20); g.closePath(); g.fill(); } else { g.fillRect(-34, -30, 68, 60); } g.restore(); });
    if (tidy > .9) { const r2 = rng(5); for (let i = 0; i < 10; i++) glw(200 + r2() * 640, 320 + r2() * 160, 26, '255,220,120', Math.sin(t * 6 + i) ** 2); }
    const annoyed = tidy < .5; doll(1300, 960, 280, 'she', { col: '#ee9a8a', smile: !annoyed, armL: annoyed ? [-6, -10] : undefined, armR: annoyed ? [6, -10] : undefined });
    T(annoyed ? '!' : '♡', 1300, 620, 64, annoyed ? '#d8513e' : '#e9806e', 1, { w: 700 });
    doll(lerp(1080, 880, tidy), 960, 300, 'he', { col: '#e8bf7a', run: tidy > 0 && tidy < 1 ? t * 9 : undefined, armL: [-20, -10], armR: [20, -10] });
    T('亮堂堂', 520, 300, 46, INK2, ramp(t, S.st[6] + 1, S.st[6] + 1.5), { w: 600 }); }
};
sNight4 = function (t) {
  const S = SEC.v4; put(L('nt_wall', x => { x.fillStyle = grad(x, 0, H, [[0, '#141a3c'], [1, '#262c5a']]); x.fillRect(0, 0, W, H); }, 'raw'));
  put(L('nt_win', x => { x.fillStyle = '#0c1030'; x.fillRect(1360, 100, 380, 360); x.fillStyle = '#3a4070'; x.fillRect(1540, 100, 16, 360); x.fillRect(1360, 270, 380, 14); x.strokeStyle = '#3a4070'; x.lineWidth = 16; x.strokeRect(1360, 100, 380, 360); const r = rng(3); for (let i = 0; i < 50; i++) { x.fillStyle = `rgba(255,240,215,${.4 + r() * .6})`; x.beginPath(); x.arc(1370 + r() * 360, 110 + r() * 340, r() * 1.4 + .3, 0, 7); x.fill(); } }, { tex: .45, sh: [16, 6, 'rgba(0,0,0,.4)'] }));
  moonP(1470, 190, 34, .62, false, .2);
  put(L('nt_floor', x => { x.fillStyle = grad(x, 860, H, [[0, '#2a2a56'], [1, '#1c1c40']]); x.fillRect(0, 860, W, 220); }, { tex: .4, sh: [16, -6, 'rgba(0,0,0,.4)'] }));
  put(L('nt_bed', x => { x.fillStyle = '#6a5a8a'; x.beginPath(); x.roundRect(320, 640, 30, 220, 8); x.fill(); x.beginPath(); x.roundRect(1120, 720, 30, 140, 8); x.fill(); x.fillStyle = '#c9c0e0'; x.beginPath(); x.roundRect(340, 760, 790, 60, 14); x.fill(); x.fillStyle = '#eee8f8'; x.beginPath(); x.roundRect(360, 726, 150, 44, 20); x.fill(); x.fillStyle = '#4a5a9a'; x.beginPath(); x.moveTo(500, 790); x.quadraticCurveTo(800, 680, 1110, 770); x.lineTo(1110, 830); x.lineTo(500, 830); x.fill(); }, { tex: .45, sh: [20, 8, 'rgba(0,0,0,.45)'] }));
  doll(440, 785, 110, 'she', { lean: -1.45, sleep: t < S.st[8], smile: t >= S.st[8], armL: null, armR: null, noShadow: true });
  plushP(1000, 720, 1.5, 'dog'); plushP(1080, 724, 1.5, 'panda'); T('阿黄', 1000, 660, 22, 'rgba(255,226,170,.75)', 1); T('黑白', 1080, 660, 22, 'rgba(255,226,170,.75)', 1);
  const u = t - S.st[7]; const trip = Math.min(3, Math.floor(u / (BEAT * 1.4)) + 1);
  if (t < S.st[8]) { const ph = (u / (BEAT * 1.4)) % 1; const x = 1440 + Math.sin(ph * Math.PI) * 140; doll(x, 960, 280, 'he', { run: t * 8, bob: t * 8, armR: [14, -14], light: '200,200,255' });
    T(['袜子', '倒水', '调空调'][trip - 1], x, 600, 34, '#ffe7b8', 1, { w: 600 }); T(`第 ${trip} 趟`, 1450, 540 - 330, 0, '#ffe7b8', 0);
    T(`第 ${trip} 趟`, 860, 200, 58, '#ffe7b8', 1, { glow: 'rgba(255,200,120,.8)', w: 500 }); bubble(480, 600, 220, 70, '帮我…～', clamp(1 - ph * 2), 32); }
  else { doll(1440, 960, 280, 'he', { smile: t < S.st[9], light: '200,200,255' }); bubble(480, 600, 260, 70, '又麻烦你啦', clamp((t - S.st[8]) / .3) * (t < S.st[9] + .2 ? 1 : 0), 32);
    if (t >= S.st[8] + .6) { const pa = clamp((t - S.st[8] - .6) / .4); g.save(); g.globalAlpha = pa; g.fillStyle = 'rgba(255,248,236,.95)'; [[1380, 680, 14], [1350, 640, 20]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 14; g.beginPath(); g.roundRect(1200, 420, 480, 190, 60); g.fill(); g.restore();
      if (t < S.st[9]) T('（她还需要我 ♡）', 1440, 515, 36, '#3a2440', pa, { w: 500 }); else { const k = clamp((t - S.st[9]) / 1.5); T(k < .99 ? '如果哪天她什么都不叫我…' : '…我才会慌！', 1440, 515, 32, '#3a2440', pa, { w: 500 }); } } }
  finish(.45);
};

// ---------- bridge: two lamps ----------
function homeNight() { put(L('br_wall', x => { x.fillStyle = grad(x, 0, H, [[0, '#120e24'], [1, '#2a1e36']]); x.fillRect(0, 0, W, H); x.strokeStyle = 'rgba(255,200,150,.04)'; x.lineWidth = 3; for (let X = 0; X < W; X += 70) { x.beginPath(); x.moveTo(X, 0); x.lineTo(X, 880); x.stroke(); } }, 'raw')); }
function floorN() { put(L('br_floor', x => { x.fillStyle = grad(x, 880, H, [[0, '#3a2a40'], [1, '#22182c']]); x.fillRect(0, 880, W, 200); }, { tex: .45, sh: [18, -6, 'rgba(0,0,0,.45)'] })); }
function lampP(x, y, a = 1) { glw(x, y + 60, 420, '255,190,110', .4 * a); g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 10; g.fillStyle = '#ffd08a'; g.beginPath(); g.moveTo(x - 44, y); g.lineTo(x + 44, y); g.lineTo(x + 28, y - 56); g.lineTo(x - 28, y - 56); g.fill(); g.restore(); g.strokeStyle = 'rgba(60,40,50,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - 56); g.lineTo(x, 0); g.stroke(); }
sBridge = function (t) {
  const S = SEC.br, i = Math.max(0, li(S, t)); homeNight();
  if (i <= 1) { lampP(960, 300); floorN();
    doll(560, 900, 320, 'he', { armR: [18, 10] }); doll(1360, 900, 300, 'she', { smile: i === 1, armL: i === 1 ? [-22, 4] : [-10, 14] });
    put(L('br_table', x => { x.fillStyle = '#5a3a40'; x.fillRect(340, 760, 1240, 26); x.fillRect(380, 786, 20, 130); x.fillRect(1520, 786, 20, 130); }, { tex: .45, sh: [16, 8, 'rgba(0,0,0,.5)'] }));
    [[820, '#f2dfc2'], [960, '#9ccf8f'], [1100, '#f2c14e']].forEach(([x, c2]) => { g.fillStyle = '#fff6ea'; g.beginPath(); g.ellipse(x, 752, 62, 15, 0, 0, 7); g.fill(); g.fillStyle = c2; g.beginPath(); g.ellipse(x, 744, 40, 15, 0, Math.PI, 0); g.fill(); });
    const sl = ease(ramp(t, S.st[1], S.st[1] + 1.6)); const dx = lerp(1220, 1500, sl); g.fillStyle = '#fff6ea'; g.beginPath(); g.ellipse(dx, 752, 58, 15, 0, 0, 7); g.fill(); g.fillStyle = '#c9a27a'; g.beginPath(); g.ellipse(dx, 744, 38, 14, 0, Math.PI, 0); g.fill();
    T('她爱吃的毛肚', dx, 680, 26, 'rgba(255,226,170,.9)', ramp(t, S.st[0] + .8, S.st[0] + 1.5));
  } else if (i <= 3) { lampP(1360, 420); floorN();
    put(L('br_desk', x => { x.fillStyle = '#5a3a40'; x.fillRect(1120, 760, 520, 24); x.fillRect(1140, 784, 18, 120); x.fillRect(1600, 784, 18, 120); x.fillStyle = '#fff6ea'; x.save(); x.translate(1440, 742); x.rotate(-.08); x.fillRect(-60, -14, 120, 20); x.restore(); }, { tex: .45, sh: [16, 8, 'rgba(0,0,0,.5)'] }));
    doll(1300, 900, 300, 'she', { armR: [24, -14] });
    const k = ramp(t, S.st[2], S.st[2] + 2.5); const pts = [[1500, 560], [1380, 420], [1560, 300], [1720, 150]]; const n = k * pts.length; g.setLineDash([6, 10]); g.strokeStyle = 'rgba(255,220,150,.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(1440, 720); pts.forEach((p, j) => { if (j < n) g.lineTo(...p); }); g.stroke(); g.setLineDash([]); pts.forEach((p, j) => { if (j < n) glowDot(p[0], p[1], 34, 1); });
    const pa = ramp(t, S.st[3], S.st[3] + .5); if (pa > 0) { g.save(); g.globalAlpha = pa; doll(560 + Math.sin(t * 3) * 6, 940, 320, 'he', { run: t * 6, bob: t * 6, lean: .08 });
      const r = rng(97); for (let j = 0; j < 14; j++) { const sp = 300 + r() * 300, x = W * .55 - ((t * sp + r() * 900) % 1100), y = 300 + r() * 600; g.save(); g.translate(x, y); g.rotate(t * 3 + j); g.shadowColor = 'rgba(0,0,0,.3)'; g.shadowBlur = 8; g.fillStyle = '#fff6ea'; g.fillRect(-26, -32, 52, 64); g.shadowBlur = 0; g.fillStyle = '#d8513e'; g.fillRect(-26, -32, 52, 14); g.restore(); } g.restore(); }
  } else if (i <= 5) { const rainA = ramp(t, S.st[5], S.st[5] + .6); const um = ease(ramp(t, S.st[5], S.st[5] + 1)); lampP(960, 260, 1 - rainA * .4); floorN();
    const hx = lerp(640, 860, um); doll(hx, 950, 320, 'he', { smile: true, armR: um > 0 ? [26, -30] : undefined }); doll(1100, 950, 300, 'she', { armL: t < S.st[5] ? [-4, -36] : undefined });
    if (t < S.st[5]) { bubble(1100, 560, 190, 76, '哎呀！', clamp((t - S.st[4] - 1.2) / .3), 38, '#fff', 'rgba(233,128,110,.95)'); const ba = clamp((t - S.st[4] - 3) / .3); if (ba > 0) { g.save(); g.globalAlpha = ba; g.fillStyle = '#fff6ea'; g.translate(hx + 14, 950 - 280); g.rotate(.5); g.fillRect(-22, -7, 44, 14); g.restore(); T('^_^', hx, 560, 44, '#ffe7b8', ba); } }
    if (rainA > 0) { const r = rng(99); g.strokeStyle = `rgba(190,210,255,${.55 * rainA})`; g.lineWidth = 2; for (let j = 0; j < 240; j++) { const x = r() * W, y = (r() * H + t * 900) % (H + 60) - 60; if (x > hx - 300 && x < 1340 && y > 520) continue; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 34); g.stroke(); }
      g.save(); g.globalAlpha = um; g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = '#e9806e'; g.beginPath(); g.arc(990, 560, 320, Math.PI, 0); g.closePath(); g.fill(); g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,.15)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(990, 240); g.lineTo(670 + k * 213, 560); g.lineTo(670 + (k + .5) * 213, 560); g.fill(); } g.strokeStyle = '#ffd08a'; g.lineWidth = 4; g.beginPath(); g.moveTo(990, 560); g.lineTo(hx + 40, 720); g.stroke(); g.restore(); }
  } else if (i <= 8) { put(L('br_split', x => { x.fillStyle = '#1a1428'; x.fillRect(950, 120, 20, 780); }, { tex: .4, sh: [16, 0, 'rgba(0,0,0,.5)'] })); lampP(480, 260); lampP(1440, 320); floorN();
    put(L('br_kitchen', x => { x.fillStyle = '#5a3a40'; x.fillRect(220, 760, 560, 30); x.fillRect(220, 790, 560, 110); x.fillStyle = '#4a4a56'; x.fillRect(420, 716, 150, 44); x.fillStyle = '#ffd08a'; x.beginPath(); x.ellipse(495, 716, 76, 12, 0, 0, 7); x.fill(); x.fillStyle = '#5a3a40'; x.fillRect(1240, 760, 460, 26); x.fillRect(1260, 786, 18, 120); x.fillRect(1660, 786, 18, 120); }, { tex: .45, sh: [18, 8, 'rgba(0,0,0,.5)'] }));
    doll(320, 940, 300, 'he', { armR: [26, -16] }); particlesUp(t, 495, 680, 90, 12, '255,240,225', .5); doll(1440, 940, 280, 'she', { armL: [-10, -6], armR: [24, -18] });
    const nb = ramp(t, S.st[8], S.st[8] + .6); if (nb > 0) { g.save(); g.globalAlpha = nb; g.fillStyle = '#fff6ea'; g.fillRect(1500, 716, 160, 44); g.strokeStyle = 'rgba(120,100,120,.5)'; g.lineWidth = 1.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(1510, 724 + k * 10); g.lineTo(1650, 724 + k * 10); g.stroke(); } g.restore(); [[1560, 600], [1640, 540], [1520, 500]].forEach(([x, y], j) => T('?', x, y - (t - S.st[8]) * 10, 46, 'rgba(255,226,170,.75)', clamp((t - S.st[8] - j * .4) / .4))); }
    const sc = ramp(t, S.st[7], S.st[7] + 2.4); if (sc > 0) { g.strokeStyle = 'rgba(255,210,130,.85)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); const N = 60; for (let k = 0; k <= N * sc; k++) { const p = k / N; const x = lerp(495, 1420, p), y = 680 - Math.sin(p * Math.PI) * 320 + Math.sin(p * 18 + t * 3) * 16; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); glowDot(lerp(495, 1420, sc), 680 - Math.sin(sc * Math.PI) * 320, 60, 1); }
  } else { const brave = ramp(t, S.st[11], S.st[11] + 3); lampP(1200, 300, 1 - brave * .5); floorN();
    const near = ease(ramp(t, S.st[9], S.st[9] + 1.4)); const hx = lerp(520, 1060, near);
    doll(1200, 940, 290, 'she', { lean: t > S.st[10] ? -.12 * ramp(t, S.st[10], S.st[10] + 1) : 0, smile: t > S.st[10] });
    doll(hx, 940, 310, 'he', { run: near > 0 && near < 1 ? t * 7 : undefined, armR: near > .95 ? [30, -10] : undefined, smile: brave > 0 });
    if (brave > 0) { glw(hx, 760, 200 + brave * 900, '255,220,150', .6 * brave); const r = rng(101); for (let j = 0; j < 60; j++) { const an = r() * 6.28, d = brave * (300 + r() * 900); glowDot(hx + Math.cos(an) * d, 780 + Math.sin(an) * d * .7, 18, brave * (1 - brave * .5)); } }
    const flash = ramp(t, SEC.fin.st[0] - .8, SEC.fin.st[0]); if (flash > 0) { g.fillStyle = `rgba(255,240,210,${flash * .85})`; g.fillRect(0, 0, W, H); } }
  finish(.5);
};

// ---------- finale ----------
const PF2 = { pal: ['#0a0820', '#2a1f56', '#5a3a6a'], tint: '255,220,160', ill: 1, waning: false };
function finSky() { return skyL('fn_sky', [[0, '#0a0820'], [.6, '#2a1f56'], [1, '#5a3a6a']], 500, 800, 41); }
function finHills() { return hillsL('fnh', '#3e2c5e', '#241a3c'); }
let FINV = .5;
finalShot = function (k, t, u) {
  FINV = .5; const hl = finHills();
  if (k === 0) { put(finSky()); const r = rng(111);
    for (let i = 0; i < 260; i++) { const tx = r() * W, ty = r() * 650, sx = r() < .5 ? -100 : W + 100, sy = r() * H; const p = ease(clamp(u / 3 - r() * .3)); glowDot(lerp(sx, tx, p), lerp(sy, ty, p), 8 + r() * 10, .8); }
    const rise = ease(clamp(u / 4)); moonP(960, lerp(1000, 440, rise), 200, 1, false, .35 + beatPulse(t) * .08); put(hl[0], 0, 0); put(hl[1]);
    T('2026.11.24 · 今晚的月亮：100%', 960, 150, 30, 'rgba(255,230,180,.85)', ramp(u, 2, 3), { glow: 'rgba(255,200,120,.6)' });
  } else if (k === 1) { put(finSky()); const r = rng(113);
    DIGITS.forEach(([x, y], i) => { const p = ease(clamp(u / 2.2 - r() * .3)); const sx = r() * W, sy = r() * H; glowDot(lerp(sx, 960 + x * 1.2, p), lerp(sy, 380 + y * 1.2, p), 16, .85 + .15 * Math.sin(t * 5 + i)); });
    put(hl[1]); glw(960, 880, 320, '255,170,180', .35); doll(960, 1010, 330, 'she', { smile: true, armL: [-18, -30], armR: [18, -30], light: '255,230,200' });
  } else if (k === 2) { chorusShot(2, t, u, { pal: PF2.pal, tint: '255,220,160', ill: 1, waning: false }); moonP(1600, 200, 80, 1, false, .3);
  } else if (k === 3) { put(finSky()); moonP(960, 470, 300, 1, false, .3); put(hl[0]);
    const lean = -.18 * ease(clamp(u / 1.2)); put(hl[1]); doll(890, 900, 330, 'he', { armR: [28, 0], light: '255,235,190' }); doll(990, 905, 305, 'she', { lean, armL: [-24, 4], smile: true, light: '255,235,190' });
  } else if (k === 4) { roadP(t, u, PF2, true, 1, false);
    ['rice', 'oil', 'salt'].forEach((it, j) => { const p = ease(clamp((u - j * .5) / 3)); if (p >= 1) return; const x = lerp(300 + j * 650, 960, p), y = lerp(320, 600, p), s = lerp(1.2, .1, p);
      g.save(); g.translate(x, y); g.scale(s, s); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 14; g.shadowOffsetY = 5; g.fillStyle = ['#f6efe2', '#f2c14e', '#ffffff'][j];
      if (it === 'rice') { g.beginPath(); g.arc(0, 0, 70, 0, Math.PI); g.closePath(); g.fill(); g.shadowBlur = 0; g.fillStyle = '#fffaf0'; g.beginPath(); g.arc(0, 0, 60, Math.PI, 0); g.fill(); g.strokeStyle = '#7fb3d5'; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 66, .3, Math.PI - .3); g.stroke(); }
      else if (it === 'oil') { g.beginPath(); g.roundRect(-34, -60, 68, 130, 14); g.fill(); g.fillRect(-12, -90, 24, 30); } else { g.beginPath(); g.roundRect(-30, -50, 60, 110, 20); g.fill(); g.fillStyle = '#c0c0c8'; g.fillRect(-30, -50, 60, 20); }
      g.restore(); T(['柴米', '油盐', '日常'][j], x, y + 110 * s, 30, 'rgba(255,226,170,.9)', 1 - p); });
  } else if (k === 5) { put(finSky()); card(960, 500, 1180, 860, -.006, '#f4e6cc');
    FINV = .15; MEM2.forEach(([d, s, ill, wn], j) => { const a = clamp((u - j * .36) / .45); const y = 128 + j * 80; if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = '#2a2448'; g.beginPath(); g.arc(520, y, 26, 0, 7); g.fill(); g.restore();
      moonP(520, y, 20, ill, wn, 0, a); T(d, 580, y, 30, '#8a5a4a', a, { align: 'left', w: 600 }); T(s, 800, y, 32, '#4a2e28', a, { align: 'left', w: 500 }); });
  } else if (k === 6) { put(finSky()); moonP(1450, 260, 100, 1, false, .3); put(hl[1], 0, 80);
    const cx = 960, cy = 690; g.save(); g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 26; g.shadowOffsetY = 10; g.fillStyle = '#fff2e0'; g.beginPath(); g.roundRect(cx - 260, cy - 60, 520, 170, 16); g.fill(); g.restore(); g.fillStyle = '#ffd1dc'; g.beginPath(); g.roundRect(cx - 180, cy - 180, 360, 130, 14); g.fill();
    g.fillStyle = '#f7a8b8'; for (let x = cx - 250; x < cx + 260; x += 52) { g.beginPath(); g.arc(x + 26, cy - 60, 26, 0, Math.PI); g.fill(); } g.fillStyle = '#fff'; for (let x = cx - 170; x < cx + 180; x += 40) { g.beginPath(); g.arc(x + 20, cy - 180, 16, 0, Math.PI); g.fill(); }
    ['3', '2'].forEach((n, j) => { const x = cx - 50 + j * 100, y = cy - 250; T(n, x, y, 120, '#ffd08a', 1, { w: 700, glow: 'rgba(255,200,120,.7)' }); const fl = 1 + .15 * Math.sin(t * 13 + j * 2); g.fillStyle = '#ffb347'; g.beginPath(); g.ellipse(x, y - 100, 12 * fl, 24 * fl, 0, 0, 7); g.fill(); glw(x, y - 100, 90, '255,200,120', .7); });
    T('三十二岁 · 生日快乐', 960, 870, 46, '#fff0d0', ramp(u, .8, 1.6), { glow: 'rgba(255,200,120,.9)', w: 500 });
  } else { const zoom = lerp(1.2, 1, ease(clamp(u / 5))); g.save(); g.translate(960, 600); g.scale(zoom, zoom); g.translate(-960, -600); put(finSky()); moonP(960, 420, 250, 1, false, .3);
    const r = rng(117); const pts = []; for (let j = 0; j < 10; j++) pts.push([160 + j * 180 + r() * 60, 150 + r() * 260]); g.setLineDash([5, 8]); g.strokeStyle = 'rgba(255,220,150,.5)'; g.lineWidth = 2; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); g.setLineDash([]); pts.forEach(p => glowDot(p[0], p[1], 30, .9));
    put(hl[0]); put(hl[1]); doll(920, 900, 300, 'he', { armR: [26, 0], light: '255,235,190' }); doll(1012, 905, 280, 'she', { lean: -.15, armL: [-22, 4], smile: true, light: '255,235,190' }); g.restore(); }
  finish(FINV);
};
const MEM2 = [['2023.01.26', '加上微信 · 那晚是一弯蛾眉月', .21, 0], ['2023.02.12', '人民广场 · 第一顿火锅', .57, 1], ['2023.03.25', '向日葵 · 表白', .13, 0], ['2023.05.01', '嵊泗 · 追夕阳', .84, 0], ['2023.12.31', '哈尔滨 · 新年钟声', .83, 1],
['2024.10.12', '星空 · 求婚', .71, 0], ['2025.05.21', '小满 · 持证上岗', .38, 1], ['2025.05.25', '婚礼 · 勇敢的人先享受世界', .04, 1], ['2025.09.23', '敦煌 · 新月下的银河', .012, 0], ['2026.11.24', '三十二岁 · 满月', 1, 0]];
// ---------- outro ----------
sOutro = function (t) {
  const S = SEC.out, u = t - (SEC.fin.st[7] + 4.5); put(skyL('ou_sky', [[0, '#04040e'], [.6, '#0b0a20'], [1, '#1a1434']], 300, 1080, 91), 0, 0, clamp((358 - t) / 2) * .8 + .2);
  const cx = 960, cy = 470, R = 240, a = ramp(u, 0, 1.5);
  g.save(); g.globalAlpha = a; glw(cx, cy, 420, '255,220,160', .15);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); const gg = g.createRadialGradient(cx, cy, 10, cx, cy, R); gg.addColorStop(0, '#1c2050'); gg.addColorStop(1, '#0a0c26'); g.fillStyle = gg; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const r = rng(121); for (let i = 0; i < 180; i++) { const an = r() * 6.28 + t * .05, d = Math.sqrt(r()) * R; g.fillStyle = `rgba(255,236,200,${.3 + r() * .7})`; g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, r() * 1.6 + .4, 0, 7); g.fill(); }
  moonP(cx, cy, 70, 1, false, .25); g.restore();
  g.strokeStyle = 'rgba(220,230,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R - 30, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20; g.shadowOffsetY = 8; g.fillStyle = '#7a4a2e'; g.beginPath(); g.ellipse(cx, cy + R + 6, 170, 28, 0, 0, 7); g.fill(); g.restore();
  const ba = ramp(t, S.st[2] - .2, S.st[2] + .5); if (ba > 0) [...'生日快乐'].forEach((ch, j) => T(ch, 840 + j * 80, 840, 76, '#ffd98a', clamp((t - S.st[2] + .2 - j * .25) / .5) * clamp((358.3 - t) / 1), { glow: 'rgba(255,200,110,1)', blur: 30, w: 500 }));
  T('2023.01.26 的月亮 21%   →   2026.11.24 的月亮 100%', 960, 930, 26, 'rgba(255,226,170,.75)', ramp(t, S.st[2] + 1, S.st[2] + 1.8) * clamp((358.3 - t) / 1));
};

// ---------- timeline from Whisper large-v3 ----------
(function () {
  const R = {"v1": [18.98, 22.94, 27.47, 31.15, 36.53, 41.01, 45.59, 50.39], "pre1": [54.89, 59.19, 62.0, 67.94], "c1": [72.75, 77.22, 81.79, 86.29, 90.25, 95.12, 99.62, 104.43], "v2": [108.97, 111.58, 113.88, 116.14, 118.38, 120.68, 122.9, 125.44], "c2": [129.35, 133.82, 138.4, 142.78, 146.87, 151.72, 156.22, 160.9], "v3": [166.14, 167.94, 170.2, 172.67, 176.63, 179.19], "pre2": [183.89, 186.08, 188.58, 191.35, 194.16, 197.0], "c3": [201.4, 205.8, 210.61, 214.83, 219.36, 224.18, 228.69, 233.38], "v4": [238.05, 240.68, 242.53, 245.11, 247.42, 249.7, 252.3, 254.32, 256.56, 261.82], "br": [267.48, 269.14, 271.73, 276.31, 281.63, 287.16, 288.8, 291.53, 294.93, 298.19, 300.6, 304.06], "fin": [307.62, 312.2, 316.74, 321.14, 325.06, 330.13, 333.98, 339.91], "out": [345.93, 350.04, 355.72]};
  const v1txt = LYR.slice(0, 8).map(l => l[1]);
  for (const k in R) if (SEC[k]) SEC[k].st = R[k];
  SEC.v1.st = R.v1;
  LYR.length = 0; R.v1.forEach((s, i) => LYR.push([s, v1txt[i]]));
  const ps = (k, endNull) => { SEC[k].st.forEach((s, i) => { if (SEC[k].txt[i]) LYR.push([s, SEC[k].txt[i]]); }); if (endNull) LYR.push([endNull, null]); };
  ps('pre1'); ps('c1', 108.2); ps('v2'); ps('c2', 164.9); ps('v3'); ps('pre2'); ps('c3'); ps('v4'); ps('br'); ps('fin', 344.4); ps('out', 353.8);
  LYR.sort((a, b) => a[0] - b[0]);
  window.capDark = t => (t > R.v4[0] - .4 && t < R.v4[7] - .3);
  const s = SEC, v1 = R.v1;
  SCENES.length = 0;
  SCENES.push([0, 19.0, sIntro], [v1[0] - .1, v1[4] - .4, t => sHotpot(t, t - v1[0])], [v1[4] - .4, s.pre1.st[0] - .2, t => sBund(t, t - v1[4])], [s.pre1.st[0] - .2, s.c1.st[0] - .1, sPre1],
    [s.c1.st[0] - .1, s.v2.st[0] - .3, t => sChorus(t, s.c1, V1)], [s.v2.st[0] - .3, s.v2.st[3], sCherry], [s.v2.st[3], s.v2.st[6], sSunflower], [s.v2.st[6], s.c2.st[0] - .3, sShengsi],
    [s.c2.st[0] - .3, s.v3.st[0], t => sChorus(t, s.c2, V2)], [s.v3.st[0], s.v3.st[1], sHarbin], [s.v3.st[1], s.v3.st[2], sConcert], [s.v3.st[2], s.pre2.st[0], sProposal],
    [s.pre2.st[0], s.pre2.st[2], sXiaoman], [s.pre2.st[2], s.pre2.st[4], sWedding], [s.pre2.st[4], s.c3.st[0], sDunhuang],
    [s.c3.st[0], s.v4.st[0] - .2, t => sChorus(t, s.c3, V3)], [s.v4.st[0] - .2, s.v4.st[3], sMorning], [s.v4.st[3], s.v4.st[7], sSunroom], [s.v4.st[7], s.br.st[0] - .3, sNight4],
    [s.br.st[0] - .3, s.fin.st[0], sBridge], [s.fin.st[0], s.fin.st[7] + 4.5, sFinal], [s.fin.st[7] + 4.5, 400, sOutro]);
})();
// cache management + global paper grain on top
const _render = window.render;
window.render = function (t) { NOW = t; evict(); _render(t); g = mainG; g.save(); g.globalAlpha = .18; g.globalCompositeOperation = 'overlay'; g.drawImage(PTEX, 0, 0); g.restore(); };
