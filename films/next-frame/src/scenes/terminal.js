// Interface bookends: a child and Opus talk in a terminal. The cursor collapses into the singularity (open)
// and is reborn from the new star (close).
import { CHAT_OPEN, CHAT_CLOSE } from '../shots.js';
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const KID_CPS = 8, AI_CPS = 22;

// visible text of a message at local time lt (with an optional typo that is typed and then deleted)
export function typedText(m, lt) {
  const chars = [...m.zh]; const cps = m.w === 'k' ? KID_CPS : AI_CPS; let x = (lt - m.t) * cps;
  if (x <= 0) return { s: '', done: false, typing: false };
  if (m.typo) {
    const [i, wrong] = m.typo; // type up to i, then the wrong char, pause, delete, continue
    if (x < i) return { s: chars.slice(0, Math.floor(x)).join(''), typing: true };
    const tAfter = x - i; // in chars
    if (tAfter < 1) return { s: chars.slice(0, i).join(''), typing: true };
    if (tAfter < 3.2) return { s: chars.slice(0, i).join('') + wrong, typing: true };
    if (tAfter < 4.2) return { s: chars.slice(0, i).join(''), typing: true };
    x = i + (tAfter - 4.2);
  }
  const n = Math.min(chars.length, Math.floor(x));
  return { s: chars.slice(0, n).join(''), done: n >= chars.length, typing: n < chars.length };
}
export function typedEnd(m) { const cps = m.w === 'k' ? KID_CPS : AI_CPS; return m.t + ([...m.zh].length + (m.typo ? 4.2 : 0)) / cps; }

export function create(ctx) {
  const term = document.getElementById('term');
  const mat = ctx.shader(`
    uniform float glow; uniform vec2 cur; varying vec2 vUv;
    void main(){ vec2 p=vUv*vec2(1920.,804.); float d=length(p-cur);
      vec3 c = vec3(1.,.86,.7)*glow*(0.9*exp(-d*d/(2.*14.*14.)) + 0.25*exp(-d/90.));
      gl_FragColor=vec4(c,1.); }`, { glow: { value: 0 }, cur: { value: new ctx.THREE.Vector2(960, 402) } });

  const L = 470, LINE = 74, BOTTOM = 600;
  function chat(list, lt, fadeAll) {
    const vis = list.filter(m => lt >= m.t);
    let html = `<div style="opacity:${fadeAll.toFixed(3)}">`;
    // scroll: messages stack upward from BOTTOM; smooth by easing each arrival
    let y = BOTTOM, cursorAt = null;
    for (let i = vis.length - 1; i >= 0; i--) {
      const m = vis[i];
      const arrive = sm(m.t, m.t + 0.25, lt);
      const tx = typedText(m, lt);
      const endT = typedEnd(m);
      const subA = sm(endT, endT + 0.5, lt);
      const age = (vis.length - 1 - i);
      const fade = Math.max(0, 1 - Math.max(0, age - 4) * 0.45);
      const top = y - LINE + (1 - arrive) * 18;
      const cls = m.w === 'k' ? 'kidl' : 'ail';
      const who = m.w === 'k' ? '›' : '◆';
      const whoCol = m.w === 'k' ? '#f5c98e' : '#e8a76a';
      html += `<div class="line" style="top:${top.toFixed(1)}px;left:${L}px;opacity:${(arrive * fade).toFixed(3)}">` +
        `<span style="position:absolute;left:-34px;top:6px;color:${whoCol};font-family:'DejaVu Sans Mono';font-size:18px">${who}</span>` +
        `<span class="${cls}" id="m${i}">${esc(tx.s)}</span><br><span class="sub" style="opacity:${subA.toFixed(3)}">${esc(m.en)}</span></div>`;
      if (i === vis.length - 1) cursorAt = i;
      y -= LINE;
    }
    html += `</div>`;
    return { html, cursorAt };
  }

  return {
    scale: 0.5,
    render(lt, dur, p, rt) {
      let glow = 0, fadeB = 0;
      const blink = (Math.floor(lt / 0.53) % 2 === 0) ? 1 : 0.0;
      const list = p.mode === 'open' ? CHAT_OPEN : CHAT_CLOSE;
      const endChat = p.mode === 'open' ? 14.6 : 20.6;
      const fadeTxt = 1 - sm(endChat, endChat + 1.2, lt);
      const c = chat(list, lt, fadeTxt);
      let html = '';
      if (p.mode === 'open') html += `<div class="line dim" style="top:96px;left:${L - 34}px;font-size:16px;opacity:${(sm(0.1, 0.8, lt) * fadeTxt * (1 - sm(11, 12.5, lt))).toFixed(3)}">$ claude --model opus-5.5</div>`;
      term.innerHTML = html + c.html;
      // cursor after the last visible message, or at the input line
      let cx = L, cy = BOTTOM - LINE + 22, typing = false;
      if (c.cursorAt !== null) {
        const el = term.querySelector('#m' + c.cursorAt);
        const m = list.filter(m => lt >= m.t)[c.cursorAt];
        typing = typedText(m, lt).typing;
        const r = el.getBoundingClientRect();
        cx = r.right + 6; cy = r.top - 138 + r.height / 2;
        if (!typing && lt > typedEnd(m) + 0.6) { cx = L; cy = BOTTOM + 22; }
      }
      let w = 13.6, h = 26, alpha = typing ? 1 : blink;
      if (p.mode === 'open') {
        // the gold atom (centre) becomes the cursor and glides to the input line
        if (lt < 1.2) { const g0 = sm(0.15, 1.1, lt); cx = 960 + (cx - 960) * g0; cy = 402 + (cy - 402) * g0; }
        const g = sm(endChat + 0.4, endChat + 2.2, lt);
        cx += (960 - cx) * g; cy += (402 - cy) * g;
        const shrink = sm(endChat + 1.4, endChat + 2.4, lt);
        w = 13.6 * (1 - shrink) + 3 * shrink; h = 26 * (1 - shrink) + 3 * shrink;
        if (lt > endChat + 0.3) alpha = 1;
        alpha *= 1 - sm(endChat + 2.35, endChat + 2.7, lt);
        glow = sm(endChat + 1.6, endChat + 2.6, lt) * 0.55 + (1 - sm(0, 0.9, lt)) * 0.7;
        mat.uniforms.cur.value.set(960, 402);
      } else {
        // reborn from the star: the point grows into the cursor at the input line
        const g = sm(0.1, 1.3, lt);
        if (lt < 1.4) { cx = 960 + (L - 960) * g; cy = 402 + (BOTTOM + 22 - 402) * g; alpha = 1; }
        const grow = sm(0.2, 1.0, lt);
        w = 3 + 10.6 * grow; h = 3 + 23 * grow;
        glow = (1 - sm(0.0, 0.9, lt)) * 1.2;
        mat.uniforms.cur.value.set(960, 402);
        alpha *= fadeTxt;
        const crA = sm(19.2, 20.2, lt) * (1 - sm(22.6, 23.6, lt));
        html = `<div class="line dim" style="top:690px;left:0;right:0;text-align:center;font-size:15px;letter-spacing:.2em;opacity:${crA.toFixed(3)}">每一帧画面、每一个音符，皆由 Claude Opus 5.5 以代码写成<br><span style="font-size:13px;letter-spacing:.28em">EVERY FRAME AND EVERY NOTE WRITTEN IN CODE BY CLAUDE OPUS 5.5</span></div>`;
        term.innerHTML += html;
        fadeB = sm(23.4, 24, lt);
      }
      term.innerHTML += `<div style="position:absolute;left:${(cx - w / 2).toFixed(2)}px;top:${(cy - h / 2).toFixed(2)}px;width:${w.toFixed(2)}px;height:${h.toFixed(2)}px;background:#efe8da;opacity:${alpha.toFixed(3)}"></div>`;
      if (p.mode === 'open') fadeB = 0;
      mat.uniforms.glow.value = glow;
      ctx.quad(mat, rt);
      return { bloom: 0.9, threshold: 0.3, streak: glow * 0.6, grain: 0.035, vig: 0.6, fadeB, ca: 0 };
    },
  };
}
