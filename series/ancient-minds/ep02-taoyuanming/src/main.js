import { makeComp, layerSet } from './comp.js';
import { clamp, ss } from '/core/lib.js';
import { subtitle } from './kit.js';
const q = new URLSearchParams(location.search);
const comp = makeComp(document.getElementById('c'));
const A = layerSet(), B = layerSet(), TMP = layerSet(), TMP2 = layerSet();
await document.fonts.load('40px MaShanZheng', '归去来陶渊明');
await document.fonts.load('40px WenKai', '他叫陶渊明');
const ST = await (await fetch('story.json')).json();
const F = await import('./film.js');
F.init(ST);
const NOSUB = q.has('nosub');
window.DUR = ST.dur;
window.EV = F.events();

function drawScene(L, sc, t) { L.clear(); return F.scene(sc, L, t, TMP, TMP2) || {}; }

window.render = t => {
  const i = F.sceneIndex(t), sc = F.SC[i];
  let o;
  const tr = sc.in;   // transition into this scene: {k:'bloom', d, at:[x,y]} or cut
  if (tr && tr.k === 'bloom' && i > 0 && t < sc.t0 + tr.d) {
    const prev = F.SC[i - 1];
    const oa = drawScene(A, prev, t), ob = drawScene(B, sc, t);
    const u = (t - sc.t0) / tr.d;
    o = { ...oa, paperB: ob.paper, bleedB: ob.bleed, rimB: ob.rim, trans: [tr.at[0], tr.at[1], 20 + 2400 * ss(u), 1], subInB: true };
  } else o = drawScene(A, sc, t);
  if (!NOSUB) for (const s of ST.subs) {
    if (t < s.t0 || t > s.t1) continue;
    const k = Math.min(clamp((t - s.t0) / .3), clamp((s.t1 - t) / .35));
    const pos = F.subPos(s, t);
    subtitle(A, s.text, pos[0], pos[1], k, { size: pos[2] || 40 });
    if (o.subInB) subtitle(B, s.text, pos[0], pos[1], k, { size: pos[2] || 40 });
  }
  comp(A, B, o);
};
window.TEXTS = t => ST.subs.filter(s => t >= s.t0 && t <= s.t1).map((s, i) => { const p = F.subPos(s, t); return { id: s.line + ':' + i, text: s.text, x0: p[0], y0: p[1] - 40, x1: p[0] + 760, y1: p[1] + 60 }; });
window.READY = true;
