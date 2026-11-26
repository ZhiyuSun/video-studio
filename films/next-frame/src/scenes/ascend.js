// S13 — The return. One unbroken pull-back: ripples -> the lit night world -> the galaxy -> the cosmic web.
import * as THREE from 'three';
import { rng, gauss, sm, lerp, camera, addMat } from '../util.js';

function galaxy(ctx) {
  const N = 160000, R = rng(77);
  const A = new Float32Array(N * 3), B = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const bulge = R() < 0.18;
    let x, y, z;
    if (bulge) { const r = Math.abs(gauss(R)) * 1.4; const th = R() * 6.283; const ph = Math.acos(2 * R() - 1); x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph) * .55; z = r * Math.sin(ph) * Math.sin(th); }
    else { const r = 1 + Math.pow(R(), .8) * 16; const arm = Math.floor(R() * 4) * Math.PI / 2; const th = arm + Math.log(r) * 2.4 + gauss(R) * (0.22 + 0.5 / r);
      x = Math.cos(th) * r; z = Math.sin(th) * r; y = gauss(R) * 0.18; }
    A.set([x, y, z], i * 3); B.set([R(), bulge ? 1 : 0], i * 2);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(A, 3)); g.setAttribute('b', new THREE.BufferAttribute(B, 2));
  const U = { gain: { value: 1 } };
  const m = addMat(`attribute vec2 b; uniform float gain; varying vec3 vCol; varying float vA;
    void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; float r=length(position.xz);
      gl_PointSize = clamp(90./-mv.z,1.,4.)*(0.5+b.x*.7);
      vec3 arm = mix(vec3(.55,.7,1.), vec3(.9,.6,1.), b.x*b.x); vec3 core = vec3(1.,.78,.5);
      vCol = mix(arm, core, max(b.y, smoothstep(4.,0.,r)))*gain*(0.3+b.x*.7)*(b.y>.5?1.6:1.); vA=1.; }`,
    `varying vec3 vCol; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard; gl_FragColor=vec4(vCol*exp(-d*3.),1.); }`, U);
  const P = new THREE.Points(g, m); P.frustumCulled = false; P.rotation.set(0.5, 0, 0.25);
  const scene = new THREE.Scene(); scene.add(P);
  const cam = camera(40);
  const bg = ctx.shader(`void main(){ gl_FragColor=vec4(.004,.005,.012,1.); }`);
  return (lt, k, rt) => {
    const D = 6 * Math.pow(14, k);
    cam.position.set(0, D * .3, D); cam.lookAt(0, 0, 0); cam.rotateZ(k * .4);
    P.rotation.y = lt * 0.02; U.gain.value = 0.36;
    ctx.quad(bg, rt);
    ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
    return { bloom: 0.7, threshold: 0.8, streak: 0.12, grain: 0.05, ca: 0.6 };
  };
}

export function create(ctx) {
  const W = 1920 * .75, H = 804 * .75;
  const rtA = ctx.makeRT(W, H), rtB = ctx.makeRT(W, H);
  let gal = null;
  // segments: [start, end, renderer]
  const SEG = [
    { a: 0, b: 7.2, f: async (lt, k, rt) => (await ctx.get('tear')).render(lt, 7.2, { rise: k }, rt) },
    { a: 6.0, b: 13.4, f: async (lt, k, rt) => (await ctx.get('planet')).render(lt, 7.4, { mode: 'pull', k }, rt) },
    { a: 12.2, b: 19.8, f: async (lt, k, rt) => { gal = gal || galaxy(ctx); return gal(lt, k, rt); } },
    { a: 18.6, b: 26.0, f: async (lt, k, rt) => (await ctx.get('web')).render(lt, 7.4, { mode: 'pull', k }, rt) },
  ];
  const SEG4 = [
    { a: 0, b: 10.0, f: async (lt, k, rt) => (await ctx.get('planet')).render(lt, 10, { mode: 'pull', k, close: true }, rt) },
    { a: 8.8, b: 18.0, f: async (lt, k, rt) => { gal = gal || galaxy(ctx); return gal(lt, k, rt); } },
    { a: 16.8, b: 26.0, f: async (lt, k, rt) => (await ctx.get('web')).render(lt, 9.2, { mode: 'pull', k }, rt) },
  ];
  const XF = 1.2;
  return {
    scale: 0.75, mb: 3,
    async renderAsync(lt, dur, p, rt) {
      lt = Math.min(Math.max(lt, 0), dur - 1e-3);
      const L = p.v4 ? SEG4 : SEG;
      const act = L.filter(s => lt >= s.a && lt < s.b);
      if (act.length === 1 || lt >= L[L.length - 1].a + XF) {
        const s = act[act.length - 1];
        return await s.f(lt - s.a, (lt - s.a) / (s.b - s.a), rt);
      }
      const [s0, s1] = act;
      const P0 = await s0.f(lt - s0.a, (lt - s0.a) / (s0.b - s0.a), rtA);
      const P1 = await s1.f(lt - s1.a, (lt - s1.a) / (s1.b - s1.a), rtB);
      const x = sm(s1.a, s0.b, lt);
      ctx.blend(rtA, rtB, x, 1 + x * 0.0, lerp(2.2, 1, sm(s1.a, s0.b + 0.3, lt)), rt);
      const P = {};
      for (const k of new Set([...Object.keys(P0), ...Object.keys(P1)])) {
        const a = P0[k] ?? P1[k], b = P1[k] ?? P0[k];
        P[k] = typeof a === 'number' ? lerp(a, b, x) : (x < .5 ? a : b);
      }
      P.fadeB = 0;
      return P;
    },
    render() { throw new Error('async'); },
  };
}
