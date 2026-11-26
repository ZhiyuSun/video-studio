// S02 — a single point of light, breathing, bending the faint starlight around it, until it can no longer hold.
import { NOISE } from '../glsl.js';
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const BEATS = [1.0, 3.6, 6.0, 8.1, 9.9, 11.4, 12.55, 13.4, 14.0, 14.45];

export function create(ctx) {
  const mat = ctx.shader(`
    uniform float t, I, pulse, lens, starsA, zoom, rays; varying vec2 vUv; ${NOISE}
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.)/zoom;
      float r=length(p)+1e-4;
      // gravitational lensing of background
      vec2 q = p - normalize(p)*lens*0.012/r;
      vec3 d = normalize(vec3(q*0.9, 1.));
      vec3 col = stars(d, 0.06, t)*starsA*smoothstep(0.02,0.08,r);
      // faint dust
      col += vec3(.05,.035,.03)*fbm3(vec3(q*3.,t*.05))*starsA*.18;
      // the point
      float core = exp(-r*r/(2.*0.0018*0.0018));
      float halo = exp(-r/0.03)*.6 + exp(-r/0.12)*.12;
      vec3 hot = vec3(1.,.92,.82);
      float ang=atan(p.y,p.x);
      float ray = pow(abs(cos(ang*3.+t*.2)),40.)*exp(-r/0.25)*rays*.35 + pow(abs(cos(ang*5.-t*.13)),60.)*exp(-r/0.18)*rays*.2;
      col += hot*(core*40.*I + halo*I*(1.+pulse*1.5)) + vec3(.8,.85,1.)*ray*I*.6;
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, I: { value: 1 }, pulse: { value: 0 }, lens: { value: 0 }, starsA: { value: 0 }, zoom: { value: 1 }, rays: { value: 0 } });

  return {
    scale: 1, mb: 2,
    render(lt, dur, p, rt, gt) {
      lt = lt * 15 / dur;
      let pulse = 0;
      for (const b of BEATS) { const x = lt - b; if (x >= 0) pulse += Math.exp(-x * 7) + 0.6 * Math.exp(-Math.max(0, x - 0.22) * 9) * (x > 0.22 ? 1 : 0); }
      const build = sm(9, 14.5, lt);
      const u = mat.uniforms;
      u.t.value = gt; u.pulse.value = pulse; u.I.value = 0.6 + build * 3 + pulse * 0.6;
      u.lens.value = 0.4 + build * 1.4 + pulse * 0.3; u.starsA.value = sm(1.5, 7, lt) * (1 - sm(13.6, 14.6, lt) * 0.7);
      u.zoom.value = 1 + lt * 0.035 + build * 0.4; u.rays.value = build * 1.5;
      ctx.quad(mat, rt);
      const fadeW = sm(14.45, 14.75, lt);
      return { bloom: 0.9 + build, threshold: 0.6, streak: 0.5 + build * 1.6 + pulse * 0.3, grain: 0.04, fadeW, ca: 1.2, streakTint: [.5, .7, 1.25] };
    },
  };
}
