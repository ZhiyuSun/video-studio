// ===================== full-song scenes =====================
const mainG = g;
const POOL = [0, 1, 2].map(() => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; });
let depth = 0;
function layer(fn, a) { // draw fn into an offscreen layer and composite with alpha a
  if (a <= 0.002) return; if (a >= 0.998) { fn(); return; }
  const cv = POOL[depth++], prev = g; g = cv.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.clearRect(0, 0, W, H);
  fn(); g = prev; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(cv, 0, 0); g.restore(); depth--;
}
const HE = '#f3d9a4', SHE = '#f7b9aa';

// ---------- timeline ----------
function even(s, e, n) { const a = []; for (let i = 0; i < n; i++) a.push(s + i * (e - s) / n); return a; }
function step(s, n, d) { const a = []; for (let i = 0; i < n; i++) a.push(s + i * d); return a; }
const CH = 4.53;
const SEC = {
  pre1: { st: [54.88, 59.18, 63.46, 68.52], txt: ['后来每个周末  都变成期待', '博物馆  音乐会  公园里的花开', '我太笨  不懂怎么把女孩宠爱', '你却一点一点  走进我心里来'] },
  c1: { st: [72.78, 77.22, 81.66, 85.86, 90.3, 94.84, 99.56, 103.98] },
  v2: { st: [109.5, 111.9, 114.16, 116.44, 118.58, 121.08, 123.22, 125.76], txt: ['你说樱花的花期  短得让人可惜', '我才忽然害怕  美好会来不及', '樱花还没落尽  我攒够所有勇气', '一束向日葵里  住着一个小王子', '在我的星球上  那朵玫瑰就是你', '你没说好  只是笑眯眯', '直到嵊泗的海边  追着夕阳跑进晚霞里', '你说就是那一刻  决定和我在一起'] },
  c2: { st: [129.28, 134.0, 138.14, 142.48, 146.94, 151.42, 156.2, 160.9] },
  v3: { st: [165.94, 168.48, 170.72, 173.02, 175.82, 180.34], txt: ['哈尔滨的冰雪里  敲响新年钟声', '内场那么近  你收到一个比心', '那年十月  我把星空投在屋顶', '我说我们的日常  就是爱情最美的风景', '我想再贪心一点  和你走完这一生', '余生都用来  爱你  陪你  支持你'] },
  pre2: { st: [184.08, 186.32, 188.88, 191.14, 193.42, 197.62], txt: ['小满那天  我们持证上岗', '小得盈满  爱逢其时  刚好的时光', '两个社恐  站在婚礼的中央', '才发现原来  幸福是这个模样', '婚后去了敦煌  鸣沙山万人合唱', '满天的星星  都替我们鼓掌'] },
  c3: { st: [201.92, 206.22, 210.68, 214.94, 219.36, 223.88, 228.66, 233.42] },
  v4: { st: [238.64, 240.94, 243.32, 245.48, 247.64, 249.92, 252.66, 254.54, 256.82, 261.84], txt: ['你说遇见我以前  周末没有早上', '是我把你喊醒  拖去展览和讲堂', '你一边喊好累  一边陪我逛', '我们的红木家  有间百万阳光房', '你窝在阳光里  像只猫晒太阳', '我总把东西乱放  你偏爱整整齐齐的模样', '我赶紧收拾好  房间亮堂堂', '夜里你轻声喊我  我起身一趟又一趟', '你总说又麻烦我了  我却偷偷在想', '哪天你什么都不叫我  我才会慌'] },
  br: { st: [267.42, 269.98, 272.56, 275.78, 281.48, 287.22, 289.08, 291.54, 295.02, 299.24, 301.54, 303.88], txt: ['你总迁就我的口味', '把爱吃的悄悄放一边', '你总替我们  把很远的以后打算', '我却常常  被日子推着往前', '你疼了就喊出来  我疼了总是笑笑', '往后的风雨  我都挡在你前面', '最近我常在厨房  你在书桌前', '饭菜的香味  飘到你身边', '明天还有好多  没写完的答案', '你别着急  也别害怕', '你也别再  那么辛苦啦', '这一次  换我来勇敢'] },
  fin: { st: [308.3, 312.24, 317.24, 321.16, 325.8, 330.32, 335.1, 339.92], txt: ['宇宙那么大  只有一个月亮', '三十二岁的你  依然闪闪发光', '勇敢的人  先享受世界', '我永远是你  靠着的肩膀', '从柴米和油盐  到未来的远方', '我们一起把日子  酿成诗行', '我的小月亮  生日快乐', '往后每一年  我都在你身旁'] },
  out: { st: [345.88, 349.88], txt: ['我是小小的宇宙', '只装得下一个月亮'] },
};
const CHORUS = ['宇宙那么大  只有一个月亮', '悄悄住在  我的心上', '勇敢的人  先享受世界', '牵着你的手  我就不再慌张', '从外滩的霓虹  到大漠的星光', '每一程风景  都因为你闪光', '我的小月亮  有你的地方', '就是我想去的  远方'];
SEC.c1.txt = SEC.c2.txt = SEC.c3.txt = CHORUS;
// rebuild lyric list (verse 1 keeps its measured times)
LYR.length = 8; [18.52, 22.92, 27.32, 32.04, 36.5, 40.92, 45.22, 50.5].forEach((v, i) => LYR[i][0] = v);
function pushSec(sec, endNull) { sec.st.forEach((s, i) => LYR.push([s, sec.txt[i]])); if (endNull) LYR.push([endNull, null]); }
pushSec(SEC.pre1); pushSec(SEC.c1, 108.96); pushSec(SEC.v2); pushSec(SEC.c2); pushSec(SEC.v3); pushSec(SEC.pre2);
pushSec(SEC.c3); pushSec(SEC.v4); pushSec(SEC.br); pushSec(SEC.fin); pushSec(SEC.out, 354.6);
LYR.sort((a, b) => a[0] - b[0]);

function li(sec, t) { let i = -1; for (let k = 0; k < sec.st.length; k++) if (t >= sec.st[k]) i = k; return i; }
const at = (sec, i, t, d = .6) => clamp((t - sec.st[i]) / d);

// ---------- helpers ----------
function T(s, x, y, size, col, a = 1, o = {}) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  g.font = `${o.w || 400} ${size}px ${FONT}`; if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.blur || 18; }
  g.fillStyle = col; g.fillText(s, x, y); g.restore();
}
function moonW(x, y, r, ill, waning, a = 1, glow = 1) {
  ill = clamp(ill, .02, 1); if (!waning) return moon(x, y, r, ill, a, glow);
  g.save(); g.translate(x, y); g.scale(-1, 1); moon(0, 0, r, ill, a, glow); g.restore();
}
function heartPath(x, y, s) {
  g.beginPath(); g.moveTo(x, y + s * .35);
  g.bezierCurveTo(x - s * 1.1, y - s * .35, x - s * .45, y - s * 1.05, x, y - s * .45);
  g.bezierCurveTo(x + s * .45, y - s * 1.05, x + s * 1.1, y - s * .35, x, y + s * .35); g.closePath();
}
function person(x, y, s, who, o = {}) {
  g.save(); g.translate(x, y); if (o.lean) g.rotate(o.lean); g.scale(s, s * (o.kneel ? .72 : 1));
  const bob = o.walk ? Math.abs(Math.sin(o.walk * Math.PI)) * -3 : 0; g.translate(0, bob);
  const col = o.col || (who === 'he' ? HE : SHE); g.fillStyle = col;
  let hy;
  if (who === 'he') {
    g.beginPath(); g.moveTo(-12, 0); g.lineTo(-8, -40); g.quadraticCurveTo(0, -46, 8, -40); g.lineTo(12, 0); g.closePath(); g.fill();
    hy = -55; if (o.kneel) g.scale(1, 1 / .72); g.beginPath(); g.arc(0, o.kneel ? -42 : hy, 11, 0, 7); g.fill(); if (o.kneel) hy = -42;
  } else {
    g.beginPath(); g.moveTo(-15, 0); g.quadraticCurveTo(-6, -20, -6, -36); g.quadraticCurveTo(0, -41, 6, -36); g.quadraticCurveTo(6, -20, 15, 0); g.closePath(); g.fill();
    hy = -49; g.beginPath(); g.arc(0, hy, 10, 0, 7); g.fill(); g.beginPath(); g.arc(6, -58, 5, 0, 7); g.fill();
    if (o.ears) { g.beginPath(); g.moveTo(-9, -54); g.lineTo(-8, -66); g.lineTo(-2, -58); g.fill(); g.beginPath(); g.moveTo(9, -54); g.lineTo(8, -66); g.lineTo(2, -58); g.fill(); }
    if (o.veil) { g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(-2, -60); g.quadraticCurveTo(-26, -30, -22, 2); g.lineTo(6, 2); g.quadraticCurveTo(-4, -30, 6, -58); g.closePath(); g.fill(); }
  }
  if (o.smile) { g.strokeStyle = 'rgba(70,40,50,.85)'; g.lineWidth = 1.6; g.lineCap = 'round';
    [-4, 4].forEach(dx => { g.beginPath(); g.arc(dx, hy + 1, 2.6, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); });
    g.fillStyle = 'rgba(240,120,120,.5)'; [-7, 7].forEach(dx => { g.beginPath(); g.arc(dx, hy + 4, 2.4, 0, 7); g.fill(); }); }
  if (o.walk) { g.strokeStyle = col; g.lineWidth = 3; g.lineCap = 'round'; const sw = Math.sin(o.walk * Math.PI) * 5; g.beginPath(); g.moveTo(-4, 0); g.lineTo(-4 - sw, 8); g.moveTo(4, 0); g.lineTo(4 + sw, 8); g.stroke(); }
  g.restore();
}
function bubble(x, y, w, h, txt, a, size = 34, col = '#3a2440', bg = 'rgba(255,244,228,.94)') {
  if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = bg; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h / 2); g.fill();
  g.beginPath(); g.moveTo(x - 14, y + h / 2 - 2); g.lineTo(x - 4, y + h / 2 + 20); g.lineTo(x + 8, y + h / 2 - 2); g.fill(); g.restore();
  T(txt, x, y + 1, size, col, a, { w: 500 });
}
function bg(top, mid, bot) { sky(top, mid, bot); }
function snow(t, a = 1, n = 160, seed = 21) { const r = rng(seed); for (let i = 0; i < n; i++) { const sp = 40 + r() * 70, x = (r() * W + Math.sin(t * .8 + i) * 30), y = ((r() * H + t * sp) % (H + 20)) - 10; g.fillStyle = `rgba(240,248,255,${a * (.4 + r() * .6)})`; g.beginPath(); g.arc(x, y, 1.5 + r() * 2.5, 0, 7); g.fill(); } }
function particlesUp(t, cx, cy, spread, n, col, a, seed = 4) { const r = rng(seed); for (let i = 0; i < n; i++) { const life = 3 + r() * 3, ph = ((t + r() * life) % life) / life; const x = cx + (r() - .5) * spread + Math.sin(t + i) * 10, y = cy - ph * 300; glowDot(x, y, 10, a * Math.sin(ph * Math.PI), col); } }
const beatPulse = t => Math.pow(1 - beatPhase(t), 4);

// =============== PRE-CHORUS 1: weekends ===============
function sPre1(t) {
  const S = SEC.pre1; bg('#070d26', '#131c46', '#272858'); stars(t + 60, 1, t * 2, H);
  moon(1600, 190, 60, .3, .9, .8);
  // calendar cards
  const ca = at(S, 0, t, .4) * clamp((S.st[1] + .6 - t) / .6);
  if (ca > 0) { for (let i = 0; i < 8; i++) { const st = S.st[0] + .2 + i * .45, k = clamp((t - st) / .5); const x = 330 + i * 180, y = 470;
      g.save(); g.globalAlpha = ca * clamp((t - st + .3) / .3); g.translate(x, y); g.scale(Math.abs(Math.cos(k * Math.PI)) * .98 + .02, 1);
      const back = k > .5; g.fillStyle = back ? 'rgba(255,226,170,.95)' : 'rgba(255,248,236,.92)'; g.beginPath(); g.roundRect(-65, -85, 130, 170, 12); g.fill();
      g.fillStyle = '#d8513e'; g.fillRect(-65, -85, 130, 34);
      if (!back) { g.fillStyle = '#3a2a40'; g.font = `600 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i % 2 ? '周日' : '周六', 0, 20); }
      else { heartPath(0, 18, 30); g.fillStyle = '#e87a8a'; g.fill(); }
      g.restore(); } }
  // constellation icons
  const ia = at(S, 1, t, .3) * clamp((S.st[2] + 1 - t) / 1);
  const shrink = ease(ramp(t, S.st[2], S.st[2] + 1.2));
  if (ia > 0 || shrink > 0) {
    const icons = [[560, 'museum'], [960, 'music'], [1360, 'flower']];
    icons.forEach(([x0, ty], k) => {
      const d = clamp((t - S.st[1] - k * 1.0) / 1.1); if (d <= 0) return;
      const x = lerp(x0, 760 + k * 200, shrink), y = lerp(470, 200 + (k % 2) * 50, shrink), sc = lerp(1, .25, shrink);
      g.save(); g.translate(x, y); g.scale(sc, sc); g.globalAlpha = Math.max(ia, shrink > 0 ? 1 : 0);
      g.strokeStyle = 'rgba(255,220,150,.8)'; g.lineWidth = 2.5; g.setLineDash([7, 7]);
      const pts = ty === 'museum' ? [[-110, -40], [0, -110], [110, -40], [-110, -40], [-110, 80], [110, 80], [110, -40]] :
        ty === 'music' ? [[-60, 70], [-60, -80], [70, -110], [70, 40], [-60, -30], [70, -60]] :
          [[0, -100], [60, -30], [95, 40], [0, 10], [-95, 40], [-60, -30], [0, -100], [0, 10], [0, 110]];
      const n = Math.floor(d * (pts.length - 1)) + 1; g.beginPath(); pts.slice(0, n + 1).forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); g.setLineDash([]);
      pts.slice(0, n + 1).forEach(p => glowDot(p[0], p[1], 22, .95));
      if (ty === 'museum') for (let c = -70; c <= 70; c += 47) { g.beginPath(); g.moveTo(c, -30); g.lineTo(c, 70); g.stroke(); }
      g.restore();
      T(['博物馆', '音乐会', '公园花开'][k], x0, 650, 30, 'rgba(255,226,170,.8)', ia * (1 - shrink));
    });
  }
  // figures
  const fa = ramp(t, S.st[2], S.st[2] + .8);
  if (fa > 0) {
    g.save(); g.globalAlpha = fa;
    const step3 = Math.floor(clamp((t - S.st[3]) / BEAT, 0, 6)); const sx = 1120 - step3 * 22 - (t > S.st[3] ? 0 : 0);
    person(800, 900, 3.2, 'he', { lean: t < S.st[3] ? Math.sin(t * 5) * .03 : 0 }); person(sx, 900, 3.0, 'she');
    // confused ?
    const qa = clamp((t - S.st[2] - .4) / .4) * clamp((S.st[3] + .3 - t) / .5);
    [[740, 640, 0], [820, 600, .5], [880, 650, 1]].forEach(([x, y, d]) => T('?', x + Math.sin(t * 3 + d) * 6, y, 56, '#ffe3a8', qa * clamp((t - S.st[2] - d) / .3), { w: 600, glow: 'rgba(255,200,120,.8)' }));
    // heart filling
    const hf = ramp(t, S.st[3], S.st[3] + 4.2);
    if (hf > 0) {
      const hx = 800, hy = 900 - 26 * 3.2, hs = 34;
      g.save(); heartPath(hx, hy, hs); g.clip(); g.fillStyle = '#f08a9a'; g.fillRect(hx - 60, hy + hs * .4 - hf * hs * 1.5, 120, 200); g.restore();
      g.strokeStyle = '#ffd1a0'; g.lineWidth = 3; heartPath(hx, hy, hs); g.stroke();
      glowDot(hx, hy - 6, 90 * hf, .5 * hf, '255,150,170');
      // dotted footsteps
      g.setLineDash([4, 10]); g.strokeStyle = 'rgba(255,190,190,.6)'; g.beginPath(); g.moveTo(1120, 930); g.lineTo(sx, 930); g.stroke(); g.setLineDash([]);
    }
    g.restore();
  }
  g.drawImage(vignette, 0, 0);
}

// =============== CHORUS (3 variants) ===============
const CITIES = [['上海', 121.47, 31.23, 40, 0], ['嵊泗', 122.45, 30.72, 40, 26], ['哈尔滨', 126.63, 45.75, 40, 0], ['重庆', 106.55, 29.56, -40, 0], ['沈阳', 123.43, 41.8, 40, 0],
['青岛', 120.38, 36.07, 40, 0], ['绍兴', 120.58, 30.0, -40, 20], ['嘉兴', 120.75, 30.75, -46, 0], ['苏州', 120.62, 31.3, -40, -22], ['张掖', 100.45, 38.93, 0, -36], ['敦煌', 94.66, 40.14, 0, -36]];
const proj = (lon, lat) => [260 + (lon - 92) * 37, 900 - (lat - 27) * 36];
function travelMap(t, u, n, a = 1) {
  const reveal = clamp(u / 3.2) * n;
  g.save(); g.globalAlpha = a;
  for (let i = 1; i < n; i++) { const k = clamp(reveal - i + 1); if (k <= 0) continue; const [x1, y1] = proj(CITIES[i - 1][1], CITIES[i - 1][2]), [x2, y2] = proj(CITIES[i][1], CITIES[i][2]);
    g.strokeStyle = 'rgba(255,220,150,.55)'; g.lineWidth = 2; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(x1, y1);
    const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 60; g.quadraticCurveTo(mx, my, lerp(x1, x2, k), lerp(y1, y2, k)); g.stroke(); g.setLineDash([]); }
  for (let i = 0; i < n; i++) { const k = clamp(reveal - i + .6); if (k <= 0) continue; const [x, y] = proj(CITIES[i][1], CITIES[i][2]);
    glowDot(x, y, 34 * k, k); T(CITIES[i][0], x + CITIES[i][3], y + CITIES[i][4], 24, 'rgba(255,232,190,.95)', k, { align: CITIES[i][3] < 0 ? 'right' : CITIES[i][3] > 0 ? 'left' : 'center' }); }
  if (n === 1) { const k = clamp(u / 2); g.setLineDash([6, 10]); g.strokeStyle = `rgba(255,220,150,${.4 * k})`; g.beginPath(); const [x, y] = proj(121.47, 31.23); g.moveTo(x, y); g.quadraticCurveTo(x - 200, y - 300, x - 520 * k, y - 220 * k); g.stroke(); g.setLineDash([]);
    T('下一站 · 未完待续', x - 540, y - 250, 26, 'rgba(255,226,170,.7)', k); }
  g.restore();
}
function globe(t, cx, cy, R, col = '255,220,150') {
  const gr = g.createRadialGradient(cx - R * .3, cy - R * .3, R * .1, cx, cy, R); gr.addColorStop(0, 'rgba(60,80,150,.95)'); gr.addColorStop(1, 'rgba(18,24,60,.95)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); g.strokeStyle = `rgba(${col},.4)`; g.lineWidth = 1.6;
  for (let k = -3; k <= 3; k++) { const y = cy + k * R / 4; const rr = Math.sqrt(R * R - (k * R / 4) ** 2); g.beginPath(); g.ellipse(cx, y, rr, rr * .12, 0, 0, 7); g.stroke(); }
  for (let k = 0; k < 8; k++) { const ph = (t * .25 + k / 8 * Math.PI) % Math.PI; const rx = Math.abs(Math.cos(ph)) * R; g.beginPath(); g.ellipse(cx, cy, rx, R, 0, 0, 7); g.stroke(); }
  g.restore(); g.strokeStyle = `rgba(${col},.85)`; g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke();
}
function road(t, u, moonIll, waning, pal, walkers = true) {
  bg(pal[0], pal[1], pal[2]); stars(t + 90, 1, 0, 600);
  moonW(960, 470, 120, moonIll, waning, 1, 1.6);
  g.fillStyle = 'rgba(8,10,26,.95)'; g.fillRect(0, 620, W, H);
  g.fillStyle = 'rgba(40,36,70,.9)'; g.beginPath(); g.moveTo(560, H); g.lineTo(950, 620); g.lineTo(970, 620); g.lineTo(1360, H); g.fill();
  g.strokeStyle = 'rgba(255,210,140,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(560, H); g.lineTo(950, 620); g.moveTo(1360, H); g.lineTo(970, 620); g.stroke();
  for (let k = 0; k < 14; k++) { const z = ((k / 14 + u * .12) % 1); const p = Math.pow(z, 2.2); const y = 620 + p * 460, w = 2 + p * 10, h = 4 + p * 40; g.fillStyle = `rgba(255,220,150,${.3 + p * .5})`; g.fillRect(960 - w / 2, y, w, h); }
  if (walkers) { const z = clamp(u / 6); const sc = lerp(2.4, 1.1, z), y = lerp(1000, 820, z); person(940 - 14 * sc, y, sc, 'he', { walk: u * 2 }); person(940 + 16 * sc, y, sc * .93, 'she', { walk: u * 2 + .5 }); handLink(940 - 5 * sc, y - 30 * sc, 940 + 8 * sc, y - 29 * sc); }
}
function chorusShot(k, t, u, V) {
  const P = V.pal;
  if (k === 0) { // galaxy + one moon
    bg('#03040f', P[0], P[1]); const zoom = lerp(1.5, 1, ease(clamp(u / 4.5)));
    g.save(); g.translate(960, 520); g.scale(zoom, zoom); const r = rng(42);
    for (let i = 0; i < 900; i++) { const arm = i % 3, d = Math.pow(r(), .7) * 760, ang = arm * 2.094 + d * .006 + t * .05 + (r() - .5) * .5; const x = Math.cos(ang) * d, y = Math.sin(ang) * d * .45;
      g.fillStyle = `rgba(${V.tint},${(.25 + r() * .6) * (1 - d / 900)})`; g.fillRect(x, y, 2 + r() * 1.8, 2 + r() * 1.8); }
    g.restore(); stars(t, .8, 0, H); moonW(960, 520, 70, V.ill, V.waning, 1, 1.8 + beatPulse(t) * .5);
  } else if (k === 1) { // moon into his heart
    bg(P[0], P[1], P[2]); stars(t + 10, 1, 0, H);
    person(960, 1150, 7.5, 'he'); const m = ease(clamp(u / 2.6)); const hy = 1150 - 28 * 7.5;
    moonW(lerp(1300, 960, m), lerp(200, hy, m), lerp(90, 46, m), V.ill, V.waning, 1, 1);
    const ha = ramp(u, 2.2, 3); if (ha > 0) { g.strokeStyle = `rgba(255,190,190,${ha})`; g.lineWidth = 5; heartPath(960, hy + 6, 95); g.stroke(); glowDot(960, hy, 260, .35 * ha, '255,160,180'); }
  } else if (k === 2) { // brave people enjoy the world first
    bg(P[0], P[1], P[2]); stars(t + 20, 1, 0, H); globe(t, 960, 1060, 520, V.tint);
    person(925, 545, 2.2, 'he'); person(990, 545, 2.05, 'she'); handLink(940, 482, 975, 485);
    T('勇敢的人先享受世界', 960, 250, 34, 'rgba(255,230,180,.75)', ramp(u, .6, 1.6), { glow: 'rgba(255,200,120,.6)' });
    T('—— 我们常挂在嘴边的话', 960, 300, 22, 'rgba(255,230,180,.5)', ramp(u, 1.2, 2.2));
  } else if (k === 3) { // hand in hand, no more panic
    bg(P[0], P[1], P[2]); stars(t + 30, 1, 0, H); moonW(1560, 220, 70, V.ill, V.waning);
    person(870, 980, 4.2, 'he'); person(1040, 980, 3.9, 'she'); handLink(900, 980 - 27 * 4.2, 1005, 980 - 24 * 4.2);
    glowDot(955, 980 - 22 * 4.2, 160, .45 + .2 * beatPulse(t), '255,200,150');
    const pop = clamp((u - 1.6) / .5); const ba = clamp(u / .3) * (1 - pop);
    bubble(840, 640, 150, 70, '……', ba, 40);
    if (pop > 0 && pop < 1) { const r = rng(8); for (let i = 0; i < 14; i++) { const a = r() * 6.28, d = pop * 120; glowDot(840 + Math.cos(a) * d, 640 + Math.sin(a) * d, 14, 1 - pop); } }
  } else if (k === 4) { // Bund neon to desert stars
    const pan = ease(clamp((u - .6) / 3.4)) * W;
    const sk = g.createLinearGradient(0, 0, W, 0); sk.addColorStop(0, '#0a1030'); sk.addColorStop(1, '#1c1430'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.save(); g.translate(-pan, 0); stars(t + 40, 1, 0, 700); g.translate(pan, 0); g.restore();
    g.save(); g.translate(-pan, 0);
    g.fillStyle = '#121640'; g.fillRect(0, 700, W + 200, 400); lujiazui(200, 700, Array(12).fill(1), t);
    // neon glow
    glowDot(900, 500, 420, .25, '255,120,200');
    // desert (to the right)
    const r = rng(15); for (let i = 0; i < 500; i++) { const x = W + r() * W, y = r() * 650, s = r() * 2 + .4; g.fillStyle = `rgba(255,240,210,${.3 + r() * .7})`; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); }
    // milky way band
    for (let i = 0; i < 700; i++) { const p = r(), x = W + p * W, y = 560 - p * 420 + (r() - .5) * 140 * (1 - Math.abs(p - .5)); g.fillStyle = `rgba(230,215,255,${r() * .35})`; g.fillRect(x, y, 2, 2); }
    [[700, '#3a2a2a'], [800, '#2a1e22'], [900, '#1a1218']].forEach(([y, c], j) => { g.fillStyle = c; g.beginPath(); g.moveTo(W - 100, H); for (let x = W - 100; x <= 2 * W + 100; x += 40) g.lineTo(x, y + Math.sin(x * .004 + j * 2) * 60 + Math.sin(x * .011) * 20); g.lineTo(2 * W + 100, H); g.fill(); });
    person(W + 980, 830, 1.6, 'he'); person(W + 1022, 830, 1.5, 'she');
    g.restore();
  } else if (k === 5) { // travel map
    bg(P[0], P[1], P[2]); stars(t + 50, .7, 0, H); travelMap(t, u, V.cities);
    T(V.mapNote, 960, 140, 28, 'rgba(255,226,170,.8)', ramp(u, .3, 1.2));
  } else if (k === 6) { // my little moon = her
    bg(P[0], P[1], P[2]); stars(t + 60, 1, 0, H);
    glowDot(960, 760, 420, .3, '255,170,180'); person(960, 1000, 5.2, 'she', { smile: true });
    const a = t * 1.1; moonW(960 + Math.cos(a) * 170, 690 + Math.sin(a) * 50, 40, V.ill, V.waning, 1, 1);
  } else { road(t, u, V.ill, V.waning, P); }
}
function sChorus(t, S, V) {
  const i = Math.max(0, li(S, t)), k = Math.min(i, 7), u = t - S.st[k];
  const prev = k > 0 && u < .5;
  if (prev) chorusShot(k - 1, t, t - S.st[k - 1], V);
  layer(() => { chorusShot(k, t, u, V); if (k !== 5) g.drawImage(vignette, 0, 0); }, prev ? ease(u / .5) : 1);
  stamp(t, ramp(t, S.st[0], S.st[0] + 1) * clamp((S.st[1] - t) / .5), V.stamp, V.stamp2);
}
const V1 = { pal: ['#070d26', '#141f4a', '#2a2a5a'], ill: .21, waning: false, tint: '255,225,170', cities: 1, mapNote: '2023 · 故事从上海开始', stamp: '副歌 · 一弯小月亮', stamp2: '2023 年初的月亮：21%' };
const V2 = { pal: ['#1a1035', '#43204f', '#7a4058'], ill: .84, waning: false, tint: '255,190,200', cities: 2, mapNote: '2023.05 · 第一次一起出发：嵊泗', stamp: '月亮长大了一点', stamp2: '嵊泗那晚的月亮：84%' };
const V3 = { pal: ['#0b0a22', '#2a2040', '#5a4030'], ill: .45, waning: true, tint: '255,215,160', cities: 11, mapNote: '一起走过的地方', stamp: '大漠的月亮', stamp2: '敦煌那晚的月亮：下弦 45%' };

// =============== VERSE 2: cherry / sunflower / Shengsi ===============
function cherryBranch(t, a) {
  g.save(); g.globalAlpha = a; g.strokeStyle = '#4a2f3a'; g.lineCap = 'round';
  const br = [[[0, 160], [420, 260], [760, 210], 18], [[300, 230], [420, 120], [560, 90], 9], [[520, 240], [640, 340], [800, 360], 8], [[160, 190], [230, 330], [330, 380], 7]];
  br.forEach(([a0, c, e, w]) => { g.lineWidth = w; g.beginPath(); g.moveTo(...a0); g.quadraticCurveTo(...c, ...e); g.stroke(); });
  const r = rng(31); for (let i = 0; i < 46; i++) { const b = br[i % 4], k = .2 + r() * .8; const x = (1 - k) ** 2 * b[0][0] + 2 * (1 - k) * k * b[1][0] + k * k * b[2][0] + (r() - .5) * 40, y = (1 - k) ** 2 * b[0][1] + 2 * (1 - k) * k * b[1][1] + k * k * b[2][1] + (r() - .5) * 40;
    g.fillStyle = `rgba(255,${190 + r() * 30 | 0},${205 + r() * 20 | 0},.95)`; for (let p = 0; p < 5; p++) { const an = p * 1.257 + i; g.beginPath(); g.ellipse(x + Math.cos(an) * 7, y + Math.sin(an) * 7, 7, 4.5, an, 0, 7); g.fill(); }
    g.fillStyle = '#f0a0b0'; g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); }
  g.restore();
}
function petals(t, n, speed, a, seed = 7) { const r = rng(seed); for (let i = 0; i < n; i++) { const sp = (50 + r() * 60) * speed, x = (r() * W * 1.2 + t * sp * .6) % (W + 100) - 50, y = (r() * H + t * sp) % (H + 40) - 20, an = t * 2 + i;
    g.save(); g.translate(x, y); g.rotate(an); g.fillStyle = `rgba(255,200,215,${a * (.5 + r() * .5)})`; g.beginPath(); g.ellipse(0, 0, 7, 4, 0, 0, 7); g.fill(); g.restore(); } }
function sCherry(t) {
  const S = SEC.v2; bg('#1a1840', '#3b2c5c', '#6a4a72'); stars(t + 70, .6, 0, 700); moon(1620, 200, 56, .13, .9);
  cherryBranch(t, 1); petals(t, t > S.st[1] ? 110 : 60, t > S.st[1] ? 1.6 : 1, 1);
  const fa = ramp(t, S.st[2] - .2, S.st[2] + .5);
  if (fa > 0) { g.save(); g.globalAlpha = fa; g.fillStyle = 'rgba(10,10,30,.6)'; g.fillRect(0, 900, W, 200);
    person(960, 920, 3.6, 'he'); const c = ramp(t, S.st[2], S.st[3]); const r = rng(12);
    for (let i = 0; i < 16; i++) { const a = r() * 6.28, d0 = 500 + r() * 300, k = clamp(c * 1.6 - i / 16 * .6); const d = d0 * (1 - ease(k)); if (k < 1) glowDot(960 + Math.cos(a) * d, 830 + Math.sin(a) * d * .6, 20, .9); }
    glowDot(960, 920 - 28 * 3.6, 150 * c, .7 * c); g.restore(); }
  stamp(t, ramp(t, S.st[0], S.st[0] + 1), '2023.03 · 樱花季', '她说：樱花的花期太短了');
  g.drawImage(vignette, 0, 0);
}
function rose(x, y, s, a = 1) { g.save(); g.globalAlpha = a; g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#6fbf8a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(4, 25, 0, 50); g.stroke();
  g.fillStyle = '#6fbf8a'; g.beginPath(); g.ellipse(8, 28, 9, 4, -.5, 0, 7); g.fill();
  g.fillStyle = '#e8667a'; g.beginPath(); g.arc(0, -6, 15, 0, 7); g.fill(); g.strokeStyle = '#ffb3bf'; g.lineWidth = 2;
  g.beginPath(); for (let k = 0; k < 30; k++) { const an = k * .5, r = 2 + k * .4; g.lineTo(Math.cos(an) * r, -6 + Math.sin(an) * r); } g.stroke(); g.restore(); }
function sunflower(cx, cy, R, t) {
  for (let p = 0; p < 24; p++) { const an = p / 24 * 6.283 + Math.sin(t * .8) * .02; g.save(); g.translate(cx, cy); g.rotate(an); g.fillStyle = p % 2 ? '#ffc93c' : '#ffb52e'; g.beginPath(); g.ellipse(R * 1.35, 0, R * .5, R * .17, 0, 0, 7); g.fill(); g.restore(); }
  g.fillStyle = '#5a3520'; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill();
  g.fillStyle = 'rgba(255,200,120,.35)'; for (let i = 0; i < 260; i++) { const an = i * 2.39996, rr = Math.sqrt(i / 260) * R * .95; g.beginPath(); g.arc(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 2.2, 0, 7); g.fill(); }
}
function sSunflower(t) {
  const S = SEC.v2; bg('#0c1233', '#1b2350', '#2e2f60'); stars(t + 80, 1, 0, H);
  const herShot = ramp(t, S.st[5] - .3, S.st[5] + .3);
  if (herShot < 1) layer(() => {
    // stems
    g.strokeStyle = '#4f9a6a'; g.lineWidth = 10; [[-90, 0], [0, 0], [90, 0]].forEach(([dx]) => { g.beginPath(); g.moveTo(760 + dx * .3, 1100); g.quadraticCurveTo(760 + dx, 900, 760 + dx * 2.2, 700); g.stroke(); });
    sunflower(560, 620, 70, t); sunflower(960, 650, 70, t + 1);
    sunflower(760, 480, 170, t);
    // tiny planet in the heart of the main sunflower
    const pa = ramp(t, S.st[3], S.st[3] + .8); const px = 760, py = 500;
    if (pa > 0) { g.save(); g.globalAlpha = pa; glowDot(px, py, 160, .35); g.fillStyle = '#3d4a8a'; g.beginPath(); g.arc(px, py + 30, 72, 0, 7); g.fill(); g.strokeStyle = '#ffd08a'; g.lineWidth = 3; g.stroke();
      g.strokeStyle = 'rgba(255,208,138,.4)'; g.beginPath(); g.ellipse(px, py + 30, 110, 22, -.2, 0, 7); g.stroke();
      person(px - 20, py - 40, 1.05, 'he'); g.restore();
      rose(px + 28, py - 62, .9, ramp(t, S.st[4], S.st[4] + .8)); }
    // card
    const ca = ramp(t, S.st[4], S.st[4] + .6);
    if (ca > 0) { g.save(); g.globalAlpha = ca; g.translate(1390, 540); g.rotate(.04); g.fillStyle = 'rgba(255,248,236,.96)'; g.beginPath(); g.roundRect(-250, -150, 500, 300, 10); g.fill(); g.restore();
      const lines = ['于我而言', '你就是那一朵', '独一无二的玫瑰'];
      lines.forEach((s, j) => T(s, 1390, 470 + j * 62, 40, '#5a3040', ca * clamp((t - S.st[4] - .3 - j * .5) / .5), { w: 500 })); }
    stamp(t, ramp(t, S.st[3], S.st[3] + 1), '2023.03.25 · 表白', '一束向日葵永生花，里面住着一个小王子');
  }, 1 - herShot);
  if (herShot > 0) layer(() => { bg('#20173e', '#3a2550', '#5a3560'); stars(t, .8, 0, H); glowDot(960, 760, 380, .35, '255,180,190');
    person(960, 1000, 5.2, 'she', { smile: true }); sunflower(1110, 760, 26, t);
    T('♪', 1150, 520, 60, '#ffe3a8', clamp((t - S.st[5] - .4) / .4), { glow: 'rgba(255,200,120,.8)' });
    T('她没说好，也没有拒绝', 960, 140, 28, 'rgba(255,226,170,.75)', ramp(t, S.st[5], S.st[5] + 1)); }, herShot);
  g.drawImage(vignette, 0, 0);
}
function sunsetSea(t, sunY, fig) {
  const s = g.createLinearGradient(0, 0, 0, 640); s.addColorStop(0, '#3a2460'); s.addColorStop(.45, '#c0587a'); s.addColorStop(.8, '#f59a62'); s.addColorStop(1, '#ffc56e'); g.fillStyle = s; g.fillRect(0, 0, W, 640);
  stars(t, .3, 0, 250); moon(1560, 170, 46, .84, .7, .5);
  glowDot(1200, sunY, 380, .5, '255,190,110'); g.fillStyle = '#ffdf9a'; g.beginPath(); g.arc(1200, sunY, 90, 0, 7); g.fill();
  const sea = g.createLinearGradient(0, 640, 0, 880); sea.addColorStop(0, '#d0707a'); sea.addColorStop(1, '#4a2d5c'); g.fillStyle = sea; g.fillRect(0, 640, W, 260);
  for (let k = 0; k < 16; k++) { const w = 220 - k * 10; g.fillStyle = `rgba(255,220,150,${.5 - k * .028})`; g.fillRect(1200 - w / 2 + Math.sin(t * 2 + k) * 14, 650 + k * 14, w, 4); }
  g.fillStyle = '#e8b48a'; g.beginPath(); g.moveTo(0, 880); for (let x = 0; x <= W; x += 60) g.lineTo(x, 880 + Math.sin(x * .004 + t) * 6); g.lineTo(W, H); g.lineTo(0, H); g.fill();
  g.strokeStyle = 'rgba(255,250,240,.7)'; g.lineWidth = 3; g.beginPath(); for (let x = 0; x <= W; x += 30) g.lineTo(x, 880 + Math.sin(x * .01 + t * 2) * 5); g.stroke();
}
function sShengsi(t) {
  const S = SEC.v2, run = t < S.st[7]; const x = run ? lerp(300, 900, ease(ramp(t, S.st[6] - .5, S.st[7]))) : 900;
  sunsetSea(t, lerp(560, 640, ramp(t, S.st[6], S.st[7] + 2.4)));
  const col = { he: '#5a2e40', she: '#7a3a4a' };
  person(x, 960, 2.8, 'he', { walk: run ? t * 4 : 0, col: col.he }); person(x + 80, 960, 2.6, 'she', { walk: run ? t * 4 + .5 : 0, col: col.she, smile: !run });
  if (!run) handLink(x + 18, 960 - 27 * 2.8, x + 60, 960 - 25 * 2.6, ramp(t, S.st[7], S.st[7] + .5));
  const ha = ramp(t, S.st[7] + .5, S.st[7] + 1.2); if (ha > 0) { g.fillStyle = `rgba(255,120,140,${ha})`; heartPath(x + 40, 740 - ha * 20, 30); g.fill(); }
  stamp(t, ramp(t, S.st[6], S.st[6] + 1), '2023.05.01 · 嵊泗', '她说：就是追夕阳的那一刻');
}

// =============== VERSE 3: Harbin / concert / proposal ===============
function sHarbin(t) {
  const S = SEC.v3, u = t - S.st[0]; bg('#06122c', '#0f2a50', '#1d4870'); stars(t, .8, 0, 500);
  const r = rng(51); for (let i = 0; i < 4; i++) { const st = .8 + i * .7, k = clamp((u - st) / 1.2); if (k <= 0 || k >= 1) continue; const cx = 300 + r() * 1300, cy = 150 + r() * 250;
    for (let j = 0; j < 24; j++) { const an = j / 24 * 6.28; glowDot(cx + Math.cos(an) * k * 160, cy + Math.sin(an) * k * 160 + k * k * 40, 12, 1 - k, i % 2 ? '255,200,230' : '200,230,255'); } }
  // ice castle
  const towers = [[200, 160, 300], [380, 120, 420], [560, 200, 260], [780, 140, 520], [960, 220, 380], [1180, 140, 540], [1360, 200, 300], [1560, 130, 440], [1720, 170, 280]];
  towers.forEach(([x, w, h], i) => { const y = 960 - h; g.fillStyle = `rgba(${120 + i * 6},${200 + (i % 3) * 15},255,.28)`; g.strokeStyle = 'rgba(190,235,255,.85)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x - w / 2, 960); g.lineTo(x - w / 2, y); for (let k = 0; k < 5; k++) { const xx = x - w / 2 + k * w / 5; g.lineTo(xx, y - 14); g.lineTo(xx + w / 10, y - 14); g.lineTo(xx + w / 10, y); g.lineTo(xx + w / 5, y); }
    g.lineTo(x + w / 2, 960); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - w * .3, y - 14); g.lineTo(x, y - 14 - w * .7); g.lineTo(x + w * .3, y - 14); g.fill(); g.stroke(); });
  // bell
  const sw = Math.sin(u * 4.2) * .25 * clamp(u / .5); g.save(); g.translate(960, 230); g.rotate(sw);
  g.fillStyle = '#ffd27a'; g.strokeStyle = '#fff0c0'; g.lineWidth = 3; g.beginPath(); g.moveTo(-60, 120); g.quadraticCurveTo(-55, 10, 0, 0); g.quadraticCurveTo(55, 10, 60, 120); g.lineTo(75, 140); g.lineTo(-75, 140); g.closePath(); g.fill(); g.stroke(); g.restore();
  for (let k = 0; k < 3; k++) { const p = ((u - .3) * .9 - k * .33); if (p <= 0 || p > 1) continue; g.strokeStyle = `rgba(255,230,170,${(1 - p) * .7})`; g.lineWidth = 3; g.beginPath(); g.arc(960, 330, p * 600, 0, 7); g.stroke(); }
  g.fillStyle = '#0a1a36'; g.fillRect(0, 960, W, 120); person(900, 990, 2, 'he'); person(950, 990, 1.85, 'she');
  snow(t, .9); stamp(t, ramp(u, 0, 1), '2023.12.31 · 哈尔滨 · 冰雪大世界', '一起敲响新年的钟声');
}
function sConcert(t) {
  const S = SEC.v3, u = t - S.st[1]; bg('#06040e', '#120a24', '#1e1030');
  for (let k = 0; k < 5; k++) { const an = -.7 + k * .35 + Math.sin(t * .8 + k) * .12; g.save(); g.translate(960, 120); g.rotate(an); const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, `rgba(${k % 2 ? '255,160,220' : '170,180,255'},.35)`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(-10, 0); g.lineTo(-140, 900); g.lineTo(140, 900); g.lineTo(10, 0); g.fill(); g.restore(); }
  g.fillStyle = '#2a1a3a'; g.fillRect(560, 300, 800, 26); glowDot(960, 260, 120, .9, '255,230,255'); person(960, 300, 1.4, 'she', { col: '#fff0f6' });
  const r = rng(61); for (let i = 0; i < 900; i++) { const x = r() * W, y = 520 + Math.pow(r(), .8) * 560, ph = r() * 6.28; const sway = Math.sin(t * 3 + ph + x * .01) * 6;
    g.fillStyle = ['rgba(255,140,200,.9)', 'rgba(140,200,255,.9)', 'rgba(255,240,180,.9)'][i % 3]; g.beginPath(); g.arc(x + sway, y, 2.2 + (y - 520) / 300, 0, 7); g.fill(); }
  g.fillStyle = 'rgba(8,6,16,.9)'; g.beginPath(); g.ellipse(960, 1150, 1200, 230, 0, 0, 7); g.fill();
  person(880, 1040, 3, 'he'); person(1010, 1040, 2.8, 'she', { smile: u > 1.9 });
  const k = ease(clamp((u - .5) / 1.4)); if (k > 0) { const x = lerp(960, 1010, k), y = lerp(290, 860, k) - Math.sin(k * Math.PI) * 120; g.fillStyle = '#ff7f9c'; g.shadowColor = '#ff9fb5'; g.shadowBlur = 30; heartPath(x, y, lerp(22, 46, k)); g.fill(); g.shadowBlur = 0; }
  stamp(t, ramp(u, 0, .8), '2024.10.13 · 张韶涵演唱会 · 内场', '她给了你一个比心');
}
function sProposal(t) {
  const S = SEC.v3, u = t - S.st[2]; bg('#0a0a1e', '#14142e', '#1c1a38');
  const sp = ease(clamp(u / 2)); const r = rng(71);
  for (let i = 0; i < 520; i++) { const x = r() * W, y = r() * 780, d = Math.hypot(x - 1460, y - 860) / 1500; if (d > sp) continue; const tw = .4 + .6 * Math.sin(t * (1 + r() * 2) + i) ** 2; g.fillStyle = `rgba(${200 + r() * 55 | 0},${200 + r() * 40 | 0},255,${tw})`; g.beginPath(); g.arc(x, y, r() * 2 + .6, 0, 7); g.fill(); }
  g.strokeStyle = 'rgba(255,220,160,.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 780); g.lineTo(W, 780); g.stroke();
  g.fillStyle = '#100e22'; g.fillRect(0, 780, W, 300);
  const pg = g.createLinearGradient(1460, 860, 1100, 300); pg.addColorStop(0, 'rgba(160,170,255,.35)'); pg.addColorStop(1, 'rgba(160,170,255,0)'); g.fillStyle = pg; g.beginPath(); g.moveTo(1440, 860); g.lineTo(700, 0); g.lineTo(1800, 0); g.lineTo(1480, 860); g.fill();
  g.fillStyle = '#8a90d0'; g.beginPath(); g.arc(1460, 870, 30, Math.PI, 0); g.fill();
  const kneel = t >= SEC.v3.st[4];
  person(kneel ? 870 : 860, 960, 3.4, 'he', { kneel }); person(1060, 960, 3.2, 'she', { smile: kneel });
  if (kneel) { const b = ramp(t, S.st[4], S.st[4] + .6); g.save(); g.globalAlpha = b; [[960, 840, '#ff9fb5'], [985, 825, '#ffd27a'], [972, 815, '#fff'], [995, 845, '#ff9fb5']].forEach(([x, y, c]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); }); g.restore(); }
  const ca = ramp(t, S.st[3], S.st[3] + .5); if (ca > 0) { const n = Math.round(lerp(1, 625, ease(clamp((t - S.st[3]) / 2.4)))); T(`在一起的第 ${n} 天`, 960, 180, 54, '#fff0d0', ca, { glow: 'rgba(255,210,140,.8)', w: 500 }); }
  const ra = ramp(t, S.st[5], S.st[5] + 1.2); if (ra > 0) { for (let i = 0; i < 40; i++) { const an = i / 40 * 6.28 + t * .2; glowDot(965 + Math.cos(an) * 300, 820 + Math.sin(an) * 150, 14, ra * .9); }
    ['爱你', '陪你', '支持你'].forEach((s, j) => T(s, 660 + j * 300, 330, 44, '#ffe7b8', clamp((t - S.st[5] - j * .6) / .5), { glow: 'rgba(255,200,120,.9)' })); }
  stamp(t, ramp(u, 0, .8), '2024.10.12 · 求婚', '我把家里变成了星空');
}

// =============== PRE-CHORUS 2: Xiaoman / wedding / Dunhuang ===============
function booklet(x, y, a, rot) { g.save(); g.globalAlpha = a; g.translate(x, y); g.rotate(rot); g.fillStyle = '#c8323a'; g.beginPath(); g.roundRect(-110, -150, 220, 300, 10); g.fill(); g.strokeStyle = '#ffd27a'; g.lineWidth = 2; g.strokeRect(-96, -136, 192, 272);
  g.beginPath(); g.arc(0, -40, 40, 0, 7); g.stroke(); for (let k = 0; k < 5; k++) { const an = -Math.PI / 2 + k * 1.2566; g.fillStyle = '#ffd27a'; g.beginPath(); g.arc(Math.cos(an) * 18, -40 + Math.sin(an) * 18, 4, 0, 7); g.fill(); }
  g.fillStyle = '#ffd27a'; g.font = `600 38px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('结婚证', 0, 60); g.restore(); }
function wheat(x, y, h, fill, t) { g.strokeStyle = '#d9b26a'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.sin(t + x) * 10, y - h / 2, x + Math.sin(t * .8 + x) * 16, y - h); g.stroke();
  const tx = x + Math.sin(t * .8 + x) * 16, ty = y - h; for (let k = 0; k < 7; k++) { const s = (3 + 5 * fill); g.fillStyle = `rgba(240,200,110,${.5 + .5 * fill})`; g.beginPath(); g.ellipse(tx - 7, ty + k * 13, s, s * 1.7, -.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(tx + 7, ty + k * 13, s, s * 1.7, .4, 0, 7); g.fill(); } }
function sXiaoman(t) {
  const S = SEC.pre2, u = t - S.st[0]; bg('#1a1230', '#3a2440', '#5a3a3a'); stars(t, .7, 0, 600); moonW(1620, 190, 60, .38, true);
  const fill = ramp(t, S.st[1], S.st[2]);
  for (let i = 0; i < 26; i++) wheat(60 + i * 72, 1080, 220 + (i % 3) * 40 + fill * 40, fill, t);
  const op = ease(clamp(u / 1.2)); booklet(960 - 130 * op, 500, 1, -.08 * op); booklet(960 + 130 * op, 500, 1, .08 * op);
  const sa = clamp((u - 1.4) / .25); if (sa > 0) { const sc = lerp(1.8, 1, ease(sa)); g.save(); g.translate(1130, 610); g.rotate(-.2); g.scale(sc, sc); g.globalAlpha = sa * .9; g.strokeStyle = '#ff5a5a'; g.lineWidth = 5; g.beginPath(); g.roundRect(-110, -44, 220, 88, 14); g.stroke(); g.fillStyle = '#ff5a5a'; g.font = `700 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('持证上岗', 0, 2); g.restore(); }
  T('小得盈满 · 爱逢其时', 960, 200, 44, '#ffe7b8', ramp(t, S.st[1], S.st[1] + .8), { glow: 'rgba(255,200,120,.8)' });
  stamp(t, ramp(u, 0, .8), '2025.05.21 · 小满 · 领证', '那天的月亮：下弦 38%');
}
function sWedding(t) {
  const S = SEC.pre2, u = t - S.st[2]; bg('#120c22', '#22163a', '#30204a');
  const warm = ramp(t, S.st[3], S.st[3] + 1.5);
  const sg = g.createLinearGradient(960, 0, 960, 1000); sg.addColorStop(0, `rgba(255,230,190,${.35 + .2 * warm})`); sg.addColorStop(1, 'rgba(255,230,190,0)'); g.fillStyle = sg; g.beginPath(); g.moveTo(900, 0); g.lineTo(1020, 0); g.lineTo(1300, 1000); g.lineTo(620, 1000); g.fill();
  // arch
  g.strokeStyle = 'rgba(255,215,150,.8)'; g.lineWidth = 4; g.beginPath(); g.arc(960, 700, 320, Math.PI, 0); g.stroke();
  const r = rng(81); for (let i = 0; i < 40; i++) { const an = Math.PI + i / 39 * Math.PI; g.fillStyle = ['#ffb3c1', '#fff2d8', '#ffd27a'][i % 3]; g.beginPath(); g.arc(960 + Math.cos(an) * 320, 700 + Math.sin(an) * 320, 10 + r() * 6, 0, 7); g.fill(); }
  g.fillStyle = '#1a1028'; g.fillRect(0, 900, W, 200);
  for (let row = 0; row < 3; row++) for (let i = 0; i < 16; i++) { if (i > 6 && i < 9) continue; g.fillStyle = `rgba(60,40,80,${.9 - row * .2})`; g.beginPath(); g.arc(120 + i * 112, 1000 + row * 40, 18, Math.PI, 0); g.fill(); }
  const nerv = 1 - ramp(u, 1, 2.2); const sh = Math.sin(t * 40) * 2 * nerv;
  person(905 + sh, 900, 3.4, 'he'); person(1015 - sh, 900, 3.2, 'she', { veil: true, smile: warm > .3 }); handLink(925, 900 - 27 * 3.4, 990, 900 - 24 * 3.2, warm);
  if (nerv > .05) { T('社恐 ×2', 960, 470, 30, 'rgba(255,226,170,.8)', nerv * clamp(u / .4)); g.fillStyle = `rgba(190,227,255,${nerv})`; g.beginPath(); g.ellipse(940, 680, 6, 9, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(1050, 690, 6, 9, 0, 0, 7); g.fill(); }
  if (warm > 0) { const r2 = rng(83); for (let i = 0; i < 90; i++) { const x = r2() * W, y = (r2() * 1200 + (t - S.st[3]) * (60 + r2() * 80)) % 1150 - 60; g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.fillStyle = `rgba(${['255,180,195', '255,242,216', '255,210,122'][i % 3]},${warm * .9})`; g.fillRect(-5, -3, 10, 6); g.restore(); }
    glowDot(960, 770, 300, .35 * warm, '255,200,170'); }
  stamp(t, ramp(u, 0, .8), '2025.05.25 · 婚礼', '两个社恐，站在了正中央');
}
function sDunhuang(t) {
  const S = SEC.pre2, u = t - S.st[4]; bg('#050616', '#121236', '#2a2040');
  const r = rng(91); const clap = t > S.st[5] ? beatPulse(t) : 0;
  for (let i = 0; i < 1300; i++) { const p = r(), x = p * W, y = 620 - p * 520 + (r() - .5) * 220 * (1 - Math.abs(p - .5)); g.fillStyle = `rgba(225,210,255,${r() * .4})`; g.fillRect(x, y, 2, 2); }
  for (let i = 0; i < 260; i++) { const x = r() * W, y = r() * 650, s = r() * 1.8 + .4; const a = .4 + .5 * Math.sin(t * 2 + i) ** 2 + clap * .6 * (i % 2); g.fillStyle = `rgba(255,240,210,${Math.min(1, a)})`; g.beginPath(); g.arc(x, y, s * (1 + clap * .8 * (i % 2)), 0, 7); g.fill(); }
  moonW(1650, 160, 50, .45, true, .9);
  [[720, '#5a4030'], [820, '#3e2c24'], [930, '#241a18']].forEach(([y, c], j) => { g.fillStyle = c; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 30) g.lineTo(x, y + Math.sin(x * .003 + j * 1.7) * 90 + Math.sin(x * .009 + j) * 20); g.lineTo(W, H); g.fill();
    if (j < 2) for (let i = 0; i < 380; i++) { const x = r() * W, yy = y + Math.sin(x * .003 + j * 1.7) * 90 + Math.sin(x * .009 + j) * 20 + 8 + r() * 80; const sway = Math.sin(t * 2.4 + x * .02) * 3; g.fillStyle = `rgba(255,${220 + r() * 35 | 0},${170 + r() * 60 | 0},${.5 + r() * .5})`; g.beginPath(); g.arc(x + sway, yy, 1.6 + j, 0, 7); g.fill(); } });
  person(900, 1000, 2.2, 'he'); person(955, 1000, 2.05, 'she', { smile: true });
  stamp(t, ramp(u, 0, .8), '2025.09 · 敦煌 · 鸣沙山', '万人合唱，热泪盈眶');
}

// =============== VERSE 4: daylight everyday ===============
const DHE = '#d79a4a', DSHE = '#e9806e', INK = '#6b4a3a';
function dayBg() { const s = g.createLinearGradient(0, 0, 0, H); s.addColorStop(0, '#fff4e2'); s.addColorStop(1, '#f6dcc0'); g.fillStyle = s; g.fillRect(0, 0, W, H); }
function clock(x, y, R, hrs) { g.fillStyle = '#fffaf0'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); g.stroke();
  for (let k = 0; k < 12; k++) { const an = k / 12 * 6.283; g.beginPath(); g.moveTo(x + Math.cos(an) * R * .82, y + Math.sin(an) * R * .82); g.lineTo(x + Math.cos(an) * R * .92, y + Math.sin(an) * R * .92); g.stroke(); }
  const ha = (hrs % 12) / 12 * 6.283 - Math.PI / 2, ma = (hrs % 1) * 6.283 - Math.PI / 2; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ha) * R * .5, y + Math.sin(ha) * R * .5); g.stroke();
  g.lineWidth = 3.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ma) * R * .75, y + Math.sin(ma) * R * .75); g.stroke(); }
function bed(x, y, w, col = '#f3c9a8') { g.fillStyle = '#c9946a'; g.fillRect(x - w / 2, y - 30, 16, 120); g.fillRect(x + w / 2 - 16, y + 20, 16, 70); g.fillStyle = col; g.beginPath(); g.roundRect(x - w / 2, y + 10, w, 60, 18); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.roundRect(x - w / 2 + 24, y - 6, 120, 34, 16); g.fill(); }
function plush(x, y, s, type) { g.save(); g.translate(x, y); g.scale(s, s);
  if (type === 'dog') { g.fillStyle = '#e8b04a'; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.beginPath(); g.ellipse(-24, 4, 10, 18, .3, 0, 7); g.fill(); g.beginPath(); g.ellipse(24, 4, 10, 18, -.3, 0, 7); g.fill(); g.fillStyle = '#f6dcae'; g.beginPath(); g.ellipse(0, 10, 13, 9, 0, 0, 7); g.fill(); }
  else { g.fillStyle = '#fff'; g.beginPath(); g.arc(0, 0, 26, 0, 7); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(-19, -19, 9, 0, 7); g.fill(); g.beginPath(); g.arc(19, -19, 9, 0, 7); g.fill(); g.beginPath(); g.ellipse(-9, -2, 6, 8, .5, 0, 7); g.fill(); g.beginPath(); g.ellipse(9, -2, 6, 8, -.5, 0, 7); g.fill(); }
  g.fillStyle = '#222'; g.beginPath(); g.arc(-8, -2, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(8, -2, 2.6, 0, 7); g.fill(); g.beginPath(); g.arc(0, 8, 3, 0, 7); g.fill(); g.restore(); }
function museum(x, y, s) { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = '#fffaf0'; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(-180, -170); g.lineTo(0, -260); g.lineTo(180, -170); g.closePath(); g.fill(); g.stroke(); g.fillRect(-170, -170, 340, 20); g.strokeRect(-170, -170, 340, 20);
  for (let c = -140; c <= 140; c += 70) { g.fillRect(c - 12, -150, 24, 150); g.strokeRect(c - 12, -150, 24, 150); } g.fillRect(-190, 0, 380, 18); g.strokeRect(-190, 0, 380, 18); g.restore(); }
function sMorning(t) {
  const S = SEC.v4; dayBg(); const i = li(S, t);
  if (t < S.st[1] + .3) { // bed + clock
    const k = clamp((t - S.st[0]) / 2.4); g.save(); g.globalAlpha = clamp((S.st[1] + .3 - t) / .3);
    bed(860, 760, 640); g.fillStyle = '#f3c9a8'; g.beginPath(); g.ellipse(900, 760, 220, 50, 0, Math.PI, 0); g.fill(); g.fillStyle = DSHE; g.beginPath(); g.arc(640, 742, 24, 0, 7); g.fill(); g.beginPath(); g.arc(654, 722, 11, 0, 7); g.fill();
    T('z', 700 + Math.sin(t * 2) * 6, 650, 40, INK, .7); T('z', 730, 600 - Math.sin(t * 2) * 6, 52, INK, .55); T('Z', 770, 540, 66, INK, .4);
    clock(1450, 380, 140, lerp(8, 12, ease(k))); T(lerp(8, 12, ease(k)) > 11.9 ? '周末的上午：不存在' : '周末 · 上午', 1450, 580, 34, INK, 1, { w: 500 }); g.restore(); }
  if (t >= S.st[1] - .1) { // dragging to the museum
    const a = clamp((t - S.st[1] + .1) / .4); g.save(); g.globalAlpha = a; museum(1450, 900, 1.25);
    T('展览 · 讲座', 1450, 560, 34, INK, 1, { w: 600 });
    g.fillStyle = 'rgba(107,74,58,.15)'; g.fillRect(0, 900, W, 180);
    const tired = t > S.st[2]; const x = lerp(400, 820, ease(clamp((t - S.st[1]) / 5)));
    person(x + 90, 900, 3.4, 'he', { col: DHE, walk: t * 3 }); person(x, 900, 3.2, 'she', { col: DSHE, lean: -.22, walk: t * 2 });
    handLink(x + 30, 900 - 26 * 3.2, x + 70, 900 - 30 * 3.4);
    bubble(x - 40, 620, 190, 74, '好累～', tired ? clamp((t - S.st[2]) / .3) : 0, 38, '#fff', 'rgba(233,128,110,.95)');
    g.restore(); }
}
function sunroom(t) {
  const S = SEC.v4; dayBg();
  g.fillStyle = '#fffaf2'; g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.roundRect(1080, 90, 640, 560, 10); g.fill(); g.stroke(); g.beginPath(); g.moveTo(1400, 90); g.lineTo(1400, 650); g.moveTo(1080, 370); g.lineTo(1720, 370); g.stroke();
  glowDot(1560, 220, 140, .7, '255,200,90');
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(255,210,120,.35)'; g.beginPath(); g.moveTo(1080, 650); g.lineTo(1720, 650); g.lineTo(1300, 1080); g.lineTo(240, 1080); g.fill(); g.restore();
  T('百万阳光房 · 朝南', 1400, 60 + 650 - 20 + 30, 30, INK, ramp(t, S.st[3], S.st[3] + .6), { w: 600 });
  g.fillStyle = 'rgba(107,74,58,.15)'; g.fillRect(0, 930, W, 150);
}
function sSunroom(t) {
  const S = SEC.v4; sunroom(t);
  const catT = t >= S.st[4] && t < S.st[5];
  if (t < S.st[4]) { person(700, 930, 3.4, 'she', { col: DSHE, smile: true }); person(560, 930, 3.6, 'he', { col: DHE }); }
  else if (catT) { // curled up in the sun, cat ears
    g.fillStyle = DSHE; g.beginPath(); g.ellipse(820, 905, 120, 40, 0, 0, 7); g.fill(); g.save(); g.translate(700, 880); g.scale(3, 3); g.beginPath(); g.arc(0, 0, 10, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-9, -5); g.lineTo(-8, -17); g.lineTo(-2, -9); g.fill(); g.beginPath(); g.moveTo(9, -5); g.lineTo(8, -17); g.lineTo(2, -9); g.fill(); g.strokeStyle = 'rgba(70,40,50,.8)'; g.lineWidth = 1.3; [-4, 4].forEach(dx => { g.beginPath(); g.arc(dx, 1, 2.4, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }); g.restore();
    T('喵～', 640, 760, 40, INK, clamp((t - S.st[4] - .5) / .3)); person(380, 930, 3.6, 'he', { col: DHE, smile: true });
  } else { // mess -> tidy
    const tidy = ease(ramp(t, S.st[6], S.st[6] + 1.2)); const r = rng(93);
    const items = ['sock', 'book', 'cup', 'book', 'sock', 'shirt', 'book', 'cup'];
    items.forEach((it, i) => { const mx = 300 + r() * 700, my = 880 + r() * 60, mr = (r() - .5) * 2; const tx = 240 + i * 70, ty = 400; const x = lerp(mx, tx, tidy), y = lerp(my, ty, tidy), rot = lerp(mr, 0, tidy);
      g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = ['#7fb3d5', '#e9806e', '#ffffff', '#9ccf8f', '#f2c14e', '#b39ddb', '#e9806e', '#fff'][i]; g.strokeStyle = INK; g.lineWidth = 2.5;
      if (it === 'book') { g.fillRect(-18, -40, 36, 80); g.strokeRect(-18, -40, 36, 80); } else if (it === 'cup') { g.fillRect(-20, -24, 40, 48); g.strokeRect(-20, -24, 40, 48); g.beginPath(); g.arc(24, 0, 10, -1.4, 1.4); g.stroke(); }
      else if (it === 'sock') { g.beginPath(); g.moveTo(-10, -36); g.lineTo(10, -36); g.lineTo(10, 10); g.lineTo(28, 22); g.lineTo(18, 36); g.lineTo(-10, 20); g.closePath(); g.fill(); g.stroke(); }
      else { g.fillRect(-34, -30, 68, 60); g.strokeRect(-34, -30, 68, 60); } g.restore(); });
    if (tidy > 0) { g.fillStyle = '#c9946a'; g.fillRect(200, 448, lerp(0, 600, tidy), 14); if (tidy > .9) { const r2 = rng(5); for (let i = 0; i < 10; i++) glowDot(200 + r2() * 600, 320 + r2() * 160, 24, Math.sin(t * 6 + i) ** 2, '255,220,120'); } }
    const annoyed = tidy < .5; person(1250, 930, 3.4, 'she', { col: DSHE, smile: !annoyed }); T(annoyed ? '!' : '♡', 1250, 640, 60, annoyed ? '#d8513e' : '#e9806e', 1, { w: 700 });
    person(lerp(1050, 820, tidy), 930, 3.6, 'he', { col: DHE, walk: tidy > 0 && tidy < 1 ? t * 5 : 0 });
    T('亮堂堂', 500, 260, 44, INK, ramp(t, S.st[6] + 1, S.st[6] + 1.5), { w: 600 });
  }
}
function sNight4(t) {
  const S = SEC.v4; bg('#0e1230', '#1a1f45', '#262a55'); stars(t, .5, 0, 300); moonW(1620, 170, 46, .6, false, .8);
  g.fillStyle = 'rgba(255,230,180,.05)'; g.fillRect(0, 0, W, H); bed(900, 760, 760, '#3b4a8a');
  g.fillStyle = '#3b4a8a'; g.beginPath(); g.ellipse(980, 770, 250, 46, 0, Math.PI, 0); g.fill();
  g.fillStyle = SHE; g.beginPath(); g.arc(640, 742, 24, 0, 7); g.fill(); g.beginPath(); g.arc(654, 722, 11, 0, 7); g.fill();
  plush(1180, 700, 1.3, 'dog'); plush(1260, 705, 1.3, 'panda'); T('阿黄', 1180, 640, 22, 'rgba(255,226,170,.7)', 1); T('黑白', 1260, 640, 22, 'rgba(255,226,170,.7)', 1);
  const u = t - S.st[7]; const trip = Math.min(3, Math.floor(u / (BEAT * 1.6)) + 1);
  if (t < S.st[8]) { const ph = (u / (BEAT * 1.6)) % 1; const x = 1450 + Math.sin(ph * Math.PI) * 120; person(x, 900, 3.2, 'he', { walk: t * 4 });
    const icon = ['🧦', '🥛', '❄'][trip - 1]; T(['袜子', '倒水', '调空调'][trip - 1], x, 560, 34, '#ffe7b8', 1, { w: 600 });
    T(`第 ${trip} 趟`, 1450, 200, 56, '#ffe7b8', 1, { glow: 'rgba(255,200,120,.8)', w: 500 });
    bubble(560, 600, 220, 70, '帮我…～', clamp(1 - ph * 2), 32); }
  else { person(1450, 900, 3.2, 'he', { smile: t < S.st[9] });
    bubble(560, 600, 260, 70, '又麻烦你啦', clamp((t - S.st[8]) / .3) * (t < S.st[9] + .2 ? 1 : 0), 32);
    if (t >= S.st[8] + .6) { const pa = clamp((t - S.st[8] - .6) / .4); g.save(); g.globalAlpha = pa; g.fillStyle = 'rgba(255,248,236,.95)'; [[1380, 640, 14], [1350, 600, 20]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }); g.beginPath(); g.roundRect(1250, 380, 400, 190, 60); g.fill(); g.restore();
      if (t < S.st[9]) T('（她还需要我 ♡）', 1450, 475, 34, '#3a2440', pa, { w: 500 });
      else { const k = clamp((t - S.st[9]) / 1.5); T(k < .99 ? '如果哪天她什么都不叫我…' : '…我才会慌！', 1450, 475, 30, '#3a2440', pa, { w: 500 }); } } }
}

// =============== BRIDGE ===============
function warmBg() { bg('#0e0b1e', '#1c1530', '#2a1e34'); }
function lamp(x, y, a = 1) { glowDot(x, y + 40, 360, .45 * a, '255,190,110'); g.fillStyle = '#ffd08a'; g.beginPath(); g.moveTo(x - 40, y); g.lineTo(x + 40, y); g.lineTo(x + 26, y - 50); g.lineTo(x - 26, y - 50); g.fill(); }
function sBridge(t) {
  const S = SEC.br, i = Math.max(0, li(S, t)); warmBg();
  if (i <= 1) { // dinner: her favorite dish slides aside
    lamp(960, 300, 1); g.fillStyle = '#3a2636'; g.fillRect(360, 760, 1200, 30); g.strokeStyle = 'rgba(255,210,140,.5)'; g.lineWidth = 2; g.strokeRect(360, 760, 1200, 30);
    person(560, 760, 3.6, 'he'); person(1360, 760, 3.4, 'she', { smile: i === 1 });
    [[820, '#f2dfc2'], [960, '#9ccf8f'], [1100, '#f2c14e']].forEach(([x, c]) => { g.fillStyle = '#fff6ea'; g.beginPath(); g.ellipse(x, 752, 60, 14, 0, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.ellipse(x, 744, 38, 14, 0, Math.PI, 0); g.fill(); });
    const sl = ease(ramp(t, S.st[1], S.st[1] + 1.6)); const dx = lerp(1220, 1480, sl);
    g.fillStyle = '#fff6ea'; g.beginPath(); g.ellipse(dx, 752, 56, 14, 0, 0, 7); g.fill(); g.fillStyle = '#c9a27a'; g.beginPath(); g.ellipse(dx, 744, 36, 13, 0, Math.PI, 0); g.fill();
    T('她爱吃的毛肚', dx, 680, 26, 'rgba(255,226,170,.85)', ramp(t, S.st[0] + .8, S.st[0] + 1.5));
  } else if (i <= 3) { // planning far vs pushed along
    lamp(1340, 420, 1); g.fillStyle = '#3a2636'; g.fillRect(1100, 760, 520, 26); person(1300, 760, 3.4, 'she');
    g.fillStyle = '#fff6ea'; g.save(); g.translate(1420, 740); g.rotate(-.1); g.fillRect(-50, -14, 100, 18); g.restore();
    const k = ramp(t, S.st[2], S.st[2] + 2.5); g.setLineDash([6, 10]); g.strokeStyle = 'rgba(255,220,150,.7)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(1420, 720);
    const pts = [[1500, 560], [1380, 420], [1560, 300], [1700, 150]]; let n = k * pts.length; pts.forEach((p, j) => { if (j < n) g.lineTo(...p); }); g.stroke(); g.setLineDash([]);
    pts.forEach((p, j) => { if (j < n) glowDot(p[0], p[1], 34, 1); });
    const pa = ramp(t, S.st[3], S.st[3] + .5); if (pa > 0) { g.save(); g.globalAlpha = pa; person(560 + Math.sin(t * 3) * 6, 900, 3.4, 'he', { walk: t * 3, lean: .08 });
      const r = rng(97); for (let j = 0; j < 14; j++) { const sp = 300 + r() * 300, x = W * .55 - ((t * sp + r() * 900) % 1100), y = 300 + r() * 600; g.save(); g.translate(x, y); g.rotate(t * 3 + j); g.fillStyle = 'rgba(255,246,230,.85)'; g.fillRect(-26, -32, 52, 64); g.fillStyle = '#d8513e'; g.fillRect(-26, -32, 52, 14); g.restore(); }
      g.restore(); }
  } else if (i <= 5) { // pain + umbrella
    const rainA = ramp(t, S.st[5], S.st[5] + .6);
    lamp(960, 260, .6); const um = ease(ramp(t, S.st[5], S.st[5] + 1));
    const hx = lerp(640, 860, um); person(hx, 920, 3.6, 'he', { smile: true }); person(1100, 920, 3.4, 'she');
    if (t < S.st[5]) { bubble(1100, 630, 180, 74, '哎呀！', clamp((t - S.st[4]) / .3), 38, '#fff', 'rgba(233,128,110,.95)'); g.fillStyle = '#fff6ea'; g.save(); g.translate(hx + 14, 920 - 55 * 3.6); g.rotate(.5); g.fillRect(-18, -6, 36, 12); g.restore(); T('^_^', hx, 640, 40, '#ffe7b8', clamp((t - S.st[4] - .8) / .3)); }
    if (rainA > 0) { const r = rng(99); g.strokeStyle = `rgba(190,210,255,${.55 * rainA})`; g.lineWidth = 2; for (let j = 0; j < 220; j++) { const x = r() * W, y = (r() * H + t * 900) % (H + 60) - 60; if (x > hx - 260 && x < 1300 && y > 560) continue; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 8, y + 34); g.stroke(); }
      g.save(); g.globalAlpha = um; g.fillStyle = '#e9806e'; g.beginPath(); g.arc(980, 600, 300, Math.PI, 0); g.closePath(); g.fill(); g.strokeStyle = '#ffd08a'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(980, 600); g.lineTo(hx + 30, 820); g.stroke(); g.restore(); }
  } else if (i <= 8) { // two lamps: kitchen & desk
    g.strokeStyle = 'rgba(255,210,140,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(960, 140); g.lineTo(960, 940); g.stroke();
    lamp(480, 260, 1); lamp(1440, 320, 1);
    g.fillStyle = '#3a2636'; g.fillRect(260, 780, 480, 30); g.fillStyle = '#5a4050'; g.fillRect(420, 740, 140, 40); g.fillStyle = '#ffd08a'; g.beginPath(); g.ellipse(490, 740, 70, 12, 0, 0, 7); g.fill();
    person(320, 940, 3.4, 'he'); particlesUp(t, 490, 700, 80, 10, '255,240,225', .5);
    g.fillStyle = '#3a2636'; g.fillRect(1240, 780, 460, 26); person(1420, 940, 3.2, 'she');
    const nb = ramp(t, S.st[8], S.st[8] + .6); if (nb > 0) { g.save(); g.globalAlpha = nb; g.fillStyle = '#fff6ea'; g.fillRect(1510, 730, 150, 50); g.strokeStyle = 'rgba(120,100,120,.5)'; g.lineWidth = 1.5; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(1520, 740 + k * 11); g.lineTo(1650, 740 + k * 11); g.stroke(); } g.restore();
      [[1560, 620], [1640, 560], [1520, 520]].forEach(([x, y], j) => T('?', x, y - (t - S.st[8]) * 10, 44, 'rgba(255,226,170,.7)', clamp((t - S.st[8] - j * .4) / .4))); }
    const sc = ramp(t, S.st[7], S.st[7] + 2.4); if (sc > 0) { g.strokeStyle = 'rgba(255,210,130,.85)'; g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); const N = 60; for (let k = 0; k <= N * sc; k++) { const p = k / N; const x = lerp(490, 1420, p), y = 690 - Math.sin(p * Math.PI) * 300 + Math.sin(p * 18 + t * 3) * 16; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      glowDot(lerp(490, 1420, sc), 690 - Math.sin(sc * Math.PI) * 300, 60, 1); }
  } else { // comfort, then brave
    const brave = ramp(t, S.st[11], S.st[11] + 3);
    lamp(1200, 300, 1 - brave * .5);
    const near = ease(ramp(t, S.st[9], S.st[9] + 1.4)); const hx = lerp(500, 1060, near);
    person(1200, 900, 3.4, 'she', { lean: t > S.st[10] ? -.12 * ramp(t, S.st[10], S.st[10] + 1) : 0, smile: t > S.st[10] }); person(hx, 900, 3.6, 'he', { walk: near > 0 && near < 1 ? t * 3 : 0 });
    if (near > .95) handLink(hx + 25, 900 - 33 * 3.6, 1185, 900 - 33 * 3.4, 1);
    if (brave > 0) { glowDot(hx, 900 - 28 * 3.6, 200 + brave * 900, .6 * brave, '255,220,150'); const r = rng(101); for (let j = 0; j < 60; j++) { const an = r() * 6.28, d = brave * (300 + r() * 900); glowDot(hx + Math.cos(an) * d, 800 + Math.sin(an) * d * .7, 18, brave * (1 - brave * .5)); } }
    const flash = ramp(t, 307.2, 308); if (flash > 0) { g.fillStyle = `rgba(255,240,210,${flash * .85})`; g.fillRect(0, 0, W, H); }
  }
  g.drawImage(vignette, 0, 0);
}

// =============== FINAL CHORUS ===============
const MEM = [['2023.01.26', '人民广场 · 一顿火锅', .21, 0], ['2023.03.25', '向日葵 · 表白', .13, 0], ['2023.05.01', '嵊泗 · 追夕阳', .84, 0], ['2023.12.31', '哈尔滨 · 新年钟声', .83, 1],
['2024.10.12', '星空 · 求婚', .71, 0], ['2025.05.21', '小满 · 持证上岗', .38, 1], ['2025.05.25', '婚礼 · 勇敢的人先享受世界', .04, 1], ['2026.11.24', '三十二岁 · 满月', 1, 0]];
const DIGITS = (() => { const cv = mk(700, 400, (x, w, h) => { x.fillStyle = '#fff'; x.font = `700 360px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('32', w / 2, h / 2 + 10); });
  const d = cv.getContext('2d').getImageData(0, 0, 700, 400).data, pts = []; for (let y = 0; y < 400; y += 12) for (let x = 0; x < 700; x += 12) if (d[(y * 700 + x) * 4 + 3] > 128) pts.push([x - 350, y - 200]); return pts; })();
const PF = ['#0a0820', '#1e1646', '#3a2860'];
function finalShot(k, t, u) {
  if (k === 0) { bg(PF[0], PF[1], PF[2]); const r = rng(111);
    for (let i = 0; i < 300; i++) { const tx = r() * W, ty = r() * 650, sx = r() < .5 ? -100 : W + 100, sy = r() * H; const p = ease(clamp(u / 3 - r() * .3)); glowDot(lerp(sx, tx, p), lerp(sy, ty, p), 8 + r() * 10, .8); }
    const rise = ease(clamp(u / 4)); moon(960, lerp(980, 430, rise), 180, .999, 1, 2.5 + beatPulse(t));
    g.fillStyle = '#080616'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, 860 + Math.sin(x * .003) * 40); g.lineTo(W, H); g.fill();
    T('2026.11.24 · 今晚的月亮：100%', 960, 150, 30, 'rgba(255,230,180,.85)', ramp(u, 2, 3), { glow: 'rgba(255,200,120,.6)' });
  } else if (k === 1) { bg(PF[0], PF[1], PF[2]); stars(t, .8, 0, H); const r = rng(113);
    DIGITS.forEach(([x, y], i) => { const p = ease(clamp(u / 2.2 - r() * .3)); const sx = r() * W, sy = r() * H; glowDot(lerp(sx, 960 + x * 1.2, p), lerp(sy, 400 + y * 1.2, p), 16, .85 + .15 * Math.sin(t * 5 + i)); });
    glowDot(960, 980, 300, .4, '255,170,180'); person(960, 1000, 3.4, 'she', { smile: true });
  } else if (k === 2) { chorusShot(2, t, u, { pal: PF, tint: '255,220,160', ill: 1, waning: false }); moon(1600, 200, 80, .999, 1, 1.5);
  } else if (k === 3) { bg(PF[0], PF[1], PF[2]); stars(t, 1, 0, H); moon(960, 470, 300, .999, 1, 1.4);
    g.fillStyle = '#07051a'; g.beginPath(); g.ellipse(960, 1180, 1100, 330, 0, 0, 7); g.fill();
    const lean = -.2 * ease(clamp(u / 1.2)); person(900, 880, 4.4, 'he', { col: '#1a1430' }); person(1010, 880, 4.1, 'she', { col: '#2a1838', lean: lean });
  } else if (k === 4) { road(t, u, 1, false, PF, true);
    const r = rng(115); ['rice', 'oil', 'salt'].forEach((it, j) => { const p = ease(clamp((u - j * .5) / 3)); const x = lerp(300 + j * 650, 960, p), y = lerp(320, 600, p), s = lerp(1.2, .1, p); if (p >= 1) return;
      g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = '#ffd08a'; g.lineWidth = 4; g.fillStyle = 'rgba(255,240,210,.15)';
      if (it === 'rice') { g.beginPath(); g.arc(0, 0, 70, 0, Math.PI); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(0, 0, 60, Math.PI, 0); g.stroke(); }
      else if (it === 'oil') { g.beginPath(); g.roundRect(-34, -60, 68, 130, 14); g.fill(); g.stroke(); g.strokeRect(-12, -90, 24, 30); }
      else { g.beginPath(); g.roundRect(-30, -50, 60, 110, 20); g.fill(); g.stroke(); for (let q = -1; q <= 1; q++) { g.beginPath(); g.arc(q * 12, -36, 3, 0, 7); g.stroke(); } }
      g.restore(); T(['柴米', '油盐', '日常'][j], x, y + 110 * s, 30, 'rgba(255,226,170,.85)', 1 - p); });
  } else if (k === 5) { bg(PF[0], PF[1], PF[2]); stars(t, .6, 0, H);
    MEM.forEach(([d, s, ill, wn], j) => { const a = clamp((u - j * .45) / .5); const y = 180 + j * 92; if (a <= 0) return;
      moonW(560, y, 22, ill, wn, a, .4); T(d, 620, y, 32, '#ffe7b8', a, { align: 'left', w: 500 }); T(s, 860, y, 32, '#fff3dc', a, { align: 'left', glow: 'rgba(255,200,120,.5)', blur: 10 }); });
  } else if (k === 6) { bg(PF[0], PF[1], PF[2]); stars(t, 1, 0, H); moon(1450, 260, 100, .999, 1, 1.8);
    // cake
    const cx = 960, cy = 680; g.fillStyle = '#fff2e0'; g.strokeStyle = '#ffd08a'; g.lineWidth = 3; g.beginPath(); g.roundRect(cx - 260, cy - 60, 520, 170, 16); g.fill(); g.stroke(); g.fillStyle = '#ffd1dc'; g.beginPath(); g.roundRect(cx - 180, cy - 180, 360, 130, 14); g.fill(); g.stroke();
    g.fillStyle = '#f7a8b8'; for (let x = cx - 250; x < cx + 260; x += 52) { g.beginPath(); g.arc(x + 26, cy - 60, 26, 0, Math.PI); g.fill(); }
    ['3', '2'].forEach((n, j) => { const x = cx - 50 + j * 100, y = cy - 250; T(n, x, y, 120, '#ffd08a', 1, { w: 700, glow: 'rgba(255,200,120,.7)' }); const fl = 1 + .15 * Math.sin(t * 13 + j * 2); g.fillStyle = '#ffb347'; g.beginPath(); g.ellipse(x, y - 100, 12 * fl, 24 * fl, 0, 0, 7); g.fill(); glowDot(x, y - 100, 90, .7); });
    T('三十二岁 · 生日快乐', 960, 870, 46, '#fff0d0', ramp(u, .8, 1.6), { glow: 'rgba(255,200,120,.9)', w: 500 });
  } else { bg(PF[0], PF[1], PF[2]); const zoom = lerp(1.25, 1, ease(clamp(u / 5))); g.save(); g.translate(960, 600); g.scale(zoom, zoom); g.translate(-960, -600);
    stars(t, 1, 0, H); moon(960, 420, 240, .999, 1, 1.6);
    const r = rng(117); const pts = []; for (let j = 0; j < 9; j++) pts.push([200 + j * 190 + r() * 60, 160 + r() * 260]);
    g.setLineDash([5, 8]); g.strokeStyle = 'rgba(255,220,150,.5)'; g.lineWidth = 2; g.beginPath(); pts.forEach((p, j) => j ? g.lineTo(...p) : g.moveTo(...p)); g.stroke(); g.setLineDash([]); pts.forEach(p => glowDot(p[0], p[1], 30, .9));
    g.fillStyle = '#07051a'; g.beginPath(); g.ellipse(960, 1150, 900, 300, 0, 0, 7); g.fill(); person(930, 860, 3, 'he', { col: '#1a1430' }); person(1000, 860, 2.8, 'she', { col: '#2a1838', lean: -.15 }); g.restore(); }
}
function sFinal(t) { const S = SEC.fin; const i = Math.max(0, li(S, t)), k = Math.min(i, 7), u = t - S.st[k]; const prev = k > 0 && u < .5;
  if (prev) finalShot(k - 1, t, t - S.st[k - 1]); layer(() => { finalShot(k, t, u); if (k !== 5) g.drawImage(vignette, 0, 0); }, prev ? ease(u / .5) : 1);
  const fl = 1 - ramp(t, SEC.fin.st[0], SEC.fin.st[0] + .5); if (fl > 0) { g.fillStyle = `rgba(255,240,210,${fl * .85})`; g.fillRect(0, 0, W, H); } }

// =============== OUTRO ===============
function sOutro(t) {
  const u = t - 344.2; bg('#04040e', '#0b0a20', '#141030'); stars(t, .7 * clamp((357 - t) / 2), 0, H);
  const cx = 960, cy = 470, R = 240, a = ramp(u, 0, 1.5);
  g.save(); g.globalAlpha = a; g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); const gg = g.createRadialGradient(cx, cy, 10, cx, cy, R); gg.addColorStop(0, '#1c2050'); gg.addColorStop(1, '#0a0c26'); g.fillStyle = gg; g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
  const r = rng(121); for (let i = 0; i < 160; i++) { const an = r() * 6.28 + t * .05, d = Math.sqrt(r()) * R; g.fillStyle = `rgba(255,236,200,${.3 + r() * .7})`; g.beginPath(); g.arc(cx + Math.cos(an) * d, cy + Math.sin(an) * d, r() * 1.6 + .4, 0, 7); g.fill(); }
  moon(cx, cy, 70, .999, 1, 1.2); g.restore();
  g.strokeStyle = 'rgba(220,230,255,.6)'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.stroke(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(cx, cy, R - 30, Math.PI * 1.1, Math.PI * 1.45); g.stroke();
  g.restore();
  // final words (spoken "生日快乐" at 355)
  const ba = ramp(t, 355.3, 356); if (ba > 0) { const chars = [...'生日快乐']; chars.forEach((ch, j) => T(ch, 840 + j * 80, 820, 76, '#ffd98a', clamp((t - 355.3 - j * .25) / .5) * clamp((358.3 - t) / 1), { glow: 'rgba(255,200,110,1)', blur: 30, w: 500 })); }
  T('2023.01.26 的月亮 21%   →   2026.11.24 的月亮 100%', 960, 920, 26, 'rgba(255,226,170,.75)', ramp(t, 356.3, 357) * clamp((358.3 - t) / 1));
}

// =============== MASTER ===============
const SCENES = [
  [0, 19.2, sIntro], [18.9, 36.4, t => sHotpot(t, t - 18.9)], [36.4, 54.7, t => sBund(t, t - 36.4)], [54.7, 72.8, sPre1],
  [72.8, 109, t => sChorus(t, SEC.c1, V1)], [109, SEC.v2.st[3], sCherry], [SEC.v2.st[3], SEC.v2.st[6], sSunflower], [SEC.v2.st[6], 128.6, sShengsi],
  [128.6, 165.94, t => sChorus(t, SEC.c2, V2)], [165.94, SEC.v3.st[1], sHarbin], [SEC.v3.st[1], SEC.v3.st[2], sConcert], [SEC.v3.st[2], 183.6, sProposal],
  [183.6, SEC.pre2.st[2], sXiaoman], [SEC.pre2.st[2], SEC.pre2.st[4], sWedding], [SEC.pre2.st[4], 201.92, sDunhuang],
  [201.92, 238, t => sChorus(t, SEC.c3, V3)], [238, SEC.v4.st[3], sMorning], [SEC.v4.st[3], SEC.v4.st[7], sSunroom], [SEC.v4.st[7], 267, sNight4],
  [267, 308, sBridge], [308, 344.2, sFinal], [344.2, 400, sOutro]];
const FADE = .6;
function render(t) {
  g = mainG; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.shadowBlur = 0; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  let first = true;
  for (let k = 0; k < SCENES.length; k++) {
    const [s, e, fn] = SCENES[k]; const s0 = k === 0 ? s : s - FADE; if (t < s0 || t >= e) continue;
    const a = (k === 0 || first) ? 1 : clamp((t - s0) / FADE);
    if (first) { g.save(); fn(t); g.restore(); } else layer(() => fn(t), a);
    first = false;
  }
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  caption(t); g.drawImage(grain, 0, 0);
  const fin = clamp(t / 1.2), fout = clamp((window.END - t) / 1.5); const k = Math.min(fin, fout);
  if (k < 1) { g.fillStyle = `rgba(0,0,0,${1 - k})`; g.fillRect(0, 0, W, H); }
}
window.capDark = t => t > 237.6 && t < SEC.v4.st[7] - .3;
window.END = 358.44; window.render = render;
const qq = new URLSearchParams(location.search); if (qq.has('t')) render(+qq.get('t'));
