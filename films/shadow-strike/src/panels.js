// Storyboard panels: nine key frames rendered with the real engine (the full timeline builds on the same states).
import { renderLayer, drawLayer, GL, trc, frc, tr, fr, W, H, camM, LAMPS0, grab, rigOf, maskShadow } from './scene.js';
import { build, yaoParts, heroParts, drawDyed, drawShadow, mul, T, S, R, ap, SHADOW } from './rig.js';
import { buildStage, GROUND, CW, CH, drawFrame } from './stage.js';
import { silhouette, gripHand, flatHand, oldManBack, armTube, lampBody, flame, smoke } from './back.js';
import { canvas, drawPiece } from './carve.js';

const yG = GROUND - 78, hG = GROUND - 170, pG = GROUND - 190;
const L3 = (i = 1) => LAMPS0.map(([x, y]) => [x, y, i, .95]);
const L2 = (i = 1) => LAMPS0.slice(0, 2).map(([x, y]) => [x, y, i, .95]);

// —— poses
export const POSE = {
  heroStrike: { x: 700, y: hG + 6, lean: .16, legF: -.42, legB: .34, head: .12, tF: [88, 40], tB: [-50, 40], bladeW: .75, rot: .04 },
  heroGuard: { x: 640, y: hG, lean: -.02, legF: -.3, legB: .24, head: 0, tF: [56, -20], tB: [-36, 60], bladeW: -1.25 },
  heroFollow: { x: 690, y: hG + 8, lean: .2, legF: -.45, legB: .36, head: .2, tF: [70, 80], tB: [-50, 30], bladeW: 1.3 },
  yaoFlip: { x: 960, y: yG - 110, rot: -2.4, flip: -1, tF: [20, -40], tB: [-20, -50], legF: -.6, legB: .5, head: -.3, tail: [.9, .6, .5] },
  yaoStand: { x: 1000, y: yG, flip: -1, tF: [30, 30], tB: [-12, 48], head: .05 },
  yaoLookHand: { x: 1000, y: yG, flip: -1, tF: [34, -14], tB: [-12, 48], head: .45, lean: .06 },
};

// —— 1. S1: the strike, mid-show (3 lamps, hand-held, rods visible)
function p1() {
  renderLayer({ cam: [860, 500, 1.55], lamps: L3(), actors: [
    { kind: 'hero', pose: POSE.heroStrike, rods: ['neck', 'hF', 'hB'], rodLean: -70 },
    { kind: 'yao', pose: POSE.yaoFlip, rods: ['neck', 'hF'], rodLean: 50 }], gl: { bloom: .34 } });
}
// —— 2. S5: backstage insert — young hands strike, old hands stop for half a beat (mirror view)
function p2() {
  const cam = [900, 560, 1.7], C = camM(cam, -1);
  const hero = { kind: 'hero', pose: { ...POSE.heroStrike, x: 740 } }, yao = { kind: 'yao', pose: { ...POSE.yaoStand, x: 1030, head: -.1, tF: [24, 40] } };
  const hr = rigOf(hero), yr = rigOf(yao);
  const r = drawLayer({ cam, mir: -1, lamps: L2(), actors: [hero, yao], gl: { expo: 1.0, vign: .6, bloom: .36 },
    over: (g) => {
      const A = { hN: ap(C, ...ap(hr.M.MB, 4, -60)), hF: ap(C, ...ap(hr.M.hF, 0, 12)), yN: ap(C, ...ap(yr.M.MB, 4, -60)), yF: ap(C, ...ap(yr.M.hF, 0, 12)) };
      const rod = (m, from, to, w) => { m.lineWidth = w; m.beginPath(); m.moveTo(from[0], from[1] + 40); m.lineTo(to[0], to[1]); m.stroke(); };
      silhouette(g, m => {
        const k = 2.3;
        rod(m, gripHand(m, [k, -.25, .25, k, A.hN[0] + 120, 700], { age: 0, side: 1 }), A.hN, 7);
        rod(m, gripHand(m, [k * .95, .2, -.2, k * .95, A.hF[0] + 360, 760], { age: 0, side: -1 }), A.hF, 5);
        rod(m, gripHand(m, [k, .12, -.12, k, A.yN[0] - 60, 690], { age: 1, side: -1, grip: .55 }), A.yN, 7);
        rod(m, gripHand(m, [k * .95, -.2, .2, k * .95, A.yF[0] - 340, 760], { age: 1, side: 1, grip: .7 }), A.yF, 5);
      }, { dir: [0, -1], k: 5, rimA: .95 });
    } });
  GL.render(trc, frc, r.o);
}
// —— 3. S6: the puppet falls; the shadow stays standing (2 lamps)
function p3() {
  renderLayer({ cam: [930, 500, 1.4], lamps: L2(), actors: [
    { kind: 'hero', pose: POSE.heroFollow, rods: ['neck', 'hF'], rodLean: -70 },
    { kind: 'yao', pose: { x: 1060, y: yG + 40, rot: -1.45, flip: -1, tF: [30, -30], tB: [-10, -40], legF: -.5, legB: .2, head: .3, tail: [.2, .1, .1] }, blur: 4, alpha: .9 },
    { kind: 'yao', pose: { ...POSE.yaoStand, x: 1010, tF: [22, 44], tB: [-12, 50] }, mode: 'shadow' }], gl: { bloom: .3 } });
}
// —— 4. S10: it tries being a tree; a bird lands on its hand (audience laughing)
function p4() {
  const yp = { x: 1500, y: yG - 10, flip: -1, aF: [-2.5, -2.9], aB: [2.3, 2.7], head: -.5, lean: -.04, hF: -.2, hB: .2, legF: -.04, legB: .04 };
  const yr = yaoParts(yp), hand = ap(yr.M.hF, 0, 30);
  renderLayer({ cam: [1330, 500, 1.4], t: 3, lamps: L2(), scenery: [{ pc: 'tree', x: 1220, y: GROUND + 4, sc: .95 }, { pc: 'bird', x: hand[0] - 4, y: hand[1] - 2, sc: 1.2, flip: -1 }],
    actors: [{ kind: 'yao', pose: yp, mode: 'shadow' }], audience: { a: 1, laugh: 1, blur: 4 } });
}
// —— 5. S11: the edge of the cloth. It cannot get out.
function p5() {
  const yp = { x: 1838, y: yG, tF: [44, -26], tB: [-10, 46], head: .28, lean: .05 };
  renderLayer({ cam: [1700, 480, 1.5], t: 7, lamps: L2(.9), actors: [{ kind: 'yao', pose: yp, mode: 'shadow' }], frame: .7, audience: { a: .9, laugh: 0, blur: 4, set: 1 } });
}
// —— 6. S13: it walks to the lamp, grows, and the solid face burns through (one lamp, brightest frame)
function p6() {
  const P = [960, 250], s = 4.2, at = [962, 270];      // projection centre (lamp), scale, where its head sits
  const base = { back: true, aF: [-.5, -.9], aB: [.5, .9], head: 0, tail: [.2, .1, .1] };
  const r0 = yaoParts({ ...base, x: 0, y: 0 }), hd = ap(r0.M.MB, 0, -150);   // head centre (unit pose)
  const pose = { ...base, k: s, x: at[0] - hd[0] * s, y: at[1] - hd[1] * s };
  renderLayer({ cam: [960, 400, 1.0], t: 5, lamps: [[P[0], P[1], 1.6, 1.8]], actors: [{ kind: 'yao', pose, mode: 'shadow', blur: 9, alpha: .96, ghost: 1 }], ground: true,
    audience: { a: 1, stand: i => [1, .8, 1, .9, 1, 1, .85, 1][i], blur: 6 }, gl: { expo: 1.15, bloom: .5, thr: .7, sigC: 120 } });
}
// —— 7. S14: behind the screen — the old puppeteer, the rack of worn yao heads, the shadow turns to look at him
function p7() {
  const cam = [860, 430, 1.15], C = camM(cam, -1);
  const r = drawLayer({ cam, mir: -1, lamps: [[860, 250, 1, 1]], actors: [
    { kind: 'yao', pose: { ...POSE.yaoStand, x: 900, flip: -1, head: -.18, tF: [20, 46] }, mode: 'shadow' },
    { kind: 'yao', pose: { x: 640, y: yG + 48, rot: 1.5, flip: -1, tF: [20, 40], tB: [-10, 40], legF: .2, head: .2 }, rivets: true }],
    over0: (g, C) => {   // the rack: the same yao head, forty years of copies — newest to oldest, darker hide, more patches
      const Y = build().y.head;
      for (let i = 0; i < 5; i++) {
        const x = 1330 - i * 105, y = 230 + (i % 2) * 10;
        g.save(); g.globalCompositeOperation = 'multiply'; g.filter = 'blur(1.5px)';
        g.setTransform(...mul(C, mul(T(x, y), S(.9)))); drawPiece(g, Y);
        g.globalAlpha = .12 + i * .13; g.fillStyle = '#6a3c18'; g.beginPath(); g.ellipse(8, -40, 62, 56, 0, 0, 7); g.fill();
        g.globalAlpha = .9; g.strokeStyle = '#2a1a10'; g.lineWidth = 2.2; for (let k = 0; k < i * 2; k++) { const px = -34 + (k * 23) % 70, py = -84 + ((k * 37) % 70); g.beginPath(); g.rect(px, py, 14, 11); g.stroke(); g.beginPath(); g.moveTo(px - 2, py + 5); g.lineTo(px + 16, py + 6); g.stroke(); }
        g.restore();
        g.save(); g.globalCompositeOperation = 'multiply'; g.filter = 'blur(1.5px)'; const a = ap(C, x + 8, y - 120), b = ap(C, x + 8, 120); g.strokeStyle = '#3a2416'; g.lineWidth = 2; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore();
      }
      g.save(); g.globalCompositeOperation = 'multiply'; g.filter = 'blur(2px)'; const a = ap(C, 860, 120), b = ap(C, 1460, 120); g.strokeStyle = '#2a1a10'; g.lineWidth = 10; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.stroke(); g.restore();
    },
    over: (g, C) => {
      const tl = ap(C, 0, 0), br = ap(C, CW, CH);
      g.save(); g.fillStyle = '#0d0705'; g.beginPath(); g.rect(0, 0, W, H); g.rect(Math.min(tl[0], br[0]), tl[1], Math.abs(br[0] - tl[0]), br[1] - tl[1]); g.fill('evenodd'); g.restore();
      const lampV = ap(C, 860, 330);
      silhouette(g, m => {
        lampBody(m, lampV[0], lampV[1] - 60, 1.0, 260);
        const o = oldManBack(m, [1.5, 0, 0, 1.5, 1380, 930], { head: -.45, slump: 1 });
        armTube(m, o.shL, [o.shL[0] - 40, o.shL[1] + 200], [o.shL[0] + 60, o.shL[1] + 320], 84, 64);
        armTube(m, o.shR, [o.shR[0] + 50, o.shR[1] + 200], [o.shR[0] - 40, o.shR[1] + 320], 84, 64);
        m.lineWidth = 8; m.beginPath(); m.moveTo(o.shL[0] - 280, o.shL[1] + 360); m.lineTo(o.shR[0] + 200, o.shR[1] + 250); m.stroke();
        m.lineWidth = 6; m.beginPath(); m.moveTo(o.shL[0] - 240, o.shL[1] + 400); m.lineTo(o.shR[0] + 260, o.shR[1] + 330); m.stroke();
      }, { dir: [-.7, -.7], k: 7, rimA: .95 });
      flame(g, lampV[0], lampV[1] - 60, 1.0, 4.2, 1, 300);
    }, gl: { expo: 1.1, vign: .55, bloom: .4 } });
  GL.render(trc, frc, r.o);
}
// —— 8. S15: pull back — he is a shadow on a bigger cloth; threads from his wrists into the dark
const WIN = [930, 300, 600, 251];   // window of the small stage inside the big cloth (x, y, w, h)
function l0Rest(t = 6) {   // the small stage as it looks from far away
  renderLayer({ cam: [960, 420, .8], t, lamps: [[470, 250, 1, .95]], frame: .8, actors: [
    { kind: 'yao', pose: { ...POSE.yaoStand, x: 900, flip: 1, head: -.1 }, mode: 'shadow' },
    { kind: 'yao', pose: { x: 1150, y: yG + 48, rot: -1.5, tF: [20, 40], tB: [-10, 40], legF: .2, head: .2 } }] });
}
let IMG0 = null;
function p8() {
  l0Rest(); IMG0 = IMG0 || canvas(W, H)[0]; grab(IMG0);
  const op = { x: 690, y: GROUND - 110, k: 1.5, head: -.5, lean: -.08, aF: [-1.0, -1.7], aB: [-.7, -1.5] };
  const st = { cam: [960, 330, .74], t: 8, lamps: [[560, 320, 1.2, 1.1]], frame: .9, actors: [{ kind: 'old', pose: op, rivets: true, rk: 1.6 }], ground: true,
    over: (g, C) => {
      const a = ap(C, WIN[0], WIN[1]), b = ap(C, WIN[0] + WIN[2], WIN[1] + WIN[3]);
      g.save(); g.fillStyle = '#1a0a06'; g.fillRect(a[0] - 14, a[1] - 14, b[0] - a[0] + 28, b[1] - a[1] + 28); g.drawImage(IMG0, a[0], a[1], b[0] - a[0], b[1] - a[1]); g.restore();
      const rig = rigOf({ kind: 'old', pose: op });
      // rods from his hands into the small stage
      for (const n of ['hF', 'hB']) { const h = ap(C, ...ap(rig.M[n], 0, 18)), e = [ap(C, WIN[0] + 200 + (n === 'hF' ? 120 : 0), 0)[0], b[1] - 30]; g.save(); g.strokeStyle = '#1a0e08'; g.lineWidth = 3; g.globalAlpha = .9; g.beginPath(); g.moveTo(...h); g.lineTo(...e); g.stroke(); g.restore(); }
      // threads: from each wrist up, out of the top of the cloth, into the dark
      for (const n of ['hF', 'hB']) {
        const h = ap(C, ...ap(rig.M[n], 0, 2)), top = ap(C, 0, -40)[1];
        g.save(); g.lineWidth = 1.6; g.strokeStyle = 'rgba(40,24,14,.85)'; g.beginPath(); g.moveTo(...h); g.lineTo(h[0] + 30, ap(C, 0, 0)[1]); g.stroke();
        const gr = g.createLinearGradient(0, ap(C, 0, 0)[1], 0, 0); gr.addColorStop(0, 'rgba(255,196,120,.7)'); gr.addColorStop(1, 'rgba(255,196,120,0)');
        g.strokeStyle = gr; g.lineWidth = 1.4; g.beginPath(); g.moveTo(h[0] + 30, ap(C, 0, 0)[1]); g.lineTo(h[0] + 44, 0); g.stroke(); g.restore();
      }
    }, gl: { vign: .5 } };
  renderLayer(st);
}
// —— 9. S18: the old man's palm from behind, the yao's palm from the front; one small lamp; the closing placard
function p9() {
  const cam = [880, 470, 2.0], C = camM(cam);
  const yp = { x: 800, y: yG - 2, tF: [42, -56], tB: [-12, 46], head: -.3, hF: -.35, lean: .03 };
  renderLayer({ cam, t: 9, lamps: [[1060, 300, .9, 1]], actors: [{ kind: 'yao', pose: yp, mode: 'shadow' }],
    over0: (g) => {
      const yr = yaoParts(yp), palm = ap(C, ...ap(yr.M.hF, 0, 14));
      maskShadow(g, m => {
        const k = 1.5, M = [k * .97, k * .24, -k * .24, k * .97, palm[0] + 92, palm[1] + 128];
        flatHand(m, M, { age: 1, side: -1, spread: .75 });
        m.lineWidth = 150; m.beginPath(); const w = [M[4] + 10, M[5] + 40]; m.moveTo(...w); m.lineTo(w[0] + 260, H + 140); m.stroke();
      }, { blur: 1, alpha: .96 });
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.strokeStyle = '#2a1c12'; g.lineWidth = 2; g.beginPath(); g.moveTo(palm[0] + 150, palm[1] + 190); g.bezierCurveTo(palm[0] + 230, palm[1] + 300, palm[0] + 260, palm[1] - 40, palm[0] + 330, -10); g.stroke(); g.restore();
    }, placard: { text: '第一千夜　它没有倒下', x: 1100 }, gl: { expo: 1.25, vign: .55 } });
}
export const PANELS = [p1, p2, p3, p4, p5, p6, p7, p8, p9];
