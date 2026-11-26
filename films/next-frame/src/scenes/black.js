export function create(ctx) {
  const mat = ctx.shader(`void main(){ gl_FragColor=vec4(0.,0.,0.,1.); }`);
  return { scale: 0.5, render(lt, dur, p, rt) { ctx.quad(mat, rt); return { grain: 0.03, bloom: 0, streak: 0 }; } };
}
