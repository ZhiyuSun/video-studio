// 《典当》SUNSHINE PAWN — 80s cel anime (lemo-opuscar style), 62.6 s, no dialogue
import { canvas, W, H } from './cel.js';
import { makePost } from './post.js';
import { DUR, shotAt, T, BEAT, bar } from './story.js';
import { streetPlate, skylinePlate, smear, reflectPlate, tallFar, tallNear } from './bg.js';
import { memoryPlate } from './memory.js';
import * as SC from './scenes.js';

const qs = new URLSearchParams(location.search);
const [sc, g] = canvas(W, H), [gc, e] = canvas(W, H);
const post = makePost(document.getElementById('gl'));

const CJK = '余额断电倒计时记忆典当估价已到账真实阳光二手回忆每分钟拉面旅馆药房茶室书店电玩修理夜市饺子照相义体网吧';
await document.fonts.load('104px HeiSC', CJK); await document.fonts.load('104px TubeSC', CJK);
await document.fonts.load('64px HUD', '0123456789:¥ .');
await document.fonts.load('italic 900 56px Kanit', 'SUNSHINE PAWN'); await document.fonts.load('italic 800 56px Kanit', 'BARCAFE');

const A = {};
{
  const st = streetPlate(4800, 700, 3, 'night'); A.street = smear(st, 6, 4); A.refl = reflectPlate(A.street, 380, .8);
  A.sky = skylinePlate(3840, 560, 9, 'night');
  const sd = streetPlate(4800, 700, 11, 'dawn'); A.streetSun = smear(sd, 6, 4); A.reflSun = reflectPlate(A.streetSun, 380, .6);
  A.skySun = skylinePlate(3840, 560, 5, 'dawn');
  A.tallFar = tallFar(3200); A.tallNear = tallNear(st, 3600);
  A.mem = memoryPlate(); A.shop = SC.shopPlate(); A.tower = SC.towerPlate(); A.bokeh = SC.bokehPlate();
}
const FN = { wrist: SC.wrist, crane: SC.crane, counter: SC.counter, memory: SC.memory, price: SC.price, extract: SC.extract,
  street: SC.street, billboard: SC.billboard, eye: SC.eye, hand: SC.hand, faces: SC.faces, title: SC.title };

let lastTexts = [];
function render(t) {
  for (const x of [g, e]) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  const [t0, t1, name] = shotAt(t);
  const fn = FN[qs.get('shot') || name];
  const over = fn({ t, lt: t - t0, u: (t - t0) / (t1 - t0), g, e, A, name, DUR }) || {};
  lastTexts = over.texts || [];
  const o = { ...over }; delete o.texts;
  post.render(sc, gc, Math.round(t * 24), null, qs.get('raw') ? { bloom: 0, halo: 0, scan: 0, grille: 0, glow: 0, noiseA: 0, corner: 0 } : o);
}

// sound events for mix.py
function events() {
  const ev = [], add = (type, t, o = {}) => ev.push({ type, t: +t.toFixed(3), ...o });
  add('crton', .02);
  for (let k = 0; k < 8; k++) add('beep', .26 + k * BEAT, { v: k % 2 ? .5 : .8 });
  add('whoosh', bar(2) + .1, { v: .5 }); add('flyby', 7.6); add('flyby', 9.4, { v: .6 });
  add('neon', T.signOn, { d: .6 });
  add('door', bar(5) - .05, { v: .5 });
  add('cable', T.plug - .4, { v: .4 }); add('click', T.plug);
  add('crton', T.crtOn); add('static', T.crtOn + .5, { d: .4 }); add('lens', T.lens);
  add('waves', T.crtOn + .9, { d: bar(9.5) - T.crtOn - .9, lofi: 1 }); add('waves', bar(7.5) - .5, { d: bar(9.5) - bar(7.5) + .5, lofi: 0 });
  add('roll', bar(9.5), { d: T.price - bar(9.5) }); add('ding', T.price);
  add('impact', T.impact); add('flash', T.flash); add('drain', T.bleach, { d: T.paid - T.bleach }); add('ding2', T.paid);
  add('door', T.door - .05, { bell: 1 });
  for (let k = 0; k < 9; k++) add('step', T.door + .35 + k * (8 / 12 / 2) * 2, { v: .7 });
  add('brownout', T.hush2, { d: .4 });
  add('powerup', T.power); add('waves', T.power + .4, { d: T.title - T.power - .4, lofi: 0, v: 1.2 });
  add('crowd', T.power + .8, { d: T.faces - T.power });
  add('cloth', T.handUp); add('cloth', T.handDown, { v: .6 });
  add('rainup', T.faces, { d: T.title - T.faces });
  add('neon', T.title, { d: .75 }); add('glint', T.glint);
  add('crtoff', DUR - .55);
  return ev.sort((a, b) => a.t - b.t);
}
window.EV = events();
window.render = render; window.DUR = DUR;
window.TEXTS = t => { render(t); return lastTexts; };
render(parseFloat(qs.get('t') ?? '15'));
window.READY = true;
