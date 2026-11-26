// S10 / S11d — A blue world. Sunrise over the limb; later, the night side slowly fills with the lights of cities.
import { NOISE } from '../glsl.js';
import { sm, lerp } from '../util.js';

export function create(ctx) {
  const THREE = ctx.THREE;
  const mat = ctx.shader(/* glsl */`
    uniform float t, rot, night, cities, sunI, zoom, marker; uniform vec3 ro, L; uniform mat3 camM; varying vec2 vUv; ${NOISE}
    vec2 sph(vec3 ro, vec3 rd, float R){ float b=dot(ro,rd); float c=dot(ro,ro)-R*R; float h=b*b-c; if(h<0.) return vec2(-1.); h=sqrt(h); return vec2(-b-h,-b+h); }
    vec3 rotY(vec3 p, float a){ float c=cos(a),s=sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z); }
    void main(){
      vec2 p=(vUv-.5)*vec2(2.388,1.);
      vec3 rd = normalize(camM*vec3(p*.62/zoom, -1.));
      vec3 col = stars(rd, .06, t)*.8*(1.-sunI*.6);
      // sun
      float sd = max(dot(rd,L),0.);
      col += vec3(1.,.9,.75)*sunI*(pow(sd,6000.)*40. + pow(sd,400.)*.8 + pow(sd,12.)*.012);
      vec2 hit = sph(ro, rd, 1.);
      // atmosphere (limb)
      float b = dot(ro,rd); vec3 cp = ro - rd*b; float hgt = length(cp);
      vec3 cpn = normalize(cp);
      float dayc = dot(cpn, L);
      vec3 atmC = mix(vec3(.25,.5,1.), vec3(1.,.45,.2), smoothstep(.35,-.1,dayc));
      float atm = 0.;
      if(b<0.) atm = exp(-abs(hgt-1.)/(hgt>1.?.018:.006))*smoothstep(-.35,.2,dayc);
      if(hit.x>0.){
        vec3 pos = ro+rd*hit.x; vec3 n = normalize(pos);
        vec3 q = rotY(n, rot);
        float land = smoothstep(.49,.53, fbm5(q*2.2+vec3(3.,1.,7.)));
        float hi = fbm4(q*9.);
        float cl = smoothstep(.5,.75, fbm5(rotY(n, rot*1.3)*3.5+vec3(t*.01,0.,0.)));
        float dif = max(dot(n,L),0.); float term = smoothstep(-.12,.25,dot(n,L));
        vec3 ocean = vec3(.01,.06,.16) + vec3(.0,.08,.12)*hi;
        vec3 ground = mix(vec3(.16,.13,.07), vec3(.06,.13,.05), smoothstep(.4,.6,hi)) * (0.7+hi*.6);
        vec3 surf = mix(ocean, ground, land);
        vec3 h = normalize(L - rd);
        float spec = pow(max(dot(n,h),0.), 120.)*(1.-land)*(1.-cl)*3.;
        vec3 c = surf*dif*1.6 + vec3(1.,.85,.6)*spec*dif;
        c = mix(c, vec3(.9)*(dif*1.2+.01), cl*.7);
        // twilight band
        c += vec3(.9,.35,.12)*exp(-pow(dot(n,L)*9.,2.))*.12*(1.-night*.6);
        // city lights
        float lights = land*(1.-cl*.8)*(smoothstep(.8,.97,vnoise(q*180.))*1.8+smoothstep(.75,.95,vnoise(q*70.))*.25)*smoothstep(.4,.7,vnoise(q*16.+5.));
        float grow = 1.-smoothstep(cities-.15, cities, fbm3(q*3.+9.));
        c += vec3(1.,.62,.28)*lights*grow*(1.-term)*3.;
        // rim haze
        float fres = pow(1.-max(dot(n,-rd),0.), 3.);
        c += atmC*pow(fres,1.7)*term*.35;
        col = c;
        atm *= .6;
      }
      col += atmC*atm*1.4;
      float mr=length(p); col += vec3(1.,.8,.5)*marker*(exp(-mr*mr*2600.)*5.+exp(-mr*30.)*.5);
      gl_FragColor=vec4(col,1.);
    }`, { t: { value: 0 }, rot: { value: 0 }, night: { value: 0 }, cities: { value: 0 }, sunI: { value: 1 }, zoom: { value: 1 }, marker: { value: 0 },
        ro: { value: new THREE.Vector3() }, L: { value: new THREE.Vector3() }, camM: { value: new THREE.Matrix3() } });
  const cam = new THREE.PerspectiveCamera(40, 1920 / 804, .01, 100);
  return {
    scale: 0.75, mb: 2,
    render(lt, dur, p, rt) {
      const u = mat.uniforms; u.t.value = lt; u.zoom.value = 1; u.marker.value = 0;
      if (p.mode === 'sunrise') {
        // low orbit, looking along the horizon; the sun climbs out from behind the limb
        const D = lerp(2.75, 2.55, lt / dur);
        cam.position.set(0, 0.25, D);
        cam.lookAt(0, 1.02, 0);
        cam.rotateZ(-0.06 + lt * 0.002);
        const sunUp = lerp(-0.16, 0.03, sm(3, 15, lt));
        u.L.value.set(0.18, 0.29 + sunUp, -1).normalize();
        u.rot.value = 1.2 + lt * 0.01; u.night.value = 0; u.cities.value = 0; u.sunI.value = 1;
      } else if (p.mode === 'pull') {
        const D = p.close ? 1.1 * Math.pow(18, p.k) : 2.0 * Math.pow(9, p.k);
        cam.position.set(D * .25, D * .45, D * .86);
        cam.lookAt(0, 0, 0); cam.rotateZ(0.12 + p.k * .3);
        u.L.value.set(-0.75, 0.2, -1).normalize();
        u.rot.value = 2.75 + lt * 0.01; u.night.value = 1; u.cities.value = 1.05; u.sunI.value = 0.6;
      } else {
        const D = 2.3;
        cam.position.set(Math.sin(lt * 0.02) * .2, D * .6, D * .85);
        cam.lookAt(0, 0.05, 0); cam.rotateZ(0.12);
        u.L.value.set(-0.75, 0.2, -1).normalize();
        u.rot.value = 2.7 + lt * 0.012; u.night.value = 1; u.cities.value = lerp(0.15, 1.05, sm(0.3, 4.2, lt)); u.sunI.value = 0.6;
        u.zoom.value = 1 + 4 * Math.pow(sm(3.4, dur + 1, lt), 2); u.marker.value = sm(3.0, 4.8, lt) * 1.6;
      }
      cam.updateMatrixWorld();
      u.ro.value.copy(cam.position); u.camM.value.setFromMatrix4(cam.matrixWorld);
      ctx.quad(mat, rt);
      const flare = p.mode === 'sunrise' ? sm(6, 10, lt) : 0;
      return { bloom: 0.6 + flare * .4, threshold: 1.2, streak: 0.15 + flare * 0.9, streakTint: [1.1, .85, .6], grain: 0.045, ca: 0.6, sat: 1.1,
        fadeB: 0 };
    },
  };
}
