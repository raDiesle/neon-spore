import type { Point } from "@neon-spore/content";
import { PALETTE } from "@neon-spore/render";
import { drawWayArrow } from "../../../../packages/render/src/way-arrow.js";
import { clamp01, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **The way to pull, inside a GOO drop** — the loudest thing on it: dark
 * under, neon round, near-white on top, THE INSTAR's arrow (`way-arrow.ts`).
 *
 * The owner, 11 October 2026: *the arrow must be visible from the very
 * beginning growing and also when disappearing it must be visible to the end
 * shrinking*. So it is sized a little ahead of the drop (`arrowSize`): a
 * speck of a drop already carries an arrow that can be seen, and a drop
 * boiling away carries one to its last frame.
 *
 * And, on UP OR DOWN: *make arrows when they show two positions shorter so
 * they can disconnect before pulling, and when pulling in one direction the
 * arrow grows in the regular single arrow size*. So a pull that may go either
 * way shows two short arrows, each sliding out towards its own end with a gap
 * between them (`split` 1); pulled, the one it goes towards grows into the
 * single arrow and the other shrinks away (`split` towards 0).
 */

/** How long one of the two short arrows is, as a share of the single one, and how far
 * out from the middle it sits. */
const SHORT = 0.4;
const OUT = 0.44;

/** The arrow's radius for a drop grown to `g` of its size: ahead of it while small. */
export function arrowSize(r: number, g: number): number {
  return r * clamp01(g) ** 0.6;
}

/** How far the drop has to go from its start, as a share of the way to an end, before
 * the two arrows of a two-way pull are one. */
const JOINED = 0.16;

/** How much a two-way pull's arrow is still two: 1 at its start, 0 once pulled a way. */
export function splitOf(twoWay: boolean, apart: number): number {
  return twoWay ? 1 - clamp01(Math.abs(apart) / JOINED) : 0;
}

/**
 * The arrow at `at` in a drop of radius `r`, pointing `dx, dy` — the way the
 * pull is going, or for a two-way pull still at rest either of its ways —
 * split into two by `split`.
 */
export function paintArrow(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  a: {
    dx: number;
    dy: number;
    split: number;
    held: boolean;
    time: number;
    alpha?: number;
    /** How far its neon has turned the green of a count, 0..1. */
    green?: number;
  },
): void {
  if (r <= 0.05) return;
  const reach = r * (a.held ? 1.05 : 1.15 + 0.07 * Math.sin(a.time * 6));
  const s = clamp01(a.split);
  const arrows: { x: number; y: number; r: number; dx: number; dy: number }[] = [];
  const main = reach * (1 - (1 - SHORT) * s);
  // Apart, they breathe out towards their ends and back, so the gap between them opens.
  const shift = reach * s * (OUT + 0.07 * Math.sin(a.time * 5));
  arrows.push({ x: at.x + a.dx * shift, y: at.y + a.dy * shift, r: main, dx: a.dx, dy: a.dy });
  if (s > 0.02)
    arrows.push({
      x: at.x - a.dx * shift,
      y: at.y - a.dy * shift,
      r: reach * SHORT * s,
      dx: -a.dx,
      dy: -a.dy,
    });
  const path = (): void => {
    for (const w of arrows) drawWayArrow(ctx, w.x, w.y, w.r, w.dx, w.dy, a.time, 1);
  };
  const alpha = a.alpha ?? 1;
  const neon = mix(style.neon, PALETTE.good, a.green ?? 0);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.globalAlpha = 0.85 * alpha;
  ctx.lineWidth = r * 0.36 * (1 - 0.35 * s);
  path();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = neon;
  ctx.globalAlpha = 0.5 * alpha;
  ctx.lineWidth = r * 0.5 * (1 - 0.5 * s);
  path();
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = mix(neon, "#FFFFFF", 0.7);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = r * 0.17 * (1 - 0.2 * s);
  path();
  ctx.restore();
}
