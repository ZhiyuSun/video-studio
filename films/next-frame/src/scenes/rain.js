// S11a — The first rain falls on the first ocean.
import { NOISE } from '../glsl.js';
import { sm } from '../util.js';

export function create(ctx) {
  const mat = ctx.shader(/* glsl */`
    uniform float t, moteY, moteI, ringAge, seed; varying vec2 vUv; ${NOISE}
    vec3 sky(vec3 d){ float h=d.y; vec3 c = mix(vec3(.10,.07,.09), vec3(.012,.02,.045), smoothstep(0.,.35,h));
      c += vec3(.9,.42,.18)*exp(-abs(h)*14.)*.55*smoothstep(-.6,.6,d.x+.2); return c; }
    float ripples(vec2 p, float t){
      float h=0.;
      for(int L=0;L<2;L++){
        vec2 sc = p*(L==0?1.6:3.1); vec2 id=floor(sc); vec2 f=fract(sc);
        for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
          vec2 g=vec2(i,j); vec2 cid=id+g; float rh=hash12(cid+float(L)*13.);
          float per = .9+rh*.8; float tt = mod(t+rh*per*3., per);
          vec2 c = g + vec2(hash12(cid+7.), hash12(cid+19.)) - f;
          float d = length(c);
          float r = tt*.55;
          h += sin((d-r)*55.)*exp(-pow((d-r)*9.,2.))*exp(-tt*3.)*(1.-smoothstep(.0,.4,d))*.25;
        }
      }
      return h;
    }
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 ro=vec3(0.,.55,0.); vec3 rd=normalize(vec3(p.x*.7, p.y*.7-.12, -1.));
      vec3 col;
      if(rd.y<0.){
        float tt=-ro.y/rd.y; vec3 pos=ro+rd*tt; vec2 w=pos.xz;
        float e=.004; float h0=ripples(w,t); vec2 gr=vec2(ripples(w+vec2(e,0.),t)-h0, ripples(w+vec2(0.,e),t)-h0)/e;
        gr += vec2(fbm2(w*1.5+t*.2)-.5, fbm2(w*1.5+11.-t*.15)-.5)*.6;
        vec3 n=normalize(vec3(-gr.x*.025, 1., -gr.y*.025));
        vec3 rf=reflect(rd,n);
        float fr = .02+.98*pow(1.-max(dot(n,-rd),0.),5.);
        col = sky(rf)*fr*1.0 + vec3(.002,.006,.01);
        float dW = length((w - vec2(0.,-1.864))*vec2(1.,1.)); float rr = ringAge*.22;
        if(ringAge>0.) col += vec3(1.,.75,.4)*exp(-pow((dW-rr)*40.,2.))*exp(-ringAge*.6)*.8;
        col *= exp(-tt*.02);
        col = mix(col, sky(vec3(rd.x,0.,rd.z)), 1.-exp(-tt*.035));
      } else col = sky(rd);
      // rain streaks
      vec2 q = vec2(p.x*1.1 + p.y*.12, p.y);
      for(int k=0;k<3;k++){
        float fk=float(k); vec2 s = q*vec2(90.+fk*50., 2.5+fk); s.y += t*(14.+fk*4.); vec2 id=floor(s); vec2 f=fract(s);
        float rh=hash12(id+fk*31.); float on=step(.86,rh);
        col += vec3(.5,.55,.62)*on*smoothstep(.12,0.,abs(f.x-.5))*smoothstep(0.,.3,f.y)*smoothstep(1.,.6,f.y)*(.018+.012*fk);
      }
      vec2 mp = p - vec2(0., moteY); float mr = length(mp*vec2(1.,.35));
      col += vec3(1.,.8,.5)*moteI*(exp(-mr*mr*3000.)*4. + exp(-mr*35.)*.4);
      float sr = length(p - vec2(0.,-.25)); col += vec3(1.,.8,.5)*seed*(exp(-sr*sr*2600.)*5. + exp(-sr*30.)*.5);
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, moteY: { value: 1 }, moteI: { value: 0 }, ringAge: { value: 0 }, seed: { value: 0 } });
  return {
    scale: 0.75, mb: 3,
    render(lt, dur, p, rt) { const u = mat.uniforms; u.t.value = lt + 3.;
      const f = Math.min(1, Math.max(0, (lt - 2.4) / 2.2)); u.moteY.value = 0.6 + (-0.25 - 0.6) * f * f; u.moteI.value = lt > 2.4 && lt < 4.6 ? 1.4 : 0;
      u.ringAge.value = lt > 4.6 ? lt - 4.6 : 0; u.seed.value = lt > 4.6 ? 0.8 + 0.8 * sm(4.6, dur + 0.8, lt) : 0;
      ctx.quad(mat, rt);
      return { bloom: 0.5, threshold: 0.6, streak: 0.15, streakTint: [1.1, .8, .6], grain: 0.06, ca: 0.4, sat: 1.05 }; },
  };
}
