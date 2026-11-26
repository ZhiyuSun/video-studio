// Evaluate a JS expression inside the loaded page and print the result. Handy for inspecting the timeline.
//   node tools/probe.js src/mv.html "SCENES.map((s,i)=>i+' '+s[0].toFixed(2)+'-'+s[1].toFixed(2)+' '+(s[2].name||'')).join('\n')"
//   node tools/probe.js src/mv.html "JSON.stringify(SEC.c1.st)"
let pw; try { pw = require('playwright'); } catch (e) { pw = require(process.env.PLAYWRIGHT_PATH || '/opt/npm-tools/node_modules/playwright'); }
(async () => { const [html, expr] = process.argv.slice(2); const opts = { args: ['--no-sandbox'] }; if (process.env.CHROME_PATH) opts.executablePath = process.env.CHROME_PATH;
  const b = await pw.chromium.launch(opts); const p = await b.newPage(); p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  await p.goto('file://' + require('path').resolve(html)); console.log(await p.evaluate(expr)); await b.close(); })();
