// Render frames of an HTML canvas page with headless Chrome and pipe them to ffmpeg.
//
//   node tools/render.js src/mv.html out.mp4 <start_s> <end_s>      -> silent H.264 video, 1920x1080 @30fps
//   node tools/render.js src/mv.html stills 12,45.5,300              -> still_12.jpg ... in the current dir
//
// Needs: Node 18+, `npm i playwright` (or set PLAYWRIGHT_PATH), ffmpeg on PATH.
// Chrome: uses Playwright's bundled Chromium unless CHROME_PATH is set.
// The page must expose window.render(t) drawing into <canvas id="c" width=1920 height=1080>.
let pw; try { pw = require('playwright'); } catch (e) { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/npm-tools/node_modules/playwright'); }
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out, a, b] = process.argv.slice(2);
  const opts = { args: ['--no-sandbox'] }; if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  const browser = await pw.chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  await page.goto('file://' + path.resolve(html));
  await page.evaluate(async () => { const g = document.getElementById('c').getContext('2d'); g.font = '400 40px "Noto Serif CJK SC"'; g.fillText('宇宙', 0, 0); await document.fonts.ready; });
  const grab = async t => Buffer.from((await page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.93); }, t)).split(',')[1], 'base64');
  if (out === 'stills') { for (const t of a.split(',').map(Number)) fs.writeFileSync(`still_${t}.jpg`, await grab(t)); }
  else {
    const s = +a, e = +b, fps = 30, n = Math.round((e - s) * fps), tmp = out.replace(/\.mp4$/, '.part.mp4');
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) { const buf = await grab(s + i / fps); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 300 === 0) console.log('frame', i, '/', n); }
    ff.stdin.end(); const code = await new Promise(r => ff.on('close', r));
    if (code === 0) fs.renameSync(tmp, out); else console.error('ffmpeg failed', code);
  }
  await browser.close();
})();
