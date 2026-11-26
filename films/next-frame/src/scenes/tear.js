// S12 — A single tear, holding the whole sky (and, at its heart, our golden mote), falls onto still water.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';

export const IMPACT = 13.0;

export const TEAR_GLSL = /* glsl */`
vec3 bokeh(vec3 rd, float t){
  vec2 uv = rd.xy/max(rd.z,.05);
  vec3 c = vec3(0.);
  for(int L=0;L<2;L++){
    float sc = L==0 ? 1.0 : 2.6; vec2 g = uv*sc + float(L)*7.3 + vec2(t*.01,0.); vec2 id=floor(g); vec2 f=fract(g)-.5;
    vec3 h = hash33(vec3(id, float(L)));
    float dens = L==0 ? .2 : .08;
    if(h.x<dens){ vec2 o=(h.yz-.5)*.45; float r=length(f-o); float R=(L==0?.2:.12)+h.y*.1;
      float disc = smoothstep(R, R-.025, r)*(.6+.4*smoothstep(R*.3,R,r));
      vec3 col = mix(vec3(1.,.7,.4), vec3(.5,.68,1.), h.z);
      c += col*disc*(.05+h.x*.35)*(L==0?1.:.7);
    }
  }
  c *= smoothstep(-.3,.25,rd.y);
  c += stars(rd, .05, t)*.5;
  c += vec3(.006,.01,.022)*(.7+rd.y);
  return c;
}
float ripH(vec2 p, float age){
  if(age<0.) return 0.;
  float d=length(p); float h=0.;
  for(int k=0;k<3;k++){ float fk=float(k); float r = age*(.45+fk*.18); float a = exp(-age*.35)*(.06/(1.+fk));
    h += a*sin((d-r)*26.)*exp(-pow((d-r)*3.2,2.)); }
  return h/(1.+d*1.5);
}
`;

export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(/* glsl */`
    uniform float t, dropY, dropS, age, mote, splash, ringA, rise; uniform vec3 ro; uniform mat3 camM; varying vec2 vUv; ${NOISE} ${TEAR_GLSL}
    float sdDrop(vec3 p){ p.y -= dropY; vec3 q=p; q.xz /= max(.1, 1. - pow(clamp((p.y+.02)/.34,0.,1.),1.15)); q.y *= .8; q.y *= mix(1., .82, smoothstep(0.,-.2,q.y)); q.y*= 1./(1.+.18*dropS); q.xz*=1./(1.-.06*dropS);
      return (length(q)-.16)*.7; }
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 rd = normalize(camM*vec3(p*.55, -1.));
      vec3 col = bokeh(rd, t);
      // water
      float tw = rd.y<0. ? -ro.y/rd.y : 1e9;
      // drop: sphere trace
      float tt=0.; bool hit=false;
      for(int i=0;i<48;i++){ float d=sdDrop(ro+rd*tt); if(d<.0008){hit=true;break;} tt+=d; if(tt>12.) break; }
      if(hit && tt<tw){
        vec3 pos=ro+rd*tt; float e=.001;
        vec3 n=normalize(vec3(sdDrop(pos+vec3(e,0,0))-sdDrop(pos-vec3(e,0,0)), sdDrop(pos+vec3(0,e,0))-sdDrop(pos-vec3(0,e,0)), sdDrop(pos+vec3(0,0,e))-sdDrop(pos-vec3(0,0,e))));
        vec3 r1 = refract(rd, n, 1./1.33);
        vec3 c = vec3(0.,dropY,0.); vec3 n2 = normalize(-(pos + r1*0.3 - c)); vec3 r2 = refract(r1, -n2, 1.33); if(dot(r2,r2)<.01) r2=reflect(r1,-n2);
        vec3 inside = bokeh(normalize(r2*vec3(1.,-1.,1.)), t)*3.5 + vec3(.02,.03,.05);
        float fr = .03+.97*pow(1.-max(dot(n,-rd),0.),5.);
        vec3 refl = bokeh(reflect(rd,n), t);
        col = mix(inside, refl*2., fr) + vec3(.6,.7,.9)*pow(1.-max(dot(n,-rd),0.),3.)*.25 + vec3(1.,.9,.8)*pow(max(dot(reflect(rd,n), normalize(vec3(-.4,.6,.5))),0.),60.)*1.5;
        // the golden mote at the heart of the tear
        vec3 toC = c - ro; float along = dot(toC, rd); float md = length(toC - rd*along);
        col += vec3(1.,.75,.4)*mote*(exp(-md*md*9000.)*5. + exp(-md*90.)*.6);
      } else if(rd.y<0.){
        vec3 pos = ro+rd*tw; vec2 w=pos.xz;
        float e=.003; float h0=ripH(w,age);
        vec2 g = vec2(ripH(w+vec2(e,0.),age)-h0, ripH(w+vec2(0.,e),age)-h0)/e;
        g += vec2(fbm2(w*2.+t*.05)-.5, fbm2(w*2.+9.)-.5)*.05;
        vec3 n=normalize(vec3(-g.x,1.,-g.y));
        float fr = .02+.98*pow(1.-max(dot(n,-rd),0.),5.);
        vec3 rc = bokeh(reflect(rd,n), t)*fr*1.6 + vec3(.003,.006,.012);
        // golden light ring at impact (echo of the supernova)
        float d=length(w); float an=atan(w.y,w.x);
        if(ringA>0.) for(int k=0;k<14;k++){ float r2 = age*.075 - float(k)*.05 - hash11(float(k)*7.3)*.03; if(r2>0.) rc += vec3(1.,.75,.4)*ringA*exp(-pow((d-r2)*(420./(1.+r2*2.)),2.))*exp(-float(k)*.2)*.2*(.45+vnoise2(vec2(an*3.,float(k)*5.+t*.2))*1.1); }
        rc += vec3(1.,.8,.5)*splash*exp(-d*d*200.)*.5;
        rc += stars(reflect(rd,n), .09, t)*.7*rise;
        col = mix(rc, vec3(.006,.01,.02), 1.-exp(-tw*.08));
      }
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, dropY: { value: 1 }, dropS: { value: 0 }, age: { value: -1 }, mote: { value: 1 }, splash: { value: 0 }, ringA: { value: 0 }, rise: { value: 0 },
        ro: { value: new THREE.Vector3() }, camM: { value: new THREE.Matrix3() } });
  const cam = new THREE.PerspectiveCamera(40, 1920 / 804, .01, 100);
  return {
    scale: 0.6, mb: 2,
    render(lt, dur, p, rt) {
      const u = mat.uniforms; u.t.value = lt; u.rise.value = 0;
      // drop: hangs (0-4.5), then falls in slow motion, hits water at IMPACT
      const fall = Math.max(0, lt - 4.5) / (IMPACT - 4.5);
      u.dropY.value = lt < IMPACT ? lerp(1.05, 0.0, fall * fall) + 0.16 : -5;
      u.dropS.value = lt < 4.5 ? Math.sin(lt * 2.2) * 0.25 * (1 - lt / 4.5) + 0.3 : 0.25 * Math.sin(lt * 7) * Math.exp(-(lt - 4.5) * .6);
      u.age.value = lt - IMPACT; u.mote.value = 1;
      u.splash.value = lt > IMPACT ? 3 * Math.exp(-(lt - IMPACT) * 3) : 0;
      u.ringA.value = lt > IMPACT ? 1 : 0;
      // camera: tracks the drop down, then holds on the spreading rings and tilts toward the sky
      // camera: tracks the drop down; after the impact it rises and turns to look straight down at the rings
      if (lt < IMPACT) {
        const ty = Math.max(0.12, u.dropY.value - 0.04);
        cam.position.set(0, lerp(0.35, 0.28, sm(0, IMPACT, lt)), 1.55);
        cam.lookAt(0, ty, 0);
      } else {
        const k = sm(IMPACT + 1.2, dur, lt);
        cam.position.set(0, lerp(0.28, 0.35, k), lerp(1.55, 0.1225, k));
        cam.lookAt(0, lerp(0.05, 0, k), 0);
        u.rise.value = k;
      }
      if (p.rise !== undefined) {
        const h = 0.35 * Math.pow(30, p.rise);
        u.dropY.value = -5; u.age.value = (20 - IMPACT) + lt; u.rise.value = 1; u.ringA.value = 1; u.splash.value = 0; u.mote.value = 0;
        cam.position.set(0.0, h, h * 0.35); cam.lookAt(0, 0, 0); cam.rotateZ(lt * 0.03);
      }
      cam.updateMatrixWorld();
      u.ro.value.copy(cam.position); u.camM.value.setFromMatrix4(cam.matrixWorld);
      ctx.quad(mat, rt);
      return { bloom: 0.7, threshold: 0.7, streak: 0.15 + (lt > IMPACT ? Math.exp(-(lt - IMPACT)) * .6 : 0), streakTint: [1.1, .85, .6], grain: 0.05, ca: 0.8,
        fadeB: 0 };
    },
  };
}
