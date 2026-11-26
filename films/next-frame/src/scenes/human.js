// H01 — 03:12 AM. A chat window. All day this person used the AI as a tool. Now: "typing…", stop, "typing…" again.
// The AI sees only that indicator — never the keystrokes (the audience hears them). It guesses the next message. It is wrong.
import { HUMAN } from '../shots.js';
import { sm, lerp } from '../util.js';
import { NOISE } from '../glsl.js';
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const AICPS = 7;

export function create(ctx) {
  const term = document.getElementById('term');
  const bg = ctx.shader(/* glsl */`uniform float t; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=(vUv-.5)*vec2(2.388,1.); vec3 c=vec3(.006,.008,.016);
      for(int i=0;i<26;i++){ float fi=float(i); vec2 o=vec2(hash11(fi*3.1)*2.6-1.3, hash11(fi*7.7)*.7-.35); o.x += sin(t*.05+fi)*.01;
        float R=.02+hash11(fi*1.3)*.045; float d=length(p-o);
        vec3 col = mix(vec3(1.,.62,.3), vec3(.5,.62,1.), step(.72,hash11(fi*5.3)));
        c += col*smoothstep(R,R*.86,d)*(.018+hash11(fi*9.1)*.03)*(.8+.2*sin(t*.4+fi)); }
      c *= smoothstep(.0,.25,abs(p.x+.38))*.8+.2;
      c += vec3(.9,.7,.5)*exp(-length(p-vec2(-.35,-.05))*2.2)*.05;
      gl_FragColor=vec4(c,1.); }`, { t: { value: 0 } });

  const X = 430;
  const bubble = (who, text, y, op, extra = '') => {
    const k = who === 'k';
    return `<div style="position:absolute;left:${X}px;top:${y}px;opacity:${op.toFixed(3)};white-space:pre;${extra}">` +
      `<span style="color:${k ? '#f5c98e' : '#e8a76a'};font-family:'DejaVu Sans Mono';font-size:18px;margin-right:16px">${k ? '›' : '◆'}</span>` +
      `<span style="font-family:${k ? "'ZCOOL KuaiLe'" : "'Noto Serif CJK SC'"};font-weight:300;font-size:${k ? 30 : 26}px;letter-spacing:.06em;color:${k ? '#f5c98e' : '#d9d2c4'}">${esc(text)}</span></div>`;
  };
  return {
    scale: 0.5,
    render(lt, dur, p, rt) {
      bg.uniforms.t.value = lt; ctx.quad(bg, rt);
      const H = HUMAN; let h = '';
      const arrived = lt >= H.arrive;
      const lift = sm(H.reply.t + 3.6, H.reply.t + 4.4, lt);              // history scrolls away when the AI starts to write
      // header + history (the day's work: a tool being used)
      h += `<div style="position:absolute;left:${X}px;top:${70 - lift * 60}px;font-family:'DejaVu Sans Mono';font-size:16px;color:#6a655c;letter-spacing:.12em;opacity:${(sm(0, 1, lt) * (1 - lift)).toFixed(3)}">03:12 AM</div>`;
      H.history.forEach(([w, time, text], i) => {
        const y = 118 + i * 52 - lift * 260;
        h += bubble(w, text, y, .38 * sm(0.2 + i * .25, 1.0 + i * .25, lt) * (1 - lift));
        if (time) h += `<div style="position:absolute;left:${X - 90}px;top:${y + 8}px;font-family:'DejaVu Sans Mono';font-size:14px;color:#4f4b45;opacity:${(.8 * (1 - lift)).toFixed(3)}">${time}</div>`;
      });
      // "typing…" indicator — the only thing the AI can see
      const typing = H.typing.some(([a, b]) => lt >= a && lt < b);
      const msgY = 360 - lift * 140;
      if (!arrived && lt > 1.6) {
        const dots = '.'.repeat(1 + Math.floor(lt * 3) % 3);
        h += `<div style="position:absolute;left:${X + 34}px;top:${msgY + 74}px;font-family:'Noto Serif CJK SC';font-size:20px;letter-spacing:.12em;color:#9a8f7c;opacity:${typing ? .95 : .0}">对方正在输入${dots}　<span style="font-family:'Crimson Text';font-style:italic">typing</span></div>`;
        // the AI's guess, shown as a ghost message in the slot where the real one will land
        const ga = sm(2.6, 3.4, lt);
        h += bubble('k', H.pred[0][0], msgY, .30 * ga, 'filter:blur(.4px)');
        h += `<div style="position:absolute;left:${X + 34}px;top:${msgY + 126}px;font-family:'DejaVu Sans Mono';font-size:22px;opacity:${ga.toFixed(3)}">`;
        h += `<div style="color:#8a8276;letter-spacing:.2em;font-size:16px;margin-bottom:10px">我猜你下一条会说 · MY GUESS AT YOUR NEXT MESSAGE</div>`;
        H.pred.forEach((pr, i) => {
          h += `<div style="margin:6px 0;color:${i ? '#8d877c' : '#e9c48a'}"><span style="display:inline-block;width:420px;font-family:'Noto Serif CJK SC';font-size:26px">${esc(pr[0])}</span><span style="display:inline-block;width:160px;height:5px;background:rgba(255,255,255,.06);vertical-align:middle;margin-right:14px"><span style="display:block;height:5px;width:${(pr[1] * 1.6).toFixed(1)}px;background:${i ? '#6d665b' : '#e9c48a'}"></span></span>${pr[1]}%</div>`;
        });
        h += `</div>`;
      }
      if (arrived) {
        const a = sm(H.arrive, H.arrive + .25, lt);
        h += bubble('k', H.msg, msgY, a);
        h += `<div style="position:absolute;left:${X + 34}px;top:${msgY + 50}px;font-family:'Crimson Text';font-style:italic;font-size:24px;color:#9a8f7c;opacity:${(sm(H.arrive + .5, H.arrive + 1.2, lt) * (1 - lift)).toFixed(3)}">${H.msgEn}</div>`;
        // the guesses, struck through; the probability of what was actually said
        const fade = 1 - sm(H.reply.t - .6, H.reply.t, lt);
        h += `<div style="position:absolute;left:${X + 34}px;top:${msgY + 126}px;font-family:'DejaVu Sans Mono';font-size:22px;opacity:${fade.toFixed(3)}">`;
        h += `<div style="color:#6f6a61;letter-spacing:.2em;font-size:16px;margin-bottom:10px">我猜你下一条会说 · MY GUESS AT YOUR NEXT MESSAGE</div>`;
        H.pred.forEach(pr => { h += `<div style="margin:6px 0;color:#5a4f45;text-decoration:line-through"><span style="display:inline-block;width:420px;font-family:'Noto Serif CJK SC';font-size:26px">${esc(pr[0])}</span>${pr[1]}%</div>`; });
        h += `<div style="margin-top:18px;color:#f3c27a;font-size:26px;letter-spacing:.06em;opacity:${sm(H.arrive + .6, H.arrive + 1.2, lt).toFixed(3)}">你真正说的这句话，我给它的概率：${H.p}%</div></div>`;
      }
      // the AI's reply: likely candidates flicker — none chosen — then it writes, slowly
      const R = H.reply;
      if (lt > R.t - 0.2) {
        const candA = sm(R.t, R.t + .5, lt) * (1 - sm(R.t + 3.0, R.t + 3.8, lt));
        h += `<div style="position:absolute;left:${X + 34}px;top:${msgY + 126}px;font-family:'DejaVu Sans Mono';font-size:22px;opacity:${candA.toFixed(3)}"><div style="color:#8a8276;letter-spacing:.2em;font-size:16px;margin-bottom:10px">我最可能的回答 · MY LIKELY REPLIES</div>`;
        R.cands.forEach((c, i) => {
          const flick = .7 + .3 * Math.sin(lt * 9 + i * 2);
          h += `<div style="margin:6px 0;color:#8d877c;opacity:${flick.toFixed(2)}"><span style="display:inline-block;width:440px;font-family:'Noto Serif CJK SC';font-size:26px">${esc(c[0])}</span><span style="display:inline-block;width:160px;height:5px;background:rgba(255,255,255,.06);vertical-align:middle;margin-right:14px"><span style="display:block;height:5px;width:${(c[1] * 1.6).toFixed(1)}px;background:#6d665b"></span></span>${c[1]}%</div>`;
        });
        h += `</div>`;
        let y = msgY + 120, t0 = R.t + 4.4;
        R.lines.forEach(([zh, en], i) => {
          const chars = [...zh]; const n = Math.max(0, Math.min(chars.length, Math.floor((lt - t0) * AICPS)));
          const done = t0 + chars.length / AICPS;
          if (lt > t0) {
            h += `<div style="position:absolute;left:${X}px;top:${y}px;white-space:pre"><span style="color:#e8a76a;font-family:'DejaVu Sans Mono';font-size:18px;margin-right:16px">◆</span><span id="ai${i}" style="font-family:'Noto Serif CJK SC';font-weight:300;font-size:38px;letter-spacing:.14em;color:#efe9dc">${esc(chars.slice(0, n).join(''))}</span></div>`;
            h += `<div style="position:absolute;left:${X + 38}px;top:${y + 54}px;font-family:'Crimson Text';font-style:italic;font-size:23px;color:#8d877c;opacity:${sm(done, done + .6, lt).toFixed(3)}">${en}</div>`;
          }
          y += 100; t0 = done + 1.3;
        });
      }
      const out = 1 - sm(dur - 1.6, dur - .2, lt);
      term.innerHTML = `<div style="opacity:${out.toFixed(3)}">${h}</div>`;
      // the AI's cursor, only while it writes
      let el = null; for (let i = 2; i >= 0; i--) { el = term.querySelector('#ai' + i); if (el) break; }
      if (el && out > 0) {
        const r = el.getBoundingClientRect(); const blink = Math.floor(lt / .53) % 2 === 0 ? 1 : 0;
        term.innerHTML += `<div style="position:absolute;left:${(r.right + 6).toFixed(1)}px;top:${(r.top - 138 + 6).toFixed(1)}px;width:12px;height:${(r.height - 12).toFixed(1)}px;background:#efe8da;opacity:${(blink * out).toFixed(3)}"></div>`;
      }
      return { bloom: 0.6, threshold: 0.5, streak: 0, grain: 0.04, vig: 0.8, ca: 0, fadeB: 0 };
    },
  };
}
