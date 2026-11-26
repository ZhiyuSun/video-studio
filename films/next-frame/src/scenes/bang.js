// S03 — Genesis. We are inside the first second, everything rushing outward, cooling from blue-white to ember.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { rng, sm, camera, addMat, TEMP_GLSL, SPRITE_FRAG } from '../util.js';
import { makeMote } from './web.js';

export function create(ctx) {
  const N = 110000, R = rng(7);
  const A = new Float32Array(N * 4), S = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    let x, y, z, l; do { x = R() * 2 - 1; y = R() * 2 - 1; z = R() * 2 - 1; l = x * x + y * y + z * z; } while (l > 1 || l < 1e-3);
    l = Math.sqrt(l); // bias toward the view direction (-z) for density on screen
    z = -Math.abs(z) * 1.2 - 0.05; const n = Math.hypot(x, y, z);
    A.set([x / n, y / n, z / n, 0.15 + Math.pow(R(), 0.6) * 3.2], i * 4); S.set([R(), R()], i * 2);
  }
  // lines: duplicate each particle (head/tail)
  const LA = new Float32Array(N * 2 * 4), LS = new Float32Array(N * 2 * 3);
  for (let i = 0; i < N; i++) for (let e = 0; e < 2; e++) {
    LA.set(A.subarray(i * 4, i * 4 + 4), (i * 2 + e) * 4); LS.set([S[i * 2], S[i * 2 + 1], e], (i * 2 + e) * 3);
  }
  const common = /* glsl */`
    uniform float t, T0, clump, streak, bright, lf;
    attribute vec4 a; ${NOISE} ${TEMP_GLSL}
    float gFil;
    float sc(float t){ return 1. + 46.*(1.-exp(-t*0.42)) + t*1.2; }
    vec3 P(vec4 a, float s0, float tt){
      vec3 p = a.xyz*a.w*sc(tt);
      vec3 q = a.xyz*a.w*3.;
      vec3 n = vec3(vnoise(q*1.3+11.), vnoise(q*1.3+37.), vnoise(q*1.3+73.))-.5;
      float fil = fbm3(q*0.9); gFil=fil;               // filament field
      p += n*clump*length(p)*0.55;
      p *= mix(1., .85+fil*.3, clump);
      return p;
    }`;
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
  lineGeo.setAttribute('a', new THREE.BufferAttribute(LA, 4)); lineGeo.setAttribute('s', new THREE.BufferAttribute(LS, 3));
  const lineFade = { value: 1 };
  const U = { lf: lineFade, t: { value: 0 }, T0: { value: 1 }, clump: { value: 0 }, streak: { value: .2 }, bright: { value: 1 } };
  const lineMat = addMat(common + /* glsl */`
    attribute vec3 s; varying vec3 vCol; varying float vA;
    void main(){ float tt = t - s.z*streak*(0.6+s.x*.8);
      vec3 p = P(a, s.x, tt); vec4 mv = modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float T = T0 + (s.y-.5)*.7; vCol = temp(T)*(1.+T*2.)*bright*(0.25+s.x*.75)/(1.+0.0004*dot(mv.xyz,mv.xyz));
      vA = mix(1.,.15,s.z) * smoothstep(0.,1.5,-mv.z) * lf * 1.8;
    }`, `varying vec3 vCol; varying float vA; void main(){ gl_FragColor=vec4(vCol*vA,1.); }`, U);
  const lines = new THREE.LineSegments(lineGeo, lineMat); lines.frustumCulled = false;

  const ptGeo = new THREE.BufferGeometry();
  ptGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  ptGeo.setAttribute('a', new THREE.BufferAttribute(A, 4)); ptGeo.setAttribute('s', new THREE.BufferAttribute(S, 2));
  const UP = Object.assign({ pa: { value: 0 } }, U);
  const ptMat = addMat(common + /* glsl */`
    attribute vec2 s; uniform float pa; varying vec3 vCol; varying float vA;
    void main(){ vec3 p=P(a,s.x,t); vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
      float T = T0 + (s.y-.5)*.35; vCol = temp(T)*(1.+T*1.5)*bright*(0.25+s.x*s.x)*0.9;
      float dn=-mv.z/sc(t); gl_PointSize = clamp(5.5/max(dn,.05)*(0.35+s.x*.9), 1.6, 18.); vA = pa*smoothstep(0.,2.,-mv.z)*mix(1., smoothstep(.47,.62,gFil)*1.8, clump);
    }`, SPRITE_FRAG, UP);
  for (const k in U) UP[k] = U[k];
  const pts = new THREE.Points(ptGeo, ptMat); pts.frustumCulled = false;

  const MU = { size: { value: 40 }, I: { value: 0 }, col: { value: new THREE.Color(1., .78, .42) } };
  const mote = makeMote(MU);
  const fwd = new THREE.Vector3();
  const scene = new THREE.Scene(); scene.add(lines); scene.add(pts); scene.add(mote);
  const cam = camera(62);

  const bg = ctx.shader(/* glsl */`
    uniform float t, T0, I; varying vec2 vUv; ${NOISE} ${TEMP_GLSL}
    void main(){ vec2 p=(vUv-.5)*vec2(2.388,1.); float r=length(p); float a=atan(p.y,p.x);
      float f = fbm4(vec3(cos(a)*3., sin(a)*3., log(r+.02)*2.2 - t*1.6));
      float g = fbm3(vec3(p*4., t*.3));
      float glow = exp(-r*1.6)*(.4+f*1.2) + f*f*.35*exp(-r*.6);
      vec3 hue = mix(vec3(.55,.7,1.3), vec3(1.25,.55,.85), smoothstep(.3,.7,g)); hue = mix(hue, vec3(1.3,.8,.4), smoothstep(.55,.85,f));
      vec3 col = temp(T0+.1)*hue*glow*I*(0.45+g*.9);
      gl_FragColor=vec4(col,1.); }`, { t: { value: 0 }, T0: { value: 1 }, I: { value: 1 } });

  return {
    scale: 0.75, psc: 1, mb: 5,
    render(lt, dur, p, rt) {
      const T0 = 1.0 - Math.pow(Math.min(1, lt / 16), 0.8) * 0.95;
      U.t.value = lt; U.T0.value = T0; U.clump.value = sm(6, 17, lt);
      U.streak.value = 0.5 * Math.exp(-lt * 0.25) + 0.02;
      U.bright.value = 2.2 * Math.exp(-lt * 0.12) + 0.5;
      UP.pa.value = sm(4, 11, lt);
      lineMat.uniforms.t.value = lt;
      lines.visible = lt < 14.5;
      U.streak.value *= 1; lineFade.value = 1 - sm(9, 14.5, lt);
      bg.uniforms.t.value = lt; bg.uniforms.T0.value = T0; bg.uniforms.I.value = 2.0 * Math.exp(-lt * 0.36) + 0.05;
      cam.position.set(Math.sin(lt * .21) * .4, Math.cos(lt * .17) * .25, 2.5 - lt * 0.35);
      cam.rotation.set(0, 0, lt * 0.035); cam.updateMatrixWorld();
      fwd.set(0, 0, -1).applyQuaternion(cam.quaternion); mote.position.copy(cam.position).addScaledVector(fwd, 30);
      MU.I.value = sm(12.5, 16.5, lt) * 2.4; MU.size.value = 34 + sm(12.5, 18, lt) * 10;
      ctx.quad(bg, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { sat: 1.35, fadeW: 1 - sm(0.0, 1.4, lt), bloom: 0.8, threshold: 0.8, streak: 0.35 * Math.exp(-lt * .2), exposure: 1.0, ca: 0.8, grain: 0.05,
        };
    },
  };
}
