import * as THREE from 'three';
export const ASPECT = 1920 / 804;
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
export const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
export function camera(fov = 40, near = 0.01, far = 5000) { return new THREE.PerspectiveCamera(fov, ASPECT, near, far); }
// soft round point sprite fragment (additive)
export const SPRITE_FRAG = /* glsl */`
varying vec3 vCol; varying float vA;
void main(){ vec2 c=gl_PointCoord-.5; float d=dot(c,c)*4.; if(d>1.) discard;
  float a = exp(-d*4.)*.85 + exp(-d*18.)*.6; gl_FragColor=vec4(vCol*a*vA,1.); }`;
export const PSC = { value: 1 };
export function addMat(vert, frag, uniforms) {
  uniforms.PSC = PSC;
  vert = 'uniform float PSC;\n' + vert.replace(/gl_PointSize\s*=\s*([^;]+);/g, 'gl_PointSize = ($1) * PSC;');
  return new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, transparent: true });
}
// blackbody-ish ramp: T in [0,1] cold red -> white -> blue
export const TEMP_GLSL = /* glsl */`
vec3 temp(float T){ T=clamp(T,0.,1.);
  vec3 a=vec3(.6,.06,.02), b=vec3(1.,.35,.06), c=vec3(1.,.72,.35), d=vec3(1.,.95,.88), e=vec3(.7,.82,1.);
  if(T<.25) return mix(a,b,T/.25); if(T<.5) return mix(b,c,(T-.25)/.25); if(T<.75) return mix(c,d,(T-.5)/.25); return mix(d,e,(T-.75)/.25); }`;
