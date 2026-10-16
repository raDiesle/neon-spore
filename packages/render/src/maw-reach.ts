import { type Layout, tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * **How far the open maw reaches**: a faint amber light standing on the hull
 * over every column it would take a pod from, while SUCK is open.
 *
 * The owner widened the catch to two columns either side of the cannon on 16
 * October 2026 (`podCatchCols`, `inMawReach`) and asked the same day for the
 * reach to be drawn. It is an addition where the game drew nothing: before
 * this, a pair learnt where the maw stopped by losing a wave to it.
 *
 * Brightest at the cannon and fading outward, so the middle still says where
 * the mouth itself is. Drawn in three stacked steps rather than a gradient: a
 * gradient object per frame while the maw is held is a cost the budget tests
 * would carry for a light this faint.
 */

/** How tall the light stands over the skin, in tiles, at its tallest step. */
const STAND_TILES = 1.5;
/** How bright one step of the cannon's own column is at a fully open maw;
 * three steps stack to about twice this at the skin. The first try, 0.06 a
 * step, could not be seen on a frame at all. */
const PEAK = 0.16;

export function drawMawReach(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  /** The maw's eased openness, 0 to 1 (`HullMood.intake`). */
  intake: number,
  /** The cannon's column as drawn, mid-slide included. */
  at: number,
  /** Columns either side it reaches (`SimConfig.podCatchCols`). */
  reach: number,
  /** The skin's height at a screen x. */
  skinY: (x: number) => number,
): void {
  if (intake <= 0.02 || reach <= 0) return;
  const was = ctx.globalAlpha;
  ctx.fillStyle = PALETTE.pod;
  const w = l.tile * 0.92;
  for (let d = -reach; d <= reach; d++) {
    const col = at + d;
    if (col < -0.5 || col > l.cols - 0.5) continue;
    const x = tileCX(l, col);
    const top = skinY(x);
    const fade = 1 - Math.abs(d) / (reach + 1);
    for (let step = 1; step <= 3; step++) {
      const h = (l.tile * STAND_TILES * step) / 3;
      ctx.globalAlpha = was * intake * PEAK * fade;
      ctx.fillRect(x - w / 2, top - h, w, h);
    }
  }
  // The two edges, a little brighter, because where it stops is the question.
  ctx.globalAlpha = was * intake * 0.85;
  for (const side of [-1, 1]) {
    const col = at + side * (reach + 0.5);
    if (col < -0.5 || col > l.cols - 0.5) continue;
    const x = tileCX(l, col);
    const top = skinY(x);
    const edge = Math.max(2, l.tile * 0.05);
    ctx.fillRect(x - edge / 2, top - l.tile * STAND_TILES, edge, l.tile * STAND_TILES);
  }
  ctx.globalAlpha = was;
}
