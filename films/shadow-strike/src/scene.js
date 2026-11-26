// One frame of one layer: state → transmittance canvas + front canvas → GL composite.
import { makeGL } from './gl.js';
import { canvas, DYE } from './carve.js';
import { clamp, lerp } from '/core/lib.js';
import { build, yaoParts, heroParts, princessParts, oldParts, drawDyed, drawShadow, drawRods, mul, T, S, R, ap, SHADOW } from './rig.js';
import { buildStage, drawFrame, drawAudience, drawPlaque, placard, drawScenePiece, CW, CH, GROUND } from './stage.js';
import { silhouette } from './back.js';

export const W = 1920, H = 804;
export const [trc, tr] = canvas(W, H), [frc, fr] = canvas(W, H);
export const GL = makeGL(document.getElementById('gl'));
export const camM = ([cx, cy, z], mir = 1) => [z * mir, 0, 0, z, W / 2 - cx * z * mir, H / 2 - cy * z];
export const LAMPS0 = [[470, 250], [960, 230], [1450, 250]];

const RIG = { yao: yaoParts, hero: heroParts, princess: princessParts, old: oldParts };
export function rigOf(a) { return RIG[a.kind](a.pose); }

// Shadow of an arbitrary mask drawing (e.g. a human hand pressed on the cloth from behind)
export function maskShadow(g, draw, { blur = 0, col = SHADOW, alpha = .95 } = {}) {
  silhouette(g, draw, { dark: col, rimA: 0, alpha, blur });
}

// state: { cam, mir, lamps, expo, actors:[{kind,pose,mode,blur,alpha,ghost,rods}], scenery:[], plaques:[], audience, frame, placard, over(fr,C), under(tr,C), gl:{} }
export function drawLayer(st) {
  const mir = st.mir || 1, C = camM(st.cam, mir), k = st.cam[2];
  tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'source-over'; tr.globalAlpha = 1; tr.filter = 'none'; tr.fillStyle = '#fff'; tr.fillRect(0, 0, W, H);
  fr.setTransform(1, 0, 0, 1, 0, 0); fr.globalCompositeOperation = 'source-over'; fr.globalAlpha = 1; fr.filter = 'none'; fr.clearRect(0, 0, W, H);
  const STG = buildStage(st.credit);
  if (st.ground !== false) drawScenePiece(tr, C, STG.ground, 0, GROUND + 8, 1);
  for (const s of st.scenery || []) drawScenePiece(tr, C, STG[s.pc] || s.pc, s.x, s.y, s.sc || 1, s.rot || 0, s);
  if (st.under) st.under(tr, C);
  for (const a of st.actors || []) {
    const rig = rigOf(a);
    if (a.mode === 'shadow') drawShadow(tr, C, rig, { blur: (a.blur || 0) * k, alpha: a.alpha, ghost: a.ghost && { M: rig.M.head, a: a.ghost } });
    else drawDyed(tr, C, rig, { blur: (a.blur || 0) * k, alpha: a.alpha, rivets: a.rivets });
    if (a.rods) {
      const pts = a.rods.map(n => n === 'neck' ? ap(C, ...ap(rig.M.MB, 4, -60)) : ap(C, ...ap(rig.M[n], 0, 12)));
      drawRods(tr, pts, pts.map((p, i) => [p[0] + (a.rodLean || -60) * k * (i + 1) * .5, p[1] + 900 * k]), 2.4 * k, .62, k);
    }
  }
  for (const p of st.plaques || []) {
    drawPlaque(tr, C, STG[p.pc], p.x, p.y, p.sc || 1, p);
    if (p.rods !== false) { const pts = [[-260, 120], [260, 120]].map(([a, b]) => ap(C, p.x + a * (p.sc || 1), p.y + b * (p.sc || 1))); drawRods(tr, pts, pts.map(q => [q[0] - 50 * k, q[1] + 900]), 2.4 * k, .6, k); }
  }
  if (st.over0) st.over0(tr, C);
  if (st.frame !== undefined && st.frame !== false) drawFrame(fr, C, st.frame);
  if (st.audience) drawAudience(fr, st.audience.a ?? 1, st.t || 0, st.audience);
  if (st.over) st.over(fr, C);
  let box = null;
  if (st.placard) box = placard(fr, st.placard.text, st.placard.a ?? 1, st.placard.slide || 0, st.placard.x ?? 70);
  const nl = (st.lamps || []).reduce((s, l) => s + l[2], 0);
  return {
    o: { lamps: st.lamps, cam: st.cam, mir, rect: [0, 0, CW, CH], expo: st.expo ?? 1.3 / Math.sqrt(Math.max(1, nl)), sigB: 620, sigC: 110, amb: .3, time: st.t || 0, vign: .45, sat: 1.1, contrast: .15, bloom: .3, ...(st.gl || {}) },
    box
  };
}
export function renderLayer(st) { const r = drawLayer(st); GL.render(trc, frc, r.o); return r; }
// copy the GL output into a 2D canvas (for nesting a layer inside a bigger one)
export function grab(c) { const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(document.getElementById('gl'), 0, 0, c.width, c.height); return c; }
