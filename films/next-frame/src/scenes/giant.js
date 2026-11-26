// S07 — The star grows old: a swollen red giant, its heartbeat slowing, until it falls in on itself.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';
import { TEMP_GLSL } from '../util.js';

export const BEATS7 = [0.6, 2.4, 4.5, 7.0, 9.9, 12.6];

export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(/* glsl */`
    uniform float t, R, heat, pulse, implode, I; uniform vec2 c; varying vec2 vUv; ${NOISE} ${TEMP_GLSL}
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec2 d=p-c; float r=length(d);
      vec3 col = stars(normalize(vec3(p*.8,1.)), .05, t)*.6;
      if(r<R){
        float z=sqrt(R*R-r*r); vec3 n=normalize(vec3(d,z));
        float ca=cos(t*.03), sa=sin(t*.03); n.xz = mat2(ca,-sa,sa,ca)*n.xz;
        vec3 q=n*3.2;
        float g1 = fbm4(q*2.2 + vec3(0.,0.,t*.08));
        float cells = pow(1.-abs(vnoise(q*7.+vec3(t*.12))*2.-1.), 3.);
        float spots = smoothstep(.62,.72,fbm3(q*1.3+11.));
        float mu = z/R;
        float limb = pow(mu, .55);
        float T = heat + g1*.28 + cells*.08 - spots*.18;
        col = temp(T) * (0.25 + g1*g1*2.2 + cells*.35) * limb * I * (1.+pulse*.5);
        col += temp(heat+.2)*pow(1.-mu,3.)*.4*I;
      } else {
        float h=r-R; float a=atan(d.y,d.x);
        float fl = fbm4(vec3(cos(a)*4., sin(a)*4., t*.15 - h*3.));
        float corona = exp(-h*9./R)*(0.5+fl*1.3) + exp(-h*2.5/R)*.12;
        col += temp(heat+.08)*corona*I*(1.+pulse*.6);
      }
      // implosion flash at the core
      col += vec3(1.,.9,.8)*implode*exp(-r*r*60.)*4.;
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, R: { value: .3 }, heat: { value: .3 }, pulse: { value: 0 }, implode: { value: 0 }, I: { value: 1 }, c: { value: new THREE.Vector2(.18, 0) } });
  return {
    scale: 0.75, mb: 2,
    render(lt, dur, p, rt) {
      const u = mat.uniforms;
      let pulse = 0; for (const b of BEATS7) { const x = lt - b; if (x >= 0) pulse += Math.exp(-x * 5) + .5 * Math.exp(-Math.max(0, x - .25) * 6) * (x > .25 ? 1 : 0); }
      const grow = lerp(0.26, 0.62, sm(0, 12.6, lt));
      const imp = sm(12.7, 13.6, lt);
      u.t.value = lt; u.pulse.value = pulse;
      u.R.value = lerp(1.7, grow, sm(0, 3.6, lt)) * (1 - imp * 0.985);
      u.c.value.set(lerp(0.0, 0.12, sm(1, 8, lt)), lerp(0.0, -0.04, sm(1, 12, lt)));
      u.heat.value = lerp(0.27, 0.1, sm(0, 12, lt)) + imp * 0.6;
      u.I.value = lerp(0.75, 0.5, sm(0, 12.5, lt)) * (1 + imp * 2);
      u.implode.value = imp * (1 - sm(13.55, 13.8, lt));
      ctx.quad(mat, rt);
      return { bloom: 0.65, threshold: 1.0, streak: 0.2 + imp * 1.5, streakTint: [1.2, .7, .45], grain: 0.05, ca: 0.7, sat: 1.15,
        fadeB: sm(13.62, 13.8, lt), fadeW: 1 - sm(0, 0.9, lt) };
    },
  };
}
