import type { Color } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { viseKernel, viseKernelPath, viseSeamPath } from "./vise-shape.js";

/**
 * **THE VISE's marks**: the two things that say what a step asks — the lit
 * seam, which is *pinch this lobe shut*, and the lit kernel, which is *shoot
 * here, in this colour*. Cut from `vise-draw.ts` the day it was written, along
 * the line its second half will grow on — the cue words and the crack's thud
 * come here.
 */

/** A step's colour on the canvas: its cannon's, or white for a step either answers (§28, *Colour*). */
export function viseColour(color: Color | "either"): { body: string; rim: string } {
  if (color === "either") return { body: PALETTE.hullRim, rim: PALETTE.hullRim };
  return { body: PALETTE[color], rim: color === "red" ? PALETTE.redRim : PALETTE.cyanRim };
}

/**
 * The lit seam, drawn in the lobe's own frame: the whole run of it glowing
 * white — a pinch is one seat's, but neither colour is its answer — and the
 * crack already spread down it by the share held, in the paler dry white the
 * cracks are drawn in.
 */
export function drawViseLitSeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  side: 0 | 1,
  seam: number,
  held: number,
  beatPhase: number,
): void {
  const pulse = 0.8 + 0.2 * Math.cos(beatPhase * Math.PI * 2);
  strokeGlow(ctx, viseSeamPath(l, side, seam), PALETTE.hullRim, STROKE.outline, pulse, 0.7);
  if (held <= 0) return;
  ctx.lineWidth = STROKE.outline * 1.4;
  ctx.strokeStyle = rgba(PALETTE.viseCrack, 0.95);
  ctx.stroke(viseSeamPath(l, side, seam, held));
}

/**
 * The kernel in its hollow: dull brown between fire steps, in shadow while
 * the lobes are over it and catching the light once they stand open off it;
 * lit in the step's colour while one is owed, brighter for every hit it has taken, with a ring
 * round it closing as the step's beats run out.
 */
export function drawViseKernel(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  size: number,
  bright: number,
  bare: boolean,
  lit: { color: Color | "either"; left: number } | null,
  beatPhase: number,
): void {
  const core = viseKernelPath(l, size);
  if (lit === null) {
    ctx.fillStyle = rgba(PALETTE.viseCase, bare ? 0.75 : 0.35);
    ctx.fill(core);
    ctx.lineWidth = STROKE.inner;
    ctx.strokeStyle = rgba(PALETTE.viseCaseDark, 0.9);
    ctx.stroke(core);
    return;
  }
  const { body, rim } = viseColour(lit.color);
  ctx.fillStyle = rgba(body, bright * (0.75 + 0.25 * Math.cos(beatPhase * Math.PI * 2)));
  ctx.fill(core);
  strokeGlow(ctx, core, rim, STROKE.inner, 0.8 + bright);
  const k = viseKernel(l);
  const ring = new Path2D();
  ring.arc(k.x, k.y, k.r * 1.45, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * lit.left);
  strokeGlow(ctx, ring, body, STROKE.outline, 1);
}
