/**
 * **The GL half of the bloom that is only setup**: the one program both
 * blur directions share, and the textures they draw into. Split from
 * `bloom-gl.ts`, which is what runs every frame.
 *
 * The blur is the nine-tap Gaussian taken as five linear samples, the
 * standard weights for a separable blur on hardware filtering. `u_cut` is 1
 * on the first draw only, which is the one that reads the frame: it keeps
 * what is brighter than the threshold and lets the rest go to black.
 */

const OFFSETS = [0, 1.3846153846, 3.2307692308] as const;
const WEIGHTS = [0.227027027, 0.3162162162, 0.0702702703] as const;

const VERTEX = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

const fragment = (threshold: number): string => `
precision mediump float;
uniform sampler2D u_src;
uniform vec2 u_step;
uniform float u_cut;
varying vec2 v_uv;
vec3 tap(vec2 at) {
  vec3 c = texture2D(u_src, at).rgb;
  float l = max(c.r, max(c.g, c.b));
  return mix(c, c * smoothstep(${threshold.toFixed(3)}, 1.0, l), u_cut);
}
void main() {
  vec3 sum = tap(v_uv) * ${WEIGHTS[0].toFixed(10)};
  sum += (tap(v_uv + u_step * ${OFFSETS[1].toFixed(10)}) + tap(v_uv - u_step * ${OFFSETS[1].toFixed(10)})) * ${WEIGHTS[1].toFixed(10)};
  sum += (tap(v_uv + u_step * ${OFFSETS[2].toFixed(10)}) + tap(v_uv - u_step * ${OFFSETS[2].toFixed(10)})) * ${WEIGHTS[2].toFixed(10)};
  gl_FragColor = vec4(sum, 1.0);
}`;

export interface Target {
  readonly tex: WebGLTexture;
  readonly fbo: WebGLFramebuffer;
}

export function target(gl: WebGLRenderingContext): Target | null {
  const tex = texture(gl);
  const fbo = gl.createFramebuffer();
  return tex && fbo ? { tex, fbo } : null;
}

export function texture(gl: WebGLRenderingContext): WebGLTexture | null {
  const t = gl.createTexture();
  if (!t) return null;
  gl.bindTexture(gl.TEXTURE_2D, t);
  // A texture of any size in WebGL 1 has to clamp and cannot mipmap.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

export function link(gl: WebGLRenderingContext, threshold: number): WebGLProgram | null {
  const vs = shader(gl, gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl, gl.FRAGMENT_SHADER, fragment(threshold));
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return gl.getProgramParameter(program, gl.LINK_STATUS) ? program : null;
}

function shader(gl: WebGLRenderingContext, kind: number, text: string): WebGLShader | null {
  const s = gl.createShader(kind);
  if (!s) return null;
  gl.shaderSource(s, text);
  gl.compileShader(s);
  return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
}
