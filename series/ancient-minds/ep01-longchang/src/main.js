import { makeComp, layerSet } from './comp.js';
const q = new URLSearchParams(location.search);
const comp = makeComp(document.getElementById('c'));
const A = layerSet(), B = layerSet(), TMP = layerSet();
await document.fonts.load('40px MaShanZheng', '心龙场'); await document.fonts.load('40px LXGW', '心');
let render;
if (q.has('board')) {
  const mod = await import('./board.js');
  window.DUR = 1;
  render = t => mod.board(+q.get('board'), A, TMP, comp, t);
} else {
  const S = await import('./film.js');
  await S.init(TMP);
  window.DUR = S.DUR; window.EV = S.events(); window.TEXTS = S.texts;
  render = t => S.render(t, A, B, TMP, comp);
}
window.render = render;
window.READY = true;
