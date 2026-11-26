// Render a still page (cover) to PNG at its canvas size.
//   node tools/shot_page.js cover/cover.html bilibili_16x9.png     (1920x1080; 4:3 = centre 1440x1080 crop -> 1200x900)
//   node tools/shot_page.js cover/album.html netease_album.png     (3000x3000)
let pw; try { pw = require('playwright'); } catch (e) { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/npm-tools/node_modules/playwright'); }
(async () => { const [html, out] = process.argv.slice(2); const opts = { args: ['--no-sandbox'] }; if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  const b = await pw.chromium.launch(opts); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file://' + require('path').resolve(html)); await p.evaluate(async () => { await document.fonts.ready; window.render(0); await document.fonts.ready; window.render(0); });
  const d = await p.evaluate(() => document.getElementById('c').toDataURL('image/png')); require('fs').writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); await b.close(); })();
