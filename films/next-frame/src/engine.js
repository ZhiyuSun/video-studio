import * as THREE from 'three';
import { SHOTS, CARDS, FPS, ACC, ACC_END, ACC_LABELS } from './shots.js';
import { FSQ_VERT } from './glsl.js';
import { PSC } from './util.js';

const W = 1920, H = 804;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.autoClear = true;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const quadGeo = new THREE.PlaneGeometry(2, 2);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadScene = new THREE.Scene();
const quadMesh = new THREE.Mesh(quadGeo, null);
quadMesh.frustumCulled = false;
quadScene.add(quadMesh);

function makeRT(w, h, opts = {}) {
  return new THREE.WebGLRenderTarget(Math.max(2, Math.round(w)), Math.max(2, Math.round(h)), {
    type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter,
    depthBuffer: opts.depth ?? true, generateMipmaps: false,
  });
}
function quad(mat, rt) {
  quadMesh.material = mat;
  renderer.setRenderTarget(rt ?? null);
  renderer.render(quadScene, quadCam);
}
function shader(frag, uniforms = {}, extra = {}) {
  return new THREE.ShaderMaterial({ vertexShader: FSQ_VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false, ...extra });
}

// ---------------- post ----------------
const rtCache = {};
function hdrTarget(scale) {
  const k = 'hdr' + scale;
  if (!rtCache[k]) rtCache[k] = makeRT(W * scale, H * scale);
  return rtCache[k];
}
const LV = [2, 4, 8, 16, 32, 64];
const down = LV.map(d => makeRT(W / d, H / d, { depth: false }));
const up = LV.map(d => makeRT(W / d, H / d, { depth: false }));
const streakA = makeRT(W / 4, H / 16, { depth: false });
const streakB = makeRT(W / 4, H / 16, { depth: false });

const downMat = shader(`
uniform sampler2D tSrc; uniform vec2 texel; uniform float threshold; uniform float first; varying vec2 vUv;
vec3 s(vec2 o){ return texture2D(tSrc, vUv + o*texel).rgb; }
void main(){
  vec3 a=s(vec2(-2,-2)),b=s(vec2(0,-2)),c=s(vec2(2,-2)),d=s(vec2(-1,-1)),e=s(vec2(1,-1)),f=s(vec2(-2,0)),g=s(vec2(0,0)),
       h=s(vec2(2,0)),i=s(vec2(-1,1)),j=s(vec2(1,1)),k=s(vec2(-2,2)),l=s(vec2(0,2)),m=s(vec2(2,2));
  vec3 col = g*.125 + (d+e+i+j)*.125 + (a+c+k+m)*.03125 + (b+f+h+l)*.0625;
  if(first>.5){ float br=max(col.r,max(col.g,col.b)); col *= max(br-threshold,0.)/max(br,1e-4); col=min(col,vec3(60.)); }
  gl_FragColor=vec4(col,1.);
}`, { tSrc: { value: null }, texel: { value: new THREE.Vector2() }, threshold: { value: 1 }, first: { value: 0 } });
const upMat = shader(`
uniform sampler2D tSrc; uniform sampler2D tAdd; uniform vec2 texel; uniform float r; varying vec2 vUv;
void main(){
  vec2 o=texel*r; vec3 c=vec3(0.);
  c+=texture2D(tSrc,vUv+vec2(-o.x,-o.y)).rgb; c+=texture2D(tSrc,vUv+vec2(0,-o.y)).rgb*2.; c+=texture2D(tSrc,vUv+vec2(o.x,-o.y)).rgb;
  c+=texture2D(tSrc,vUv+vec2(-o.x,0)).rgb*2.; c+=texture2D(tSrc,vUv).rgb*4.; c+=texture2D(tSrc,vUv+vec2(o.x,0)).rgb*2.;
  c+=texture2D(tSrc,vUv+vec2(-o.x,o.y)).rgb; c+=texture2D(tSrc,vUv+vec2(0,o.y)).rgb*2.; c+=texture2D(tSrc,vUv+vec2(o.x,o.y)).rgb;
  gl_FragColor=vec4(c/16. + texture2D(tAdd,vUv).rgb, 1.);
}`, { tSrc: { value: null }, tAdd: { value: null }, texel: { value: new THREE.Vector2() }, r: { value: 1 } });
const streakMat = shader(`
uniform sampler2D tSrc; uniform float spread; uniform vec2 texel; varying vec2 vUv;
void main(){ vec3 c=vec3(0.); float wsum=0.;
  for(int i=-7;i<=7;i++){ float fi=float(i); float w=exp(-fi*fi/18.); c+=texture2D(tSrc,vUv+vec2(fi*spread*texel.x,0.)).rgb*w; wsum+=w; }
  gl_FragColor=vec4(c/wsum,1.); }`, { tSrc: { value: null }, spread: { value: 1 }, texel: { value: new THREE.Vector2() } });

const finalMat = shader(`
uniform sampler2D tHdr, tBloom, tStreak; uniform float exposure, bloomStr, streakStr, ca, vig, grain, frame, fadeB, fadeW, sat, contrast;
uniform vec3 streakTint, lift, gain; varying vec2 vUv;
float h12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
vec3 aces(vec3 x){ const float a=2.51,b=.03,c=2.43,d=.59,e=.14; return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.); }
void main(){
  vec2 uv=vUv; vec2 cc=uv-.5; float r2=dot(cc*vec2(2.39,1.),cc*vec2(2.39,1.));
  vec2 off=cc*ca*0.006*r2;
  vec3 col;
  col.r=texture2D(tHdr,uv-off).r; col.g=texture2D(tHdr,uv).g; col.b=texture2D(tHdr,uv+off).b;
  vec3 bl=texture2D(tBloom,uv).rgb; vec3 st=texture2D(tStreak,uv).rgb;
  col = col + bl*bloomStr + st*streakTint*streakStr;
  col *= exposure;
  col = aces(col*gain);
  col = pow(col, vec3(1./2.2));
  float l=dot(col,vec3(.2126,.7152,.0722)); col=mix(vec3(l),col,sat);
  col = (col-.5)*contrast+.5; col = col + lift*(1.-col);
  col *= mix(1., smoothstep(1.25, .15, r2*.55), vig);
  float g=h12(gl_FragCoord.xy+frame*vec2(17.3,41.1))-.5; float g2=h12(gl_FragCoord.xy*.5+frame*vec2(3.7,9.1))-.5;
  col += (g*.7+g2*.5)*grain*(0.35+0.65*(1.-l));
  col = mix(col, vec3(0.), fadeB); col = mix(col, vec3(1.), fadeW);
  gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`, {
  tHdr: { value: null }, tBloom: { value: null }, tStreak: { value: null }, exposure: { value: 1 }, bloomStr: { value: .6 }, streakStr: { value: 0 },
  ca: { value: 1 }, vig: { value: .8 }, grain: { value: .05 }, frame: { value: 0 }, fadeB: { value: 0 }, fadeW: { value: 0 }, sat: { value: 1 },
  contrast: { value: 1.04 }, streakTint: { value: new THREE.Vector3(.55, .75, 1.2) }, lift: { value: new THREE.Vector3(0, 0, 0) }, gain: { value: new THREE.Vector3(1, 1, 1) },
});

const DEF_POST = { exposure: 1, bloom: .55, threshold: 1.0, streak: 0, ca: 1, vig: .85, grain: .045, fadeB: 0, fadeW: 0, sat: 1, contrast: 1.04,
  streakTint: [.55, .75, 1.2], lift: [0, 0, 0], gain: [1, 1, 1] };

function post(src, P, frame) {
  // bloom chain
  let prev = src;
  for (let i = 0; i < down.length; i++) {
    downMat.uniforms.tSrc.value = prev.texture;
    downMat.uniforms.texel.value.set(1 / prev.width, 1 / prev.height);
    downMat.uniforms.first.value = i === 0 ? 1 : 0;
    downMat.uniforms.threshold.value = P.threshold;
    quad(downMat, down[i]); prev = down[i];
  }
  // upsample
  let acc = down[down.length - 1];
  for (let i = down.length - 2; i >= 0; i--) {
    upMat.uniforms.tSrc.value = acc.texture; upMat.uniforms.tAdd.value = down[i].texture;
    upMat.uniforms.texel.value.set(1 / acc.width, 1 / acc.height); upMat.uniforms.r.value = 1;
    quad(upMat, up[i]); acc = up[i];
  }
  // anamorphic streak from level 1 (1/4)
  if (P.streak > 0) {
    let s = down[1], a = streakA, b = streakB;
    const spreads = [1, 3, 9, 27];
    for (let k = 0; k < spreads.length; k++) {
      streakMat.uniforms.tSrc.value = s.texture; streakMat.uniforms.spread.value = spreads[k];
      streakMat.uniforms.texel.value.set(1 / streakA.width, 1 / streakA.height);
      const dst = (k % 2 === 0) ? a : b; quad(streakMat, dst); s = dst;
    }
    finalMat.uniforms.tStreak.value = s.texture;
  } else finalMat.uniforms.tStreak.value = down[5].texture;
  const u = finalMat.uniforms;
  u.tHdr.value = src.texture; u.tBloom.value = up[0].texture;
  u.exposure.value = P.exposure; u.bloomStr.value = P.bloom; u.streakStr.value = P.streak; u.ca.value = P.ca; u.vig.value = P.vig;
  u.grain.value = P.grain; u.frame.value = frame; u.fadeB.value = P.fadeB; u.fadeW.value = P.fadeW; u.sat.value = P.sat; u.contrast.value = P.contrast;
  u.streakTint.value.set(...P.streakTint); u.lift.value.set(...P.lift); u.gain.value.set(...P.gain);
  quad(finalMat, null);
}

// ---------------- scenes ----------------
const blendMat = shader(`
uniform sampler2D tA,tB; uniform float k, zA, zB; varying vec2 vUv;
vec3 zs(sampler2D t, vec2 uv, float z){ vec2 c=(uv-.5)/z+.5; return texture2D(t,c).rgb; }
void main(){ gl_FragColor=vec4(mix(zs(tA,vUv,zA), zs(tB,vUv,zB), k),1.); }`,
  { tA: { value: null }, tB: { value: null }, k: { value: 0 }, zA: { value: 1 }, zB: { value: 1 } });

export const ctx = {
  THREE, renderer, W, H, quad, shader, makeRT, FPS,
  blend(a, b, k, zA, zB, out) { const u = blendMat.uniforms; u.tA.value = a.texture; u.tB.value = b.texture; u.k.value = k; u.zA.value = zA; u.zB.value = zB; quad(blendMat, out); },
  scenes: {},
  async get(name) {
    if (!this.scenes[name]) { const m = await import(`./scenes/${name}.js`); this.scenes[name] = m.create(this); }
    return this.scenes[name];
  },
};

// ---------------- titles ----------------
const cardsEl = document.getElementById('cards');
const cardEls = CARDS.map(c => {
  const d = document.createElement('div');
  d.className = 'card s-' + c.style + (c.slot !== undefined ? ' slot' + c.slot : '');
  if (c.style === 'probs') {
    d.style.cssText += ';bottom:70px;left:0;right:0';
    d.innerHTML = c.items.map(([zh, en, p], i) => `<div class="pi" style="opacity:0;margin:12px 0;white-space:nowrap"><span style="display:inline-block;width:520px;text-align:right;font-family:'Noto Serif CJK SC';font-weight:300;font-size:36px;letter-spacing:.2em;color:#f3efe6;text-shadow:0 0 6px rgba(0,0,0,.9),0 0 22px rgba(0,0,0,.85)">${zh}</span><span style="display:inline-block;width:150px;margin-left:34px;text-align:left;font-family:'DejaVu Sans Mono';font-size:26px;color:#f3c27a;text-shadow:0 0 10px rgba(0,0,0,.9)">${p.toFixed(1)}%</span><span style="display:inline-block;width:360px;text-align:left;font-family:'Crimson Text';font-style:italic;font-size:22px;color:#a39a8a;text-shadow:0 0 8px #000">${en}</span></div>`).join('');
  } else d.innerHTML = `<div class="zh">${c.zh}</div><div class="en">${c.en}</div>`;
  d.style.opacity = 0; cardsEl.appendChild(d); return d;
});
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function updateCards(t) {
  CARDS.forEach((c, i) => {
    const el = cardEls[i];
    const fi = c.style === 'title' ? 2.2 : (c.style === 'center' ? 0.35 : c.style === 'kid' ? 0.12 : c.style === 'ai' ? 0.7 : 1.1);
    const fo = c.style === 'title' ? 1.6 : (c.style === 'center' ? 0.3 : 1.0);
    const a = sm(c.t0, c.t0 + fi, t) * (1 - sm(c.t1 - fo, c.t1, t));
    el.style.opacity = a.toFixed(4);
    if (a > 0) {
      const p = (t - c.t0) / (c.t1 - c.t0);
      const blur = (1 - sm(c.t0, c.t0 + fi, t)) * 8 + sm(c.t1 - fo, c.t1, t) * 6;
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      const zh = el.children[0], en = el.children[1];
      if (c.style === 'title') {
        zh.style.letterSpacing = (0.32 + p * 0.12).toFixed(4) + 'em'; zh.style.textIndent = (0.32 + p * 0.12).toFixed(4) + 'em';
        en.style.letterSpacing = (0.9 + p * 0.3).toFixed(4) + 'em';
      } else if (c.style === 'credit' || c.style === 'date') {
        en.style.letterSpacing = ((c.style === 'credit' ? .5 : .6) + p * .2).toFixed(4) + 'em';
      }
      if (c.style === 'probs') { [...el.children].forEach((ch, j) => { ch.style.opacity = sm(c.t0 + j * 1.4, c.t0 + j * 1.4 + .6, t).toFixed(3); }); }
      if (c.style === 'kid') {
        const chars = [...c.zh]; const n = Math.min(chars.length, Math.floor((t - c.t0) * 7.5) + 1);
        zh.textContent = chars.slice(0, n).join('');
        const done = c.t0 + chars.length / 7.5;
        en.style.opacity = (0.7 * sm(done, done + 0.5, t)).toFixed(3);
        el.style.filter = (1 - sm(c.t1 - fo, c.t1, t)) < 1 ? el.style.filter : 'none';
      }
      el.style.display = 'block';
    } else el.style.display = 'none';
  });
}

// ---------------- prediction ghost ----------------
const ghostMat = shader(`
uniform sampler2D tR, tG; uniform float a, d, time; uniform vec2 texel; varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n2(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
vec3 realC(vec2 uv){ return texture2D(tR,uv).rgb; }
vec3 S(sampler2D t, vec2 uv){ vec3 c=texture2D(t,uv).rgb; if(!(c.r==c.r && c.g==c.g && c.b==c.b)) return vec3(0.); return clamp(c, 0., 40.); }
float L(vec2 uv){ vec3 c=S(tG,uv); return log(1.+dot(c,vec3(.3,.5,.2))*2.); }
void main(){
  vec2 uv=vUv; vec3 real = S(tR,uv);
  float th = time*.11 + 1.3;
  vec2 off = d*vec2(cos(th)*.034, sin(th*1.3)*.05);
  vec2 gu = (uv-.5-off)*(1.-d*.035)+.5;
  vec2 o=texel*1.5;
  float gx = L(gu+vec2(o.x,0.))-L(gu-vec2(o.x,0.)), gy = L(gu+vec2(0.,o.y))-L(gu-vec2(0.,o.y));
  float edge = smoothstep(.05,.35,length(vec2(gx,gy)));
  float lum = L(gu);
  float scan = .85+.15*sin(vUv.y*804.*1.3);
  vec3 ghost = vec3(1.,.74,.38)*(edge*2.2 + lum*.06)*scan;
  float inside = smoothstep(0.,.02,gu.x)*smoothstep(1.,.98,gu.x)*smoothstep(0.,.03,gu.y)*smoothstep(1.,.97,gu.y);
  ghost *= inside;
  real *= 1. - a*.35;
  gl_FragColor = vec4(real + ghost*a, 1.);
}`, { tR: { value: null }, tG: { value: null }, a: { value: 0 }, d: { value: 0 }, time: { value: 0 }, texel: { value: new THREE.Vector2() } });
function ghostAt(shot, lt) {
  const k = shot.gh; if (!k) return null;
  if (lt <= k[0][0]) return [k[0][1], k[0][2]];
  for (let i = 1; i < k.length; i++) if (lt <= k[i][0]) { const u = (lt - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return [k[i - 1][1] + (k[i][1] - k[i - 1][1]) * u, k[i - 1][2] + (k[i][2] - k[i - 1][2]) * u]; }
  return [k[k.length - 1][1], k[k.length - 1][2]];
}
const hud = document.createElement('div');
hud.style.cssText = "position:absolute;right:64px;top:44px;text-align:right;font-family:'DejaVu Sans Mono',monospace;color:#e9c48a;opacity:0";
hud.innerHTML = `<div id="hudl" style="font-family:'Noto Serif CJK SC',serif;font-size:21px;letter-spacing:.16em;color:#d8c8a8;text-shadow:0 0 8px #000"></div><div id="hudv" style="font-size:46px;letter-spacing:.04em;margin-top:4px;text-shadow:0 0 14px rgba(240,180,100,.35),0 0 6px #000">100.000%</div><div style="margin-top:8px;height:3px;width:360px;margin-left:auto;background:rgba(233,196,138,.18)"><div id="hudb" style="height:3px;background:#e9c48a;width:100%"></div></div><div id="huds" style="margin-top:10px;font-family:'Noto Serif CJK SC',serif;font-size:15px;letter-spacing:.06em;color:#a89a80;text-shadow:0 0 6px #000"></div><div id="hudg" style="margin-top:8px;font-family:'Noto Serif CJK SC',serif;font-size:16px;letter-spacing:.1em;color:#d9b67e;text-shadow:0 0 6px #000"><span style="display:inline-block;width:22px;height:0;border-top:2px solid #e9c48a;vertical-align:middle;margin-right:10px"></span>金色线条 = 我的预测</div>`;
document.getElementById('ui').appendChild(hud);
function updateHUD(t) {
  if (!ACC.length || t < ACC[0][0] - 1 || t > ACC_END + 1) { hud.style.opacity = 0; return; }
  let v = ACC[0][1];
  for (let i = 1; i < ACC.length; i++) { if (t <= ACC[i][0]) { const u = Math.max(0, (t - ACC[i - 1][0]) / (ACC[i][0] - ACC[i - 1][0])); v = ACC[i - 1][1] + (ACC[i][1] - ACC[i - 1][1]) * u; break; } v = ACC[i][1]; }
  // flicker of the last digits, as if being recomputed
  const jit = (v < 99.99 && v > 0.5) ? (Math.sin(t * 37.1) * .004 + Math.sin(t * 91.7) * .003) * Math.min(100 - v, v) : 0;
  const a = sm(ACC[0][0] - 1, ACC[0][0] + .5, t) * (1 - sm(ACC_END - .4, ACC_END + .6, t));
  hud.style.opacity = a.toFixed(3);
  let L = ACC_LABELS[0]; for (const x of ACC_LABELS) if (t >= x[0]) L = x;
  document.getElementById('hudl').textContent = L[1]; document.getElementById('huds').textContent = L[2];
  document.getElementById('hudg').style.display = L === ACC_LABELS[0] ? 'block' : 'none';
  document.getElementById('hudv').textContent = Math.max(0, v + jit).toFixed(3) + '%';
  document.getElementById('hudb').style.width = Math.max(0, v + jit).toFixed(2) + '%';
}

// ---------------- frame ----------------
const termEl = document.getElementById('term');
const accMat = new THREE.ShaderMaterial({ vertexShader: FSQ_VERT, fragmentShader: `uniform sampler2D tSrc; uniform float w; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tSrc,vUv).rgb*w,1.); }`,
  uniforms: { tSrc: { value: null }, w: { value: 1 } }, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true });
function namedRT(name, scale) { const k = name + scale; if (!rtCache[k]) rtCache[k] = makeRT(W * scale, H * scale); return rtCache[k]; }
export let MB_ENABLED = true, MB_SHUTTER = 0.5;
async function renderShot(shot, t, out, tag) {
  const sc = await ctx.get(shot.scene);
  const lt = t - shot.start, dur = shot.end - shot.start;
  const n = MB_ENABLED ? (sc.mb ?? 1) : 1;
  PSC.value = sc.psc ?? 1;
  const call = async (tt, rt) => sc.renderAsync ? await sc.renderAsync(tt, dur, shot.p, rt, shot.start + tt) : sc.render(tt, dur, shot.p, rt, shot.start + tt);
  if (n <= 1) return await call(lt, out);
  const tmp = namedRT('mbtmp' + tag, out.width / W);
  renderer.setRenderTarget(out); renderer.setClearColor(0x000000, 1); renderer.clear();
  let P = null;
  for (let k = 0; k < n; k++) {
    const dt = ((k + 0.5) / n - 0.5) * MB_SHUTTER / FPS;
    const R = await call(lt + dt, tmp);
    if (k === (n >> 1)) P = R;
    accMat.uniforms.tSrc.value = tmp.texture; accMat.uniforms.w.value = 1 / n;
    renderer.autoClear = false; quad(accMat, out); renderer.autoClear = true;
  }
  return P;
}
function scaleOf(sc, p) { return typeof sc.scale === 'function' ? sc.scale(p) : (sc.scale ?? 1); }
window.renderAt = async function (t) {
  const frame = Math.round(t * FPS);
  const idx = Math.max(0, SHOTS.findIndex(s => t >= s.start && t < s.end));
  const shot = SHOTS[idx < 0 ? SHOTS.length - 1 : idx];
  const sc = await ctx.get(shot.scene);
  termEl.innerHTML = '';
  const lt = t - shot.start, dur = shot.end - shot.start;
  let P, rt;
  const prev = SHOTS[idx - 1];
  if (shot.x && prev && lt < shot.x.d) {
    const psc = await ctx.get(prev.scene);
    const sa = scaleOf(psc, prev.p), sb = scaleOf(sc, shot.p), so = Math.max(sa, sb);
    const rA = namedRT('xA', sa), rB = namedRT('xB', sb); rt = namedRT('xO', so);
    const PA = await renderShot(prev, t, rA, 'A');
    const PB = await renderShot(shot, t, rB, 'B');
    const k = sm(0, shot.x.d, lt);
    ctx.blend(rA, rB, k, 1, 1, rt);
    P = Object.assign({}, DEF_POST);
    const A = Object.assign({}, DEF_POST, PA || {}), B = Object.assign({}, DEF_POST, PB || {});
    for (const key in DEF_POST) {
      const a = A[key], b = B[key];
      P[key] = Array.isArray(a) ? a.map((v, i) => v + (b[i] - v) * k) : a + (b - a) * k;
    }
  } else {
    rt = hdrTarget(scaleOf(sc, shot.p));
    P = Object.assign({}, DEF_POST, (await renderShot(shot, t, rt, 'M')) || {});
  }
  if (shot.scene === 'ascend') { P.fadeB = Math.max(P.fadeB || 0, sm(dur - 0.8, dur, lt)); }
  const g = ghostAt(shot, lt);
  if (g && g[0] > 0.001 && !window.NOGHOST) {
    const sc2 = await ctx.get(shot.scene); const s2 = rt.width / W;
    const rG = namedRT('ghost', s2), rO = namedRT('ghostO', s2);
    const keepMB = MB_ENABLED; MB_ENABLED = false;
    const savedTerm = termEl.innerHTML;
    await renderShot(shot, t + 0.45, rG, 'G');
    termEl.innerHTML = savedTerm;
    MB_ENABLED = keepMB;
    const u = ghostMat.uniforms; u.tR.value = rt.texture; u.tG.value = rG.texture; u.a.value = g[0]; u.d.value = g[1]; u.time.value = t; u.texel.value.set(1 / rG.width, 1 / rG.height);
    quad(ghostMat, rO); rt = rO;
  }
  post(rt, P, frame);
  updateCards(t);
  updateHUD(t);
  renderer.getContext().finish();
  return frame;
};
window.setMB = (on) => { MB_ENABLED = on; };
window.engineReady = true;
