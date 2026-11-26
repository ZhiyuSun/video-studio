// 《半拍》 — page entry. ?sb=N renders storyboard panel N; ?test=model renders the model sheet; otherwise render(t) follows the timeline.
import { renderLayer, drawLayer, GL, trc, frc, tr, fr, W, H, camM, LAMPS0, grab } from './scene.js';
import { build } from './rig.js';
import { buildStage, GROUND } from './stage.js';
import { PANELS } from './panels.js';

const qs = new URLSearchParams(location.search);
await document.fonts.load('600 40px "Noto Serif SC"', '第一千夜'); await document.fonts.load('900 40px "Noto Serif SC"', '半拍');
build(); buildStage();

function modelSheet() {
  const yG = GROUND - 78, hG = GROUND - 170;
  const actors = [
    { kind: 'hero', pose: { x: 170, y: hG, tF: [50, 20], tB: [-30, 70], bladeW: -1.1 }, rivets: true },
    { kind: 'yao', pose: { x: 420, y: yG, tF: [36, 10], tB: [-10, 50], bladeW: 0 } },
    { kind: 'yao', pose: { x: 600, y: yG, tF: [30, -50], tB: [-30, -40], head: -.25, legF: -.3, legB: .3 } },
    { kind: 'yao', pose: { x: 790, y: yG, tF: [36, 10], tB: [-10, 50], head: .3 }, mode: 'shadow' },
    { kind: 'yao', pose: { x: 990, y: yG, back: true, aF: [-.4, -.8], aB: [.4, .8] } },
    { kind: 'princess', pose: { x: 1210, y: GROUND - 190, aF: -.4, aB: .2 } },
    { kind: 'old', pose: { x: 1520, y: GROUND - 120, aF: [-1.2, -2.2], aB: [-.8, -1.9] } },
  ];
  return { cam: [960, 402, 1], lamps: LAMPS0.map(([x, y]) => [x, y, 1, .95]), actors, scenery: [{ pc: 'tree', x: 1780, y: GROUND }] };
}

let frameState = null;
export function render(t) {
  if (qs.get('test') === 'model') { renderLayer(modelSheet()); return; }
  const sb = qs.get('sb');
  if (sb) { PANELS[+sb - 1](); return; }
}
window.render = render; window.DUR = 1;
render(0);
window.READY = true;
