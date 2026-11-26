// Vermilion square seal in baiwen (白文, intaglio: the characters are carved away and print white) reading "水": the seal text is seal-script-like lines drawn in code (one long S-shaped stroke in the middle, two zigzag water-ripple segments on each side)
import { vnoise, clamp } from '/core/lib.js';
import { VERM } from './hero.js';
let SEAL_TEXT = '心';
export function setSealText(t) { SEAL_TEXT = t; }
export function seal(c, x, y, size, am = 1, seed = 3) {
  if (am <= 0) return;
  c.save(); c.translate(x, y);
  const S = size, jit = S * .018; if (typeof seed === 'object') seed = seed.seed ?? 3;
  // Seal face: a slightly irregular square
  c.beginPath();
  const N = 28;
  for (let i = 0; i < N; i++) {
    const t = i / N * 4, side = Math.floor(t), u = t - side;
    let px, py; if (side === 0) { px = u * S; py = 0; } else if (side === 1) { px = S; py = u * S; } else if (side === 2) { px = S - u * S; py = S; } else { px = 0; py = S - u * S; }
    px += (vnoise(seed + i * 1.3) - .5) * jit * 2; py += (vnoise(seed + 40 + i * 1.3) - .5) * jit * 2;
    i ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath(); c.fillStyle = `rgba(${VERM.join(',')},${clamp(am)})`; c.fill();
  // Seal text (carved out white): baiwen 白文, the character knocked out of the red with the kaishu font, slightly eroded
  c.globalCompositeOperation = 'destination-out';
  c.fillStyle = '#000'; c.strokeStyle = '#000';
  const ch = SEAL_TEXT;
  const n = ch.length, cols = n > 1 ? 2 : 1, rows = Math.ceil(n / cols), cell = S * .8 / Math.max(cols, rows);
  c.font = `${cell * 1.02}px MaShanZheng`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {   // seal order: right column first, top to bottom
    const col = cols - 1 - Math.floor(i / rows), row = i % rows;
    const cx = S * .1 + cell * (col + .5) + (S * .8 - cell * cols) / 2, cy = S * .1 + cell * (row + .5) + (S * .8 - cell * rows) / 2;
    c.fillText(ch[i], cx, cy + cell * .04);
  }
  // Uneven seal paste: tiny white specks
  for (let i = 0; i < 70; i++) { const a = vnoise(seed + i * 3.7) , b = vnoise(seed + 91 + i * 2.9); c.globalAlpha = .5 + .5 * vnoise(i * 1.1); c.beginPath(); c.arc(a * S, b * S, S * (.004 + .012 * vnoise(i * 5.3)), 0, 7); c.fill(); }
  c.restore();
}
