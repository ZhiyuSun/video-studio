// The 25 shots of 定风波. Each shot: (A, t local, C) → compositor params. C.V(id) = local start of line id, C.E(id) = local end, C.d = shot length.
import * as K from './kit.js';
const { mk, draw, mass, blot, TONE, hero, POSE, mixPose, SU, RUN, walker, seated, columns, rain, bamboo, grove, path, hut, boat, wake, moonWash, goose, crow, paperMoney,
  cached, blit, setCam, paperOf, mtnInto, cun, cliff, pine, reed, ripple, seal, clamp, lerp, mulberry, vnoise, ss, eio, eo, ei } = K;

const T12 = t => Math.floor(t * 12) / 12;          // figures on twos
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const CAP = { hat: 'cap' };

// ---------------------------------------------------------------- shared scenery
function rainScene() {   // the Shahu road: far hills, bamboo groves, a path (world 4600 × 1080)
  return cached('rainScene', 4600, 1080, L => {
    mtnInto(L, { W: 4600, peaks: [[400, 140, 160], [900, 210, 200], [1500, 160, 170], [2200, 240, 220], [2900, 170, 180], [3500, 220, 210], [4200, 150, 170]], base: 600, depth: 240, tone: .13, rim: .5, rimW: 26, mist: .95, seed: 3 });
    grove(L, -60, 4660, 900, { n: 34, h: 640, s: .9, tone: .3, seed: 5 });
    path(L, [[-50, 905], [1200, 900], [2400, 908], [3600, 902], [4650, 906]], 40, .14, 9);
    for (let i = 0; i < 26; i++) draw(L, mk([[i * 180 + 20, 930 + (i % 3) * 14], [i * 180 + 110, 928 + (i % 3) * 14]], { w: 3, tone: .35, dry: .75, prof: 'tip', seed: 700 + i }));
  });
}
function rainFore() {   // dark foreground culms, passed with parallax
  return cached('rainFore', 6400, 1080, L => {
    const R = mulberry(77);
    for (let i = 0; i < 9; i++) { const x = 300 + i * 700 + R() * 260; bamboo(L, x, 1240, 1500, 2.2, 400 + i, (R() - .5) * .08, .78, { leaves: 3 }); }
  });
}
function rainRoad(A, t, C, o = {}) {
  const cam = { x: (o.cx0 ?? 1300) + (o.v ?? 58) * t, y: 540, z: 1 };
  blit(A, rainScene(), cam);
  // figures in world coords
  setCam(A, cam);
  const tt = T12(t);
  if (o.runners) for (let k = 0; k < 3; k++) {
    const st = .4 + k * 1.3, x = cam.x - 1150 + (t - st) * 330;
    if (t > st && x < cam.x + 1100) walker(A.ink, tt, x, 888 + k * 6, 2.7 - k * .2, { poses: RUN, rate: 3.2, ph: k, seed: 40 + k, extra: { hat: 'none' } });
  }
  const su = o.su ? o.su(t, cam) : { x: cam.x - 120, dir: 1, walk: true };
  if (su.walk) walker(A.ink, tt, su.x, 892, 3, { rate: 1.3, seed: 2, dir: su.dir });
  else hero(A.ink, su.P, { x: su.x, y: 892, s: 3, dir: su.dir, seed: 2, t: tt });
  // foreground culms (parallax 1.7)
  blit(A, rainFore(), { x: cam.x * 1.7 - 600, y: 540, z: 1 }, .95);
  rain(A, t, o.rain ?? 1);
  return { bleed: 5, rim: 1, paper: paperOf(cam), warm: .5 };
}

// ---------------------------------------------------------------- 1 rain, high wide
function pathPt(u) {
  const P = [[160, 1120], [520, 930], [900, 820], [1250, 720], [1560, 660], [1900, 620]];
  const f = clamp(u) * (P.length - 1), k = Math.min(P.length - 2, Math.floor(f)), r = f - k;
  return [lerp(P[k][0], P[k + 1][0], r), lerp(P[k][1], P[k + 1][1], r)];
}
function rainwide(A, t, C) {
  const lay = cached('rainwide', 1920, 1080, L => {
    mtnInto(L, { peaks: [[300, 160, 180], [820, 220, 200], [1500, 180, 190]], base: 560, depth: 230, tone: .12, rim: .5, rimW: 26, mist: .95, seed: 13 });
    grove(L, -80, 560, 1040, { n: 9, h: 900, s: 1.1, tone: .45, seed: 21 });
    grove(L, 1480, 2000, 980, { n: 7, h: 760, s: .9, tone: .38, seed: 23 });
    const pts = []; for (let i = 0; i <= 20; i++) pts.push(pathPt(i / 20));
    path(L, pts, 34, .13, 31);
  });
  blit(A, lay, { x: 960, y: 540, z: 1 });
  A.xf(1, 0, 0);
  const tt = T12(t);
  const su = pathPt(.36 + t * .006), s0 = lerp(1.3, .7, .4);
  walker(A.ink, tt, su[0], su[1], s0, { rate: 1.2, seed: 2 });
  for (let k = 0; k < 3; k++) {
    const u = .22 + (t - k * .7) * .03; if (u < .05 || u > 1) continue;
    const p = pathPt(u); walker(A.ink, tt, p[0], p[1], lerp(1.4, .6, u), { poses: RUN, rate: 3, ph: k, seed: 40 + k });
  }
  rain(A, t, ramp(t, .4, 2.5), { n: 260 });
  return { bleed: 5, rim: 1, rev: [980, 700, 120 + 2600 * eo(ramp(t, 0, 4.6)), 1] };
}

// ---------------------------------------------------------------- 2 rain, tracking with the passers-by
const rainwalk = (A, t, C) => rainRoad(A, t, C, { runners: true });

// ---------------------------------------------------------------- 3 the staff and the sandal in the puddle
function puddle(A, t, C) {
  const v = 230, rate = 1.05, sx = 760;
  mass(A.cw, [[0, 860], [1920, 850], [1920, 1080], [0, 1080]], .1, 6, 3, [0, 850, 0, 1080, .4, 1.2]);
  // puddles drifting left with the ground
  for (let i = 0; i < 6; i++) {
    const x = ((i * 520 + 1900 - t * v) % 3120 + 3120) % 3120 - 400, y = 930 + (i % 3) * 40;
    draw(A.ink, mk([[x - 150, y], [x, y + 18], [x + 160, y + 2]], { w: 5, tone: .55, dry: .55, prof: 'tip', seed: 80 + i }));
    draw(A.ink, mk([[x - 120, y + 30], [x + 130, y + 32]], { w: 2.5, tone: .35, dry: .7, prof: 'tip', seed: 90 + i }));
  }
  // staff contacts: ripples
  const per = 1 / rate;
  for (let k = Math.max(0, Math.floor(t / per) - 4); k <= Math.floor(t / per); k++) {
    const tk = k * per + .1, age = t - tk; if (age < 0) continue;
    const x = sx + 7 * 14 + 30 - age * v;
    for (let r = 0; r < 3; r++) { const rr = (age - r * .18) * 140; if (rr > 0) ripple(A.ink, x, 1032, rr, .55 * clamp(1 - age / 2.4), k * 3 + r, .2, 3); }
  }
  walker(A.ink, T12(t), sx, 1030, 14, { rate, seed: 2 });
  rain(A, t, 1, { n: 200, len: 70 });
  const q = C.V('L05');
  columns(A, ['莫听穿林打叶声', '何妨吟啸且徐行'], 1800, 150, ramp(t, q, q + 4.2), { size: 62 });
  columns(A, ['竹杖芒鞋轻胜马', '一蓑烟雨任平生'], 1640, 150, ramp(t, q + 4.4, q + 8.6), { size: 62 });
  return { bleed: 5, rim: 1, paper: [t * v, 0, 1] };
}

// ---------------------------------------------------------------- 4 a tiny figure in the blank rain
function small(A, t, C) {
  const u = eio(ramp(t, 0, C.d)), z = lerp(1, 1.16, u), cam = { x: lerp(960, 1000, u), y: lerp(540, 600, u), z };
  const lay = cached('small', 1920, 1080, L => {
    grove(L, -120, 240, 1080, { n: 4, h: 900, s: .9, tone: .2, seed: 61 });
    grove(L, 1760, 2040, 1000, { n: 3, h: 700, s: .7, tone: .16, seed: 63 });
    path(L, [[-40, 760], [500, 720], [1000, 700], [1500, 690], [1960, 680]], 18, .1, 65);
  });
  blit(A, lay, cam); setCam(A, cam);
  walker(A.ink, T12(t), 900 + t * 6, 702, .62, { rate: 1.1, seed: 2 });
  rain(A, t, .7, { n: 160, am: .8 });
  return { bleed: 5, rim: 1, paper: paperOf(cam) };
}

// ---------------------------------------------------------------- 5 one drop: the hard cut
const DROP = [640, 540];
function dropBlot(A, k, am = 1) {
  if (k <= 0) return;
  const c = A.cw, R = mulberry(51);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  for (let i = 0; i < 9; i++) {
    const a = R() * 6.28, d = R() * 70 * k, x = DROP[0] + Math.cos(a) * d, y = DROP[1] + Math.sin(a) * d * .85, r = (110 + R() * 90) * k;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(0,0,0,${.32 * am})`); g.addColorStop(.75, `rgba(0,0,0,${.22 * am})`); g.addColorStop(.92, `rgba(0,0,0,${.3 * am})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  }
  const g = c.createRadialGradient(DROP[0], DROP[1], 0, DROP[0], DROP[1], 120 * k);
  g.addColorStop(0, `rgba(0,0,0,${.6 * am})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = g; c.beginPath(); c.arc(DROP[0], DROP[1], 120 * k, 0, 7); c.fill();
  c.restore();
  for (let i = 0; i < 22; i++) { const a = R() * 6.28, d = (210 + R() * 150) * k; blot(A.cd, DROP[0] + Math.cos(a) * d, DROP[1] + Math.sin(a) * d, (2 + R() * 5), .7 * am * clamp(k * 2), R() * 3, .7, i + 40); }
}
function drop(A, t, C) {
  const th = .55;
  if (t < th) { const u = ramp(t, .15, th), y = lerp(-40, DROP[1], u * u); if (t > .15) { A.cw.fillStyle = '#000'; A.cw.globalAlpha = .9; A.cw.beginPath(); A.cw.ellipse(DROP[0], y, 7, 11 + 8 * u, 0, 0, 7); A.cw.fill(); A.cw.globalAlpha = 1; } }
  else dropBlot(A, eo(ramp(t, th, th + 1.6)));
  return { bleed: 9, rim: 1.4 };
}

// ---------------------------------------------------------------- 6 title
function title(A, t, C) {
  dropBlot(A, 1, lerp(1, .45, eo(ramp(t, 0, 2))));
  columns(A, ['苏轼在黄州'], 1300, 250, ramp(t, .3, 1.6), { size: 118 });
  columns(A, ['人生低谷时', '怎么不被情绪吞掉'], 1150, 300, ramp(t, 1.4, 3.2), { size: 46, gap: 62 });
  K.seal(A.cc, 1250, 880, 84, eo(ramp(t, 3.4, 3.7)) * .95, '东坡', 7);
  return { bleed: 8, rim: 1.2 };
}

// ---------------------------------------------------------------- 7 prison
function prison(A, t, C) {
  const u = ramp(t, 0, C.d), z = lerp(1, 1.1, eio(u)), cam = { x: 820, y: 600, z };
  const lay = cached('prison', 1920, 1080, L => {
    mass(L.wet, [[-40, -40], [1460, -40], [1420, 260], [1380, 640], [1440, 820], [-40, 820]], .5, 20, 7, [0, 0, 0, 820, 1.4, .6]);
    for (let i = 0; i < 6; i++) draw(L, mk([[300 + i * 190, -20], [304 + i * 190, 400], [298 + i * 190, 840]], { w: 26, tone: .92, darkDir: [1, 0], side: .7, brWet: true, body: .6, dry: .3, wet: .6, prof: 'even', seed: 120 + i }));
    draw(L, mk([[240, 120], [1300, 112]], { w: 30, tone: .92, dry: .35, wet: .5, prof: 'even', seed: 130 }));
    draw(L, mk([[-20, 860], [900, 852], [1480, 858]], { w: 8, tone: .6, dry: .6, prof: 'tip', seed: 131 }));
  });
  // the lamp: a hole of light in the dark wall
  blit(A, lay, cam); setCam(A, cam);
  for (const c of [A.cw, A.cd]) { c.save(); c.globalCompositeOperation = 'destination-out'; const g = c.createRadialGradient(1150, 650, 4, 1150, 650, 150); g.addColorStop(0, 'rgba(0,0,0,.95)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(950, 450, 400, 400); c.restore(); }
  const fl = Math.sin(t * 7) * 1.5;
  draw(A.ink, mk([[1150, 672], [1148 + fl, 650], [1150, 628]], { w: 9, tone: .3, wet: .9, dry: .1, prof: 'tip', seed: 133 }));
  draw(A.ink, mk([[1128, 690], [1172, 690]], { w: 6, tone: .9, dry: .3, prof: 'even', seed: 134 }));
  seated(A.ink, 760, 852, 3.2, { dir: 1, hat: 'none', hunch: 1, arm: [10, -8] });
  const q = C.V('L10');
  columns(A, ['是处青山可埋骨'], 1680, 230, ramp(t, q + .8, q + 4.5), { size: 60 });
  return { bleed: 6, rim: 1.1, paper: paperOf(cam), shake: [Math.sin(t * 13) * .8, Math.cos(t * 11) * .6] };
}

// ---------------------------------------------------------------- 8 river handscroll to Huangzhou
function river(A, t, C) {
  const u = eio(ramp(t, 0, C.d)), cam = { x: lerp(3300, 1250, u), y: 540, z: 1 };
  const lay = cached('river', 4400, 1080, L => {
    mtnInto(L, { W: 4400, peaks: [[300, 150, 160], [900, 120, 180], [1600, 190, 210], [2400, 140, 200], [3200, 230, 220], [4000, 170, 200]], base: 560, depth: 240, tone: .13, rim: .5, rimW: 24, mist: .95, seed: 41 });
    mtnInto(L, { W: 4400, peaks: [[3700, 260, 170], [4150, 330, 190], [3400, 160, 150]], base: 760, depth: 300, tone: .42, rim: .8, rimW: 14, mist: .6, seed: 43, xmask: x => clamp((x - 3150) / 220) });
    cun(L, { x0: 3250, x1: 4380, ridge: K.ridgeFn([[3700, 260, 170], [4150, 330, 190], [3400, 160, 150]], 760, 43, 24), tone: .3, cun: 1.2, moss: 1.2, seed: 43 });
    mtnInto(L, { W: 4400, peaks: [[500, 200, 200], [900, 150, 160], [150, 120, 150]], base: 740, depth: 260, tone: .36, rim: .8, rimW: 14, mist: .6, seed: 45, xmask: x => clamp((1350 - x) / 220) });
    // Huangzhou: a low city wall with a gate tower on the far bank
    mass(L.wet, [[560, 742], [1180, 736], [1180, 690], [560, 696]], .42, 3, 47);
    for (let i = 0; i < 16; i++) mass(L.wet, [[566 + i * 38, 696], [590 + i * 38, 695], [590 + i * 38, 682], [566 + i * 38, 683]], .5, 1, 48 + i);
    mass(L.wet, [[820, 690], [940, 690], [930, 640], [830, 640]], .5, 2, 70);
    draw(L, mk([[790, 640], [880, 612], [972, 640]], { w: 8, tone: .9, dry: .45, prof: 'brush', seed: 71 }));
    mass(L.wet, [[862, 742], [898, 742], [898, 708], [862, 708]], .7, 1, 72);
    for (let i = 0; i < 40; i++) draw(L, mk([[200 + i * 105, 820 + (i % 5) * 34], [260 + i * 105, 820 + (i % 5) * 34]], { w: 2.2, tone: .3, dry: .8, prof: 'tip', seed: 800 + i }));
  });
  blit(A, lay, cam); setCam(A, cam);
  const bx = lerp(3500, 1700, eio(ramp(t, 0, C.d))), by = 860;
  boat(A.ink, bx, by, 1.1, 5, { canopy: true });
  seated(A.ink, bx + 50, by - 6, 1.1, { dir: -1, hat: 'none', hunch: .6 });
  draw(A.ink, mk([[bx + 120, by - 70], [bx + 150, by + 30]], { w: 3, tone: .8, dry: .4, prof: 'even', seed: 77 }));
  K.wake(A.ink, bx, by, 1.1, t, .45, 3);
  columns(A, ['黄州'], 880, 250, ramp(t, C.V('L12') - 2, C.V('L12')), { size: 96, world: true });
  return { bleed: 5, rim: 1, paper: paperOf(cam) };
}

// ---------------------------------------------------------------- 9 temple at night, the door closing
function temple(A, t, C) {
  const lay = cached('temple', 1920, 1080, L => {
    mass(L.wet, [[-20, -20], [1940, -20], [1940, 1100], [-20, 1100]], .1, 0, 1, [0, 0, 0, 1080, 1.4, .5]);
    pine(L, 330, 860, 2.2, 15, 0, 0, 1);
    // hall: roof with upturned eaves, walls, steps
    mass(L.wet, [[640, 470], [960, 380], [1290, 470], [1370, 450], [1310, 520], [610, 520], [550, 452]], .62, 4, 91, [0, 380, 0, 520, 1.2, .8]);
    draw(L, mk([[540, 446], [700, 480], [960, 386], [1220, 480], [1380, 446]], { w: 10, tone: .95, dry: .4, wet: .3, prof: 'brush', seed: 92 }));
    mass(L.wet, [[680, 520], [1240, 520], [1240, 820], [680, 820]], .2, 3, 93);
    for (const x of [690, 1230]) draw(L, mk([[x, 520], [x + 2, 820]], { w: 16, tone: .7, darkDir: [1, 0], side: .6, brWet: true, body: .5, dry: .35, wet: .7, prof: 'even', seed: 94 + x }));
    for (let i = 0; i < 3; i++) draw(L, mk([[620 - i * 30, 840 + i * 22], [1300 + i * 30, 840 + i * 22]], { w: 6, tone: .55, dry: .6, prof: 'even', seed: 97 + i }));
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  const g = lerp(150, 0, eio(ramp(t, 1.2, 6.5)));            // gap between the door leaves
  for (const sd of [-1, 1]) mass(A.cw, [[960 + sd * g / 2, 560], [960 + sd * (g / 2 + 160), 560], [960 + sd * (g / 2 + 160), 818], [960 + sd * g / 2, 818]], .55, 2, 101 + sd);
  draw(A.ink, mk([[960, 560], [960, 818]], { w: 3, tone: .9, dry: .5, prof: 'even', seed: 103 }), clamp(1 - g / 20));
  if (g > 6) { A.cd.save(); A.cd.globalAlpha = .0; A.cd.restore(); }
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 10 the lone goose
function gooseShot(A, t, C) {
  const lay = cached('goose', 1920, 1080, L => {
    mass(L.wet, [[-20, -20], [1940, -20], [1940, 640], [-20, 700]], .08, 0, 1, [0, 0, 0, 700, 1.3, .1]);
    moonWash(L, 1480, 230, 42, .1, 3);
    // cold bare branches from the upper left
    const br = [[[-20, 120], [180, 170], [380, 160], [560, 210]], [[180, 170], [260, 260], [300, 360]], [[380, 160], [450, 100], [540, 70]], [[300, 360], [380, 420], [470, 430]], [[560, 210], [660, 240], [760, 230]]];
    br.forEach((b, i) => draw(L, mk(b, { w: i ? 7 : 16, tone: .85, dry: .55, wet: .3, prof: 'press', seed: 140 + i })));
    for (let i = 0; i < 14; i++) { const R = mulberry(150 + i), x = 120 + R() * 620, y = 120 + R() * 300; draw(L, mk([[x, y], [x + 20 + R() * 30, y - 10 - R() * 20]], { w: 3, tone: .8, dry: .5, prof: 'tip', seed: 160 + i })); }
    // the sandbar
    draw(L, mk([[200, 812], [700, 800], [1300, 806], [1700, 818]], { w: 26, tone: .26, dry: .5, wet: .8, prof: 'lens', seed: 170 }));
    draw(L, mk([[260, 822], [900, 816], [1500, 826]], { w: 5, tone: .5, dry: .7, prof: 'tip', seed: 171 }));
    for (let i = 0; i < 11; i++) reed(L, 420 + i * 95, 812, 70 + (i % 3) * 30, 1, 180 + i, .25, .5);
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  const u = t / C.d, gx = lerp(1850, 160, u), gy = 420 + 150 * Math.sin(u * Math.PI * 1.4) - 60 * u;
  goose(A.ink, gx, gy, 2.2, t, -1, 7);
  const q = C.V('L16');
  columns(A, ['拣尽寒枝不肯栖', '寂寞沙洲冷'], 1790, 330, ramp(t, q, q + 3.4), { size: 58 });
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 11 the hut like a fishing boat; the stove; the crows
function hutShot(A, t, C) {
  const cut = C.V('L20') - .25;
  if (t < cut) {
    const z = lerp(1, 1.12, eio(ramp(t, 0, cut))), cam = { x: 960, y: 640, z };
    const lay = cached('hutwide', 1920, 1080, L => {
      mass(L.wet, [[-20, -20], [1940, -20], [1940, 420], [-20, 460]], .14, 0, 1, [0, 0, 0, 460, 1.2, .15]);
      for (let i = 0; i < 4; i++) draw(L, mk([[-60, 520 + i * 90], [700, 510 + i * 92], [1980, 524 + i * 88]], { w: 60 - i * 10, tone: .08, dry: .2, wet: 1, prof: 'lens', seed: 190 + i }));
      hut(L, 960, 720, 2.2, 11, { window: true });
      for (let i = 0; i < 12; i++) draw(L, mk([[760 + i * 36, 735], [762 + i * 36, 790 + (i % 4) * 16]], { w: 5, tone: .14, wet: .9, dry: .3, prof: 'tip', seed: 210 + i }));
      for (let i = 0; i < 6; i++) draw(L, mk([[600 + i * 140, 840 + (i % 2) * 30], [720 + i * 140, 838 + (i % 2) * 30]], { w: 2.4, tone: .32, dry: .8, prof: 'tip', seed: 230 + i }));
    });
    blit(A, lay, cam); setCam(A, cam);
    rain(A, t, 1, { n: 280, ang: .1, len: 60 });
    return { bleed: 6, rim: 1, paper: paperOf(cam) };
  }
  // interior: window with rain and crows, the cold stove, wet reeds smoking, the man by the fire
  const lt = t - cut;
  const lay = cached('hutin', 1920, 1080, L => {
    mass(L.wet, [[-20, -20], [1940, -20], [1940, 1100], [-20, 1100]], .2, 0, 1, [0, 0, 1920, 0, 1, .7]);
    L.wet.save(); L.wet.globalCompositeOperation = 'destination-out'; L.wet.fillRect(160, 150, 560, 380); L.wet.restore();
    for (const [a, b] of [[[150, 150], [730, 150]], [[150, 530], [730, 530]], [[156, 140], [156, 540]], [[724, 140], [724, 540]], [[440, 150], [440, 530]]]) draw(L, mk([a, b], { w: 12, tone: .85, dry: .35, wet: .4, prof: 'even', seed: 240 + a[0] + a[1] }));
    // stove: a mud block with a dark mouth, a pot
    mass(L.wet, [[1180, 760], [1680, 760], [1700, 1000], [1160, 1000]], .38, 6, 251, [0, 760, 0, 1000, .8, 1.2]);
    draw(L, mk([[1170, 760], [1430, 752], [1690, 762]], { w: 14, tone: .85, dry: .45, prof: 'brush', seed: 252 }));
    mass(L.wet, [[1300, 880], [1420, 880], [1430, 1000], [1290, 1000]], .8, 4, 253);
    mass(L.wet, [[1340, 760], [1580, 760], [1560, 700], [1360, 700]], .55, 3, 254);
    draw(L, mk([[1330, 702], [1460, 688], [1592, 702]], { w: 9, tone: .9, dry: .4, prof: 'brush', seed: 255 }));
    for (let i = 0; i < 7; i++) draw(L, mk([[1120 + i * 14, 1000], [1310 + i * 10, 950 - i * 4]], { w: 3, tone: .7, dry: .6, prof: 'tip', seed: 260 + i }));
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  // rain outside the window only
  A.cd.save(); A.cw.save(); for (const c of [A.cd, A.cw]) { c.beginPath(); c.rect(165, 155, 550, 370); c.clip(); }
  rain(A, t, 1, { n: 140, ang: .1 });
  const cr = C.V('L21') - cut;
  for (let k = 0; k < 3; k++) { const ct = lt - cr - k * .5; if (ct > 0 && ct < 4) { const x = lerp(760, 120, ct / 4), y = 300 + k * 50 + Math.sin(ct * 2 + k) * 20; crow(A.ink, x, y, 1.6, ct, -1, 30 + k); paperMoney(A.ink, x - 18, y + 14, 1.6, ct); } }
  A.cd.restore(); A.cw.restore();
  // smoke from wet reeds
  for (let i = 0; i < 5; i++) { const ph = (lt * .25 + i / 5) % 1, x0 = 1330 + i * 6, y0 = 880; const pts = []; for (let j = 0; j < 6; j++) { const v = j / 5; pts.push([x0 + Math.sin(v * 5 + lt + i) * 30 * v + v * 40, y0 - v * 260 * (.3 + ph)]); } draw(A.ink, mk(pts, { w: 16, tone: .14, wet: 1, dry: .1, prof: 'lens', seed: 270 + i }), 1, .7 * (1 - ph)); }
  seated(A.ink, 860, 990, 4.6, { dir: 1, hat: 'cap', hunch: .8, arm: [22, -4] });
  return { bleed: 6, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 12 despair: the Cold Food poems
function darkness(A, k, cx = 960, cy = 500, floor = .0) {
  if (k <= 0) return;
  const c = A.cw; c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(cx, cy, lerp(1400, 120, k), cx, cy, lerp(1900, 1100, k));
  g.addColorStop(0, `rgba(0,0,0,${floor})`); g.addColorStop(1, `rgba(0,0,0,${clamp(.25 + .7 * k)})`);
  c.fillStyle = g; c.fillRect(0, 0, 1920, 1080); c.restore();
}
function despair(A, t, C) {
  const u = ramp(t, 0, C.d), z = lerp(1, 1.08, eio(u)), cam = { x: 940, y: 520, z };
  setCam(A, cam);
  darkness(A, .75 * u);
  const a = C.V('L22'), b = C.V('L25'), e = C.V('L26');
  columns(A, ['君门深九重', '坟墓在万里'], 1260, 230, ramp(t, a, a + 3), { size: 104, world: true });
  columns(A, ['也拟哭途穷'], 900, 230, ramp(t, b, b + 1.5), { size: 104, world: true });
  columns(A, ['死灰吹不起'], 760, 230, ramp(t, b + 1.6, b + 3.4), { size: 104, world: true, am: lerp(.92, .45, ramp(t, e, e + 4)) });
  return { bleed: 6, rim: 1.1, paper: paperOf(cam), vig: .3 };
}
// ---------------------------------------------------------------- 13 hush: the whole bus silent, one drop
function hush(A, t, C) {
  const c = A.cw; c.fillStyle = 'rgba(0,0,0,.9)'; c.fillRect(0, 0, 1920, 1080);
  const td = 1.7;
  if (t > td) { const r = 8 + (t - td) * 90; for (const cc of [A.cw]) { cc.save(); cc.globalCompositeOperation = 'destination-out'; cc.strokeStyle = `rgba(0,0,0,${.7 * clamp(1 - (t - td) / 2.2)})`; cc.lineWidth = 3; cc.beginPath(); cc.ellipse(960, 600, r, r * .3, 0, 0, 7); cc.stroke(); cc.restore(); } }
  return { bleed: 6, rim: 1, vig: .3 };
}
// ---------------------------------------------------------------- 14 the ink is lifted
function lift(A, t, C) {
  const k = eo(ramp(t, .2, 6));
  const c = A.cw;
  const dark = .9 * (1 - k) + .0;
  if (dark > .01) { c.fillStyle = `rgba(0,0,0,${dark})`; c.fillRect(0, 0, 1920, 1080); }
  // the two slopes of the valley stay, the man stands in the pale gap
  const slope = (x0, x1, sd) => mass(c, [[x0, lerp(-60, 320, k)], [x1, 1100], [x0, 1100]].map(p => p), .55 * k + .0, 14, 300 + sd, [x0, 300, x0, 1080, .5, 1.3]);
  slope(-40, 860, 1); slope(1960, 1060, 2);
  if (k > .05) {
    draw(A.ink, mk([[-40, lerp(-60, 320, k)], [420, 640], [860, 1100]], { w: 14, tone: .85 * k, darkDir: [1, 0], side: .7, brWet: true, body: .3, dry: .5, wet: .7, prof: 'press', seed: 310 }));
    draw(A.ink, mk([[1960, lerp(-60, 320, k)], [1500, 640], [1060, 1100]], { w: 14, tone: .85 * k, darkDir: [-1, 0], side: .7, brWet: true, body: .3, dry: .5, wet: .7, prof: 'press', seed: 311 }));
  }
  hero(A.ink, { ...SU.stand, ...CAP }, { x: 960, y: 1000, s: 1.2, dir: 1, seed: 2, t: T12(t), am: k });
  const q = C.V('L28');
  columns(A, ['不被情绪吞掉', '不等于没有情绪'], 1030, 180, ramp(t, q + 3.0, q + 6.2), { size: 70 });
  return { bleed: 6, rim: 1, vig: .25 };
}

// ---------------------------------------------------------------- 15 one: give the feeling to the paper
const WORDS = [['孤鸿', 0], ['死灰', 1], ['哭途穷', 2]];
function paperShot(A, t, C) {
  const lay = cached('desk', 1920, 1080, L => {
    draw(L, mk([[800, 760], [1150, 754], [1520, 762]], { w: 22, tone: .9, darkDir: [0, 1], side: .6, brWet: true, body: .5, dry: .35, wet: .6, prof: 'even', seed: 320 }));
    for (const x of [840, 1480]) draw(L, mk([[x, 770], [x - 6, 980]], { w: 12, tone: .8, dry: .45, prof: 'even', seed: 321 + x }));
    mass(L.wet, [[900, 744], [1260, 744], [1270, 752], [890, 752]], .1, 1, 323);
    draw(L, mk([[1340, 742], [1358, 700]], { w: 3, tone: .9, dry: .3, prof: 'tip', seed: 324 }));
    blot(L.wet, 1390, 742, 14, .6, 0, .4, 9);
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  seated(A.ink, 700, 990, 4.2, { dir: 1, hat: 'cap', arm: [44, 2], brush: true });
  const a = C.V('L32'), r = C.V('L35');
  WORDS.forEach(([w, i]) => {
    const tw = a + 1.6 + i * 1.1, lift = eio(ramp(t, r + i * .5, r + 3 + i * .5));
    const x = lerp(950 + i * 100, 1180 + i * 230, lift), y = lerp(738, 300 + i * 90, lift), size = lerp(26, 70, lift);
    columns(A, [w], x, y - (w.length - 1) * size * 1.08 * lift * .5, ramp(t, tw, tw + .8), { size, am: lerp(.9, .8, lift) });
  });
  const h = C.V('L31');
  columns(A, ['一', '把情绪交给纸'], 1820, 120, ramp(t, h, h + 1.8), { size: 64, fade: 1 - ramp(t, C.V('L33'), C.V('L33') + 1) });
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 16 incense and sitting still
function sitShot(A, t, C) {
  const lay = cached('hall', 1920, 1080, L => {
    for (const x of [200, 1720]) draw(L, mk([[x, -20], [x + 4, 1100]], { w: 60, tone: .7, darkDir: [x < 960 ? 1 : -1, 0], side: .7, brWet: true, body: .4, dry: .35, wet: .8, prof: 'even', seed: 330 + x }));
    draw(L, mk([[-20, 60], [1940, 64]], { w: 40, tone: .85, dry: .4, wet: .5, prof: 'even', seed: 333 }));
    draw(L, mk([[200, 900], [1720, 904]], { w: 6, tone: .45, dry: .7, prof: 'tip', seed: 334 }));
    mass(L.wet, [[930, 985], [990, 985], [1000, 1020], [920, 1020]], .7, 2, 335);
    draw(L, mk([[912, 985], [1008, 985]], { w: 6, tone: .9, dry: .3, prof: 'even', seed: 336 }));
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  seated(A.ink, 960, 900, 3.8, { front: true, hat: 'cap' });
  // incense thread
  const pts = []; for (let j = 0; j <= 14; j++) { const v = j / 14; pts.push([960 + Math.sin(v * 6 - t * .9) * 40 * v + Math.sin(v * 13 + t * .5) * 8 * v, 980 - v * 720]); }
  draw(A.ink, mk([[960, 985], [960, 975]], { w: 2, tone: .9, dry: .3, prof: 'tip', seed: 337 }));
  draw(A.ink, mk(pts, { w: 6, tone: .22, wet: 1, dry: .1, prof: 'tip', seed: 338, boil: Math.floor(t * 12) % 5 }), 1, .8);
  // thoughts: pale marks that rise, linger, fall and are let go
  const a = C.V('L37');
  if (t > a) for (let i = 0; i < 7; i++) {
    const st = a + i * 1.1, age = t - st; if (age < 0 || age > 4) continue;
    const R = mulberry(340 + i), x = 960 + (R() - .5) * 700, y0 = 600 - R() * 140, y = y0 - Math.sin(Math.PI * age / 4) * 120;
    blot(A.cw, x, y, 10 + R() * 14, .28 * Math.sin(Math.PI * age / 4), R() * 3, .6, i);
  }
  const q = C.V('L36');
  columns(A, ['焚香默坐', '深自省察'], 1520, 240, ramp(t, q + 4, q + 6.4), { size: 64 });
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 17 two: the money on the beam
function coins(A, t, C) {
  const lay = cached('beam', 1920, 1080, L => {
    draw(L, mk([[140, 210], [900, 204], [1560, 212]], { w: 34, tone: .9, darkDir: [0, 1], side: .6, brWet: true, body: .5, dry: .35, wet: .6, prof: 'even', seed: 350 }));
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  const a = C.V('L40'), lt = ramp(t, a + 6.0, a + 9.6), K0 = 18;
  for (let i = 0; i < 30; i++) {
    let x = 250 + i * 40, y0 = 226, dy = 0, am = 1;
    if (i === K0) { const lf = ss(clamp(lt * 2)), dn = ss(clamp(lt * 2 - 1)); dy = -18 * lf + 420 * dn; am = 1 - clamp(lt * 2 - 1.4); }
    if (am <= 0) continue;
    draw(A.ink, mk([[x, y0 + dy], [x + 1, y0 + 160 + dy]], { w: 1.4, tone: .8, dry: .4, prof: 'even', seed: 360 + i }), 1, am);
    for (let j = 0; j < 7; j++) blot(A.cw, x + Math.sin(j + i) * 1.5, y0 + 172 + j * 12 + dy, 9, .5 * am, 0, .35, i * 10 + j);
    draw(A.ink, mk([[x - 8, y0 + 160 + dy], [x + 8, y0 + 160 + dy]], { w: 2, tone: .9, dry: .4, prof: 'tip', seed: 400 + i }), 1, am);
  }
  // the fork (画叉) comes up from below, hooks one string, lowers it
  if (lt > 0 && lt < 1) {
    const up = ss(clamp(lt * 2)), dn = ss(clamp(lt * 2 - 1)), hx = 250 + K0 * 40, hy = lerp(1150, 210, up) + 420 * dn;
    draw(A.ink, mk([[hx + 6, hy + 10], [hx + 40, hy + 900]], { w: 8, tone: .85, dry: .4, prof: 'even', seed: 420 }));
    draw(A.ink, mk([[hx - 12, hy - 14], [hx + 6, hy + 12], [hx + 22, hy - 12]], { w: 4, tone: .9, dry: .35, prof: 'tip', seed: 421 }));
  }
  const q = C.V('L38');
  columns(A, ['二', '让身体先动起来'], 1820, 120, ramp(t, q, q + 2), { size: 64, fade: 1 - ramp(t, C.V('L40'), C.V('L40') + 1) });
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 18 the eastern slope: wasteland, hoe, wheat, a pot
const HOE = [
  { ...POSE.walk1, sheath: null, hat: 'cap', H: [0, -44], C: [5, -72], Hd: [9, -80], tilt: -.08, aF: [[5, -71], [12, -82], [16, -95]], aB: [[4, -71], [10, -84], [13, -97]], lF: [[2, -44], [10, -22], [14, 0]], lB: [[-1, -44], [-6, -22], [-10, 0]] },
  { ...POSE.walk1, sheath: null, hat: 'cap', H: [0, -42], C: [10, -66], Hd: [15, -73], tilt: -.25, aF: [[9, -65], [18, -56], [27, -50]], aB: [[8, -65], [16, -58], [24, -52]], lF: [[2, -42], [12, -22], [16, 0]], lB: [[-1, -42], [-6, -22], [-10, 0]] },
];
function farm(A, t, C) {
  const u = eio(ramp(t, 0, C.d)), cam = { x: lerp(4300, 1350, u), y: 540, z: 1 };
  const lay = cached('farm', 5200, 1080, L => {
    mtnInto(L, { W: 5200, peaks: [[500, 120, 200], [1400, 160, 220], [2400, 110, 200], [3300, 170, 220], [4300, 130, 200]], base: 600, depth: 220, tone: .11, rim: .5, rimW: 24, mist: .95, seed: 61 });
    draw(L, mk([[-40, 820], [1600, 800], [3200, 790], [5240, 810]], { w: 40, tone: .2, dry: .55, wet: .8, prof: 'even', seed: 450 }));
    const R = mulberry(451);
    for (let i = 0; i < 70; i++) { const x = 3500 + R() * 1650, y = 790 + R() * 120; draw(L, mk([[x, y], [x + (R() - .5) * 40, y - 20 - R() * 40], [x + (R() - .5) * 60, y - 50 - R() * 50]], { w: 3, tone: .8, dry: .65, prof: 'tip', seed: 460 + i })); }
    for (let i = 0; i < 40; i++) { const x = 3500 + R() * 1650, y = 820 + R() * 100; mass(L.wet, [[x, y], [x + 18 + R() * 20, y - 4], [x + 26, y + 10], [x + 4, y + 14]], .45, 3, 520 + i); }
    hut(L, 1050, 790, 1.6, 21, { window: true });
    mass(L.wet, [[1320, 800], [1420, 800], [1410, 760], [1330, 760]], .55, 2, 560);
    draw(L, mk([[1316, 762], [1370, 752], [1424, 762]], { w: 6, tone: .9, dry: .35, prof: 'brush', seed: 561 }));
  });
  blit(A, lay, cam); setCam(A, cam);
  // furrows and wheat sprouting between the hoe and the house
  const R = mulberry(600);
  for (let i = 0; i < 90; i++) {
    const x = 1700 + i * 15 + R() * 8, y = 800 + (i % 6) * 18, g = ramp(t, 1 + i * .14, 4 + i * .14);
    if (g > 0) draw(A.ink, mk([[x, y], [x + 3, y - 14 - 22 * g], [x + 8, y - 22 - 34 * g]], { w: 3.4, tone: .7, dry: .4, wet: .3, prof: 'tip', seed: 610 + i }), g);
  }
  for (let i = 0; i < 8; i++) draw(A.ink, mk([[1700, 806 + i * 16], [3150, 802 + i * 16]], { w: 2.2, tone: .35, dry: .75, prof: 'tip', seed: 720 + i }), clamp(ramp(t, 0, 6) * 1.2 - i * .1));
  // the man with the hoe
  const ph = (t * .9) % 1, P = mixPose(HOE[0], HOE[1], ph < .35 ? ss(ph / .35) : 1 - ss((ph - .35) / .65));
  const hx = 3200, hy = 818, s = 2.4;
  hero(A.ink, P, { x: hx, y: hy, s, dir: 1, seed: 2, t: T12(t) });
  const hand = [hx + P.aF[2][0] * s, hy + P.aF[2][1] * s], ang = lerp(-1.9, .9, ph < .35 ? ss(ph / .35) : 1 - ss((ph - .35) / .65));
  const end = [hand[0] + Math.cos(ang + Math.PI / 2) * 0 + Math.sin(ang) * 0, 0];
  const tip = [hand[0] + 150 * Math.cos(ang - .9), hand[1] + 150 * Math.sin(ang - .9) + 60];
  draw(A.ink, mk([[hand[0] - 30, hand[1] - 20], tip], { w: 5, tone: .85, dry: .4, prof: 'even', seed: 740 }));
  draw(A.ink, mk([tip, [tip[0] + 18, tip[1] + 26]], { w: 10, tone: .95, dry: .3, prof: 'nail', seed: 741 }));
  // steam from the pot
  const st = C.V('L44');
  if (t > st - 1) for (let i = 0; i < 4; i++) { const ph2 = (t * .3 + i / 4) % 1, pts = []; for (let j = 0; j < 6; j++) { const v = j / 5; pts.push([1370 + Math.sin(v * 5 + t + i) * 18 * v, 752 - v * 160 * (.4 + ph2)]); } draw(A.ink, mk(pts, { w: 12, tone: .14, wet: 1, dry: .1, prof: 'lens', seed: 750 + i }), 1, .7 * (1 - ph2) * ramp(t, st - 1, st)); }
  const q = C.V('L43');
  columns(A, ['东坡'], 2400, 230, ramp(t, q + 1.2, q + 2.6), { size: 124, world: true });
  return { bleed: 5, rim: 1, paper: paperOf(cam), warm: .6 };
}

// ---------------------------------------------------------------- 19 behavioural activation; four small things
function icon(A, k, x, y, p) {
  if (p <= 0) return;
  const S = [];
  if (k === 0) { S.push(mk([[x - 60, y + 70], [x + 40, y - 70]], { w: 6, tone: .85, dry: .4, prof: 'even', seed: 800 })); S.push(mk([[x + 30, y - 80], [x + 70, y - 40]], { w: 16, tone: .95, dry: .3, prof: 'nail', seed: 801 })); }
  if (k === 1) for (let i = 0; i < 7; i++) S.push(mk([[x + (i - 3) * 6, y + 80], [x + (i - 3) * 14, y - 30], [x + (i - 3) * 20, y - 70]], { w: 4, tone: .8, dry: .45, prof: 'tip', seed: 810 + i }));
  if (k === 2) { S.push(mk([[x - 80, y - 70], [x + 80, y - 72]], { w: 12, tone: .9, dry: .4, prof: 'even', seed: 820 })); for (let i = 0; i < 4; i++) S.push(mk([[x - 45 + i * 30, y - 66], [x - 45 + i * 30, y + 50]], { w: 6, tone: .7, dry: .5, prof: 'even', seed: 821 + i })); }
  if (k === 3) { S.push(mk([[x - 70, y], [x, y + 60], [x + 70, y]], { w: 30, tone: .6, darkDir: [0, 1], side: .8, brWet: true, body: .4, dry: .35, wet: .9, prof: 'lens', seed: 830 })); S.push(mk([[x - 78, y - 4], [x + 78, y - 4]], { w: 6, tone: .9, dry: .35, prof: 'even', seed: 831 })); S.push(mk([[x - 10, y - 20], [x + 10, y - 60], [x - 6, y - 100]], { w: 12, tone: .14, wet: 1, dry: .1, prof: 'lens', seed: 832 })); }
  K.drawSeq(A.ink, S, p);
}
function acts(A, t, C) {
  const a = C.V('L45'), b = C.V('L46'), c = C.V('L47');
  A.xf(1, 0, 0);
  if (t < c - .3) {
    const up = a + 6.5, walking = t > up;
    if (!walking) seated(A.ink, 720, 860, 3.2, { dir: 1, hat: 'cap', hunch: 1, arm: [8, -6] });
    else walker(A.ink, T12(t), 720 + (t - up) * 70, 862, 3.2, { rate: 1.1, seed: 2, extra: { hat: 'cap', staff: null } });
    const fx = walking ? 720 + (t - up) * 40 : 740, fade = 1 - ramp(t, b, b + 2.6);
    const R = mulberry(850);
    for (let i = 0; i < 9; i++) blot(A.cw, fx + (R() - .5) * 260, 520 + (R() - .5) * 80, 40 + R() * 50, .16 * fade, R() * 3, .5, i);
    draw(A.ink, mk([[200, 866], [1700, 870]], { w: 5, tone: .4, dry: .7, prof: 'tip', seed: 860 }));
  } else {
    const n = 4, d = C.E('L47') - c;
    for (let k = 0; k < n; k++) { const st = c + d * [.0, .1, .2, .38][k]; icon(A, k, 330 + k * 420, 560, ramp(t, st, st + 1.4)); }
  }
  return { bleed: 5, rim: 1, warm: .6 };
}

// ---------------------------------------------------------------- 20–22 the Red Cliff
function cliffNight() {
  return cached('chibi', 1920, 1080, L => {
    moonWash(L, 420, 210, 56, .16, 3);
    mtnInto(L, { peaks: [[200, 140, 170], [700, 100, 190], [1100, 160, 160]], base: 640, depth: 200, tone: .12, rim: .5, rimW: 24, mist: .9, seed: 71 });
    cliff(L, 1960, 760, 3.4, 5, -1);
    pine(L, 1700, 760 - 6, 1.1, 9, 0, 0, -1);
    for (let i = 0; i < 9; i++) draw(L, mk([[380 + (i % 3) * 12, 700 + i * 34], [440 - (i % 2) * 14, 700 + i * 34]], { w: 3, tone: .35, dry: .75, prof: 'tip', seed: 880 + i }));
    for (let i = 0; i < 20; i++) draw(L, mk([[100 + i * 90, 900 + (i % 4) * 30], [150 + i * 90, 900 + (i % 4) * 30]], { w: 2, tone: .25, dry: .8, prof: 'tip', seed: 900 + i }));
  });
}
function chibi(A, t, C) {
  const cam = { x: 960 + t * .8, y: 540, z: 1 };
  blit(A, cliffNight(), cam); setCam(A, cam);
  const bx = 900 + t * 2.5, by = 790;
  boat(A.ink, bx, by, 1.4, 7);
  seated(A.ink, bx - 40, by - 4, 1.1, { dir: 1, hat: 'none', tone: .75 });
  draw(A.ink, mk([[bx - 34, by - 74], [bx - 10, by - 54]], { w: 1.6, tone: .9, dry: .3, prof: 'even', seed: 940 }));
  seated(A.ink, bx + 52, by - 4, 1.1, { dir: -1, hat: 'cap' });
  K.wake(A.ink, bx, by, 1.4, t, .35, 5);
  const h = C.V('L48'), g = C.V('L51');
  columns(A, ['三', '换一个距离看'], 300, 380, ramp(t, h, h + 1.8), { size: 62, world: true, fade: 1 - ramp(t, C.V('L49'), C.V('L49') + 1) });
  columns(A, ['哀吾生之须臾', '羡长江之无穷'], 330, 330, ramp(t, g + 1, g + 4.2), { size: 56, world: true, am: .5 });
  return { bleed: 5, rim: 1, paper: paperOf(cam), warm: .45 };
}
function reply(A, t, C) {
  const cam = { x: 960, y: 560, z: 1 };
  mass(A.cw, [[-20, -20], [1940, -20], [1940, 500], [-20, 560]], .1, 0, 1, [0, 0, 0, 560, 1.2, .1]);
  A.xf(1, 0, 0);
  for (let i = 0; i < 7; i++) draw(A.ink, mk([[200 + i * 230, 960 + (i % 3) * 30], [300 + i * 230, 960 + (i % 3) * 30]], { w: 3, tone: .3, dry: .8, prof: 'tip', seed: 950 + i }));
  const by = 880 + Math.sin(t * .8) * 3;
  boat(A.ink, 960, by, 3.4, 9);
  seated(A.ink, 800, by - 14, 2.6, { dir: 1, hat: 'none', tone: .6 });
  seated(A.ink, 1130, by - 14, 2.6, { dir: -1, hat: 'cap' });
  columns(A, ['哀吾生之须臾', '羡长江之无穷'], 330, 140, 1, { size: 54, am: .3 });
  const a = C.V('L54'), b = C.V('L55');
  const f1 = 1 - ramp(t, b - .4, b);
  columns(A, ['逝者如斯', '而未尝往也', '盈虚者如彼', '而卒莫消长也'], 1800, 120, ramp(t, a, a + 6.5), { size: 54, gap: 74, fade: f1 });
  columns(A, ['自其变者而观之', '天地曾不能以一瞬', '自其不变者而观之', '物与我皆无尽也'], 1800, 120, ramp(t, b, b + 9), { size: 54, gap: 74 });
  return { bleed: 5, rim: 1, warm: .45 };
}
function pullWorld() {
  return cached('pullW', 3840, 2160, L => {
    moonWash(L, 900, 420, 70, .14, 3, 3840, 2160);
    mtnInto(L, { W: 3840, H: 2160, peaks: [[400, 260, 300], [1200, 200, 340], [2000, 300, 300], [2900, 220, 320], [3600, 280, 300]], base: 1060, depth: 320, tone: .12, rim: .5, rimW: 30, mist: .9, seed: 81 });
    cliff(L, 3900, 1320, 6.5, 5, -1);
    cliff(L, -120, 1400, 4.2, 8, 1);
    for (let i = 0; i < 22; i++) draw(L, mk([[880 + (i % 3) * 18, 1260 + i * 30], [960 - (i % 2) * 20, 1260 + i * 30]], { w: 4, tone: .3, dry: .75, prof: 'tip', seed: 960 + i }));
    for (let i = 0; i < 60; i++) { const R = mulberry(1000 + i), x = R() * 3800, y = 1350 + R() * 760; draw(L, mk([[x, y], [x + 90, y]], { w: 3, tone: .22, dry: .8, prof: 'tip', seed: 1100 + i })); }
  });
}
function pull(A, t, C) {
  const e = C.V('L58') + 2, u = eio(ramp(t, 0, e)), z = Math.exp(lerp(Math.log(2.4), Math.log(.5), u));
  const cam = { x: lerp(1920, 1920, u), y: lerp(1250, 1080, u), z };
  blit(A, pullWorld(), cam); setCam(A, cam);
  boat(A.ink, 1920, 1250, 1, 11);
  seated(A.ink, 1890, 1246, .8, { dir: 1, hat: 'none', tone: .7 });
  seated(A.ink, 1958, 1246, .8, { dir: -1, hat: 'cap' });
  const q = C.V('L59');
  columns(A, ['惟江上之清风', '与山间之明月'], 1780, 140, ramp(t, q, q + 4.5), { size: 56 });
  return { bleed: 5 * Math.min(1.5, z), rim: 1, paper: paperOf(cam), warm: .45 };
}
function dawn(A, t, C) {
  const lay = cached('dawn', 1920, 1080, L => {
    mass(L.wet, [[-20, -20], [1940, -20], [1940, 400], [-20, 460]], .1, 0, 1, [0, 0, 1920, 0, 1.3, .0]);
    mtnInto(L, { peaks: [[300, 140, 170], [800, 100, 190], [1300, 150, 170], [1750, 110, 160]], base: 600, depth: 200, tone: .1, rim: .45, rimW: 24, mist: .95, seed: 91 });
    for (let i = 0; i < 12; i++) draw(L, mk([[150 + i * 150, 820 + (i % 3) * 30], [220 + i * 150, 820 + (i % 3) * 30]], { w: 2, tone: .25, dry: .8, prof: 'tip', seed: 1200 + i }));
  });
  blit(A, lay, { x: 960, y: 540, z: 1 }); A.xf(1, 0, 0);
  const bx = 880 + t * 4, by = 740;
  boat(A.ink, bx, by, 1.5, 13);
  for (const [dx, tn] of [[-50, .55], [40, .8]]) {
    mass(A.cw, [[bx + dx - 34, by - 6], [bx + dx + 30, by - 8], [bx + dx + 32, by - 20], [bx + dx - 30, by - 18]], .2 * tn + .05, 1.5, 1300 + dx);
    draw(A.ink, mk([[bx + dx - 34, by - 14], [bx + dx + 30, by - 16]], { w: 6, tone: tn, darkDir: [0, -1], side: .8, brWet: true, body: .2, dry: .45, wet: .9, prof: 'robe', seed: 1310 + dx }));
    blot(A.cw, bx + dx + 36, by - 18, 5, .2, 0, .8, 3);
  }
  return { bleed: 5, rim: 1, warm: .7, flash: .06 * ramp(t, 0, C.d) };
}

// ---------------------------------------------------------------- 24 back in the rain: it stops; he looks back
function rainback(A, t, C) {
  const q = C.V('L63'), d = C.dur('L63');
  const rk = 1 - ramp(t, q + d * .1, q + d * .6), look0 = q + d * .45, look1 = q + d * .78;
  const o = rainRoad(A, t, C, {
    rain: rk, cx0: 1300, v: 58 * (t < look0 ? 1 : 0) + 0,
    su: (tt, cam) => {
      if (tt < look0) return { x: cam.x - 120, dir: 1, walk: true };
      if (tt < look1) return { x: cam.x - 120, dir: -1, walk: false, P: SU.stand };
      return { x: cam.x - 120 + (tt - look1) * 58, dir: 1, walk: true };
    },
  });
  if (t >= look0) { o.paper[0] = -(960 - (1300 + 58 * look0)); }
  // slanting light after the rain: pale wash lifted in diagonal bands
  const sl = ramp(t, q + d * .5, q + d);
  if (sl > 0) for (const c of [A.cw, A.cd]) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 4; i++) { c.globalAlpha = .18 * sl; c.beginPath(); c.moveTo(1500 + i * 160, -10); c.lineTo(1600 + i * 160, -10); c.lineTo(700 + i * 160, 1090); c.lineTo(560 + i * 160, 1090); c.fill(); } c.restore(); }
  return { ...o, flash: .05 * sl };
}

// ---------------------------------------------------------------- 25 the footprints dry
function prints(A, t, C) {
  mass(A.cw, [[0, 560], [1920, 540], [1920, 1080], [0, 1080]], .06, 6, 3, [0, 540, 0, 1080, .5, 1.3]);
  const end = C.E('L68');
  for (let i = 0; i < 9; i++) {
    const st = i * .35, x = 120 + i * 200, y = 760 + (i % 2) * 90;
    if (t < st) continue;
    const dry = ramp(t, st + 4, st + 24), k = 1 - dry * .7;
    blot(A.cw, x, y, 46, .7 * k, .15, .42, i);
    blot(A.cw, x + 52, y - 3, 22, .65 * k, 0, .85, i + 40);
    blot(A.cd, x - 6, y, 44, .35 * dry, .15, .42, i + 80);
    if (i % 2) blot(A.cw, x + 130, y - 120, 11, .75 * k, 0, 1, i + 120);
  }
  columns(A, ['也无风雨也无晴'], 1760, 150, ramp(t, end + .6, end + 3.4), { size: 64 });
  K.seal(A.cc, 1720, 660, 78, eo(ramp(t, end + 3.8, end + 4.1)) * .95, '东坡', 9);
  return { bleed: 5, rim: 1, warm: .6, fade: ramp(t, C.d - 1.4, C.d) };
}

export const SHOTS = { rainwide, rainwalk, puddle, small, drop, title, prison, river, temple, goose: gooseShot, hut: hutShot, despair, hush, lift, paper: paperShot, sit: sitShot, coins, farm, acts, chibi, reply, pull, dawn, rainback, prints };

// subtitle placement per shot (screen px, left edge + baseline of first line)
export const SUBPOS = {
  rainwide: [700, 170], rainwalk: [120, 1010], puddle: [90, 140], small: [130, 160], prison: [110, 990], river: [130, 150], temple: [130, 150],
  goose: [120, 980], hut: [130, 150], hutin: [990, 140], despair: [110, 990], lift: [1150, 140], paper: [110, 150], sit: [300, 160], coins: [110, 760],
  farm: [120, 150], acts: [120, 150], chibi: [560, 990], reply: [110, 1010], pull: [110, 1000], dawn: [120, 150], rainback: [120, 1010], prints: [110, 150],
};
export function subPos(shot, lt, C) {
  if (shot === 'hut' && lt >= C.V('L20') - .25) return SUBPOS.hutin;
  return SUBPOS[shot] || [120, 150];
}
