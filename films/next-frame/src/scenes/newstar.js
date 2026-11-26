// S14 — Somewhere far away, a new star kindles. Title.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';
export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(`uniform float t, I, haze; uniform vec2 c; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 col = stars(normalize(vec3(p*.7,1.)), .05, t)*.35*haze;
      col += vec3(.03,.035,.07)*pow(fbm3(vec3(p*1.4,t*.02)),3.)*3.*haze;
      float r=length(p-c);
      col += vec3(1.,.8,.5)*I*(exp(-r*r*20000.)*12. + exp(-r*40.)*.9 + exp(-r*9.)*.12);
      gl_FragColor=vec4(col,1.); }`, { t: { value: 0 }, I: { value: 0 }, haze: { value: 1 }, c: { value: new THREE.Vector2(0, .2) } });
  return {
    scale: 1, mb: 1,
    render(lt, dur, p, rt) {
      const u = mat.uniforms; u.t.value = lt;
      const ign = sm(0.8, 2.2, lt);
      const flick = 1 + 1.8 * Math.exp(-Math.max(0, lt - 1.6) * 2.5) * (lt > 1.6 ? 1 : 0);
      const toC = sm(11.0, 12.8, lt);
      u.c.value.set(0, lerp(0.21, 0, toC));
      u.I.value = ign * flick * lerp(1, 0.55, toC);
      u.haze.value = sm(0, 3, lt) * (1 - toC);
      ctx.quad(mat, rt);
      return { bloom: 0.8, threshold: 0.5, streak: 0.35 * ign, streakTint: [1.15, .85, .55], grain: 0.045, ca: 0.4 };
    },
  };
}
