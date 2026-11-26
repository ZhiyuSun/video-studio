// S11c — A murmuration at dusk: thousands moving as one.
import * as THREE from 'three';
import { NOISE } from '../glsl.js';
import { rng, gauss, camera, PSC } from '../util.js';

export function create(ctx) {
  const N = 26000, R = rng(5);
  const A = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) A.set([gauss(R), gauss(R) * .6, gauss(R), R()], i * 4);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute('a', new THREE.BufferAttribute(A, 4));
  const U = { t: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: Object.assign(U, { PSC }), transparent: true, depthTest: false, depthWrite: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    vertexShader: /* glsl */`attribute vec4 a; uniform float t, PSC; varying float vA; ${NOISE}
      vec3 field(vec3 p, float t){ return vec3(vnoise(p*.6+vec3(t*.25,0.,0.)), vnoise(p*.6+vec3(0.,t*.25,7.)), vnoise(p*.6+vec3(3.,0.,t*.25)))-.5; }
      void main(){
        vec3 p = a.xyz;
        // morph the cloud: stretch and fold through a slowly changing field
        p += field(p, t)*3.2; p += field(p*1.7+5., t*1.3)*1.2;
        float s = 1.+.35*sin(t*.7+p.x*.6);
        p *= vec3(2.2*s, .9, 1.3);
        p += vec3(sin(t*.35)*2.5, cos(t*.27)*.8+1.2, 0.);
        vec4 mv=modelViewMatrix*vec4(p,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize = clamp(55./-mv.z,1.,4.)*(0.7+a.w*.6)*PSC; vA = .9;
      }`,
    fragmentShader: `varying float vA; void main(){ vec2 c=gl_PointCoord-.5; if(dot(c,c)>.25) discard; gl_FragColor=vec4(0.,0.,0.,vA*.85); }`,
  });
  const P = new THREE.Points(g, mat); P.frustumCulled = false;
  const scene = new THREE.Scene(); scene.add(P);
  const cam = camera(40); cam.position.set(0, 0, 18); cam.lookAt(0, 1.2, 0);
  const sky = ctx.shader(`uniform float t; varying vec2 vUv; ${NOISE}
    void main(){ vec2 p=vUv; float h=p.y;
      vec3 c = mix(vec3(1.25,.55,.25), vec3(.32,.22,.38), smoothstep(.0,.75,h)); c = mix(c, vec3(.06,.07,.16), smoothstep(.6,1.1,h));
      vec2 sp=(p-vec2(.62,.06))*vec2(2.388,1.); c += vec3(1.,.7,.4)*exp(-length(sp)*5.)*1.2;
      float cl = fbm2(vec2(p.x*3.+t*.02, p.y*14.)); c *= 1.-smoothstep(.55,.8,cl)*.25*(1.-h);
      gl_FragColor=vec4(c*.9,1.); }`, { t: { value: 0 } });
  return {
    scale: 1, psc: 1.333, mb: 3,
    render(lt, dur, p, rt) {
      U.t.value = lt + 20; sky.uniforms.t.value = lt;
      cam.position.set(lt * 0.15, 0.2, 18 - lt * .4); cam.lookAt(lt * .1, 1.4, 0);
      ctx.quad(sky, rt);
      ctx.renderer.autoClear = false; ctx.renderer.setRenderTarget(rt); ctx.renderer.render(scene, cam); ctx.renderer.autoClear = true;
      return { bloom: 0.5, threshold: 0.9, streak: 0.15, streakTint: [1.1, .8, .5], grain: 0.06, ca: 0.4, sat: 1.1 };
    },
  };
}
