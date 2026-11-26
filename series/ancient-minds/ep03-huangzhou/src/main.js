import { makeComp, layerSet } from './comp.js';
import { SHOTS, subPos } from './film.js';
import { subtitle } from './kit.js';
import { clamp, ss } from '/core/lib.js';

const q = new URLSearchParams(location.search);
const NOSUB = q.has('nosub');
const story = await (await fetch(new URL('../story.json', import.meta.url))).json();
await document.fonts.load('40px WenKai', '苏轼黄州');
await document.fonts.load('40px MaShanZheng', '苏轼黄州');
const comp = makeComp(document.getElementById('c'));
const A = layerSet(), B = layerSet();
const SH = story.shots, VO = story.vo, SUBS = story.subs, TR = 1.1;
const voById = Object.fromEntries(VO.map(v => [v.id, v]));
const ctx = s => ({
  d: s.t1 - s.t0,
  V: id => voById[id].t - s.t0,
  E: id => voById[id].t + voById[id].d - s.t0,
  dur: id => voById[id].d,
});
const CTX = SH.map(ctx);

function shotAt(t) { let i = SH.findIndex(s => t < s.t1); return i < 0 ? SH.length - 1 : i; }
function renderShot(L, i, t) { L.clear(); const s = SH[i]; return SHOTS[s.id](L, t - s.t0, CTX[i]) || {}; }

window.DUR = story.dur;
window.render = t => {
  const i = shotAt(t), s = SH[i];
  let o, target = A;
  if (s.tr === 'bloom' && i > 0 && t - s.t0 < TR) {
    // ink-bloom transition: the previous shot (still running) in A, the new one grows inside a spreading drop in B
    const ob = renderShot(B, i, t); o = renderShot(A, i - 1, t);
    const u = (t - s.t0) / TR;
    o = { ...o, paperB: ob.paper, bleedB: ob.bleed, rimB: ob.rim, trans: [960, 560, 20 + 2400 * ss(u), 1] };
    target = B;
  } else o = renderShot(A, i, t);
  if (!NOSUB) for (const sb of SUBS) {
    if (t < sb.t0 || t > sb.t1) continue;
    const k = Math.min(clamp((t - sb.t0) / .3), clamp((sb.t1 - t) / .35));
    const si = SH.findIndex(x => x.id === sb.shot), pos = subPos(sb.shot, t - SH[si].t0, CTX[si]);
    subtitle(target, sb.text, pos[0], pos[1], k, { size: 40, quote: sb.quote });
  }
  comp(A, B, o);
};
// sound events for mix.py
const EV = [];
for (const v of VO) EV.push({ t: v.t, type: 'vo', id: v.id });
const S = Object.fromEntries(SH.map((s, i) => [s.id, { ...s, C: CTX[i] }]));
const at = (id, lt) => S[id].t0 + lt;
for (const id of ['rainwide', 'rainwalk', 'puddle', 'small']) EV.push({ type: 'amb', kind: 'rain', t0: S[id].t0, t1: S[id].t1, gain: id === 'puddle' ? 1.1 : id === 'small' ? .6 : 1 });
EV.push({ type: 'amb', kind: 'rain', t0: S.hut.t0, t1: S.despair.t0 + 4, gain: .9 });
EV.push({ type: 'amb', kind: 'rain', t0: S.rainback.t0, t1: at('rainback', S.rainback.C.V('L63') + S.rainback.C.dur('L63') * .6), gain: 1 });
for (const id of ['river', 'chibi', 'reply', 'pull', 'dawn']) EV.push({ type: 'amb', kind: 'water', t0: S[id].t0, t1: S[id].t1, gain: id === 'river' ? 1 : .6 });
for (const id of ['prison', 'temple', 'goose', 'sit']) EV.push({ type: 'amb', kind: 'night', t0: S[id].t0, t1: S[id].t1, gain: .7 });
for (const id of ['farm', 'acts', 'rainback', 'prints']) EV.push({ type: 'amb', kind: 'field', t0: S[id].t0, t1: S[id].t1, gain: .6 });
// steps of the staff in the puddle
for (let k = 0; k * (1 / 1.05) < S.puddle.t1 - S.puddle.t0; k++) EV.push({ t: S.puddle.t0 + k / 1.05 + .1, type: 'staff', gain: .8 });
for (let k = 0; k < 14; k++) EV.push({ t: S.rainwalk.t0 + .3 + k * .385, type: 'splash', gain: .35 });
EV.push({ t: S.drop.t0 + .55, type: 'drip', gain: 1 });
EV.push({ t: S.title.t0 + 3.4, type: 'seal', gain: 1 });
EV.push({ t: S.prison.t0 + .1, type: 'clank', gain: .8 });
EV.push({ t: S.temple.t0 + 6.4, type: 'door', gain: .8 });
for (let k = 0; k < 3; k++) EV.push({ t: at('hut', S.hut.C.V('L21') + k * .5 + .3), type: 'crow', gain: .7 });
EV.push({ type: 'amb', kind: 'fire', t0: at('hut', S.hut.C.V('L20') - .25), t1: S.hut.t1, gain: .8 });
EV.push({ type: 'silence', t0: S.hush.t0, t1: S.hush.t1 });
EV.push({ t: S.hush.t0 + 1.7, type: 'drip', gain: .9 });
for (let k = 0; k < 6; k++) EV.push({ t: at('paper', S.paper.C.V('L32') + 1.6 + k * .55), type: 'brush', gain: .5 });
EV.push({ t: at('coins', S.coins.C.V('L40') + 6.3), type: 'coins', gain: .8 });
EV.push({ t: at('coins', S.coins.C.V('L40') + 8.6), type: 'coins', gain: .6 });
for (let k = 0; k * (1 / .9) < S.farm.t1 - S.farm.t0; k++) EV.push({ t: S.farm.t0 + k / .9 + .35 / .9 * .9, type: 'hoe', gain: .55 });
EV.push({ t: at('prints', S.prints.C.E('L68') + 3.8), type: 'seal', gain: 1 });
window.EV = EV;
window.TEXTS = () => [];
window.READY = true;
