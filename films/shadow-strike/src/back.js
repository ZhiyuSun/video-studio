// Backstage: rim-lit silhouettes (hands, the old puppeteer, lamps), flames, smoke. Viewport coordinates.
// silhouette() technique adapted from the Lemo-Opuscar shadow-puppet demo (MIT).
import { canvas } from './carve.js';
import { vnoise, mulberry } from '/core/lib.js';

let BUF = null;
function bufs(W, H) { if (!BUF || BUF[0][0].width !== W || BUF[0][0].height !== H) BUF = [canvas(W, H), canvas(W, H), canvas(W, H)]; return BUF; }
// draw(mask) paints the shape in white; dir = unit vector toward the light; k = rim width
export function silhouette(g, draw, { dir = [.6, -.8], k = 5, dark = '#0c0705', rim = '#ffb05a', rimA = .9, blur = 0, alpha = 1 } = {}) {
  const W = g.canvas.width, H = g.canvas.height, [[mc, mg], [rc, rg], [oc, og]] = bufs(W, H);
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, W, H); mg.fillStyle = '#fff'; mg.strokeStyle = '#fff'; mg.lineCap = 'round'; mg.lineJoin = 'round'; mg.filter = 'none'; mg.globalAlpha = 1;
  draw(mg);
  og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, W, H); og.globalCompositeOperation = 'source-over'; og.filter = 'none'; og.globalAlpha = 1;
  og.drawImage(mc, 0, 0); og.globalCompositeOperation = 'source-in'; og.fillStyle = dark; og.fillRect(0, 0, W, H);
  rg.setTransform(1, 0, 0, 1, 0, 0); rg.clearRect(0, 0, W, H); rg.globalCompositeOperation = 'source-over'; rg.filter = 'none';
  rg.drawImage(mc, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.filter = 'blur(1.6px)'; rg.drawImage(mc, -dir[0] * k, -dir[1] * k);
  rg.filter = 'none'; rg.globalCompositeOperation = 'source-in'; rg.fillStyle = rim; rg.fillRect(0, 0, W, H);
  og.globalCompositeOperation = 'source-over'; og.globalAlpha = rimA; og.filter = 'blur(.7px)'; og.drawImage(rc, 0, 0); og.globalAlpha = 1; og.filter = 'none';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; if (blur) g.filter = `blur(${blur}px)`; g.drawImage(oc, 0, 0); g.restore();
}
const tf = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
const cap = (g, pts, w) => { for (let i = 0; i < pts.length - 1; i++) { g.lineWidth = Array.isArray(w) ? w[i] : w; g.beginPath(); g.moveTo(...pts[i]); g.lineTo(...pts[i + 1]); g.stroke(); } };
const blob = (g, pts) => { g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i < pts.length; i++) g.lineTo(...pts[i]); g.closePath(); g.fill(); };

// A hand gripping a vertical rod, back of the hand to camera. M: local → viewport (origin = wrist, -y = fingers up).
// age 0 = young (smooth, slim) … 1 = old (knobbed knuckles, thin fingers, bony wrist). grip 0..1 (1 = closed). Returns the grip point.
export function gripHand(g, M, { age = 0, grip = 1, side = 1, sleeve = true } = {}) {
  const k = Math.hypot(M[0], M[1]), P = p => tf(M, [p[0] * side, p[1]]);
  if (sleeve) {
    blob(g, [[-46, 26], [-62, 70], [-86, 170], [-110, 300], [116, 300], [92, 170], [70, 70], [50, 26]].map(P));
    g.beginPath(); const c = P([2, 34]); g.ellipse(c[0], c[1], 54 * k, 18 * k, Math.atan2(M[1], M[0]), 0, 7); g.fill();
  }
  const ww = age ? 30 : 34;
  blob(g, [[-ww, -10], [-ww - 2, 30], [ww + 2, 30], [ww, -10]].map(P));                                        // wrist
  if (age) { g.beginPath(); g.arc(...P([ww - 4, -6]), 7 * k, 0, 7); g.fill(); }                                   // bony wrist knob
  blob(g, [[-40, 0], [-46, -34], [-44, -68], [-36, -86], [34, -88], [42, -70], [40, -32], [32, 0]].map(P));      // back of hand
  const kn = [[-27, -86, 20], [-8, -91, 21], [12, -90, 20], [30, -84, 17]];
  for (const [x, y, w] of kn) {
    const wf = w * (age ? .82 : 1) * k;
    cap(g, [P([x, y + 8]), P([x - 1, y - 6 * grip]), P([x + 3, y - 14 * grip])], [wf, wf * .92]);
    if (age) { g.beginPath(); g.arc(...P([x - .5, y - 2]), w * .62 * k, 0, 7); g.fill(); g.beginPath(); g.arc(...P([x + 2, y - 12 * grip]), w * .5 * k, 0, 7); g.fill(); }
  }
  cap(g, [P([-42, -22]), P([-56, -50]), P([-48, -80]), P([-32, -96])], [24 * k * (age ? .85 : 1), 20 * k * (age ? .85 : 1), 16 * k]);
  g.beginPath(); g.arc(...P([-30, -98]), (age ? 9.5 : 8.5) * k, 0, 7); g.fill();
  return P([-6, -102]);
}
// An open hand (palm pressed flat), seen from behind: fingers spread. origin = wrist, -y = fingers
export function flatHand(g, M, { age = 1, side = 1, spread = 1 } = {}) {
  const k = Math.hypot(M[0], M[1]), P = p => tf(M, [p[0] * side, p[1]]);
  blob(g, [[-30, 40], [-34, 0], [34, 0], [32, 40]].map(P));
  blob(g, [[-38, 4], [-46, -40], [-40, -84], [34, -88], [44, -44], [36, 4]].map(P));
  const f = [[-30, -82, -.22, 62], [-10, -88, -.07, 74], [10, -88, .07, 72], [28, -82, .2, 58]];
  for (const [x, y, a0, L] of f) {
    const a = a0 * spread, pts = [0, .35, .7, 1].map(u => P([x + Math.sin(a) * L * u, y - Math.cos(a) * L * u]));
    cap(g, pts, [17 * k * (age ? .85 : 1), 15 * k * (age ? .85 : 1), 13 * k]);
    if (age) for (const u of [.36, .7]) { g.beginPath(); g.arc(...P([x + Math.sin(a) * L * u, y - Math.cos(a) * L * u]), 9.5 * k, 0, 7); g.fill(); }
  }
  cap(g, [P([40, -10]), P([66, -34]), P([82, -62]), P([88, -84])], [24 * k, 20 * k, 16 * k]);
}
// The old puppeteer seen from behind (we are behind him, he faces the cloth). M: local → viewport, origin = seat. arms: hand targets (local)
export function oldManBack(g, M, { head = 0, slump = 0 } = {}) {
  const k = Math.hypot(M[0], M[1]), P = p => tf(M, p);
  blob(g, [[-60, 0], [60, 0], [70, 40], [-70, 40]].map(P));                       // stool
  cap(g, [P([-50, 40]), P([-60, 160])], 12 * k); cap(g, [P([50, 40]), P([60, 160])], 12 * k);
  const sl = slump * 12;
  g.beginPath(); const back = [[-120, 0], [-132, -80], [-126, -170], [-98, -236 + sl], [-50, -262 + sl], [0, -268 + sl], [50, -262 + sl], [98, -236 + sl], [126, -170], [132, -80], [120, 0]].map(P);
  g.moveTo(...back[0]); for (let i = 1; i < back.length - 1; i++) { const m = [(back[i][0] + back[i + 1][0]) / 2, (back[i][1] + back[i + 1][1]) / 2]; g.quadraticCurveTo(...back[i], ...m); } g.lineTo(...back[back.length - 1]); g.closePath(); g.fill();
  const hc = P([4 + head * 14, -306 + sl * 1.4 + Math.abs(head) * 4]);
  g.beginPath(); g.ellipse(hc[0], hc[1], 44 * k, 52 * k, head * .3, 0, 7); g.fill();                       // head
  g.beginPath(); g.ellipse(hc[0], hc[1] - 36 * k, 58 * k, 16 * k, head * .3, 0, 7); g.fill();            // cap brim
  g.beginPath(); g.ellipse(hc[0], hc[1] - 52 * k, 40 * k, 26 * k, head * .3, 0, 7); g.fill();            // cap crown
  g.beginPath(); g.ellipse(...P([-46 - head * 6, -300 + sl]), 9 * k, 15 * k, 0, 0, 7); g.fill();               // ear
  return { shL: P([-104, -226 + sl]), shR: P([104, -226 + sl]) };
}
// arm as a tapered tube between viewport points
export function armTube(g, a, b, c, w0, w1) { cap(g, [a, b], w0); cap(g, [b, c], w1); g.beginPath(); g.arc(...b, w0 * .5, 0, 7); g.fill(); }
// Oil lamp (mask, white). x,y = bowl centre; s = scale; cord = length of the hanging cords
export function lampBody(g, x, y, s, cord = 260) {
  const P = (a, b) => [x + a * s, y + b * s];
  g.beginPath(); g.moveTo(...P(-34, -4)); g.quadraticCurveTo(...P(-30, 14), ...P(0, 16)); g.quadraticCurveTo(...P(30, 14), ...P(34, -4)); g.lineTo(...P(24, -2)); g.lineTo(...P(-24, -2)); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(...P(-5, 14)); g.lineTo(...P(5, 14)); g.lineTo(...P(6, 50)); g.lineTo(...P(-6, 50)); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(...P(-22, 50)); g.lineTo(...P(22, 50)); g.lineTo(...P(16, 58)); g.lineTo(...P(-16, 58)); g.closePath(); g.fill();
  g.lineWidth = 2.2 * s; g.beginPath(); g.moveTo(...P(-24, 0)); g.lineTo(...P(0, -cord)); g.moveTo(...P(24, 0)); g.lineTo(...P(0, -cord)); g.stroke();
  g.lineWidth = 3 * s; g.beginPath(); g.moveTo(...P(12, -4)); g.lineTo(...P(20, -10)); g.stroke();
}
export function flame(g, x, y, s, t, a = 1, halo = 260) {
  if (a <= 0) return;
  const f = 1 + .08 * Math.sin(t * 31) + .06 * vnoise(t * 9) - .03, sw = (vnoise(t * 5 + 3) - .5) * 5 * s;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a;
  const gx = x + 20 * s, gy = y - 12 * s, hr = halo * s;
  let gr = g.createRadialGradient(gx, gy - 18 * s, 0, gx, gy - 18 * s, hr); gr.addColorStop(0, 'rgba(255,190,110,.55)'); gr.addColorStop(.25, 'rgba(255,150,70,.18)'); gr.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = gr; g.fillRect(gx - hr, gy - hr - 20 * s, hr * 2, hr * 2);
  g.beginPath(); g.moveTo(gx - 7 * s, gy); g.quadraticCurveTo(gx - 9 * s, gy - 18 * s * f, gx + sw, gy - 40 * s * f); g.quadraticCurveTo(gx + 9 * s, gy - 18 * s * f, gx + 7 * s, gy); g.closePath();
  gr = g.createLinearGradient(0, gy, 0, gy - 40 * s); gr.addColorStop(0, 'rgba(120,150,255,.8)'); gr.addColorStop(.18, 'rgba(255,240,200,1)'); gr.addColorStop(.6, 'rgba(255,190,90,.95)'); gr.addColorStop(1, 'rgba(255,120,40,.2)');
  g.fillStyle = gr; g.fill();
  g.restore();
}
export function smoke(g, x, y, s, t, age, seed = 1) {
  if (age <= 0) return;
  const r = mulberry(seed);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.lineCap = 'round';
  for (let w = 0; w < 3; w++) {
    const ph = r() * 10, amp = 10 + r() * 16, len = Math.min(1, age / 2.5) * (260 + r() * 140) * s, pts = [];
    for (let i = 0; i < 40; i++) { const u = i / 39; pts.push([x + 20 * s + Math.sin(u * 5 + t * .9 + ph) * amp * u * s * (1 + u) + (vnoise(u * 3 + t * .4 + ph) - .5) * 34 * u * s, y - 10 * s - u * len, u]); }
    for (let i = 1; i < pts.length; i++) { const [xx, yy, u] = pts[i], fade = (1 - u * .85) * Math.min(1, age * .8) * Math.max(0, 1 - age / 9); g.lineWidth = (2.5 + u * 10) * s; g.strokeStyle = `rgba(60,40,28,${.22 * fade})`; g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(xx, yy); g.stroke(); }
  }
  g.restore();
}
