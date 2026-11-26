// The memory: a seaside at noon, painted once at load (colour + emissive), then the moving cels (kite, woman, glints) per frame.
// It is drawn into its own canvas each frame, so the shop CRT, the extraction, the billboard and the eye reflection all show the same picture.
import { canvas, W, H, TAU, rng, rgba, mix, vgrad, airbrush, path } from './cel.js';
import { woman, kite } from './chars.js';
import { T, q12 } from './story.js';

export function memoryPlate() {
  const [c, g] = canvas(W, H), [ec, e] = canvas(W, H), R = rng(77);
  e.fillStyle = '#000'; e.fillRect(0, 0, W, H);
  // sky: cobalt → pale near the horizon
  vgrad(g, 0, 0, W, 640, [[0, '#1f5fd6'], [.55, '#4f9cf0'], [1, '#bfe6ff']]);
  // sun (upper right) + airbrushed halo
  airbrush(g, 1480, 230, 520, 520, '#fff6d0', .55);
  airbrush(g, 1480, 230, 200, 200, '#ffffff', .9, .5);
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(1480, 230, 78, 0, TAU); g.fill();
  airbrush(e, 1480, 230, 360, 360, '#fff2c0', .85, .6);
  // cumulus: lit tops, hard-edged lavender undersides (one painted plate, gradients allowed here)
  for (let i = 0; i < 9; i++) {
    const cx = 120 + i * 220 + R() * 80, cy = 380 + R() * 150, s = .6 + R() * .8;
    g.save(); g.filter = 'blur(2px)';
    for (let k = 0; k < 7; k++) { const bx = cx + (k - 3) * 52 * s, by = cy - Math.sin(k / 6 * Math.PI) * 70 * s - R() * 20 * s; g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx, by, (50 + R() * 30) * s, 0, TAU); g.fill(); }
    g.fillStyle = '#b9c4ee'; g.beginPath(); g.ellipse(cx, cy + 20 * s, 190 * s, 34 * s, 0, 0, TAU); g.fill();
    g.restore();
  }
  // headland far left
  g.fillStyle = '#5a7fb0'; g.fill(path([[0, 560], [120, 520], [260, 540], [380, 600], [0, 610]]));
  // sea
  vgrad(g, 0, 600, W, 170, [[0, '#2a6fc8'], [1, '#1d4f9a']]);
  for (let y = 606; y < 770; y += 9) { g.fillStyle = rgba('#ffffff', .12 + .1 * Math.sin(y * .7)); g.fillRect(0, y, W, 2); }
  // sun path on the water
  airbrush(g, 1480, 640, 260, 40, '#fff6d8', .65);
  airbrush(e, 1480, 640, 220, 36, '#fff0c0', .5);
  // surf line + sand
  g.fillStyle = '#e8f6ff'; g.fill(path([[0, 770], [400, 760], [900, 774], [1400, 762], [1920, 772], [1920, 790], [0, 792]]));
  vgrad(g, 0, 784, W, H - 784, [[0, '#f2d8a8'], [1, '#e0b080']]);
  g.fillStyle = rgba('#c89060', .35);
  for (let i = 0; i < 60; i++) { g.beginPath(); g.ellipse(R() * W, 820 + R() * 260, 30 + R() * 60, 3, 0, 0, TAU); g.fill(); }
  return { c, e: ec };
}

// o: { bleach (0..1), noKite, noWoman }
export function drawMemory(M, g, e, t, A, o = {}) {
  g.drawImage(A.mem.c, 0, 0); e.drawImage(A.mem.e, 0, 0);
  const fr = q12(t);
  // glints on the water (on twos)
  const R = rng(900 + Math.floor(fr * 12) % 6);
  for (let i = 0; i < 26; i++) {
    const x = 1300 + (R() - .5) * 600, y = 620 + R() * 120, s = 2 + R() * 4;
    g.fillStyle = '#ffffff'; g.fillRect(x - s * 2, y, s * 4, 2);
    e.fillStyle = rgba('#fff4d0', .6); e.fillRect(x - s * 3, y - 1, s * 6, 4);
  }
  // the kite rises on its string from the bottom of the frame (the memory is first person)
  if (!o.noKite) {
    const k = Math.min(1, Math.max(0, (t - T.kite + 2.0) / 3.0)), kk = 1 - Math.pow(1 - k, 2);
    const kx = 560 - kk * 120, ky = 760 - kk * 480;
    g.strokeStyle = rgba('#ffffff', .8); g.lineWidth = 2;
    g.beginPath(); g.moveTo(360, H + 10); g.quadraticCurveTo(420, ky + 260, kx, ky + 60); g.stroke();
    kite(g, e, kx, ky, .9, t, -.15);
  }
  // the woman, backlit, waving
  if (!o.noWoman) {
    const wv = Math.min(1, Math.max(0, (t - (o.waveAt ?? T.wave)) / .4));
    g.save(); g.translate(1230, 900); g.scale(1.05, 1.05);
    woman(g, null, { t, wave: wv > 0 ? 1 : 0, rim: { c: '#ffe0a0', d: [-5, 4] } });
    g.restore();
    airbrush(e, 1230, 520, 90, 120, '#fff0c0', .25);
  }
  if (o.bleach > 0) {
    const b = o.bleach;
    g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = rgba('#808080', b); g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba('#6a7a9a', b * .9); g.fillRect(0, 0, W, H); g.restore();
    e.save(); e.globalCompositeOperation = 'multiply'; e.fillStyle = `rgb(${255 * (1 - b)},${255 * (1 - b)},${255 * (1 - b)})`; e.fillRect(0, 0, W, H); e.restore();
  }
}
