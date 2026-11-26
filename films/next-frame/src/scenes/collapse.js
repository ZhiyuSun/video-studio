// S05 — Gravity gathers the dust into a spiral; at its heart, the first star ignites.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { rng, gauss, sm, lerp, camera, addMat } from '../util.js';
import { makeMote } from './web.js';

export const IGNITE = 12.6;

export function create(ctx) {
  const N = 130000, R = rng(11);
  const A = new Float32Array(N * 4), B = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const r0 = 1.5 + Math.pow(R(), 0.7) * 42; const th = R() * Math.PI * 2;
    // two spiral arms + noise
    const arm = (Math.floor(R() * 2) * Math.PI) + Math.log(r0) * 1.9;
    const thA = R() < 0.88 ? arm + gauss(R) * (0.16 + 0.1 * R()) : th;
    A.set([r0, thA, gauss(R) * (0.6 + r0 * 0.22), R()], i * 4); B.set([R(), R()], i * 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute('a', new THREE.BufferAttribute(A, 4)); g.setAttribute('b', new THREE.BufferAttribute(B, 2));
  const U = { t: { value: 0 }, f: { value: 0 }, ign: { value: 0 }, gain: { value: .4 } };
  const mat = addMat(/* glsl */`
    attribute vec4 a; attribute vec2 b; uniform float t, f, ign, gain; varying vec3 vCol; varying float vA;
    void main(){
      float r0=a.x; float fall = f*(0.55+0.45*smoothstep(40.,2.,r0));
      float r = mix(r0, 1.6 + r0*0.34, fall);
      float th = a.y + t*(0.9/(0.25+pow(r/6.,1.35)));
      float y = a.z*(1.-0.85*fall);
      vec3 p = vec3(cos(th)*r, y, sin(th)*r);
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float dist=-mv.z;
      gl_PointSize = clamp(110./dist,1.2,6.)*(0.5+b.x*.8);
      vec3 gas = mix(vec3(.35,.42,.85), vec3(.6,.45,.8), b.y);
      float lit = ign*0.9/(1.+r*r*.08);
      vec3 warm = vec3(1.,.62,.3);
      vCol = (gas*(0.5+0.8/(1.+r*.15))*(1.-ign*.35) + warm*lit) * gain * (0.4+b.x)*1.3;
      vA = smoothstep(.5,3.,dist)*smoothstep(44.,22.,r0)*smoothstep(1.2,5.,r);
    }`, /* glsl */`varying vec3 vCol; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard; gl_FragColor=vec4(vCol*exp(-d*3.)*vA,1.); }`, U);
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false;
  const MU = { size: { value: 50 }, I: { value: 2 }, col: { value: new THREE.Color(1, .78, .42) } };
  const mote = makeMote(MU);
  const scene = new THREE.Scene(); scene.add(pts); scene.add(mote);
  const cam = camera(40);
  const glow = ctx.shader(`uniform float ign, t; uniform vec2 c; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=(vUv-c)*vec2(2.388,1.); float r=length(p); float a=atan(p.y,p.x);
      float rays = pow(fbm3(vec3(cos(a)*6.,sin(a)*6.,t*.3)),2.)*exp(-r*3.)*2.;
      vec3 col = vec3(1.,.8,.6)*ign*(exp(-r*14.)*1.2+exp(-r*4.)*.18+rays*.08) + vec3(.01,.012,.03);
      gl_FragColor=vec4(col,1.); }`, { ign: { value: 0 }, t: { value: 0 }, c: { value: new THREE.Vector2(.5, .5) } });
  const v = new THREE.Vector3();
  return {
    scale: 1, psc: 1.333, mb: 4,
    render(lt, dur, p, rt) {
      const f = sm(0, IGNITE + 0.4, lt);
      const ign = sm(IGNITE - 0.25, IGNITE + 0.2, lt) * (1 + 2.5 * Math.exp(-Math.max(0, lt - IGNITE) * 1.4));
      U.t.value = lt; U.f.value = f; U.ign.value = ign;
      const ang = 0.4 + lt * 0.05;
      let D = lerp(6, 58, sm(0, 7, lt)); D = lerp(D, 34, sm(7, IGNITE, lt)); D = lerp(D, 1.2, Math.pow(sm(15.8, 18, lt), 2));
      const el = lerp(0.8, 0.42, Math.min(1, lt / dur));
      cam.position.set(Math.cos(ang) * D, D * el, Math.sin(ang) * D);
      cam.lookAt(0, 0, 0); cam.rotateZ(0.08);
      MU.size.value = lerp(40, 90, f) + ign * 50; MU.I.value = 2.2 + f * 3 + ign * 4;
      v.set(0, 0, 0).project(cam);
      glow.uniforms.c.value.set(v.x * .5 + .5, v.y * .5 + .5); glow.uniforms.ign.value = ign; glow.uniforms.t.value = lt;
      ctx.quad(glow, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { bloom: 0.75 + ign * 0.4, threshold: 0.8, streak: 0.2 + ign * 0.5, streakTint: [1.0, .75, .5], grain: 0.05, ca: 0.6,
        exposure: (1 - 0.35 * Math.exp(-Math.max(0, lt - IGNITE) * 2) * (lt > IGNITE ? 1 : 0)) * (1 + 3 * sm(16.4, 18, lt)), fadeW: sm(17.2, 18, lt) };
    },
  };
}
