// S06 — Inside the star. Three motes of helium spiral together and fuse: carbon is born.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';
import { TEMP_GLSL } from '../util.js';

export const FUSE = 6.6;

export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(/* glsl */`
    uniform float t, z, flash, ring, I; uniform vec3 m0, m1, m2, mc; varying vec2 vUv; ${NOISE} ${TEMP_GLSL}
    float gR;
    float dens(vec3 p){
      vec3 q = p + vec3(fbm3(p*.5+vec3(0.,0.,t*.15)), fbm3(p*.5+vec3(5.2,1.3,t*.12)), fbm3(p*.5+vec3(2.,7.,t*.1)))*1.8;
      float d = fbm4(q*1.05 + vec3(0.,t*.06,0.));
      gR = pow(1.-abs(fbm3(q*1.9)*2.-1.), 6.);
      return d;
    }
    vec3 moteGlow(vec2 p, vec3 m, vec3 col){ float r=length(p-m.xy); return col*m.z*(exp(-r*r*2600.)*6. + exp(-r*28.)*.7 + exp(-r*7.)*.12); }
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 ro = vec3(0.,0.,z); vec3 rd = normalize(vec3(p*.75, 1.));
      vec3 col=vec3(0.); float T=1.;
      float st = .2;
      for(int i=0;i<34;i++){
        float dd = 0.3+float(i)*st;
        vec3 pos = ro + rd*dd;
        float d = dens(pos);
        float e = smoothstep(.38,.85,d);
        vec3 c = temp(.08 + e*.7 + gR*.25) * (0.02 + e*e*e*2.2 + gR*e*1.4);
        float a = clamp(e*.16 + gR*.05, 0., 1.);
        col += T*c*a*exp(-dd*.25); T *= 1.-a*.8;
        if(T<.03) break;
      }
      col += T*vec3(.06,.01,.0);
      col *= I;
      // the motes (screen space)
      vec3 he = vec3(1.,.85,.6);
      col += moteGlow(p,m0,he)+moteGlow(p,m1,he)+moteGlow(p,m2,he);
      col += moteGlow(p,mc,vec3(.75,.88,1.2))*1.6;
      float rr = length(p-mc.xy);
      float ra = ring>0. ? (1.-ring) : 0.; col += vec3(.8,.9,1.2)*ra*exp(-pow((rr-ring*1.3)*26.,2.))*1.1;
      col += vec3(1.,.95,.9)*flash;
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, z: { value: 0 }, flash: { value: 0 }, ring: { value: 0 }, I: { value: 1 },
        m0: { value: new THREE.Vector3() }, m1: { value: new THREE.Vector3() }, m2: { value: new THREE.Vector3() }, mc: { value: new THREE.Vector3() } });
  return {
    scale: 0.5,
    render(lt, dur, p, rt) {
      const u = mat.uniforms;
      u.t.value = lt; u.z.value = lt * 0.45;
      const conv = sm(0.5, FUSE, lt);
      const cx = Math.sin(lt * .2) * .015, cy = 0.0;
      const rad = lerp(0.42, 0.0, Math.pow(conv, 1.4));
      const spin = lt * 0.6 + Math.pow(conv, 3) * 7;
      const he = lt < FUSE ? (0.5 + conv * 1.2) * sm(0.2, 1.5, lt) : 0;
      [u.m0, u.m1, u.m2].forEach((m, i) => {
        const a = spin + i * Math.PI * 2 / 3;
        m.value.set(cx + Math.cos(a) * rad * 1.1, cy + Math.sin(a) * rad * 0.7, he);
      });
      const after = Math.max(0, lt - FUSE);
      u.mc.value.set(cx, cy, lt >= FUSE ? 1.4 + 2.5 * Math.exp(-after * 1.5) + 0.1 * Math.sin(lt * 4) : 0);
      u.flash.value = lt >= FUSE ? 1.6 * Math.exp(-after * 5) : 0;
      u.ring.value = lt >= FUSE ? Math.min(1, after / 1.6) : 0; if (after > 1.6) u.ring.value = 0;
      u.I.value = (1 - 0.3 * Math.exp(-after * 2) * (lt >= FUSE ? 1 : 0)) * (0.9 + 0.1 * Math.sin(lt * .7));
      ctx.quad(mat, rt);
      return { bloom: 0.6, threshold: 1.2, streak: 0.25 + (lt >= FUSE ? Math.exp(-after) * 0.8 : 0), streakTint: [.7, .85, 1.2], grain: 0.055, ca: 0.8, vig: 1.0,
        exposure: 0.95 * (1 + 2.5 * sm(dur - 1.8, dur, lt)), sat: 1.3, gain: [1.12, 1.0, 0.86], fadeW: Math.max(1 - sm(0, 1.0, lt), sm(dur - 0.8, dur, lt)) };
    },
  };
}
