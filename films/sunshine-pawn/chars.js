// Characters for 《典当》: the hero in a yellow raincoat (profile, back), his eye in extreme close-up,
// the pawnbroker (backlit), the woman in the memory (backlit silhouette), umbrella crowd, the kite.
// Every shape: flat fill → hard shadow → hard highlight → coloured line (cel.js).
import { cel, path, poly, ribbon, flutter, line, TAU, rgba, mix, LWK } from './cel.js';

const lerp = (a, b, u) => a + (b - a) * u;
export function limb(a, b, w1, w2) {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d;
  return [[a[0] + nx * w1, a[1] + ny * w1], [b[0] + nx * w2, b[1] + ny * w2], [b[0] + dx / d * w2 * .9, b[1] + dy / d * w2 * .9],
    [b[0] - nx * w2, b[1] - ny * w2], [a[0] - nx * w1, a[1] - ny * w1], [a[0] - dx / d * w1 * .7, a[1] - dy / d * w1 * .7]];
}
// two-bone arm from shoulder angle + elbow angle (radians, 0 = pointing down, positive = towards screen left)
function arm(S, a1, a2, L1, L2) {
  const E = [S[0] - Math.sin(a1) * L1, S[1] + Math.cos(a1) * L1];
  const a = a1 + a2, Hd = [E[0] - Math.sin(a) * L2, E[1] + Math.cos(a) * L2];
  return [E, Hd];
}

// ——— hero, profile facing screen left ———
// local: head centre (0,0), head radius ≈ 80; neck pivot (10,96). o: { nod (rad), arm: 0 rest → 1 hand at the neck port, cable, rim:{c,d}, light (band sweep fn) }
export function heroProfile(g, P, o = {}) {
  const lw = 2.6;
  const k = o.arm ?? 0;
  // —— body (raincoat) ——
  const body = [[-34, 104], [40, 92], [112, 150, 1], [150, 260], [168, 470], [-96, 470], [-84, 250], [-70, 150]];
  cel(g, body, { f: P.coat.f, s: P.coat.s, so: [-30, 0], h: P.coat.h, ho: [14, 10], l: P.coat.l, lw, rim: o.rim,
    sh: [[[60, 200], [90, 210], [110, 470], [70, 470]]] });
  // coat seam + buttons
  line(g, [[-60, 170], [-70, 300], [-76, 470]], P.coat.l, 1.8);
  // —— back arm (far side) hidden; near arm ——
  const Sh = [44, 150];
  const a1 = lerp(.18, -2.5, k), a2 = lerp(.35, -1.75, k);
  const [E, Hd] = arm(Sh, a1, a2, 120, 112);
  // cable from the neck port
  const port = [74, 66];
  if (o.cable !== false) {
    const end = o.cableEnd || [-260, 520];
    const cb = new Path2D(); cb.moveTo(port[0], port[1]);
    cb.bezierCurveTo(port[0] + 60, port[1] + 40, end[0] + 120, end[1] - 200, end[0], end[1]);
    g.strokeStyle = P.cable.l; g.lineWidth = 11; g.lineCap = 'round'; g.stroke(cb);
    g.strokeStyle = P.cable.f; g.lineWidth = 7; g.stroke(cb);
    g.strokeStyle = rgba(P.cable.h, .7); g.lineWidth = 2; g.stroke(cb);
  }
  // —— head group (nods around the neck) ——
  g.save(); g.translate(10, 96); g.rotate(o.nod || 0); g.translate(-10, -96);
  // neck
  cel(g, [[-26, 60], [34, 56], [44, 112], [-20, 116]], { f: P.skin.f, s: P.skin.s, so: [-14, 0], l: P.skin.l, lw: 1.8 });
  // hood back (behind the face)
  const hood = [[-70, -70], [-30, -112], [40, -108], [96, -60], [110, 10], [98, 74], [62, 118, 1], [-20, 120], [-40, 60], [-54, 0]];
  cel(g, hood, { f: P.coat.f, s: P.coat.s, so: [-20, 12], h: P.coat.h, ho: [10, 14], l: P.coat.l, lw, rim: o.rim });
  // face (profile): under the visor → nose → lips → chin → jaw; the hood opening frames it from behind
  const face = [[-70, -50], [-84, -20], [-88, 4], [-99, 22, 1], [-88, 32, 1], [-87, 40], [-82, 46, 1], [-86, 52], [-80, 62, 1], [-80, 76], [-64, 90], [-40, 96], [-28, 40], [-34, -40]];
  cel(g, face, { f: P.skin.f, s: P.skin.s, so: [16, 0], sh: [[[-104, 6], [-26, 6], [-26, 20], [-92, 18]]], h: P.skin.h, ho: [-5, -4], l: P.skin.l, lw: 1.8 });
  // hood lining: a narrow dark band behind the cheek
  cel(g, [[-46, -84], [-24, -86], [-12, 0], [-16, 70], [-30, 108], [-48, 102], [-32, 40], [-30, -30]], { f: P.lining.f, s: P.lining.s, l: P.lining.l, lw: 1.6 });
  const brim = [[-88, -62], [-50, -102], [0, -106], [-4, -92], [-48, -88], [-78, -56]];
  cel(g, brim, { f: P.coat.f, s: P.coat.s, so: [0, -6], h: P.coat.h, l: P.coat.l, lw });
  // visor: wraps from just past the nose back under the hood
  const visor = [[-106, -30], [-72, -40], [-24, -38], [-20, -22], [-26, 4], [-72, 6], [-104, 0]];
  cel(g, visor, { f: P.visor.f, s: P.visor.s, so: [0, 10], h: P.visor.h, hi: [[[-98, -28], [-56, -34], [-60, -28], [-96, -22]]], l: P.visor.l, lw: 2.2 });
  if (o.visorGlow) o.visorGlow(g, visor);
  // neck port (on the back of the neck)
  cel(g, [[64, 54], [86, 54], [88, 78], [62, 78]], { f: P.metal.f, s: P.metal.s, so: [4, 4], h: P.metal.h, l: P.metal.l, lw: 1.4 });
  g.restore();
  // —— arm on top ——
  cel(g, limb(Sh, E, 30, 24), { f: P.coat.f, s: P.coat.s, so: [-12, 0], h: P.coat.h, ho: [6, 0], l: P.coat.l, lw, rim: o.rim });
  cel(g, limb(E, Hd, 24, 20), { f: P.coat.f, s: P.coat.s, so: [-10, 0], h: P.coat.h, l: P.coat.l, lw });
  // glove
  const hp = new Path2D(); hp.ellipse(Hd[0], Hd[1], 22, 18, Math.atan2(Hd[1] - E[1], Hd[0] - E[0]), 0, TAU);
  cel(g, hp, { f: P.lining.f, s: P.lining.s, so: [-6, 0], h: P.lining.h, l: P.lining.l, lw: 1.6 });
  return { port, hand: Hd };
}

// ——— hero from behind (walking away / standing) ———
// local: feet at y=0, head top ≈ -560. o: { ph (0..1 walk phase), walk (0..1), rim, lookUp }
export function heroBack(g, P, o = {}) {
  const lw = 3, ph = (o.ph || 0) * TAU, w = o.walk ?? 0;
  const bob = -Math.abs(Math.sin(ph)) * 10 * w;
  // legs
  for (const s of [-1, 1]) {
    const lift = Math.max(0, Math.sin(ph + (s > 0 ? 0 : Math.PI))) * w;
    const x = s * 34, y0 = -150 + bob, y1 = -lift * 40;
    cel(g, [[x - 24, y0], [x + 24, y0], [x + 20, y1 - 10], [x - 20, y1 - 10]], { f: P.pants.f, s: P.pants.s, so: [s * 8, 0], l: P.pants.l, lw: 2 });
    cel(g, [[x - 26, y1 - 24], [x + 26, y1 - 24], [x + 28, y1 + 2], [x - 28, y1 + 2]], { f: P.boot.f, s: P.boot.s, so: [0, -6], h: P.boot.h, l: P.boot.l, lw: 2 });
  }
  g.save(); g.translate(0, bob);
  // coat: shoulders → hem, hem swings with the walk
  const sw = Math.sin(ph) * 10 * w;
  const coat = [[-96, -420], [-60, -452], [60, -452], [96, -420, 1], [118, -300], [130 + sw, -130], [-130 + sw, -130], [-118, -300]];
  cel(g, coat, { f: P.coat.f, s: P.coat.s, so: [16, 0], h: P.coat.h, ho: [-8, 8], l: P.coat.l, lw, rim: o.rim,
    sh: [[[-10, -440], [10, -440], [18 + sw * .5, -130], [-18 + sw * .5, -130]]] });
  line(g, [[-70, -300], [-84 + sw * .6, -140]], P.coat.l, 2);
  line(g, [[70, -300], [84 + sw * .6, -140]], P.coat.l, 2);
  // arms hanging, swinging slightly
  for (const s of [-1, 1]) {
    const a = Math.sin(ph + (s > 0 ? Math.PI : 0)) * .18 * w + (o.armUp && s > 0 ? -o.armUp * 2.4 : 0);
    const S = [s * 92, -410], Hd = [S[0] + Math.sin(a) * 30 * s + s * 10, S[1] + Math.cos(a) * 230];
    let Hd2 = o.armUp && s > 0 ? [lerp(Hd[0], 40, o.armUp), lerp(Hd[1], -520, o.armUp)] : Hd;
    if (o.wave && s > 0) Hd2 = [lerp(Hd[0], 230, o.wave), lerp(Hd[1], -640, o.wave)];
    cel(g, limb(S, Hd2, 30, 22), { f: P.coat.f, s: P.coat.s, so: [s * 10, 0], h: P.coat.h, l: P.coat.l, lw, rim: o.rim });
    const hp = new Path2D(); hp.ellipse(Hd2[0], Hd2[1] + 8, 20, 22, 0, 0, TAU);
    cel(g, hp, { f: P.lining.f, s: P.lining.s, so: [s * 5, 0], l: P.lining.l, lw: 1.6 });
  }
  // hood from behind (slight point at the top), tilts back when looking up
  g.save(); g.translate(0, -440); g.rotate(0); const lu = o.lookUp || 0, ld = o.lookDown || 0; g.rotate(ld * .12); g.scale(1, 1 - lu * .12 - ld * .06); g.translate(ld * 8, -lu * 10 + ld * 14);
  const hood = [[-78, -10], [-84, -70], [-56, -128], [0, -150, 1], [56, -128], [84, -70], [78, -10], [30, 6], [-30, 6]];
  cel(g, hood, { f: P.coat.f, s: P.coat.s, so: [14, 4], h: P.coat.h, ho: [-8, 10], l: P.coat.l, lw, rim: o.rim });
  line(g, [[0, -146], [2, -80], [0, -10]], P.coat.s, 2.5);
  g.restore();
  g.restore();
}

// ——— eye, extreme close-up through the visor ———
// draws into the full frame. o: { open (0..1), look [x,y], dil (pupil), reflect(g, clipPath, ix, iy, iw, ih), P, visorA }
export function eyeECU(g, e, o) {
  const P = o.P, cx = o.cx ?? 960, cy = o.cy ?? 560, w = o.w ?? 980, h = o.h ?? 420;
  const open = o.open ?? 1;
  // skin field with hard-edged cheek shadow
  g.fillStyle = P.skin.f; g.fillRect(0, 0, 1920, 1080);
  g.fillStyle = P.skin.s;
  g.fill(path([[0, 900], [600, 980], [1300, 1000], [1920, 880], [1920, 1080], [0, 1080]]));
  g.fill(path([[1500, 0], [1920, 0], [1920, 700], [1700, 560], [1560, 300]]));
  // brow (long, thin)
  const by = cy - h * .95;
  cel(g, ribbon([[cx - w * .5, by + 40], [cx - w * .1, by - 6], [cx + w * .3, by + 2], [cx + w * .56, by + 60]], u => 46 * Math.sin(Math.PI * Math.min(1, u * 1.2 + .1))), { f: mix(P.lash, P.skin.s, .25), l: P.lash, lw: 2 });
  // eyelid crease
  line(g, [[cx - w * .42, cy - h * .52], [cx, cy - h * .72], [cx + w * .44, cy - h * .5]], P.skin.l, 4);
  const L = cx - w / 2, R = cx + w / 2;
  const topY = cy - h * .5 * open, botY = cy + h * .45 * Math.min(1, open + .3);
  if (open > .06) {
    const EP = path([[L, cy + h * .06, 1], [cx - w * .2, topY + h * .04], [cx + w * .18, topY], [R, cy - h * .1, 1], [cx + w * .2, botY], [cx - w * .22, botY - h * .02]]);
    g.save(); g.clip(EP);
    g.fillStyle = P.white_eye; g.fill(EP);
    g.fillStyle = mix(P.white_eye, P.skin.s, .6); g.fillRect(L, topY - 20, w, h * .22 + 20);   // lid cast shadow (hard)
    const lk = o.look || [0, 0];
    const iw = w * .22, ih = h * .5, ix = cx + lk[0] * w * .12, iy = cy + h * .06 + lk[1] * h * .1;
    const IR = new Path2D(); IR.ellipse(ix, iy, iw, ih, 0, 0, TAU);
    g.fillStyle = P.eye.f; g.fill(IR);
    g.save(); g.clip(IR);
    g.fillStyle = P.eye.s; g.fillRect(ix - iw, iy - ih, iw * 2, ih * .9);
    g.fillStyle = mix(P.eye.s, P.lash, .5); g.fillRect(ix - iw, iy - ih, iw * 2, ih * .36);
    g.fillStyle = mix(P.eye.h, P.eye.f, .3); g.beginPath(); g.ellipse(ix, iy + ih * .62, iw * .8, ih * .34, 0, 0, TAU); g.fill();
    const pr = (o.dil ?? 1);
    g.fillStyle = mix(P.eye.l, P.lash, .4); g.beginPath(); g.ellipse(ix, iy, iw * .42 * pr, ih * .5 * pr, 0, 0, TAU); g.fill();
    if (o.reflect) o.reflect(g, IR, ix, iy, iw, ih);
    g.restore();
    g.strokeStyle = P.eye.l; g.lineWidth = 5; g.stroke(IR);
    // two highlights
    g.fillStyle = '#ffffff';
    g.beginPath(); g.ellipse(ix - iw * .4, iy - ih * .38, iw * .2, ih * .14, -.4, 0, TAU); g.fill();
    g.beginPath(); g.ellipse(ix + iw * .32, iy + ih * .34, iw * .09, ih * .07, 0, 0, TAU); g.fill();
    if (e) { e.fillStyle = rgba('#ffffff', .25); e.beginPath(); e.ellipse(ix - iw * .4, iy - ih * .38, iw * .2, ih * .14, -.4, 0, TAU); e.fill(); }
    g.restore();
    g.strokeStyle = P.skin.l; g.lineWidth = 3; g.stroke(EP);
  }
  // upper lash line: thick, flicks outward; lower lid thin
  const lash = ribbon([[L - 10, cy + h * .08], [cx - w * .2, topY + h * .02], [cx + w * .18, topY - 4], [R + 10, cy - h * .12], [R + 70, cy - h * .3]], u => 10 + 26 * Math.sin(Math.PI * Math.min(1, u * 1.1)));
  g.fillStyle = P.lash; g.fill(path(lash));
  line(g, [[L + 40, cy + h * .14], [cx - w * .2, botY + 6], [cx + w * .2, botY + 4], [R - 20, cy - h * .02]], P.skin.l, 3.5);
  // visor glass over everything: tint + hard highlight bands
  const va = o.visorA ?? .3;
  g.fillStyle = rgba(P.visor.f, va); g.fillRect(0, 0, 1920, 1080);
  g.fillStyle = rgba(P.visor.h, .1);
  g.fill(poly([[-100, 0], [380, 0], [-100, 700]])); g.fill(poly([[1500, 1080], [1920, 600], [1920, 1080]]));
}

// ——— the pawnbroker, mostly backlit ———
// local: shoulders around (0,0), faces screen right; o: { lens (0..1 lit), hands [[x,y],[x,y]], rim }
export function keeper(g, e, P, o = {}) {
  const lw = 2.4;
  // hunched mass + coat
  cel(g, [[-260, 420], [-250, 60], [-150, -40], [40, -60], [140, 0, 1], [200, 120], [220, 420]], { f: P.keeper.f, s: P.keeper.s, so: [30, 0], l: P.keeper.l, lw, rim: o.rim });
  // head (faces right), flat cap
  cel(g, [[-20, -70], [-40, -150], [0, -210], [70, -210], [110, -170], [118, -120], [100, -70], [60, -40]], { f: P.keeper.f, s: P.keeper.s, so: [16, 0], l: P.keeper.l, lw, rim: o.rim });
  cel(g, [[-60, -190], [-20, -240], [80, -246], [130, -214], [160, -200], [150, -192], [60, -200]], { f: mix(P.keeper.f, '#000000', .3), l: P.keeper.l, lw, rim: o.rim });
  // monocle: ring + lens, glows when lit
  const mx = 92, my = -152, mr = 24, L = o.lens ?? 0;
  const ring = new Path2D(); ring.arc(mx, my, mr, 0, TAU);
  cel(g, ring, { f: mix('#0a3a2a', '#7dffb0', L * .85), s: mix('#06261c', '#2fc078', L), so: [0, 8], h: '#ffffff', hi: L > .3 ? [[[mx - 12, my - 14], [mx - 2, my - 18], [mx - 8, my - 4]]] : [], l: P.metal.l, lw: 5 });
  g.strokeStyle = P.metal.f; g.lineWidth = 5; g.stroke(ring);
  if (e && L > 0) {
    const gr = e.createRadialGradient(mx, my, 0, mx, my, mr * 4); gr.addColorStop(0, rgba('#7dffb0', .9 * L)); gr.addColorStop(.3, rgba('#3dff90', .35 * L)); gr.addColorStop(1, rgba('#3dff90', 0));
    e.fillStyle = gr; e.beginPath(); e.arc(mx, my, mr * 4, 0, TAU); e.fill();
  }
  // mechanical hands
  for (const [hx, hy] of o.hands || []) mechHand(g, P, hx, hy, o.fingers || 0);
}
export function mechHand(g, P, x, y, f = 0) {
  cel(g, [[x - 50, y - 30], [x + 30, y - 36], [x + 44, y + 6], [x - 46, y + 10]], { f: P.metal.f, s: P.metal.s, so: [0, 10], h: P.metal.h, ho: [0, -4], l: P.metal.l, lw: 2 });
  for (let i = 0; i < 4; i++) {
    const fx = x + 34, fy = y - 26 + i * 10, a = .3 + Math.sin(f * TAU + i) * .15;
    const p1 = [fx + Math.cos(a) * 34, fy + Math.sin(a) * 34], p2 = [p1[0] + Math.cos(a + .7) * 26, p1[1] + Math.sin(a + .7) * 26];
    cel(g, limb([fx, fy], p1, 5, 4.5), { f: P.metal.f, s: P.metal.s, so: [0, 3], l: P.metal.l, lw: 1.4 });
    cel(g, limb(p1, p2, 4.5, 3.5), { f: P.metal.f, s: P.metal.s, so: [0, 3], l: P.metal.l, lw: 1.4 });
  }
}

// ——— the woman in the memory: backlit silhouette, hair and dress in the sea wind ———
// local: feet at 0, height ≈ 420. o: { t, wave (0..1), rim }
export function woman(g, P, o = {}) {
  const t = o.t || 0, fr = Math.floor(t * 12) / 12, wv = o.wave || 0;
  const fill = { f: '#3a2f58', s: '#2a2044', so: [10, 0], l: '#1c1430', lw: 2, rim: o.rim };
  // dress (A-line), hem flutters to the left
  const hem = [];
  for (let i = 0; i <= 6; i++) { const u = i / 6; hem.push([lerp(90, -110, u) + Math.sin(fr * 7 + u * 6) * 8, -70 + Math.sin(fr * 9 + u * 5) * 6 - u * 10]); }
  cel(g, [[-36, -300], [36, -300], [60, -200], ...hem, [-60, -200]], fill);
  // legs
  cel(g, [[-26, -76], [-10, -76], [-14, 0], [-28, 0]], fill); cel(g, [[10, -76], [26, -76], [28, 0], [14, 0]], fill);
  // waving arm (right), other arm down
  const a = -2.4 - Math.sin(fr * 10) * .35 * wv - (1 - wv) * -1.6;
  const S = [30, -290], Hd = [S[0] - Math.sin(a) * 150, S[1] + Math.cos(a) * 150];
  cel(g, limb(S, Hd, 12, 9), fill);
  cel(g, limb([-30, -290], [-58, -160], 12, 9), fill);
  // neck + head
  cel(g, [[-10, -330], [10, -330], [12, -296], [-12, -296]], fill);
  const head = new Path2D(); head.ellipse(0, -362, 34, 40, 0, 0, TAU); cel(g, head, fill);
  // hair: locks streaming left
  for (let k = 0; k < 5; k++) {
    const sp = flutter(12, -380 + k * 10, Math.PI - .22 - k * .05, 150 + k * 20, 9, 12 + k * 2, 1.4, fr * 9 + k, 10);
    cel(g, ribbon(sp, u => (1 - u) * 34 + 2), fill);
  }
}

// ——— crowd: a figure under an umbrella, facing away or up ———
// local: feet at 0. o: { umb: palette entry, tilt, up (0..1 looking up), rim, lit }
export function umbrellaPerson(g, P, o = {}) {
  const U = o.umb || P.umb, C = P.coatC, lw = 2;
  const up = o.up || 0, tilt = (o.tilt || 0) - up * .35;
  cel(g, [[-58, -300], [58, -300], [70, -60], [-70, -60]], { f: C.f, s: C.s, so: [14, 0], l: C.l, lw, rim: o.rim });
  cel(g, [[-40, -60], [-8, -60], [-10, 0], [-38, 0]], { f: P.pants.f, s: P.pants.s, l: P.pants.l, lw });
  cel(g, [[8, -60], [40, -60], [38, 0], [10, 0]], { f: P.pants.f, s: P.pants.s, l: P.pants.l, lw });
  const hd = new Path2D(); hd.ellipse(0, -334 - up * 6, 34, 38, 0, 0, TAU);
  cel(g, hd, { f: mix(C.f, '#000', .2), s: C.s, so: [10, 0], l: C.l, lw, rim: o.rim });
  g.save(); g.translate(0, -300); g.rotate(tilt);
  line(g, [[0, 0], [0, -140]], P.metal.l, 4);
  const dome = [[-170, -110], [-120, -170], [-40, -200], [40, -200], [120, -170], [170, -110], [120, -122], [60, -112], [0, -124], [-60, -112], [-120, -122]];
  cel(g, dome, { f: U.f, s: U.s, so: [0, 18], h: U.h, ho: [0, -10], l: U.l, lw, rim: o.rim });
  g.restore();
}

// ——— the kite (diamond + ribbon tail) ———
export function kite(g, e, x, y, s, t, ang = .1) {
  const fr = Math.floor(t * 12) / 12;
  g.save(); g.translate(x, y); g.rotate(ang + Math.sin(fr * 3) * .06); g.scale(s, s);
  const tail = flutter(0, 70, Math.PI / 2 + .5, 220, 12, 18, 2.2, fr * 10, 20);
  cel(g, ribbon(tail, u => 10 * (1 - u) + 3), { f: '#ff6a5a', l: '#8a2a2a', lw: 1.5 });
  cel(g, [[0, -70, 1], [48, 0, 1], [0, 70, 1], [-48, 0, 1]], { f: '#ff4a46', s: '#c02a3a', sh: [[[0, -70], [48, 0], [0, 70]]], l: '#6a1420', lw: 2.4 });
  cel(g, [[0, -70, 1], [0, 0, 1], [-48, 0, 1]], { f: '#fff4e0', l: '#6a1420', lw: 2 });
  g.restore();
}
