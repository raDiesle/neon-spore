/**
 * **The bloom itself: a bright-pass and a separable blur in one WebGL
 * context, laid back over the frame additively.**
 *
 * The frame is shrunk by `DOWNSCALE` into a small 2D canvas and uploaded as
 * one texture. The first draw keeps only what is brighter than `THRESHOLD`
 * and blurs it across into a texture of its own; the next blurs that down,
 * and the pair runs once per entry in `SPREADS`, the last draw landing on the
 * WebGL canvas. The 2D context then draws the WebGL canvas over itself with
 * `lighter`, stretched back to full size — the stretch is one more blur for
 * free.
 *
 * **Why a threshold and not a canvas of its own for the bright layer.** The
 * queue entry asked for the halos, rims and lamps to be drawn to their own
 * canvas, and that is a rewiring of every drawer that makes light; pulling
 * the bright part back out of the finished frame is how bloom is ordinarily
 * done, and it costs the renderer nothing but one call at the end
 * (`packages/render/src/frame-post.ts`). What it gives up is the choice: a
 * pale body is as bright as a lamp to a threshold.
 *
 * The program and its textures are `bloom-program.ts`. `SPREADS` widens the
 * step between samples, which at a quarter of the frame's size is
 * wider on the screen than it reads here.
 *
 * **Anything that is not a real browser gets nothing.** No `document`, a
 * context without `createShader` — the frame tests' stub hands its 2D context
 * to every `getContext` — a shader that will not compile, or a context the
 * phone has taken back: the pass is a no-op, and the frame is the game's.
 */

import { link, type Target, target, texture } from "./bloom-program.js";

/** How many times smaller than the frame the blur runs, on each side. */
const DOWNSCALE = 4;
/** The channel value (0..1) above which a pixel starts to bloom. */
const THRESHOLD = 0.25;
/** How much of the blurred light goes back over the frame. */
const STRENGTH = 1;
/** The step between blur samples, in texels of the small canvas, for each
 * round of the blur: a second, wider round rather than one wide one, whose
 * taps would stand apart and show as a grain. */
const SPREADS = [1, 2.5] as const;

interface Pass {
  readonly gl: WebGLRenderingContext;
  readonly out: HTMLCanvasElement;
  readonly small: HTMLCanvasElement;
  readonly smallCtx: CanvasRenderingContext2D;
  readonly program: WebGLProgram;
  readonly source: WebGLTexture;
  /** Two textures to draw into, turn about. */
  readonly targets: readonly [Target, Target];
  readonly step: WebGLUniformLocation | null;
  readonly cut: WebGLUniformLocation | null;
  w: number;
  h: number;
}

/** One pass per canvas drawn on, and `null` for one that cannot have it. */
const passes = new WeakMap<HTMLCanvasElement, Pass | null>();

export function bloomAfter(ctx: CanvasRenderingContext2D): void {
  const canvas = ctx.canvas;
  if (typeof document === "undefined" || !canvas || canvas.width < 1) return;
  let pass = passes.get(canvas);
  if (pass === undefined) {
    pass = build();
    passes.set(canvas, pass);
  }
  if (!pass) return;
  if (pass.gl.isContextLost()) {
    // Asked again next frame, on a fresh canvas: the phone may give one back.
    passes.delete(canvas);
    return;
  }
  const w = Math.max(1, Math.ceil(canvas.width / DOWNSCALE));
  const h = Math.max(1, Math.ceil(canvas.height / DOWNSCALE));
  if (w !== pass.w || h !== pass.h) size(pass, w, h);
  pass.smallCtx.drawImage(canvas, 0, 0, w, h);
  blur(pass);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = STRENGTH;
  ctx.drawImage(pass.out, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

function build(): Pass | null {
  const out = document.createElement("canvas");
  const small = document.createElement("canvas");
  const got = out.getContext("webgl", { alpha: false, antialias: false, depth: false });
  const smallCtx = small.getContext("2d");
  // The frame tests' stub answers every `getContext` with its 2D context.
  if (!got || typeof (got as WebGLRenderingContext).createShader !== "function" || !smallCtx) {
    return null;
  }
  const gl = got as WebGLRenderingContext;
  const program = link(gl, THRESHOLD);
  const source = texture(gl);
  const a = target(gl);
  const b = target(gl);
  const quad = gl.createBuffer();
  if (!program || !source || !a || !b || !quad) return null;
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, "a_pos");
  gl.enableVertexAttribArray(at);
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  gl.uniform1i(gl.getUniformLocation(program, "u_src"), 0);
  // The small canvas is top row first; GL reads bottom row first.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const step = gl.getUniformLocation(program, "u_step");
  const cut = gl.getUniformLocation(program, "u_cut");
  return { gl, out, small, smallCtx, program, source, targets: [a, b], step, cut, w: 0, h: 0 };
}

function size(pass: Pass, w: number, h: number): void {
  const { gl } = pass;
  pass.small.width = w;
  pass.small.height = h;
  pass.out.width = w;
  pass.out.height = h;
  for (const t of pass.targets) {
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.tex, 0);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  pass.w = w;
  pass.h = h;
}

/**
 * Each round blurs across into the first target and down into the second;
 * the first round reads the frame and keeps only its bright part, and the
 * last one draws down onto the WebGL canvas instead.
 */
function blur(pass: Pass): void {
  const { gl, w, h } = pass;
  const [a, b] = pass.targets;
  gl.viewport(0, 0, w, h);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, pass.source);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, pass.small);
  SPREADS.forEach((spread, round) => {
    if (round > 0) gl.bindTexture(gl.TEXTURE_2D, b.tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, a.fbo);
    gl.uniform2f(pass.step, spread / w, 0);
    gl.uniform1f(pass.cut, round === 0 ? 1 : 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.bindTexture(gl.TEXTURE_2D, a.tex);
    gl.bindFramebuffer(gl.FRAMEBUFFER, round === SPREADS.length - 1 ? null : b.fbo);
    gl.uniform2f(pass.step, 0, spread / h);
    gl.uniform1f(pass.cut, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  });
}
