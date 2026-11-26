// S04 — The cosmic web. Filaments of matter; the focus racks onto a single golden mote: our protagonist.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { rng, gauss, sm, lerp, camera, addMat } from '../util.js';

export const MOTE = new THREE.Vector3(5.5, 1.2, 12);

export function buildWeb(seed = 3, N = 150000, box = 110) {
  const R = rng(seed);
  const nodes = [];
  for (let i = 0; i < 120; i++) nodes.push(new THREE.Vector3((R() - .5) * box, (R() - .5) * box * .55, (R() - .5) * box));
  const segs = [];
  nodes.forEach((a, i) => {
    const d = nodes.map((b, j) => [a.distanceTo(b), j]).sort((x, y) => x[0] - y[0]).slice(1, 4);
    d.forEach(([dist, j]) => { if (j > i || dist > 0) segs.push([a, nodes[j], dist]); });
  });
  const A = new Float32Array(N * 4), B = new Float32Array(N * 2);
  const tmp = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    const u = R();
    if (u < 0.22) { // cluster at a node
      const n = nodes[Math.floor(R() * nodes.length)]; const s = 0.6 + R() * 2.2;
      tmp.set(n.x + gauss(R) * s, n.y + gauss(R) * s * .7, n.z + gauss(R) * s);
      A.set([tmp.x, tmp.y, tmp.z, 1.4 + R() * 1.4], i * 4);
    } else if (u < 0.9) { // filament
      const [a, b, dist] = segs[Math.floor(R() * segs.length)]; const k = R();
      const w = (0.35 + 1.4 * Math.sin(k * Math.PI) * 0.5) * (0.7 + dist * .02);
      tmp.lerpVectors(a, b, k); tmp.x += gauss(R) * w; tmp.y += gauss(R) * w; tmp.z += gauss(R) * w;
      A.set([tmp.x, tmp.y, tmp.z, 0.5 + R() * 0.9], i * 4);
    } else { // diffuse void dust
      A.set([(R() - .5) * box, (R() - .5) * box * .55, (R() - .5) * box, 0.12 + R() * .2], i * 4);
    }
    B.set([R(), R()], i * 2);
  }
  return { A, B, N };
}

export function webPoints(W, U) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(W.N * 3), 3));
  g.setAttribute('a', new THREE.BufferAttribute(W.A, 4)); g.setAttribute('b', new THREE.BufferAttribute(W.B, 2));
  const m = addMat(/* glsl */`
    attribute vec4 a; attribute vec2 b; uniform float focus, aperture, t, gain, scale, far; varying vec3 vCol; varying float vA;
    void main(){
      vec3 p=a.xyz*scale; p += vec3(sin(t*.1+b.x*30.), cos(t*.13+b.y*20.), sin(t*.09+b.x*9.))*0.08;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float dist=-mv.z; float base = clamp(180./dist,1.4,6.)*(0.6+b.y*.6);
      float coc = abs(1./focus - 1./dist)*aperture*1400.;
      float s = base + coc; gl_PointSize = min(s, 90.);
      vec3 cold = mix(vec3(.45,.55,1.), vec3(.75,.6,1.), b.x);
      vec3 warm = vec3(1.,.72,.45);
      vCol = mix(cold, warm, smoothstep(1.2,2.5,a.w)*.8) * a.w * gain;
      vA = (base*base)/(s*s) * smoothstep(.5,4.,dist) * smoothstep(far,far*.45,dist);
    }`, /* glsl */`varying vec3 vCol; varying float vA;
    void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard;
      float a = mix(exp(-d*5.), smoothstep(1.,.75,d)*.55+exp(-d*3.)*.2, step(.08, 1.-vA)); // bokeh discs when defocused
      gl_FragColor=vec4(vCol*a*vA,1.); }`, U);
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; return pts;
}

export const MOTE_VERT = /* glsl */`uniform float size, I; uniform vec3 col; varying vec3 vCol; varying float vA;
  void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=size; vCol=col*I; vA=1.; }`;
export const MOTE_FRAG = /* glsl */`varying vec3 vCol; varying float vA;
  void main(){ vec2 c=gl_PointCoord-.5; float d=length(c)*2.; if(d>1.) discard;
   float a = exp(-d*d*40.)*6. + exp(-d*7.)*.8 + exp(-d*2.5)*.15; gl_FragColor=vec4(vCol*a,1.); }`;
export function makeMote(U) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const p = new THREE.Points(g, addMat(MOTE_VERT, MOTE_FRAG, U)); p.frustumCulled = false; return p;
}

export function create(ctx) {
  const W = buildWeb();
  const U = { far: { value: 260 }, focus: { value: 80 }, aperture: { value: 1 }, t: { value: 0 }, gain: { value: 1 }, scale: { value: 1 } };
  const pts = webPoints(W, U);
  const MU = { size: { value: 40 }, I: { value: 1 }, col: { value: new THREE.Color(1., .78, .42) } };
  const mote = makeMote(MU); mote.position.copy(MOTE);
  const scene = new THREE.Scene(); scene.add(pts); scene.add(mote);
  const cam = camera(38);
  const bg = ctx.shader(`uniform float t; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=(vUv-.5)*vec2(2.388,1.); float n=fbm3(vec3(p*1.6,t*.02));
      gl_FragColor=vec4(vec3(.03,.035,.07)*n*n*1.5 + vec3(.012,.01,.02),1.); }`, { t: { value: 0 } });
  const look = new THREE.Vector3();
  return {
    scale: 1, psc: 1.333, mb: 3,
    render(lt, dur, p, rt) {
      if (p.mode === 'pull') {
        const D = 25 * Math.pow(7, p.k);
        cam.position.set(MOTE.x + D * .15, MOTE.y + D * .12, MOTE.z + D); cam.lookAt(MOTE); cam.rotateZ(p.k * .2);
        U.far.value = D + 160; U.focus.value = D; U.aperture.value = 0.25; U.t.value = lt; U.gain.value = 0.34;
        MU.size.value = 40; MU.I.value = 2.5 * (1 - p.k);
        bg.uniforms.t.value = lt; ctx.quad(bg, rt);
        ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
        return { bloom: 0.7, threshold: 0.7, streak: 0.1, grain: 0.05, ca: 0.6 };
      }
      const k = lt / dur;
      const e = k <= 1 ? 1 - Math.pow(1 - k, 1.6) : 1;
      cam.position.set(lerp(-14, 1.5, e), lerp(7, 2.6, e), lerp(78, 26, e));
      // final push: right up to the mote (continues into the next shot)
      const push = sm(11.5, dur + 1.2, lt);
      cam.position.lerp(look.copy(MOTE).add(new THREE.Vector3(0.6, 0.35, 5.0)), push);
      look.copy(MOTE);
      cam.lookAt(look); cam.rotateZ(-0.06 + Math.min(k, 1.1) * 0.05);
      const dMote = cam.position.distanceTo(MOTE);
      const rack = sm(5.2, 8.6, lt);
      U.focus.value = lerp(140, dMote, rack); U.aperture.value = lerp(0.35, 1.6, rack); U.t.value = lt;
      U.gain.value = 0.34;
      MU.size.value = 46 + sm(9, 15, lt) * 16; MU.I.value = (0.6 + rack * 3.2) * (1 + 0.15 * Math.sin(lt * 3.1));
      bg.uniforms.t.value = lt;
      ctx.quad(bg, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { bloom: 0.7, threshold: 0.7, streak: 0.25 * rack, streakTint: [1.1, .8, .5], grain: 0.05, ca: 0.6 };
    },
  };
}
