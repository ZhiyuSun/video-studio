// Jointed hide puppets for 《半拍》: the yao (side + back view), the hero, the princess, and the seated puppeteer figures of the outer screens.
// Units = cloth px at camera 1×. Origin of every puppet = waist pivot, y down, facing right. Angles: radians, + = clockwise.
import { piece, drawPiece, fill, cut, cutLine, ink, within, smooth, poly, scales, scalesOpen, lattice, coin, cloud, beads, beadLine, plum, waves, meander, rivet, cutTaper, DYE, canvas } from './carve.js';

export const mul = (A, B) => [A[0] * B[0] + A[2] * B[1], A[1] * B[0] + A[3] * B[1], A[0] * B[2] + A[2] * B[3], A[1] * B[2] + A[3] * B[3], A[0] * B[4] + A[2] * B[5] + A[4], A[1] * B[4] + A[3] * B[5] + A[5]];
export const T = (x, y) => [1, 0, 0, 1, x, y];
export const R = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
export const S = (kx, ky = kx) => [kx, 0, 0, ky, 0, 0];
export const ap = (M, x, y) => [M[0] * x + M[2] * y + M[4], M[1] * x + M[3] * y + M[5]];
const set = (g, M) => g.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);

// The yao's own dyes: deep malachite body, ochre sleeves, a little crimson, and the solid face
export const YD = { body: '#1f5b36', body2: '#2c7046', sleeve: '#c8892a', crim: '#8e2416', face: '#2a3a22', hand: '#d9b27a' };
export const SHADOW = '#2b2119';          // the shadow: no dye, only blocked light

// ======================================================================= YAO (side view)
function yLeg() {
  return piece([-20, -10, 34, 82], g => {
    const tr = q => smooth(q, [[-13, -6], [13, -6], [15, 24], [12, 50], [-9, 52], [-14, 26]]);
    fill(g, YD.crim, tr); within(g, tr, () => lattice(g, -16, 0, 16, 52, 8, 1.6)); ink(g, 1.6, tr);
    const boot = q => smooth(q, [[-11, 44], [11, 44], [12, 62], [22, 66], [31, 64], [33, 70], [28, 78], [-12, 78], [-13, 60]]);
    fill(g, DYE.ink, boot);
    within(g, boot, () => { cloud(g, -1, 58, 6, .4, 1.4); cutLine(g, 1.1, q => { q.moveTo(-10, 49); q.lineTo(10, 48); }); beadLine(g, -9, 73, 26, 73, 1.1, 4.5); });
    ink(g, 1.2, boot, '#000');
  }, { seed: 21 });
}
function yBody() {
  const body = q => smooth(q, [[-26, 8], [-35, -18], [-36, -50], [-28, -76], [-12, -92], [8, -96], [26, -88], [40, -66], [47, -38], [43, -10], [30, 8]]);
  return piece([-46, -110, 56, 18], g => {
    fill(g, YD.body, body);
    within(g, body, () => {
      scalesOpen(g, -40, -84, 2, 0, 5.6);
      cloud(g, 20, -44, 15, .6, 2.2); cloud(g, 26, -18, 8, 2.4, 1.6, -1); cloud(g, 12, -70, 7, 4, 1.4);
      cutLine(g, 2, q => { q.moveTo(4, -86); q.quadraticCurveTo(-4, -46, 6, -4); });
    });
    const belt = q => poly(q, [[-28, -6], [34, -6], [31, 9], [-25, 9]]);
    fill(g, YD.sleeve, belt); within(g, belt, () => { for (let x = -20; x < 30; x += 8.5) coin(g, x, 1.5, 3.4); }); ink(g, 1.5, belt);
    ink(g, 2.3, body);
    // cloud collar
    const col = q => smooth(q, [[-22, -84], [-14, -98], [6, -104], [26, -98], [34, -84], [24, -76], [14, -84], [4, -76], [-6, -84], [-14, -76]]);
    fill(g, YD.sleeve, col); within(g, col, () => { for (const [x, y, f] of [[-12, -86, 1], [6, -90, -1], [22, -88, 1]]) cloud(g, x, y, 5.2, 1, 1.3, f); }); ink(g, 1.6, col);
  }, { seed: 22 });
}
function yHead() {
  // pivot = neck. Big round skull, snout to the right, SOLID face (features as thin carved lines only)
  return piece([-56, -110, 70, 16], g => {
    g.scale(.88, .88);
    const hair = q => smooth(q, [[-8, -70], [-30, -82], [-44, -74], [-52, -52], [-48, -30], [-40, -10], [-26, 2], [-12, 6], [-18, -30]]);
    fill(g, DYE.ink, hair);
    within(g, hair, () => { for (let k = 0; k < 8; k++) cutTaper(g, [[-14 - k * 3, -66 + k * 3], [-30 - k * 2, -48 + k * 4], [-36 - k, -24 + k * 5]], 2.4); });
    const ear = q => smooth(q, [[-20, -48], [-40, -66], [-46, -84], [-30, -70], [-16, -60]]);
    fill(g, YD.body2, ear); cutLine(g, 1.2, q => { q.moveTo(-22, -54); q.quadraticCurveTo(-34, -66, -40, -78); }); ink(g, 1.4, ear);
    // the face: one solid piece of deep-dyed hide
    const face = q => smooth(q, [[-16, -8], [-20, -40], [-10, -70], [12, -80], [32, -70], [44, -52], [60, -44], [64, -32], [56, -24], [60, -16], [50, -8], [36, -2], [20, 6], [0, 6]]);
    fill(g, YD.face, face);
    within(g, face, () => {
      // features: carved slits only (the face itself stays whole)
      cut(g, q => { q.moveTo(22, -50); q.quadraticCurveTo(30, -57, 38, -50); q.quadraticCurveTo(30, -46, 22, -50); }, 'nonzero');       // eye slit
      cutLine(g, 2.2, q => { q.moveTo(16, -60); q.quadraticCurveTo(30, -70, 44, -58); });                                                  // brow
      cutLine(g, 1.2, q => { q.moveTo(54, -38); q.quadraticCurveTo(57, -36, 55, -33); });                                                   // nostril
      cutLine(g, 1.4, q => { q.moveTo(56, -22); q.quadraticCurveTo(44, -18, 30, -22); });                                                  // mouth
      cutLine(g, 1, q => { q.moveTo(8, -30); q.quadraticCurveTo(0, -20, 6, -8); });                                                          // jaw
    });
    fill(g, DYE.white, q => poly(q, [[46, -21], [50, -21], [47, -12]])); // fang
    ink(g, 2.2, face);
    g.beginPath(); g.arc(31, -51, 1.8, 0, 7); g.fillStyle = DYE.ink; g.fill();
    // horn: one curved ochre horn with ink bands
    const horn = q => smooth(q, [[2, -74], [-2, -92], [8, -112], [26, -118], [16, -104], [14, -90], [16, -78]]);
    fill(g, YD.sleeve, horn); for (let k = 0; k < 4; k++) ink(g, 2, q => { const y = -82 - k * 8; q.moveTo(0 + k, y); q.lineTo(16 + k * .5, y + 2); }, DYE.brown); ink(g, 1.5, horn);
  }, { seed: 23 });
}
function yUA() {
  return piece([-18, -16, 20, 52], g => {
    const sl = q => smooth(q, [[-10, -4], [10, -4], [14, 32], [9, 44], [-9, 44], [-13, 32]]);
    fill(g, YD.sleeve, sl); within(g, sl, () => lattice(g, -14, 2, 14, 44, 7, 1.5)); ink(g, 1.5, sl);
    fill(g, YD.sleeve, q => q.arc(0, 40, 9, 0, 7)); ink(g, 1.3, q => q.arc(0, 40, 9, 0, 7));
  }, { seed: 24 });
}
function yFA() {
  return piece([-12, -10, 12, 34], g => {
    const f = q => smooth(q, [[-8, -4], [8, -4], [7, 32], [-7, 32]]);
    fill(g, YD.body2, f); within(g, f, () => scalesOpen(g, -10, 2, 10, 32, 3.8)); ink(g, 1.4, f);
    fill(g, YD.sleeve, q => poly(q, [[-8, 24], [8, 24], [8, 33], [-8, 33]])); ink(g, 1.2, q => poly(q, [[-8, 24], [8, 24], [8, 33], [-8, 33]]));
  }, { seed: 25 });
}
// open palm with four clawed fingers (pivot = wrist, fingers along +y)
export function openHand(dye, seed = 26, K = 1) {
  return piece([-16 * K, -4 * K, 16 * K, 34 * K], g => {
    g.scale(K, K);
    const palm = q => smooth(q, [[-8, -1], [8, -1], [10, 10], [8, 16], [-7, 16], [-10, 9]]);
    const fingers = q => {
      for (const [x, a] of [[-6, .25], [-2, .08], [2.5, -.06], [7, -.2]]) { q.moveTo(x - 2.2, 14); q.lineTo(x - 2.2 + Math.sin(a) * 15, 14 + Math.cos(a) * 15); q.lineTo(x + Math.sin(a) * 19, 14 + Math.cos(a) * 19); q.lineTo(x + 2.2 + Math.sin(a) * 15, 14 + Math.cos(a) * 15); q.lineTo(x + 2.2, 14); q.closePath(); }
      q.moveTo(8, 4); q.lineTo(15, 9); q.lineTo(16, 14); q.lineTo(12, 13); q.lineTo(8, 10); q.closePath();
    };
    fill(g, dye, q => { palm(q); }); fill(g, dye, fingers, 'nonzero');
    cutLine(g, .8, q => { q.moveTo(-5, 8); q.quadraticCurveTo(0, 11, 5, 7); });
    ink(g, 1.3, palm); ink(g, 1.1, fingers);
  }, { seed });
}
function yTail(k) {
  return piece([-28, -10, 6, 10], g => {
    const s = q => smooth(q, [[2, -6 + k], [-22, -4 + k * .6], [-24, 0], [-22, 4 - k * .6], [2, 6 - k]]);
    fill(g, k === 2 ? DYE.ink : YD.body, s);
    if (k === 2) within(g, s, () => { for (let i = 0; i < 4; i++) cutTaper(g, [[-2, -3 + i * 2], [-12, -3 + i * 2], [-22, -2 + i * 1.4]], 1.6); });
    else within(g, s, () => beadLine(g, -18, 0, -2, 0, 1.4, 5));
    fill(g, YD.sleeve, q => poly(q, [[-2, -6], [2, -6], [2, 6], [-2, 6]]));
    ink(g, 1.3, s);
  }, { seed: 27 + k });
}
// ======================================================================= YAO (back view: turned away, toward the lamp)
function ybBody() {
  const body = q => smooth(q, [[-40, 8], [-46, -26], [-40, -62], [-24, -88], [0, -96], [24, -88], [40, -62], [46, -26], [40, 8]]);
  return piece([-56, -110, 56, 18], g => {
    fill(g, YD.body, body);
    within(g, body, () => { scalesOpen(g, -48, -84, 48, 0, 5.8); beadLine(g, 0, -86, 0, -6, 1.8, 6); });
    const belt = q => poly(q, [[-40, -6], [40, -6], [38, 9], [-38, 9]]);
    fill(g, YD.sleeve, belt); within(g, belt, () => { for (let x = -32; x < 34; x += 8.5) coin(g, x, 1.5, 3.4); }); ink(g, 1.5, belt);
    ink(g, 2.3, body);
    const col = q => smooth(q, [[-30, -84], [-20, -100], [0, -106], [20, -100], [30, -84], [18, -78], [8, -86], [0, -78], [-8, -86], [-18, -78]]);
    fill(g, YD.sleeve, col); within(g, col, () => { for (const [x, y, f] of [[-16, -88, 1], [0, -94, -1], [16, -88, 1]]) cloud(g, x, y, 5, 1, 1.3, f); }); ink(g, 1.6, col);
  }, { seed: 31 });
}
function ybHead() {
  return piece([-56, -130, 56, 12], g => {
    for (const s of [-1, 1]) { const ear = q => smooth(q, [[s * 26, -48], [s * 46, -66], [s * 52, -86], [s * 34, -72], [s * 22, -60]]); fill(g, YD.body2, ear); ink(g, 1.4, ear); }
    const skull = q => q.ellipse(0, -44, 34, 42, 0, 0, 7);
    fill(g, DYE.ink, skull);
    within(g, skull, () => { for (let k = -5; k <= 5; k++) cutTaper(g, [[k * 4, -82], [k * 6, -50], [k * 6.5, -12]], 2.2); });
    ink(g, 2, skull);
    const horn = q => smooth(q, [[-6, -80], [-10, -100], [0, -122], [18, -128], [8, -112], [6, -96], [8, -84]]);
    fill(g, YD.sleeve, horn); for (let k = 0; k < 4; k++) ink(g, 2, q => { const y = -90 - k * 8; q.moveTo(-8 + k, y); q.lineTo(8 + k * .5, y + 2); }, DYE.brown); ink(g, 1.5, horn);
  }, { seed: 32 });
}
// the face that was never carved: drawn as a mask (white = where the hide is thinner)
export function ghostFace() {
  const [c, g] = canvas(140, 140); g.translate(70, 86);
  g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, -44, 28, 34, 0, 0, 7); g.globalAlpha = .35; g.fill(); g.globalAlpha = 1;
  g.lineWidth = 3.2;
  for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 6, -50); g.quadraticCurveTo(s * 13, -45, s * 20, -50); g.stroke(); }   // closed eyes
  g.lineWidth = 2.2; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 5, -60); g.quadraticCurveTo(s * 13, -64, s * 21, -60); g.stroke(); }
  g.beginPath(); g.moveTo(-7, -26); g.quadraticCurveTo(0, -21, 7, -26); g.stroke();
  g.beginPath(); g.moveTo(0, -46); g.lineTo(-2, -36); g.lineTo(2, -35); g.stroke();
  return { c, x0: -70, y0: -86, w: 140, h: 140 };
}
// ======================================================================= HERO
function hLeg() {
  return piece([-24, -12, 52, 176], g => {
    const tr = q => smooth(q, [[-14, -8], [14, -8], [16, 50], [14, 92], [-12, 94], [-15, 50]]);
    fill(g, DYE.jade, tr); within(g, tr, () => lattice(g, -16, 30, 18, 94, 9, 1.7)); ink(g, 1.7, tr);
    fill(g, DYE.jade, q => q.arc(1, 66, 8, 0, 7)); cloud(g, 1, 66, 5.5, .5, 1.3); ink(g, 1.2, q => q.arc(1, 66, 8, 0, 7));
    const boot = q => smooth(q, [[-13, 86], [13, 84], [14, 128], [26, 136], [40, 140], [45, 134], [46, 144], [40, 152], [-15, 152], [-15, 118]]);
    fill(g, DYE.ink, boot);
    within(g, boot, () => { cloud(g, 0, 104, 7, .3, 1.6); cloud(g, -2, 128, 5, 2.4, 1.3, -1); cutLine(g, 1.2, q => { q.moveTo(-13, 92); q.lineTo(13, 90); }); });
    ink(g, 1.2, boot, '#000');
    const sole = q => poly(q, [[-17, 151], [46, 149], [44, 168], [-15, 170]]);
    fill(g, DYE.white, sole); within(g, sole, () => { for (let x = -11; x < 42; x += 6.5) cut(g, q => q.ellipse(x, 159.5, 2, 3.4, 0, 0, 7)); }); ink(g, 1.6, sole);
  }, { seed: 41 });
}
function hSkirt() {
  return piece([-50, -8, 56, 100], g => {
    const f = q => smooth(q, [[-30, -4], [30, -4], [42, 40], [50, 86], [0, 92], [-44, 88], [-38, 40]]);
    fill(g, DYE.red, f); within(g, f, () => scalesOpen(g, -48, 6, 52, 82, 6)); g.save(); g.beginPath(); f(g); g.clip(); ink(g, 7, f, DYE.green); g.restore(); ink(g, 1.7, f);
    const tab = q => smooth(q, [[-8, -3], [8, -3], [10, 54], [1, 74], [-8, 54]]);
    fill(g, DYE.green, tab); cloud(g, 1, 18, 5.5, 0, 1.3); coin(g, 1, 40, 5); ink(g, 1.5, tab);
  }, { seed: 42 });
}
function hChest() {
  const body = q => smooth(q, [[-26, 4], [-30, -40], [-31, -80], [-24, -106], [-10, -122], [6, -128], [20, -124], [32, -110], [42, -86], [44, -58], [38, -30], [30, 4]]);
  return piece([-40, -140, 52, 12], g => {
    fill(g, DYE.red, body);
    within(g, body, () => scalesOpen(g, -38, -96, 48, -14, 6.2));
    ink(g, 2.4, q => { q.moveTo(-30, -56); q.quadraticCurveTo(6, -46, 42, -56); });
    const mir = q => q.arc(18, -70, 14, 0, 7);
    fill(g, DYE.yellow, mir); cut(g, q => { q.arc(18, -70, 11, 0, 7); q.arc(18, -70, 7.5, 0, 7, true); }, 'nonzero');
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; cut(g, q => q.ellipse(18 + Math.cos(a) * 4.5, -70 + Math.sin(a) * 4.5, 2.2, 1, a, 0, 7)); }
    ink(g, 1.5, mir);
    const cc = q => smooth(q, [[-25, -108], [-29, -96], [-19, -90], [-11, -98], [-1, -88], [9, -98], [19, -90], [31, -100], [36, -102], [28, -114], [14, -128], [-6, -130]]);
    fill(g, DYE.green, cc); within(g, cc, () => { for (const [x, y, f] of [[-19, -100, 1], [-1, -99, -1], [19, -100, 1]]) cloud(g, x, y, 5.2, 1.2, 1.4, f); lattice(g, -12, -128, 24, -110, 7, 1.6); }); ink(g, 1.5, cc);
    const belt = q => poly(q, [[-28, -14], [32, -14], [30, 5], [-26, 5]]);
    fill(g, DYE.yellow, belt); within(g, belt, () => { for (let x = -22; x < 24; x += 9) coin(g, x, -4.5, 3.6); }); ink(g, 1.5, belt);
    ink(g, 2.3, body);
  }, { seed: 43 });
}
const HK = 1.18;
function hHead() {
  return piece([-50 * HK, -150 * HK, 40 * HK, 14 * HK], g => {
    g.scale(HK, HK);
    // neck guard
    const flap = q => smooth(q, [[-20, -60], [-34, -50], [-38, -24], [-32, -6], [-24, -12], [-22, -40]]);
    fill(g, DYE.green, flap); within(g, flap, () => scales(g, -40, -56, -20, -8, 4.4, 1)); ink(g, 1.5, flap);
    const hair = q => smooth(q, [[-2, -62], [-16, -62], [-24, -50], [-24, -26], [-14, -2], [-4, 6], [-8, -14], [-6, -40]]);
    fill(g, DYE.ink, hair); within(g, hair, () => { for (let k = 0; k < 6; k++) cutLine(g, .7, q => { q.moveTo(-5 - k * 3, -58); q.quadraticCurveTo(-18 - k, -36, -10 - k * 1.5, -4); }); });
    // open face: only the outline + feature strips remain
    const prof = [[-4, 6], [8, 5], [11, -6], [15, -12], [19, -15], [21, -20], [23, -22], [21, -24], [24, -26], [23, -30], [26, -32], [28, -35], [23, -44], [20, -54], [19, -62]];
    ink(g, 2.4, q => poly(q, prof, false));
    ink(g, 1.2, q => { q.moveTo(17, -15); q.quadraticCurveTo(6, -8, -4, -22); });
    ink(g, 1.6, q => { q.moveTo(17, -45); q.quadraticCurveTo(9, -49, 0, -47); });
    ink(g, 1, q => { q.moveTo(16, -44.5); q.quadraticCurveTo(9, -42.5, 2.5, -45.5); });
    g.beginPath(); g.arc(10.5, -46, 1.9, 0, 7); g.fillStyle = DYE.ink; g.fill();
    fill(g, DYE.ink, q => smooth(q, [[19, -53], [10, -56], [0, -58], [-6, -61], [-5, -58.5], [2, -55.5], [10, -53.5], [18.5, -51.5]]));
    ink(g, 1.2, q => { q.moveTo(22, -23.5); q.lineTo(16, -22.5); });
    ink(g, 1.3, q => { q.moveTo(-3, -40); q.bezierCurveTo(-9, -41, -10, -30, -4.5, -30.5); });
    // helmet: red dome, ochre band with fret, side wing, tall pompom
    const dome = q => smooth(q, [[20, -70], [15, -92], [2, -108], [-14, -106], [-24, -90], [-26, -66]]);
    fill(g, DYE.red, dome); within(g, dome, () => { cloud(g, -6, -88, 8.5, 0, 1.3); cloud(g, 8, -84, 5.5, 2, 1.1, -1); }); ink(g, 1.7, dome);
    const band = q => poly(q, [[23, -60], [23, -71], [-26, -68], [-27, -58]]);
    fill(g, DYE.yellow, band); within(g, band, () => meander(g, -24, -60.5, 21, 3.6, 1)); ink(g, 1.6, band);
    const wing = q => smooth(q, [[-20, -72], [-34, -86], [-48, -84], [-50, -70], [-38, -66], [-30, -72]]);
    fill(g, DYE.green, wing); cloud(g, -40, -77, 4.6, 0, 1, -1); ink(g, 1.3, wing);
    ink(g, 2.6, q => { q.moveTo(-4, -106); q.lineTo(-4, -116); }, DYE.brown);
    const pom = q => q.arc(-4, -125, 10, 0, 7);
    fill(g, DYE.red, pom); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; cutLine(g, 1, q => { q.moveTo(-4 + Math.cos(a) * 3, -125 + Math.sin(a) * 3); q.lineTo(-4 + Math.cos(a) * 9, -125 + Math.sin(a) * 9); }); } ink(g, 1.4, pom);
  }, { seed: 44 });
}
function hUA() {
  return piece([-26, -26, 26, 74], g => {
    const sl = q => smooth(q, [[-12, 0], [12, 0], [12, 56], [-11, 56]]);
    fill(g, DYE.yellow, sl); within(g, sl, () => lattice(g, -14, 6, 14, 56, 8, 1.6)); ink(g, 1.6, sl);
    fill(g, DYE.yellow, q => q.arc(0, 60, 10, 0, 7)); ink(g, 1.5, q => q.arc(0, 60, 10, 0, 7));
    const gd = q => smooth(q, [[-20, -10], [-6, -24], [14, -22], [24, -6], [16, 12], [0, 18], [-18, 8]]);
    fill(g, DYE.red, gd); cloud(g, 1, -3, 8, 0, 1.6); ink(g, 1.7, gd);
  }, { seed: 45 });
}
function hFA() {
  return piece([-14, -12, 14, 60], g => {
    fill(g, DYE.yellow, q => q.arc(0, 0, 9, 0, 7)); ink(g, 1.4, q => q.arc(0, 0, 9, 0, 7));
    const cf = q => smooth(q, [[-10, -2], [10, -2], [9, 34], [-8, 34]]);
    fill(g, DYE.yellow, cf); within(g, cf, () => lattice(g, -12, 4, 12, 34, 7, 1.5)); ink(g, 1.5, cf);
    const br = q => poly(q, [[-9, 30], [9, 30], [8, 54], [-8, 54]]);
    fill(g, DYE.red, br); within(g, br, () => scalesOpen(g, -10, 32, 10, 54, 4)); ink(g, 1.4, br);
  }, { seed: 46 });
}
function fistHand(seed) {
  return piece([-14, -6, 16, 28], g => {
    const f = q => smooth(q, [[-7, -1], [7, -1], [11, 7], [11, 17], [5, 22], [-5, 21], [-9, 12]]);
    fill(g, DYE.skin, f); cut(g, q => q.ellipse(1.5, 12.5, 2.6, 3.6, 0, 0, 7));
    for (const y of [9, 13.5, 18]) cutLine(g, .8, q => { q.moveTo(5, y); q.lineTo(10, y + .5); });
    ink(g, 1.5, f);
  }, { seed });
}
// the hero's broadsword: pivot = grip point, blade toward local -y
function blade() {
  return piece([-40, -230, 40, 60], g => {
    ink(g, 5, q => { q.moveTo(0, 50); q.lineTo(0, -110); }, '#4a2612');
    for (const y of [-10, 20]) ink(g, 7, q => { q.moveTo(-1, y); q.lineTo(1, y + 6); }, DYE.yellow);
    const bl = q => smooth(q, [[-6, -108], [-12, -150], [-12, -196], [-2, -232], [12, -250], [10, -232], [24, -214], [40, -186], [42, -150], [30, -128], [22, -134], [14, -118]]);
    fill(g, '#8a7a5e', bl);
    within(g, bl, () => { cloud(g, 14, -178, 11, .4, 1.8); cloud(g, 22, -146, 6, 2, 1.3, -1); for (const y of [-214, -196]) cut(g, q => q.arc(0, y, 3, 0, 7)); cutLine(g, 1.3, q => { q.moveTo(-6, -116); q.quadraticCurveTo(-4, -190, 8, -238); }); });
    ink(g, 1.8, bl);
    const gd = q => smooth(q, [[-14, -104], [0, -116], [16, -104], [0, -100]]);
    fill(g, DYE.yellow, gd); ink(g, 1.4, gd);
    const tas = q => smooth(q, [[-2, -104], [-16, -96], [-24, -70], [-14, -76], [-4, -92]]);
    fill(g, DYE.red, tas); ink(g, 1.1, tas);
  }, { seed: 47 });
}
// ======================================================================= PRINCESS
function pRobe() {
  return piece([-60, -10, 70, 200], g => {
    const f = q => smooth(q, [[-26, -4], [26, -4], [36, 60], [50, 150], [62, 190], [-50, 192], [-44, 150], [-34, 60]]);
    fill(g, DYE.jade, f);
    within(g, f, () => { lattice(g, -50, 10, 60, 140, 11, 2); waves(g, -60, 150, 70, 192, 8, 1.4); });
    g.save(); g.beginPath(); f(g); g.clip(); ink(g, 6, f, DYE.red); g.restore(); ink(g, 1.8, f);
    const sash = q => smooth(q, [[-4, -2], [6, -2], [10, 110], [2, 130], [-6, 110]]);
    fill(g, DYE.red, sash); plum(g, 2, 30, 3.4); plum(g, 3, 70, 3); ink(g, 1.3, sash);
  }, { seed: 51 });
}
function pChest() {
  const b = q => smooth(q, [[-22, 4], [-26, -40], [-22, -72], [-10, -86], [8, -88], [22, -78], [28, -50], [24, -20], [22, 4]]);
  return piece([-34, -100, 38, 12], g => {
    fill(g, DYE.red, b); within(g, b, () => { for (let y = -70; y < 0; y += 12) for (let x = -20; x < 26; x += 12) plum(g, x + (y % 24 ? 6 : 0), y, 3); }); ink(g, 2, b);
    const col = q => smooth(q, [[-18, -80], [-8, -92], [10, -94], [24, -82], [12, -74], [0, -82], [-10, -72]]);
    fill(g, DYE.yellow, col); cloud(g, 2, -84, 4.4, 1, 1.1); ink(g, 1.4, col);
  }, { seed: 52 });
}
const PK = 1.15;
function pHead() {
  return piece([-56 * PK, -170 * PK, 40 * PK, 12 * PK], g => {
    g.scale(PK, PK);
    const hair = q => smooth(q, [[0, -64], [-18, -66], [-28, -54], [-28, -30], [-18, -6], [-6, 4], [-8, -20], [-6, -44]]);
    fill(g, DYE.ink, hair); within(g, hair, () => { for (let k = 0; k < 7; k++) cutLine(g, .7, q => { q.moveTo(-4 - k * 3, -60); q.quadraticCurveTo(-20 - k, -34, -12 - k, -2); }); });
    const bun = q => smooth(q, [[-2, -62], [-20, -70], [-30, -92], [-22, -118], [-2, -128], [14, -116], [12, -94], [4, -74]]);
    fill(g, DYE.ink, bun); within(g, bun, () => { for (let k = 0; k < 6; k++) cutLine(g, .9, q => { q.moveTo(-22 + k * 6, -72); q.quadraticCurveTo(-26 + k * 7, -100, -6 + k * 3, -122); }); });
    const comb = q => smooth(q, [[-26, -96], [-10, -106], [10, -100], [8, -94], [-12, -98], [-24, -90]]);
    fill(g, DYE.red, comb); beadLine(g, -20, -96, 4, -99, 1.3, 5); ink(g, 1.2, comb);
    const prof = [[-2, 4], [9, 3], [12, -6], [15, -11], [18, -14], [19, -18], [21, -21], [19.5, -23], [22, -25], [21, -29], [23.5, -31], [24.5, -35], [20, -44], [18, -54], [17, -62]];
    ink(g, 2.2, q => poly(q, prof, false));
    ink(g, 1.4, q => { q.moveTo(15, -44); q.quadraticCurveTo(8, -47, 1, -44); });
    g.beginPath(); g.arc(9, -44, 1.6, 0, 7); g.fillStyle = DYE.ink; g.fill();
    ink(g, 1.5, q => { q.moveTo(17, -52); q.quadraticCurveTo(9, -55, 1, -52); });
    fill(g, DYE.red, q => q.ellipse(19.5, -22, 2.2, 1.4, 0, 0, 7));
    // buyao hairpin: ochre flower
    const fl = q => q.arc(10, -112, 9, 0, 7); fill(g, DYE.yellow, fl); plum(g, 10, -112, 4); ink(g, 1.2, fl);
  }, { seed: 53 });
}
function pSleeve() {   // upper arm + long water sleeve in one piece (pivot = shoulder)
  return piece([-26, -12, 30, 150], g => {
    const s = q => smooth(q, [[-11, -4], [11, -4], [16, 50], [24, 100], [26, 140], [10, 146], [-12, 140], [-16, 96], [-14, 50]]);
    fill(g, DYE.red, q => smooth(q, [[-11, -4], [11, -4], [14, 54], [-13, 54]]));
    fill(g, DYE.white, q => smooth(q, [[-13, 48], [14, 48], [24, 100], [26, 140], [10, 146], [-12, 140], [-16, 96]]));
    within(g, q => smooth(q, [[-13, 48], [14, 48], [24, 100], [26, 140], [10, 146], [-12, 140], [-16, 96]]), () => { for (let k = 0; k < 6; k++) cutTaper(g, [[-10 + k * 6, 62], [-10 + k * 6.5, 100], [-8 + k * 6.8, 136]], 2.2); });
    within(g, q => smooth(q, [[-11, -4], [11, -4], [14, 54], [-13, 54]]), () => { for (let y = 6; y < 50; y += 12) plum(g, 0, y, 3); });
    ink(g, 1.6, s);
  }, { seed: 54 });
}
// ======================================================================= PUPPETEER FIGURES (outer screens: dark-dyed hide, few cuts, rivets show)
const OLD = '#3b2a1c';
function oTorso() {   // seated, hunched, facing right
  return piece([-70, -150, 60, 20], g => {
    const b = q => smooth(q, [[-44, 12], [-58, -40], [-56, -92], [-36, -130], [-6, -140], [20, -130], [32, -104], [36, -60], [30, -20], [24, 12]]);
    fill(g, OLD, b); within(g, b, () => { for (let k = 0; k < 5; k++) cutLine(g, 1.3, q => { q.moveTo(-44 + k * 14, -10); q.quadraticCurveTo(-40 + k * 13, -60, -30 + k * 10, -118); }); coin(g, -10, -70, 5); }); ink(g, 2, b);
  }, { seed: 61 });
}
function oHead() {    // old man: cap, hooked nose, beard
  return piece([-46, -96, 50, 12], g => {
    const h = q => smooth(q, [[-18, 6], [-28, -24], [-24, -50], [-6, -62], [14, -58], [22, -44], [30, -36], [26, -30], [28, -22], [20, -16], [24, -6], [12, 8]]);
    fill(g, OLD, h); within(g, h, () => { cut(g, q => { q.moveTo(8, -42); q.quadraticCurveTo(14, -46, 20, -42); q.quadraticCurveTo(14, -40, 8, -42); }, 'nonzero'); cutLine(g, 1, q => { q.moveTo(4, -50); q.quadraticCurveTo(12, -54, 20, -50); }); for (let k = 0; k < 4; k++) cutTaper(g, [[6 + k * 4, -16], [4 + k * 4, -2], [0 + k * 4, 8]], 1.6); }); ink(g, 1.8, h);
    const cap = q => smooth(q, [[-30, -46], [-26, -70], [-4, -82], [22, -74], [32, -56], [10, -60], [-12, -56]]);
    fill(g, '#2a1c12', cap); within(g, cap, () => beadLine(g, -24, -56, 26, -58, 1.4, 6)); ink(g, 1.6, cap);
  }, { seed: 62 });
}
function oLimb(len, w, seed) {
  return piece([-w - 4, -w - 4, w + 4, len + w + 4], g => {
    const s = q => smooth(q, [[-w, 0], [w, 0], [w * .85, len], [-w * .85, len]]);
    fill(g, OLD, s); fill(g, OLD, q => q.arc(0, len, w * .8, 0, 7)); fill(g, OLD, q => q.arc(0, 0, w * .9, 0, 7));
    within(g, s, () => cutLine(g, 1, q => { q.moveTo(0, len * .2); q.lineTo(0, len * .8); }));
    ink(g, 1.5, s);
  }, { seed });
}
function oStool() {
  return piece([-60, -4, 60, 130], g => {
    const s = q => { poly(q, [[-50, 4], [50, 4], [46, 20], [-46, 20]]); poly(q, [[-40, 20], [-30, 20], [-44, 124], [-54, 124]]); poly(q, [[30, 20], [40, 20], [54, 124], [44, 124]]); poly(q, [[-42, 80], [42, 80], [44, 90], [-44, 90]]); };
    fill(g, '#3a2414', s, 'nonzero'); ink(g, 1.4, s);
  }, { seed: 68 });
}
function oHand(seed) {
  return piece([-16, -6, 18, 30], g => {
    const f = q => smooth(q, [[-7, -1], [7, -1], [12, 8], [14, 18], [8, 24], [-2, 24], [-9, 14]]);
    fill(g, OLD, f); cutLine(g, .9, q => { q.moveTo(2, 10); q.lineTo(9, 16); }); ink(g, 1.4, f);
  }, { seed });
}

// ======================================================================= Build + rigs
let P = null;
export function build() {
  if (P) return P;
  P = {
    y: { leg: yLeg(), body: yBody(), head: yHead(), ua: yUA(), fa: yFA(), hand: openHand(YD.hand), tail: [yTail(0), yTail(1), yTail(2)], bbody: ybBody(), bhead: ybHead(), ghost: ghostFace() },
    h: { leg: hLeg(), skirt: hSkirt(), chest: hChest(), head: hHead(), ua: hUA(), fa: hFA(), hand: fistHand(48), blade: blade() },
    p: { robe: pRobe(), chest: pChest(), head: pHead(), sleeve: pSleeve() },
    o: { torso: oTorso(), head: oHead(), ua: oLimb(52, 11, 63), fa: oLimb(46, 9, 64), th: oLimb(56, 14, 65), sh: oLimb(60, 11, 66), hand: oHand(67), stool: oStool() },
    yb: { blade: blade() }
  };
  return P;
}
function ik(s, p, L1, L2, bend) {
  let dx = p[0] - s[0], dy = p[1] - s[1], d = Math.hypot(dx, dy);
  d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - .3, d));
  const phi = Math.atan2(dy, dx), al = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d));
  const a1 = phi + bend * al, e = [s[0] + Math.cos(a1) * L1, s[1] + Math.sin(a1) * L1];
  const a2 = Math.atan2(p[1] - e[1], p[0] - e[0]);
  return [a1 - Math.PI / 2, a2 - Math.PI / 2];
}
// Root matrix: position, rotation, facing (flip = -1 faces left), scale
const rootM = p => mul(mul(T(p.x, p.y), S((p.flip || 1) * (p.k || 1), p.k || 1)), R(p.rot || 0));
// Generic arm: shoulder (body local) → angles from IK target (body local) or explicit
function arm(MB, sh, a, L1, L2, ua, fa, hand, at1, at2, hA = 0) {
  const Mu = mul(MB, mul(T(...sh), R(a[0]))), Mf = mul(Mu, mul(T(0, at1), R(a[1] - a[0]))), Mh = mul(Mf, mul(T(0, at2), R(hA)));
  return { Mu, Mf, Mh, parts: [[Mu, ua], [Mf, fa], [Mh, hand]] };
}
const armAngles = (p, side, sh, L1, L2) => {
  const k = side === 'F' ? 'aF' : 'aB', tk = side === 'F' ? 'tF' : 'tB';
  if (p[tk]) return ik(sh, [sh[0] + p[tk][0], sh[1] + p[tk][1]], L1, L2, p[side === 'F' ? 'bendF' : 'bendB'] ?? 1);
  return p[k] || [0, 0];
};

// YAO pose: {x,y,rot,flip,k, head, lean(body), legF, legB, tF:[dx,dy] / aF:[a1,a2], tB / aB, hF, hB, tail:[a0,a1,a2], back:bool}
export const YJ = { hipF: [10, 4], hipB: [-8, 4], neck: [8, -92], shF: [16, -78], shB: [0, -80], tail: [-30, -12] };
export function yaoParts(pose) {
  const p = pose, P = build().y, M0 = rootM(p), MB = mul(M0, R(p.lean || 0));
  const out = [], riv = [];
  if (p.back) {
    const MlegL = mul(MB, mul(T(-16, 4), R(p.legB || 0))), MlegR = mul(MB, mul(T(16, 4), mul(S(-1, 1), R(p.legF || 0))));
    const aL = armAngles(p, 'B', [-30, -76], 32, 34), aR = armAngles(p, 'F', [30, -76], 32, 34);
    const A = arm(MB, [-34, -76], aL, 40, 46, P.ua, P.fa, P.hand, 40, 30, p.hB || 0);
    const Bm = arm(mul(MB, S(-1, 1)), [-34, -76], aR, 40, 46, P.ua, P.fa, P.hand, 40, 30, p.hF || 0);
    const Mh = mul(MB, mul(T(0, -92), R(p.head || 0)));
    const ta = p.tail || [.3, .2, .2]; let Mt = mul(MB, mul(T(0, 4), R(Math.PI / 2 + ta[0] * .3)));
    const tails = []; for (let i = 0; i < 3; i++) { tails.push([Mt, P.tail[i]]); Mt = mul(Mt, mul(T(-20, 0), R(ta[i] * .4))); }
    out.push(...tails, [MlegL, P.leg], [MlegR, P.leg], ...A.parts, ...Bm.parts, [MB, P.bbody], [Mh, P.bhead]);
    riv.push(ap(MB, -16, 4), ap(MB, 16, 4), ap(A.Mu, 0, 0), ap(A.Mf, 0, 0), ap(Bm.Mu, 0, 0), ap(Bm.Mf, 0, 0), ap(MB, 0, -92));
    return { parts: out, riv, M: { MB, Mh, hF: Bm.Mh, hB: A.Mh, head: Mh } };
  }
  const MlegB = mul(MB, mul(T(...YJ.hipB), R(p.legB || 0))), MlegF = mul(MB, mul(T(...YJ.hipF), R(p.legF || 0)));
  const Mh = mul(MB, mul(T(...YJ.neck), R(p.head || 0)));
  const aB = armAngles(p, 'B', YJ.shB, 40, 46), aF = armAngles(p, 'F', YJ.shF, 40, 46);
  const B = arm(MB, YJ.shB, aB, 40, 46, P.ua, P.fa, P.hand, 40, 30, p.hB || 0), F = arm(MB, YJ.shF, aF, 40, 46, P.ua, P.fa, P.hand, 40, 30, p.hF || 0);
  const ta = p.tail || [.5, .3, .25]; let Mt = mul(MB, mul(T(...YJ.tail), R(ta[0]))); const tails = [];
  for (let i = 0; i < 3; i++) { tails.push([Mt, P.tail[i]]); Mt = mul(Mt, mul(T(-20, 0), R(ta[i + 1] ?? ta[i]))); }
  out.push(...tails, ...B.parts, [MlegB, P.leg], [MlegF, P.leg], [MB, P.body], [Mh, P.head]);
  let Mbl = null;
  if (p.bladeW !== undefined) { Mbl = mul(F.Mh, mul(T(0, 14), R(p.bladeW + Math.PI / 2 - ((p.rot || 0) + (p.lean || 0) + aF[1] + (p.hF || 0))))); out.push([Mbl, build().h.blade]); }
  out.push(...F.parts);
  riv.push(ap(MB, ...YJ.hipB), ap(MB, ...YJ.hipF), ap(MB, ...YJ.neck), ap(B.Mu, 0, 0), ap(B.Mf, 0, 0), ap(F.Mu, 0, 0), ap(F.Mf, 0, 0), ap(MB, ...YJ.tail));
  return { parts: out, riv, M: { MB, Mh, hF: F.Mh, hB: B.Mh, head: Mh, blade: Mbl } };
}
// HERO pose: {x,y,rot,flip,k, head, lean, legF, legB, tF/aF, tB/aB, blade:{a} | null, feat:[...]}
export const HJ = { hipF: [10, 52 - 52], hipB: [-8, -2], neck: [8, -128], shF: [18, -112], shB: [2, -116], plume: [-4, -146] };
export function heroParts(pose) {
  let p = pose; const P = build().h, M0 = rootM(p), MB = mul(M0, R(p.lean || 0));
  const MlegB = mul(MB, mul(T(-8, 0), R(p.legB || 0))), MlegF = mul(MB, mul(T(10, 0), R(p.legF || 0)));
  const Mh = mul(MB, mul(T(...HJ.neck), R(p.head || 0)));
  const aB = armAngles(p, 'B', HJ.shB, 60, 66), aF = armAngles(p, 'F', HJ.shF, 60, 66);
  const B = arm(MB, HJ.shB, aB, 60, 58, P.ua, P.fa, P.hand, 60, 54, p.hB || 0), F = arm(MB, HJ.shF, aF, 60, 58, P.ua, P.fa, P.hand, 60, 54, p.hF || 0);
  const out = [...B.parts, [MlegB, P.leg], [MlegF, P.leg], [MB, P.skirt], [MB, P.chest], [Mh, P.head]];
  let Mbl = null;
  if (p.bladeW !== undefined) p = { ...p, blade: p.bladeW + Math.PI / 2 - ((p.rot || 0) + (p.lean || 0) + aF[1] + (p.hF || 0)) };
  if (p.blade !== null && p.blade !== undefined) { Mbl = mul(F.Mh, mul(T(1.5, 12.5), R(p.blade))); out.push([Mbl, P.blade]); }
  out.push(...F.parts);
  const riv = [ap(MB, -8, 0), ap(MB, 10, 0), ap(MB, ...HJ.neck), ap(B.Mu, 0, 0), ap(B.Mf, 0, 0), ap(F.Mu, 0, 0), ap(F.Mf, 0, 0)];
  return { parts: out, riv, M: { MB, Mh, hF: F.Mh, hB: B.Mh, blade: Mbl } };
}
// PRINCESS pose: {x,y,rot,flip,k, head, lean, aF:[a], aB:[a], robe}
export function princessParts(pose) {
  const p = pose, P = build().p, M0 = rootM(p), MB = mul(M0, R(p.lean || 0));
  const Mh = mul(MB, mul(T(6, -86), R(p.head || 0)));
  const MsB = mul(MB, mul(T(-2, -76), R(p.aB || .1))), MsF = mul(MB, mul(T(12, -74), R(p.aF || -.1)));
  const Mr = mul(M0, R((p.robe || 0)));
  const out = [[MsB, P.sleeve], [Mr, P.robe], [MB, P.chest], [Mh, P.head], [MsF, P.sleeve]];
  const riv = [ap(MB, 6, -86), ap(MB, -2, -76), ap(MB, 12, -74)];
  return { parts: out, riv, M: { MB, Mh, hF: MsF, hB: MsB } };
}
// SEATED PUPPETEER (outer screens): {x,y,k,flip, head, lean, aF:[a1,a2], aB, thigh, shin}
export function oldParts(pose) {
  const p = pose, P = build().o, M0 = rootM(p), MB = mul(M0, R(p.lean || 0));
  const Mh = mul(MB, mul(T(10, -136), R(p.head || 0)));
  const leg = (dx, a) => { const Mt = mul(MB, mul(T(dx, 0), R(a[0]))), Ms = mul(Mt, mul(T(0, 56), R(a[1] - a[0]))); return [[Mt, P.th], [Ms, P.sh]]; };
  const A = arm(MB, [-6, -112], p.aB || [.2, -.4], 52, 46, P.ua, P.fa, P.hand, 52, 46, p.hB || 0), F = arm(MB, [12, -110], p.aF || [-.3, -1], 52, 46, P.ua, P.fa, P.hand, 52, 46, p.hF || 0);
  const out = [[MB, P.stool], ...A.parts, ...leg(-10, p.legB || [-1.5, -.1]), [MB, P.torso], ...leg(10, p.legF || [-1.45, -.05]), [Mh, P.head], ...F.parts];
  const riv = [ap(A.Mu, 0, 0), ap(A.Mf, 0, 0), ap(F.Mu, 0, 0), ap(F.Mf, 0, 0), ap(MB, 10, -136)];
  return { parts: out, riv, M: { MB, Mh, hF: F.Mh, hB: A.Mh } };
}

// ======================================================================= Drawing
// Draw a rig onto the transmittance canvas (multiply). Cam = cloth → viewport matrix.
export function drawDyed(g, Cam, rig, opt = {}) {
  const k = Math.hypot(Cam[0], Cam[1]);
  g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = opt.alpha ?? 1; if (opt.blur) g.filter = `blur(${opt.blur}px)`;
  for (const [M, pc] of rig.parts) { set(g, mul(Cam, M)); drawPiece(g, pc); }
  g.restore();
  if (opt.rivets !== false) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); if (opt.blur) g.filter = `blur(${opt.blur}px)`; for (const q of rig.riv) { const v = ap(Cam, ...q); rivet(g, v[0], v[1], 3.2 * k * (opt.rk || 1)); } g.restore(); }
}
// Draw a rig as a pure shadow (no dye, holes still let light through) via an offscreen mask
let MASK = null;
export function drawShadow(g, Cam, rig, opt = {}) {
  const Wc = g.canvas.width, Hc = g.canvas.height;
  if (!MASK || MASK[0].width !== Wc || MASK[0].height !== Hc) MASK = canvas(Wc, Hc);
  const [mc, mg] = MASK;
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'source-over'; mg.globalAlpha = 1; mg.filter = 'none'; mg.clearRect(0, 0, Wc, Hc);
  for (const [M, pc] of rig.parts) { set(mg, mul(Cam, M)); drawPiece(mg, pc); }
  if (opt.ghost) {     // the never-carved face: thinner hide lets more light through
    const G = build().y.ghost; set(mg, mul(Cam, opt.ghost.M));
    mg.globalCompositeOperation = 'destination-out'; mg.globalAlpha = opt.ghost.a; mg.drawImage(G.c, G.x0, G.y0, G.w, G.h); mg.globalAlpha = 1;
  }
  mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'source-in'; mg.fillStyle = opt.col || SHADOW; mg.fillRect(0, 0, Wc, Hc);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = opt.alpha ?? .94; if (opt.blur) g.filter = `blur(${opt.blur}px)`;
  g.drawImage(mc, 0, 0); g.restore();
}
// Control rods (soft, off the cloth). pts = anchor points (viewport), ends = rod butts (viewport)
export function drawRods(g, pts, ends, blur = 2.5, alpha = .62, w = 1) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.filter = `blur(${blur}px)`; g.globalAlpha = alpha;
  pts.forEach((p, i) => { const e = ends[i]; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(e[0], e[1]); g.strokeStyle = '#2a1a10'; g.lineWidth = (i === 0 ? 4 : 2.8) * w; g.stroke(); g.beginPath(); g.arc(p[0], p[1], (i === 0 ? 4 : 3) * w, 0, 7); g.fillStyle = '#2a1a10'; g.fill(); });
  g.restore();
}
