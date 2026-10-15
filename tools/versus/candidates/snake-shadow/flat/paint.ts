import type { Arena } from "../../../../../packages/render/src/snake-draw.js";

/**
 * **The floor shadow with no blur**: the shape filled dark and offset, under
 * three widened faint strokes of its own path — the way `strokeGlow` fakes a
 * glow out of passes rather than a filter (`glow.ts`). What ships is
 * `shadowBlur` a fifth of a tile wide, which the canvas has to blur on every
 * fill that casts one; this is four plain passes.
 *
 * Every size is the shipped one in the same units: the canvas lays a shadow
 * in its own pixels under no transform, so this one is offset in those pixels
 * too, and its strokes are widened by as many of them as the blur spread. The
 * same offset, the same dark, the same reach — only how the edge falls off
 * differs.
 */

/** The shipped offset, down and right, in a tile's canvas pixels. */
const OFFSET_X = 0.08;
const OFFSET_Y = 0.12;
/** The shipped blur's width, in a tile's canvas pixels: the widest stroke reaches that far out. */
const BLUR = 0.22;
/** Each stroke's width over the blur's, widest first, and how dark it lays. */
const FALLOFF: readonly (readonly [number, number])[] = [
  [2, 0.1],
  [1.2, 0.12],
  [0.5, 0.15],
];
/** How dark the shadow is under the shape itself, over the strokes. */
const CORE = 0.4;

export function paintFlat(
  ctx: CanvasRenderingContext2D,
  arena: Arena,
  path: Path2D,
  fill: string | CanvasGradient,
): void {
  const m = ctx.getTransform();
  const scale = Math.hypot(m.a, m.b) || 1;
  const fade = ctx.globalAlpha;
  ctx.save();
  ctx.setTransform(m.a, m.b, m.c, m.d, m.e + arena.tile * OFFSET_X, m.f + arena.tile * OFFSET_Y);
  ctx.strokeStyle = "#000";
  ctx.fillStyle = "#000";
  ctx.lineJoin = "round";
  for (const [wide, dark] of FALLOFF) {
    ctx.globalAlpha = fade * dark;
    ctx.lineWidth = (arena.tile * BLUR * wide) / scale;
    ctx.stroke(path);
  }
  ctx.globalAlpha = fade * CORE;
  ctx.fill(path);
  ctx.restore();
  ctx.fillStyle = fill;
  ctx.fill(path);
}
