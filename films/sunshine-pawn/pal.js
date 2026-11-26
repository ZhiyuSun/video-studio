// Colour models (色指定): one daylight model per character, derived per lighting set; skin set by hand where multiplying would turn it pink
import { hex } from './cel.js';

export const BASE = {
  skin: { f: '#f4ccb4', s: '#d29888', h: '#fff1e8', l: '#5a2e2e' },
  coat: { f: '#ffc632', s: '#d9861a', h: '#fff2a0', l: '#6a3606' },     // the hero's accent: yellow raincoat
  lining: { f: '#3a3550', s: '#25213a', h: '#5a5578', l: '#0e0c18' },
  visor: { f: '#1b3a58', s: '#0e1f34', h: '#8ff0ff', l: '#071322' },
  pants: { f: '#2f3148', s: '#1c1d2e', h: '#4c4f70', l: '#0b0b14' },
  boot: { f: '#2a2630', s: '#17141c', h: '#55506a', l: '#08070b' },
  metal: { f: '#8c93ad', s: '#4e5470', h: '#e4e9ff', l: '#1c2034' },
  keeper: { f: '#2c2638', s: '#191522', h: '#4a4260', l: '#08060c' },
  crt: { f: '#c9c2b0', s: '#8a8270', h: '#f4efe2', l: '#3a3428' },
  counter: { f: '#4a3040', s: '#2c1a28', h: '#7a5066', l: '#12080e' },
  cable: { f: '#202030', s: '#101018', h: '#6a6a90', l: '#050508' },
  umb: { f: '#3a4466', s: '#232a44', h: '#6a78a8', l: '#0c1020' },
  umb2: { f: '#5a3a5a', s: '#382238', h: '#8a6088', l: '#160a16' },
  umb3: { f: '#2f5050', s: '#1c3434', h: '#5a8a88', l: '#0a1818' },
  coatC: { f: '#3a3a50', s: '#24243a', h: '#5a5a78', l: '#0c0c16' },
  eye: { f: '#5a4a9a', s: '#2a1f5a', h: '#b8a8ff', l: '#140c30' },
  white_eye: '#f8f4ff',
  lash: '#1a0f22',
};

const mul = (c, m) => { const v = hex(c); return '#' + v.map((x, i) => Math.max(0, Math.min(255, Math.round(x * m[i]))).toString(16).padStart(2, '0')).join(''); };
export const LIGHTS = {
  day: { lit: [1, 1, 1], shade: [1, 1, 1], line: [1, 1, 1] },
  night: { lit: [.74, .72, 1.0], shade: [.52, .48, .9], line: [.8, .7, 1.1] },
  shop: { lit: [.7, .8, .86], shade: [.42, .5, .66], line: [.7, .8, .9] },     // the shop: green-cyan monitor light
  sun: { lit: [1.08, .96, .78], shade: [.62, .5, .72], line: [.9, .7, .8] },   // the street lit by the billboard's noon
  backlit: { lit: [.34, .26, .46], shade: [.22, .15, .32], line: [.35, .22, .45] },
};
export function palette(name) {
  const L = LIGHTS[name], out = {};
  for (const [k, v] of Object.entries(BASE)) {
    if (typeof v === 'string') { out[k] = mul(v, L.lit); continue; }
    out[k] = {};
    for (const [kk, c] of Object.entries(v)) out[k][kk] = mul(c, kk === 's' ? L.shade : kk === 'l' ? L.line : L.lit);
  }
  return out;
}
export const PAL = Object.fromEntries(Object.keys(LIGHTS).map(k => [k, palette(k)]));
// skin by hand for each light (multiplying makes faces pink under neon)
Object.assign(PAL.night.skin, { f: '#e6c8c4', s: '#9a82b2', h: '#fff2f2' });
Object.assign(PAL.shop.skin, { f: '#cfd8cc', s: '#7f8fa0', h: '#f2fff4', l: '#2e3a3a' });
Object.assign(PAL.sun.skin, { f: '#ffd2a8', s: '#c08890', h: '#fff4d8' });
// the yellow coat must pop in every set
Object.assign(PAL.night.coat, { f: '#f0bc3a', s: '#a86a30', h: '#ffe9a0' });
Object.assign(PAL.shop.coat, { f: '#d8c048', s: '#8a7a3a', h: '#f6f0a8' });
