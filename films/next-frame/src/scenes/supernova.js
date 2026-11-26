// S08 — Supernova. The shock front rushes over the camera; the forged elements are scattered into the dark.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { rng, sm, lerp, camera, addMat } from '../util.js';
import { makeMote } from './web.js';

export function create(ctx) {
  const N = 100000, R = rng(23);
  const A = new Float32Array(N * 4), B = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    let x, y, z, l; do { x = R() * 2 - 1; y = R() * 2 - 1; z = R() * 2 - 1; l = x * x + y * y + z * z; } while (l > 1 || l < 1e-4);
    l = Math.sqrt(l);
    const shell = R() < 0.7;
    const v = shell ? 9 * (0.92 + R() * 0.16) : 9 * Math.pow(R(), 0.5) * 0.9;
    A.set([x / l, y / l, z / l, v], i * 4); B.set([R(), R(), Math.floor(R() * 4)], i * 3);
  }
  const LA = new Float32Array(N * 2 * 4), LB = new Float32Array(N * 2 * 4);
  for (let i = 0; i < N; i++) for (let e = 0; e < 2; e++) { LA.set(A.subarray(i * 4, i * 4 + 4), (i * 2 + e) * 4); LB.set([B[i * 3], B[i * 3 + 1], B[i * 3 + 2], e], (i * 2 + e) * 4); }
  const common = /* glsl */`
    uniform float t, gain, sl; attribute vec4 a; ${NOISE}
    vec3 pal(float k){ if(k<.5) return vec3(.35,.85,1.); if(k<1.5) return vec3(1.,.32,.62); if(k<2.5) return vec3(1.,.72,.32); return vec3(.75,.85,1.); }
    float ex(float t){ return t*(1.-0.035*t); }
    vec3 P(vec4 a, float tt){ vec3 d=a.xyz; float fil = fbm3(d*3.5); return d*a.w*ex(tt)*(0.88+fil*.24); }
    float filB(vec4 a){ return smoothstep(.42,.7,fbm3(a.xyz*3.5+3.)); }`;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 6), 3));
  g.setAttribute('a', new THREE.BufferAttribute(LA, 4)); g.setAttribute('b', new THREE.BufferAttribute(LB, 4));
  const U = { t: { value: 0 }, gain: { value: 1 }, sl: { value: .3 } };
  const lmat = addMat(common + /* glsl */`
    attribute vec4 b; varying vec3 vCol; varying float vA;
    void main(){ float tt = t - b.w*sl*(0.5+b.x);
      vec3 p=P(a,tt); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float hot = exp(-t*.5);
      vCol = mix(pal(b.z), vec3(1.,.95,.9), hot*.7)*gain*(0.2+b.y*.8)*(0.25+filB(a)*1.6)/(1.+0.002*dot(mv.xyz,mv.xyz));
      vA = mix(1.,.0,b.w)*smoothstep(.2,2.5,-mv.z);
    }`, `varying vec3 vCol; varying float vA; void main(){ gl_FragColor=vec4(vCol*vA,1.); }`, U);
  const lines = new THREE.LineSegments(g, lmat); lines.frustumCulled = false;
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  pg.setAttribute('a', new THREE.BufferAttribute(A, 4)); pg.setAttribute('b', new THREE.BufferAttribute(B, 3));
  const pmat = addMat(common + /* glsl */`
    attribute vec3 b; varying vec3 vCol; varying float vA;
    void main(){ vec3 p=P(a,t); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      gl_PointSize=clamp(60./-mv.z,1.,7.)*(0.5+b.x);
      vCol = pal(b.z)*gain*.6*(0.2+b.y)*(0.08+filB(a)*2.6); vA=smoothstep(.3,3.,-mv.z);
    }`, `varying vec3 vCol; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard; gl_FragColor=vec4(vCol*exp(-d*3.)*vA,1.); }`, U);
  const pts = new THREE.Points(pg, pmat); pts.frustumCulled = false;
  const MU = { size: { value: 60 }, I: { value: 4 }, col: { value: new THREE.Color(.75, .88, 1.2) } };
  const mote = makeMote(MU);
  const scene = new THREE.Scene(); scene.add(lines, pts, mote);
  const cam = camera(55);
  const core = ctx.shader(`uniform float t, I; uniform vec2 c; uniform vec3 hm; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=(vUv-c)*vec2(2.388,1.); float r=length(p);
      float a=atan(p.y,p.x); float sh = fbm3(vec3(cos(a)*5.,sin(a)*5.,t*.4));
      vec3 col = vec3(1.,.92,.85)*I*(exp(-r*r*300.)*8. + exp(-r*5.)*.5*(0.6+sh)) + vec3(.6,.75,1.)*I*.25*exp(-r*1.2);
      vec2 pp=(vUv-.5)*vec2(2.388,1.); float rm=length(pp-hm.xy); col += vec3(1.,.8,.5)*hm.z*(exp(-rm*rm*2600.)*5.+exp(-rm*30.)*.5+exp(-rm*8.)*.06);
      gl_FragColor=vec4(col,1.); }`, { t: { value: 0 }, I: { value: 1 }, c: { value: new THREE.Vector2(.5, .5) }, hm: { value: new THREE.Vector3() } });
  const v = new THREE.Vector3(), mp = new THREE.Vector3();
  return {
    scale: 1, psc: 1.15, mb: 5,
    render(lt, dur, p, rt) {
      U.t.value = lt + 0.02; U.gain.value = 2.2 * Math.exp(-lt * 0.25) + 0.5; U.sl.value = 0.35 * Math.exp(-lt * .3) + .03;
      cam.position.set(Math.sin(lt * .1) * 2, 1.5 + lt * .1, 22 - lt * 0.4);
      cam.lookAt(0, 0, 0); cam.rotateZ(0.05 - lt * 0.012);
      // the carbon mote rides the shock toward us, passing just right of frame centre
      mp.set(1.6, 0.6, 0).lerp(new THREE.Vector3(3.2, 0.9, 19), sm(0.2, 4.8, lt) );
      mote.position.copy(mp); MU.I.value = 0;
      v.set(0, 0, 0).project(cam);
      core.uniforms.c.value.set(v.x * .5 + .5, v.y * .5 + .5); core.uniforms.t.value = lt;
      core.uniforms.I.value = 3.5 * Math.exp(-lt * 1.1) + 0.06;
      { const k = sm(0.8, 5.0, lt), cxp = (v.x * .5) * 2.388, cyp = v.y * .5; core.uniforms.hm.value.set(lerp(cxp, -0.30, k), lerp(cyp, -0.06, k), (0.6 + 1.0 * k) * sm(0.3, 1.2, lt)); }
      ctx.quad(core, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { fadeW: 1 - sm(0.02, 1.1, lt), bloom: 0.9, threshold: 0.9, streak: 0.8 * Math.exp(-lt * .4) + 0.1, streakTint: [.6, .8, 1.2], ca: 1.0, grain: 0.05, sat: 1.35,
        exposure: 1.0, fadeB: sm(9.2, 9.6, lt) * 0 };
    },
  };
}
