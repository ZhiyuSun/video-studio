// The AI writing: a prefix, its candidate next words with probabilities, the sampling, the choice.
// mode 'genesis': 太初有 → 光, whose light condenses into the singularity.  mode 'final': 下一帧，由 → 你 来写。
import { TOKENS } from '../shots.js';
import { sm, lerp } from '../util.js';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function create(ctx) {
  const term = document.getElementById('term');
  const glowMat = ctx.shader(`uniform float g, r; uniform vec2 c; varying vec2 vUv;
    void main(){ vec2 p=vUv*vec2(1920.,804.); float d=length(p-c);
      vec3 col = vec3(1.,.84,.62)*g*(exp(-d*d/(2.*r*r))*1.4 + .3*exp(-d/(r*5.)));
      gl_FragColor=vec4(col,1.); }`, { g: { value: 0 }, r: { value: 30 }, c: { value: new ctx.THREE.Vector2(960, 402) } });

  return {
    scale: 0.5,
    render(lt, dur, p, rt) {
      const T = TOKENS[p.mode]; const fin = p.mode === 'final';
      const pre = [...T.prefix]; const nPre = Math.min(pre.length, Math.max(0, Math.floor((lt - 1.0) * 5)));
      const candA = sm(3.0, 3.6, lt);
      // sampling: the highlight wanders between candidates, then settles
      const settle = fin ? 7.0 : 7.8;
      let hi = T.pick;
      if (lt > 5.6 && lt < settle) { const k = Math.floor((lt - 5.6) * (fin ? 5 : 7)); hi = [1, 2, 0, 3, 1, 0, 2, 0, 1, 0, 1, 0, 1, 0][k % 14] % T.cands.length; }
      const chosen = lt >= settle ? T.cands[T.pick][0] : '';
      const after = fin && lt > settle + 0.6 ? [...T.after].slice(0, Math.floor((lt - settle - 0.6) * 4)).join('') : '';
      const textFade = fin ? 1 - sm(11.6, 12.8, lt) : 1 - sm(9.4, 10.6, lt);
      const listFade = candA * (1 - sm(settle + 0.2, settle + 1.0, lt));
      // layout
      const X = fin ? 560 : 700, Y = 330;
      let h = `<div style="position:absolute;left:${X}px;top:${Y}px;opacity:${textFade.toFixed(3)};white-space:pre">`;
      h += `<span style="font-family:'Noto Serif CJK SC';font-weight:300;font-size:64px;letter-spacing:.12em;color:#efe9dc">${esc(pre.slice(0, nPre).join(''))}</span>`;
      h += `<span id="tk" style="font-family:'Noto Serif CJK SC';font-weight:500;font-size:64px;letter-spacing:.12em;color:#f3c27a;text-shadow:0 0 ${(20 + sm(settle, settle + 1.2, lt) * 40).toFixed(1)}px rgba(255,190,110,.8)">${esc(chosen)}</span>`;
      h += `<span id="tka" style="font-family:'Noto Serif CJK SC';font-weight:300;font-size:64px;letter-spacing:.12em;color:#efe9dc">${esc(after)}</span>`;
      h += `<div style="font-family:'Crimson Text';font-style:italic;font-size:26px;color:#8d877c;margin-top:10px;opacity:${sm(2.0, 2.8, lt).toFixed(3)}">${T.en}${lt >= settle ? ' <span style="color:#d9b27a">' + T.cands[T.pick][2] + '</span>' : ' …'}${after ? ' to write.' : ''}</div>`;
      h += `</div>`;
      // candidate list
      const LX = X + 64 * 0.0 + (fin ? 600 : 470), LY = Y - 40;
      h += `<div style="position:absolute;left:${LX}px;top:${LY}px;opacity:${listFade.toFixed(3)};font-family:'DejaVu Sans Mono';">`;
      T.cands.forEach((c, i) => {
        const grow = sm(3.2 + i * .15, 4.4 + i * .15, lt);
        const on = i === hi;
        const pv = c[1] === null ? null : c[1] * grow;
        let bar;
        if (c[1] === null) {
          // unknown probability: a shimmering, unmeasurable bar
          const segs = Array.from({ length: 22 }, (_, j) => { const v = .25 + .75 * Math.abs(Math.sin(lt * 3.1 + j * 1.7) * Math.sin(lt * 1.3 + j * .9)); return `<span style="display:inline-block;width:8px;height:${(4 + v * 12).toFixed(1)}px;margin-right:2px;background:rgba(243,194,122,${(.25 + v * .6).toFixed(2)});vertical-align:middle"></span>`; }).join('');
          bar = `<span style="display:inline-block;width:240px">${segs}</span><span style="display:inline-block;width:110px;text-align:right;color:#f3c27a;font-size:20px">？</span>`;
        } else {
          bar = `<span style="display:inline-block;width:240px;height:8px;background:rgba(255,255,255,.07);vertical-align:middle"><span style="display:block;height:8px;width:${(pv * 2.4).toFixed(1)}px;background:${on ? '#f3c27a' : '#7d7466'}"></span></span><span style="display:inline-block;width:110px;text-align:right;color:${on ? '#f3c27a' : '#8d877c'};font-size:20px">${pv.toFixed(1)}%</span>`;
        }
        h += `<div style="margin:10px 0;padding:6px 14px;border-left:2px solid ${on ? '#f3c27a' : 'transparent'};background:${on ? 'rgba(243,194,122,.08)' : 'transparent'}">
          <span style="display:inline-block;width:70px;font-family:'Noto Serif CJK SC';font-size:34px;color:${on ? '#fff3dc' : '#bdb6a8'}">${c[0]}</span>
          <span style="display:inline-block;width:140px;font-family:'Crimson Text';font-style:italic;font-size:20px;color:#7f796f">${c[2]}</span>${bar}</div>`;
      });
      h += `</div>`;
      // cursor
      term.innerHTML = h;
      const tk = term.querySelector('#tk'); const r = (after ? term.querySelector('#tka') : tk).getBoundingClientRect();
      let cx = r.right + 8, cy = r.top - 138 + r.height / 2;
      const blink = Math.floor(lt / .53) % 2 === 0 ? 1 : 0;
      let g = 0, rad = 30, gc = [960, 402];
      if (!fin) {
        // the chosen word "光" becomes light: it glows, everything else fades, the light condenses to a point at centre
        const wr = r.left + r.width / 2 - 0, wy = r.top - 138 + r.height / 2;
        const k = sm(9.2, 12.6, lt);
        g = (sm(settle, settle + 1.2, lt) * 0.35 + sm(9.4, 10.6, lt) * 1.05) * (1 - sm(12.4, 13.6, lt) * .55);
        rad = lerp(lerp(22, 46, sm(9.4, 10.4, lt)), 6, k); gc = [lerp(wr, 960, k), lerp(wy, 402, k)];
        if (lt > 9.4) tk.style.opacity = (1 - sm(9.4, 10.4, lt)).toFixed(3);
      }
      const curA = (fin ? (lt < 12.8 ? blink : 1 - sm(12.8, 13.6, lt)) : blink * textFade) * sm(0.4, 0.6, lt);
      if (fin && lt > 11.6) { cx = 960; cy = 402; }
      term.innerHTML += `<div style="position:absolute;left:${(cx - 7).toFixed(1)}px;top:${(cy - 30).toFixed(1)}px;width:14px;height:60px;background:#efe8da;opacity:${curA.toFixed(3)}"></div>`;
      glowMat.uniforms.g.value = g; glowMat.uniforms.r.value = rad; glowMat.uniforms.c.value.set(gc[0], 804 - gc[1]);
      ctx.quad(glowMat, rt);
      return { bloom: 0.9, threshold: 0.35, streak: g * 0.4, streakTint: [1.1, .85, .55], grain: 0.035, vig: 0.6, ca: 0, fadeB: fin ? sm(13.4, 14, lt) : 0 };
    },
  };
}
