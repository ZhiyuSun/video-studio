// S00 — Cold open. A pencil writes in the lamplight. We push into the graphite: layers of carbon, and one atom glows gold.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { sm, lerp, camera, addMat, rng } from '../util.js';

export function create(ctx) {
  // ---------- A: macro pencil on paper ----------
  // the question mark: polyline in paper coords (x right, z down-screen)
  const QP = [];
  for (let i = 0; i <= 28; i++) { const a = Math.PI * 1.05 - i / 28 * Math.PI * 1.45; QP.push([0.034 * Math.cos(a), -0.03 - 0.034 * Math.sin(a)]); }
  const last = QP[QP.length - 1];
  for (let i = 1; i <= 10; i++) { const k = i / 10; QP.push([last[0] + (0.002 - last[0]) * k, last[1] + (0.022 - last[1]) * k * k * .3 + (0.022 - last[1]) * k * .7]); }
  const NQ = QP.length;
  const matA = ctx.shader(/* glsl */`
    uniform float t, prog, dotA; uniform vec3 ro; uniform vec2 tip; uniform mat3 camM; uniform vec2 Q[${NQ}]; varying vec2 vUv; ${NOISE}
    vec3 lamp = normalize(vec3(-0.75, 0.55, -0.35));
    float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 rd = normalize(camM*vec3(p*.5, -1.));
      float tp = -ro.y/rd.y; vec3 pp = ro+rd*tp; vec2 w2 = pp.xz;
      // paper tooth: raking light over fibres
      float h0 = fbm2(w2*vec2(1400.,520.))*.6 + fbm2(w2*3000.)*.4;
      float e=.0004; float hx = fbm2((w2+vec2(e,0.))*vec2(1400.,520.))*.6 + fbm2((w2+vec2(e,0.))*3000.)*.4;
      float hz = fbm2((w2+vec2(0.,e))*vec2(1400.,520.))*.6 + fbm2((w2+vec2(0.,e))*3000.)*.4;
      vec3 n = normalize(vec3(-(hx-h0)/e*.0006, 1., -(hz-h0)/e*.0006));
      float dif = max(dot(n,lamp),0.);
      vec3 paper = vec3(.80,.75,.66)*(.9+h0*.15);
      // stroke drawn so far
      float d = 1e3; float total = float(${NQ - 1});
      for(int i=0;i<${NQ - 1};i++){ float fi=float(i); if(fi < prog*total){ vec2 a=Q[i], b=Q[i+1]; float k=clamp(prog*total-fi,0.,1.); d=min(d, sdSeg(w2,a,mix(a,b,k))); } }
      float wid = .0021;
      float gr = smoothstep(wid, wid*.55, d) * (0.55 + 0.45*step(.42, vnoise2(w2*vec2(3200.,2600.)))) * (0.75+0.25*h0);
      // the dot of the question mark
      float dd = length(w2 - vec2(0.002, 0.034));
      gr = max(gr, dotA*smoothstep(.0042,.0028,dd)*(0.88+0.12*vnoise2(w2*9000.)));
      vec3 spec = vec3(.5,.52,.56)*pow(max(dot(reflect(rd,n),lamp),0.),24.)*gr;
      vec3 col = mix(paper*(.25+dif*.95), vec3(.07,.07,.08)*(.4+dif*.6)+spec, gr);
      // lamp pool and the soft shadow of a pencil we never quite see
      col *= .35 + .9*exp(-dot(w2-vec2(-.02,-.03),w2-vec2(-.02,-.03))*90.);
      vec2 sd = w2 - tip; vec2 sdir = normalize(vec2(.8,.45));
      float along = dot(sd, sdir); float perp = abs(dot(sd, vec2(-sdir.y, sdir.x)));
      float shw = smoothstep(.0, .02, along) * (1. - smoothstep(.004+along*.12, .012+along*.3, perp));
      col *= 1. - .45*shw;
      col *= vec3(1.05,.96,.84);
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, prog: { value: 0 }, dotA: { value: 0 }, ro: { value: new THREE.Vector3() }, tip: { value: new THREE.Vector2() },
        camM: { value: new THREE.Matrix3() }, Q: { value: QP.map(q => new THREE.Vector2(q[0], q[1])) } });
  const camA = new THREE.PerspectiveCamera(40, 1920 / 804, .001, 10);
  
  // ---------- B: inside the graphite ----------
  const R = rng(9), pts = [], bonds = [];
  const a = 0.142, layers = 6, NX = 26, NZ = 26;
  for (let L = 0; L < layers; L++) {
    const y = -L * 0.335, off = (L % 2) * a;
    for (let i = -NX; i < NX; i++) for (let j = -NZ; j < NZ; j++) {
      // honeycomb: two atoms per cell
      const cx = i * a * 1.5 + off, cz = j * a * Math.sqrt(3) + (i % 2 ? a * Math.sqrt(3) / 2 : 0);
      const A1 = [cx, y, cz], A2 = [cx + a, y, cz];
      pts.push(...A1, L, R(), ...A2, L, R());
      bonds.push(...A1, ...A2);
      bonds.push(...A2, cx + 1.5 * a, y, cz + a * Math.sqrt(3) / 2, ...A2, cx + 1.5 * a, y, cz - a * Math.sqrt(3) / 2);
    }
  }
  const NP = pts.length / 5;
  const P = new Float32Array(NP * 3), Bt = new Float32Array(NP * 2);
  for (let i = 0; i < NP; i++) { P.set(pts.slice(i * 5, i * 5 + 3), i * 3); Bt.set(pts.slice(i * 5 + 3, i * 5 + 5), i * 2); }
  const gP = new THREE.BufferGeometry(); gP.setAttribute('position', new THREE.BufferAttribute(P, 3)); gP.setAttribute('b', new THREE.BufferAttribute(Bt, 2));
  const UB = { t: { value: 0 }, focus: { value: 2 }, gain: { value: 1 } };
  const atoms = new THREE.Points(gP, addMat(/* glsl */`
    attribute vec2 b; uniform float t, focus, gain; varying vec3 vCol; varying float vA;
    void main(){ vec3 p=position; p += vec3(sin(t*3.+b.y*40.),cos(t*2.7+b.y*30.),sin(t*3.3+b.y*20.))*.004;
      vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv; float dist=-mv.z;
      float base=clamp(26./dist,1.5,22.); float coc=abs(1./focus-1./dist)*600.; float s=base+coc; gl_PointSize=min(s,80.);
      vCol = mix(vec3(.55,.62,.8), vec3(.75,.78,.9), b.y)*gain*(1.-b.x*.12); vA=(base*base)/(s*s)*smoothstep(.05,.3,dist);
    }`, `varying vec3 vCol; varying float vA; void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard; gl_FragColor=vec4(vCol*vA*(exp(-d*4.)*.9+exp(-d*20.)*.6),1.); }`, UB));
  atoms.frustumCulled = false;
  const gB = new THREE.BufferGeometry(); gB.setAttribute('position', new THREE.BufferAttribute(new Float32Array(bonds), 3));
  const bondMat = new THREE.LineBasicMaterial({ color: new THREE.Color(.10, .12, .17), blending: THREE.AdditiveBlending, transparent: true, depthTest: false });
  const bondL = new THREE.LineSegments(gB, bondMat); bondL.frustumCulled = false;
  const MU = { size: { value: 40 }, I: { value: 0 }, col: { value: new THREE.Color(1, .78, .42) } };
  const mote = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array([a, 0, 0]), 3)),
    addMat(`uniform float size, I; uniform vec3 col; varying vec3 vCol; void main(){ vec4 mv=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*mv; gl_PointSize=size; vCol=col*I; }`,
      `varying vec3 vCol; void main(){ vec2 c=gl_PointCoord-.5; float d=length(c)*2.; if(d>1.) discard; gl_FragColor=vec4(vCol*(exp(-d*d*40.)*6.+exp(-d*7.)*.8+exp(-d*2.5)*.15),1.); }`, MU));
  mote.frustumCulled = false;
  const sceneB = new THREE.Scene(); sceneB.add(bondL, atoms, mote);
  const camB = camera(45, .01, 100);
  const bgB = ctx.shader(`varying vec2 vUv; void main(){ vec2 p=vUv-.5; gl_FragColor=vec4(vec3(.012,.013,.02)*(1.-length(p)*.8),1.); }`);

  const rtA = ctx.makeRT(1920 * .6, 804 * .6), rtB = ctx.makeRT(1920 * .6, 804 * .6);
  const look = new THREE.Vector3();

  function renderA(lt, rt) {
    const u = matA.uniforms; u.t.value = lt;
    const prog = sm(0.8, 4.6, lt); u.prog.value = prog;
    const dotA = sm(5.0, 5.15, lt); u.dotA.value = dotA;
    // tip position: along the stroke, then lifts to tap the dot
    const fi = prog * (NQ - 1), i = Math.min(NQ - 2, Math.floor(fi)), k = fi - i;
    let tx = QP[i][0] + (QP[i + 1][0] - QP[i][0]) * k, tz = QP[i][1] + (QP[i + 1][1] - QP[i][1]) * k;
    const toDot = sm(4.6, 5.0, lt); tx = lerp(tx, 0.002, toDot); tz = lerp(tz, 0.034, toDot);
    const away = sm(5.3, 6.0, lt); tx += away * 0.05; tz -= away * 0.03;
    u.tip.value.set(tx, tz);
    // camera: looks down at the page, slowly pushes toward the dot
    const c = sm(5.0, 7.6, lt), drift = lt * 0.004;
    camA.position.set(lerp(0.02 - drift, 0.002, c), lerp(0.17, 0.006, c), lerp(0.13, 0.0345, c));
    const tg = sm(4.4, 5.6, lt); camA.lookAt(lerp(0, 0.002, tg), 0, lerp(0.0, 0.034, tg)); camA.updateMatrixWorld();
    u.ro.value.copy(camA.position); u.camM.value.setFromMatrix4(camA.matrixWorld);
    ctx.quad(matA, rt);
  }
  function renderB(lb, rt) {
    UB.t.value = lb;
    const k = sm(0, 3.6, lb);
    camB.position.set(lerp(1.8, 0.55, k), lerp(1.6, 0.42, k), lerp(4.5, 1.05, k));
    look.set(a, 0, 0); camB.lookAt(look); camB.rotateZ(0.15 - lb * 0.03);
    UB.focus.value = camB.position.distanceTo(look); bondMat.color.setRGB(.10, .12, .17).multiplyScalar(sm(0.3, 1.5, lb) * (1 - sm(2.2, 3.4, lb))); UB.gain.value = 0.9 * sm(0.5, 1.8, lb) * (1 - sm(2.2, 3.4, lb));
    MU.I.value = sm(1.0, 2.0, lb) * (1.6 + 0.25 * Math.sin(lb * 4)) * (1 - 0.4 * sm(2.6, 3.6, lb)); MU.size.value = 26 + sm(1, 2.2, lb) * 24 - sm(2.6, 3.6, lb) * 30;
    ctx.quad(bgB, rt);
    ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(sceneB, camB); ctx.renderer.autoClear = true;
  }
  return {
    scale: 0.6, mb: 2,
    render(lt, dur, p, rt) {
      const X0 = 6.4, X1 = 7.6;
      if (lt < X0) renderA(lt, rt);
      else if (lt >= X1) renderB(lt - X0, rt);
      else {
        renderA(lt, rtA); renderB(lt - X0, rtB);
        const k = sm(X0, X1, lt);
        ctx.blend(rtA, rtB, k * k, 1 + k * 6, lerp(1.8, 1, k), rt);
      }
      return { bloom: lt < X0 ? 0.35 : 0.8, threshold: 0.9, streak: lt > 8 ? 0.35 : 0.05, streakTint: [1.1, .85, .55], grain: 0.05, ca: 0.6, vig: 1.0,
        fadeB: (1 - sm(0.2, 2.0, lt)) };
    },
  };
}
