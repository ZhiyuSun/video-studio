// S16 — The reveal. Code on the left, what it renders on the right; then the sound as code; then the numbers.
import { sm, lerp } from '../util.js';
import { SPEC, SPEC_T0 } from '../spectrum.js';
import { DURATION, FPS } from '../shots.js';

const FILES = ['engine.js', 'glsl.js', 'util.js', 'shots.js', 'index.html',
  ...['pencil', 'terminal', 'singularity', 'bang', 'web', 'collapse', 'forge', 'giant', 'black', 'supernova', 'nebula', 'planet', 'rain', 'tree', 'flock', 'tear', 'ascend', 'newstar', 'reveal'].map(s => `scenes/${s}.js`),
  '../score3.py', '../render.py'];
function load(path) { try { const x = new XMLHttpRequest(); x.open('GET', new URL(path, location.href).href, false); x.send(); return x.responseText || ''; } catch (e) { return ''; } }
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function hl(line, py) {
  const ci = py ? line.indexOf('#') : line.indexOf('//');
  const comment = ci >= 0 ? line.slice(ci) : ''; if (ci >= 0) line = line.slice(0, ci);
  let s = esc(line);
  s = s.replace(/("[^"]*"|'[^']*'|`[^`]*`)/g, '<span style="color:#9fb98a">$1</span>');
  s = s.replace(/\b(\d+\.?\d*)\b/g, '<span style="color:#7fb0d8">$1</span>');
  s = s.replace(/\b(const|let|function|return|for|if|else|import|export|from|def|in|vec2|vec3|vec4|float|uniform|varying|void|new|async|await)\b/g, '<span style="color:#e8a76a">$1</span>');
  return s + (comment ? '<span style="color:#6b675f">' + esc(comment) + '</span>' : '');
}

export function create(ctx) {
  const term = document.getElementById('term');
  const src = {}; let totalLines = 0;
  for (const f of FILES) { src[f] = load(f); totalLines += src[f].split('\n').length; }
  const SPLIT = 0.44;
  const comp = ctx.shader(`uniform sampler2D tS; uniform float split, a; varying vec2 vUv;
    void main(){ vec3 c=vec3(0.006,0.007,0.012);
      if(vUv.x>split){ vec2 u=vec2((vUv.x-split)/(1.-split), vUv.y); u.x = .5 + (u.x-.5)*(1.-split); c = texture2D(tS,u).rgb*a; }
      float edge = smoothstep(.0012,0.,abs(vUv.x-split)); c += vec3(1.,.75,.4)*edge*.9;
      gl_FragColor=vec4(c,1.); }`, { tS: { value: null }, split: { value: SPLIT }, a: { value: 1 } });
  const sub = ctx.makeRT(1920 * .75, 804 * .75);
  const black = ctx.shader(`void main(){ gl_FragColor=vec4(0.,0.,0.,1.); }`);

  const BEATS = [
    { a: 0.0, b: 5.4, file: 'scenes/supernova.js', scene: 'supernova', from: 0.25, label: '超新星 · SUPERNOVA', note: '100,000 粒子 · 光线逐帧计算' },
    { a: 5.4, b: 10.8, file: 'scenes/tree.js', scene: 'tree', from: 0.6, dur: 6, label: '生命之树 · TREE OF LIFE', note: '递归分叉 · 每一次分叉都是一次突变' },
    { a: 10.8, b: 16.2, file: '../score3.py', scene: null, label: '配乐 · THE SCORE', note: '每一个音符都由代码合成 · EVERY NOTE IS CODE' },
  ];
  function codePanel(beat, lt) {
    const lines = src[beat.file].split('\n'); const py = beat.file.endsWith('.py');
    const speed = 9; const off = Math.max(0, Math.floor((lt - beat.a) * speed));
    const start = Math.min(lines.length - 40, Math.floor(lines.length * 0.12) + off);
    const vis = lines.slice(Math.max(0, start), Math.max(0, start) + 40);
    const appear = sm(beat.a, beat.a + .5, lt) * (1 - sm(beat.b - .3, beat.b, lt));
    let h = `<div style="position:absolute;left:46px;top:40px;width:${1920 * SPLIT - 80}px;opacity:${appear.toFixed(3)};font-family:'DejaVu Sans Mono';font-size:14.5px;line-height:18.2px;color:#cfc8ba;white-space:pre;overflow:hidden;height:730px">`;
    vis.forEach((l, i) => { h += `<div><span style="color:#4d4a44;display:inline-block;width:46px">${start + i + 1}</span>${hl(l.slice(0, 92), py)}</div>`; });
    h += `</div>`;
    h += `<div style="position:absolute;left:${1920 * SPLIT + 40}px;bottom:44px;opacity:${appear.toFixed(3)};text-shadow:0 0 12px #000">
      <div style="font-family:'Noto Serif CJK SC';font-size:30px;letter-spacing:.2em;color:#f3efe6">${beat.label}</div>
      <div style="font-family:'DejaVu Sans Mono';font-size:15px;letter-spacing:.08em;color:#b9b2a4;margin-top:8px">${beat.file.replace('../', '')} · ${lines.length} lines · ${beat.note}</div></div>`;
    return h;
  }
  function spectrum(lt, gt) {
    const i = Math.max(0, Math.min(SPEC.length - 1, Math.round((gt - SPEC_T0) * FPS)));
    const bands = SPEC[i]; const x0 = 1920 * SPLIT + 90, w = 1920 * (1 - SPLIT) - 180, bw = w / bands.length;
    let h = '';
    bands.forEach((v, k) => {
      const hh = 6 + v * 420;
      h += `<div style="position:absolute;left:${(x0 + k * bw).toFixed(1)}px;top:${(400 - hh / 2).toFixed(1)}px;width:${(bw * .62).toFixed(1)}px;height:${hh.toFixed(1)}px;background:linear-gradient(#f3c27a,#e8a76a 60%,#7a5530);border-radius:2px;opacity:.9;box-shadow:0 0 14px rgba(240,180,100,.35)"></div>`;
    });
    return h;
  }
  return {
    scale: 0.75,
    async renderAsync(lt, dur, p, rt, gt) {
      let html = ''; let P = { bloom: .6, threshold: 1.0, streak: 0, grain: .035, vig: .5, ca: 0 };
      const beat = BEATS.find(b => lt >= b.a && lt < b.b);
      if (beat && beat.scene) {
        const sc = await ctx.get(beat.scene);
        const R = await sc.render(beat.from + (lt - beat.a), beat.dur ?? 20, {}, sub, 0);
        comp.uniforms.tS.value = sub.texture; comp.uniforms.a.value = sm(beat.a, beat.a + .4, lt) * (1 - sm(beat.b - .3, beat.b, lt));
        ctx.quad(comp, rt);
        P = Object.assign({}, R || {}, { fadeW: 0, fadeB: 0, vig: .6 });
        html += codePanel(beat, lt);
      } else if (beat) {
        comp.uniforms.tS.value = sub.texture; comp.uniforms.a.value = 0; ctx.quad(comp, rt);
        html += codePanel(beat, lt);
        html += `<div style="opacity:${(sm(beat.a, beat.a + .5, lt) * (1 - sm(beat.b - .3, beat.b, lt))).toFixed(3)}">${spectrum(lt, gt)}</div>`;
      } else {
        ctx.quad(black, rt);
        // the numbers
        const a = sm(16.4, 17.0, lt), out = 1 - sm(23.8, 24.8, lt);
        const k = sm(16.6, 20.6, lt);
        const n = v => Math.round(v * k).toLocaleString('en-US');
        const frames = Math.round(DURATION * FPS);
        const rows = [['0', '张图片素材', 'IMAGES USED'], ['0', '段录音采样', 'RECORDED SAMPLES'], [n(totalLines), '行代码', 'LINES OF CODE'], [n(frames), '帧，逐帧计算', 'FRAMES, EACH ONE COMPUTED']];
        html += `<div style="position:absolute;left:0;right:0;top:${lt < 21.5 ? 190 : 130}px;text-align:center;opacity:${(a * out * (1 - sm(21.0, 21.5, lt))).toFixed(3)}">`;
        rows.forEach((r, i) => {
          const ai = sm(16.6 + i * .5, 17.2 + i * .5, lt);
          html += `<div style="opacity:${ai.toFixed(3)};margin:14px 0;font-family:'Noto Serif CJK SC';color:#efe9dc"><span style="font-family:'Inter Display','Inter';font-weight:200;font-size:58px;color:#f3c27a;letter-spacing:.04em;display:inline-block;min-width:260px;text-align:right">${r[0]}</span>
            <span style="font-size:30px;letter-spacing:.25em;margin-left:28px;display:inline-block;min-width:420px;text-align:left">${r[1]} <span style="font-family:'Inter Display';font-size:15px;letter-spacing:.3em;color:#8d877c">${r[2]}</span></span></div>`;
        });
        html += `</div>`;
        const fa = sm(21.5, 22.3, lt) * out;
        html += `<div style="position:absolute;left:0;right:0;top:300px;text-align:center;opacity:${fa.toFixed(3)}">
          <div style="font-family:'Inter Display','Inter';font-weight:200;font-size:86px;letter-spacing:.18em;color:#fff6e4;text-shadow:0 0 40px rgba(255,190,110,.35)">Claude Opus 5.5</div>
          <div style="font-family:'Noto Serif CJK SC';font-size:26px;letter-spacing:.6em;color:#cfc6b4;margin-top:26px">编剧 · 导演 · 摄影 · 剪辑 · 配乐</div></div>`;
        P = { bloom: .5, threshold: 1, streak: 0, grain: .03, vig: .4, ca: 0, fadeB: sm(24.4, 25, lt) };
      }
      term.innerHTML = html;
      return P;
    },
    render() { throw new Error('async'); },
  };
}
