// Shared GLSL snippets
export const NOISE = /* glsl */`
float hash11(float p){p=fract(p*.1031);p*=p+33.33;p*=p+p;return fract(p);}
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float hash13(vec3 p3){p3=fract(p3*.1031);p3+=dot(p3,p3.zyx+31.32);return fract((p3.x+p3.y)*p3.z);}
vec3 hash33(vec3 p3){p3=fract(p3*vec3(.1031,.1030,.0973));p3+=dot(p3,p3.yxz+33.33);return fract((p3.xxy+p3.yxx)*p3.zyx);}
float vnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash13(i),hash13(i+vec3(1,0,0)),f.x),mix(hash13(i+vec3(0,1,0)),hash13(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash13(i+vec3(0,0,1)),hash13(i+vec3(1,0,1)),f.x),mix(hash13(i+vec3(0,1,1)),hash13(i+vec3(1,1,1)),f.x),f.y),f.z);}
float vnoise2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
 return mix(mix(hash12(i),hash12(i+vec2(1,0)),f.x),mix(hash12(i+vec2(0,1)),hash12(i+vec2(1,1)),f.x),f.y);}
float fbm3(vec3 p){float a=.5,s=0.;for(int i=0;i<3;i++){s+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float fbm4(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*vnoise(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float fbm5(vec3 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vnoise(p);p=p*2.02+vec3(1.7,9.2,3.1);a*=.5;}return s;}
float fbm2(vec2 p){float a=.5,s=0.;for(int i=0;i<5;i++){s+=a*vnoise2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
// starfield: returns radiance for direction
vec3 stars(vec3 d, float dens, float t){
  vec3 c=vec3(0.);
  for(int L=0;L<3;L++){
    float sc=180.+float(L)*170.;
    vec3 p=d*sc; vec3 id=floor(p); vec3 f=fract(p)-.5;
    vec3 h=hash33(id+float(L)*17.);
    if(h.x<dens){ vec3 o=(h-.5)*.6; float r=length(f-o);
      float b=pow(h.y,6.)*3.+.15; float tw=.75+.25*sin(t*(1.+h.z*3.)+h.x*40.);
      vec3 col=mix(vec3(1.,.75,.55),vec3(.7,.8,1.),h.z);
      c+=col*b*tw*smoothstep(.09,0.,r);
    }
  }
  return c;
}
`;

export const FSQ_VERT = /* glsl */`varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`;
