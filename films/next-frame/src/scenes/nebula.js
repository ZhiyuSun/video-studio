// S09 — Drift. The ashes of the star become a nebula; eons pass; a new sun kindles in the gas.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';

export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(/* glsl */`
    uniform float t, z, sun; uniform vec3 mote; uniform vec2 sunP; varying vec2 vUv; ${NOISE}
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 ro=vec3(t*.05, 0., z); vec3 rd=normalize(vec3(p*.7,1.));
      vec3 col = stars(rd, .07, t)*.9;
      vec3 acc=vec3(0.); float T=1.;
      for(int i=0;i<30;i++){
        float dd = 1.+float(i)*.26;
        vec3 q = ro+rd*dd;
        vec3 w = q*.32 + vec3(fbm3(q*.25), fbm3(q*.25+7.), 0.)*1.6;
        float d = fbm4(w);
        float e = smoothstep(.5,.82,d);
        float dust = smoothstep(.5,.72,fbm3(w*1.7+19.));
        float hue = fbm3(w*.7+3.);
        vec3 c = mix(vec3(.15,.55,.75), vec3(.85,.22,.5), smoothstep(.35,.65,hue));
        c = mix(c, vec3(1.,.65,.3), smoothstep(.6,.8,hue)*.7);
        float ridge = pow(1.-abs(vnoise(w*3.)*2.-1.),5.);
        acc += T*c*(e*e*.6 + ridge*e*.5)*.22;
        T *= 1. - (e*.04 + dust*.22);
        if(T<.04) break;
      }
      col = col*T + acc;
      // new sun kindling
      vec2 sp = (p - sunP); float sr=length(sp);
      col += vec3(1.,.85,.65)*sun*(exp(-sr*sr*900.)*5. + exp(-sr*9.)*.5 + exp(-sr*2.)*.08);
      // our mote in the foreground (soft, slightly out of focus)
      float mr = length(p-mote.xy);
      col += vec3(1.,.8,.5)*mote.z*(exp(-mr*mr*1500.)*3. + exp(-mr*30.)*.35);
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, z: { value: 0 }, sun: { value: 0 }, mote: { value: new THREE.Vector3() }, sunP: { value: new THREE.Vector2(.30, -.22) } });
  return {
    scale: 0.5,
    render(lt, dur, p, rt) {
      const u = mat.uniforms;
      u.t.value = lt; u.z.value = lt * 0.18;
      u.sun.value = sm(6.5, 13.5, lt) * 1.4;
      { const k = sm(1.5, 14, lt); u.mote.value.set(lerp(-0.30, 0.30, k), lerp(-0.06, -0.22, k), 1.6 * (1 - sm(11, 14.5, lt))); }
      ctx.quad(mat, rt);
      return { bloom: 0.6, threshold: 1.0, streak: 0.1 + sm(6.5, 13.5, lt) * 0.5, streakTint: [1.1, .85, .6], grain: 0.055, ca: 0.6, sat: 1.15 };
    },
  };
}
