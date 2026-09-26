import type { Layout } from "../../../../packages/render/src/layout.js";
import { drawFuse } from "../../../../packages/render/src/slow-fuse.js";
import { type Aim, aim, ramp } from "../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook, SlowWindow } from "../../../../packages/render/src/slow-look.js";
import { drawPrism } from "../../../../packages/render/src/slow-prism.js";

/**
 * **What every `slow:light` answer keeps and none of them is about**: the
 * prism under it and the fuse over it.
 *
 * The owner took PRISM on 26 September 2026 *on top of* the streams, and asked
 * in the same breath for the streams themselves to be argued again — light
 * that looks like it is *slowing* round the boss, and one answer shaped like a
 * warp jump run backwards, the boss arriving out of it. So every candidate
 * here swaps the streams and nothing else, and the pair is a vote on the light
 * alone (`tools/versus/DECIDED.md`, `slow:pull`).
 */

/** One answer's light: where the boss is, how far up the look stands, and the window. */
export type Light = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  up: number,
  win: SlowWindow,
) => void;

/** The shipped window with `light` where the streams were. */
export function withLight(light: Light): SlowLook["paint"] {
  return (ctx, l, world, view, win) => {
    const at = aim(world, l, world.beat, view.beatPhase);
    const up = ramp(win, world.cfg);
    if (up > 0) {
      drawPrism(ctx, l, at, up, win);
      light(ctx, l, at, up, win);
    }
    drawFuse(ctx, l, win);
  };
}

/** From the boss to the furthest corner of the field above the hull, in layout pixels. */
export function reach(l: Layout, at: Aim): number {
  return Math.hypot(Math.max(at.x, l.width - at.x), Math.max(at.y, l.hullY - at.y));
}

/** Beats the window has run, fractional. */
export function spent(win: SlowWindow): number {
  return win.beats - win.left;
}

/** Widths and strengths of the passes a line of light is stroked in, widest first. */
const GLOW = [
  [5, 0.05],
  [2.4, 0.14],
  [1, 1],
] as const;

/**
 * The current path stroked as light: two wide faint passes under the line
 * itself, so it has a falloff instead of the hard edge of one fat stroke.
 */
export function glowStroke(ctx: CanvasRenderingContext2D, width: number): void {
  const alpha = ctx.globalAlpha;
  for (const [wide, strength] of GLOW) {
    ctx.globalAlpha = alpha * strength;
    ctx.lineWidth = width * wide;
    ctx.stroke();
  }
  ctx.globalAlpha = alpha;
}
