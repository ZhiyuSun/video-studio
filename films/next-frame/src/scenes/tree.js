// S11b — Life branches: a tree of light grows out of the dark, every fork a new kind of being.
import * as THREE from 'three';
import { rng, sm, lerp, camera, addMat } from '../util.js';
import { makeMote } from './web.js';

export function create(ctx) {
  const R = rng(42);
  const pts = []; // x,y,z, birth, depth, seed
  function branch(p, dir, len, depth, t0) {
    const end = p.clone().addScaledVector(dir, len);
    const n = Math.max(8, Math.floor(len * 70));
    const tl = len * 0.9;
    for (let i = 0; i < n; i++) {
      const k = i / n; const q = p.clone().lerp(end, k);
      const w = 0.012 * Math.max(0.3, 6 - depth);
      q.x += (R() - .5) * w; q.y += (R() - .5) * w; q.z += (R() - .5) * w;
      pts.push(q.x, q.y, q.z, t0 + k * tl, depth, R());
    }
    if (depth >= 8) return;
    const kids = depth < 2 ? 3 : 2 + (R() < 0.35 ? 1 : 0);
    for (let c = 0; c < kids; c++) {
      const d = dir.clone();
      const ax = new THREE.Vector3(R() - .5, R() * .3, R() - .5).normalize();
      d.applyAxisAngle(ax, 0.35 + R() * 0.55).normalize();
      d.y = Math.max(d.y, -0.1); d.normalize();
      branch(end, d, len * (0.68 + R() * 0.12), depth + 1, t0 + tl);
    }
  }
  branch(new THREE.Vector3(0, -1.6, 0), new THREE.Vector3(0, 1, 0), 0.75, 0, 0);
  const N = pts.length / 6;
  const A = new Float32Array(N * 3), B = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { A.set(pts.slice(i * 6, i * 6 + 3), i * 3); B.set(pts.slice(i * 6 + 3, i * 6 + 6), i * 3); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(A, 3)); g.setAttribute('b', new THREE.BufferAttribute(B, 3));
  const U = { t: { value: 0 }, speed: { value: 1 } };
  const mat = addMat(/* glsl */`
    attribute vec3 b; uniform float t, speed; varying vec3 vCol; varying float vA;
    void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv;
      float age = t*speed - b.x;
      float on = step(0., age);
      float tip = exp(-max(age,0.)*6.);
      vec3 trunk = vec3(1.,.7,.35), leaf = vec3(.45,1.,.75), bloom = vec3(.7,.6,1.);
      vec3 c = mix(trunk, leaf, smoothstep(2.,6.,b.y)); c = mix(c, bloom, smoothstep(6.5,8.,b.y)*b.z);
      vCol = c*(0.22 + tip*1.4)*(1.1 - b.y*.08);
      gl_PointSize = clamp((7.5 - b.y*.75)*9./-mv.z, 1.2, 12.);
      vA = on;
    }`, /* glsl */`varying vec3 vCol; varying float vA; void main(){ if(vA<.5) discard; vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard; gl_FragColor=vec4(vCol*exp(-d*3.),1.); }`, U);
  const P = new THREE.Points(g, mat); P.frustumCulled = false;
  const MU = { size: { value: 60 }, I: { value: 0 }, col: { value: new THREE.Color(1., .78, .42) } };
  const seed = makeMote(MU); seed.position.set(0, -1.6, 0);
  const scene = new THREE.Scene(); scene.add(P); scene.add(seed);
  const cam = camera(42);
  const bg = ctx.shader(`varying vec2 vUv; void main(){ vec2 p=vUv-.5; gl_FragColor=vec4(vec3(.01,.02,.025)*(1.-length(p)),1.); }`);
  let maxB = 0; for (let i = 3; i < pts.length; i += 6) maxB = Math.max(maxB, pts[i]);
  return {
    scale: 1, psc: 1.333, mb: 2,
    render(lt, dur, p, rt) {
      U.t.value = lt; U.speed.value = (maxB + 0.4) / (dur - 0.8);
      MU.I.value = 1.6 * (1 - sm(0.3, 2.2, lt)) + 0.15;
      const a = 0.5 + lt * 0.08;
      cam.position.set(Math.sin(a) * 4.2, lerp(-0.6, 0.6, lt / dur), Math.cos(a) * 4.2);
      cam.lookAt(0, lerp(-0.8, 0.5, sm(0, dur, lt)), 0);
      ctx.quad(bg, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { bloom: 0.55, threshold: 1.1, streak: 0.2, streakTint: [1, .9, .6], grain: 0.05, ca: 0.6 };
    },
  };
}
