// Call window.render(t) at many times and print any JS error. Run after every code change.
//   node tools/errcheck.js src/mv.html            (every 3.5 s across the song)
//   node tools/errcheck.js src/mv.html 100,101.5   (specific times)
let pw; try { pw = require('playwright'); } catch (e) { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/npm-tools/node_modules/playwright'); }
(async () => {
  const [html, list] = process.argv.slice(2); const ts = list ? list.split(',').map(Number) : Array.from({ length: 103 }, (_, i) => i * 3.5);
  const opts = { args: ['--no-sandbox'] }; if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  const b = await pw.chromium.launch(opts); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file://' + require('path').resolve(html)); let bad = 0;
  for (const t of ts) { try { await p.evaluate(t => window.render(t), t); } catch (e) { bad++; console.log('ERR at', t, e.message.split('\n')[0]); } }
  console.log(bad ? `${bad} errors` : 'ok'); await b.close();
})();
