import type { Layout } from "../../../../../packages/render/src/layout.js";
import { drawFuse } from "../../../../../packages/render/src/slow-fuse.js";
import { type Aim, aim, ramp } from "../../../../../packages/render/src/slow-intake-aim.js";
import type { SlowLook, SlowWindow } from "../../../../../packages/render/src/slow-look.js";
import { drawPrism } from "../../../../../packages/render/src/slow-prism.js";

/**
 * **What every kept `slow:light` answer draws round its light**: the prism
 * under it and the fuse over it — the game's own window (`slow-intake.ts`)
 * with one light swapped in.
 *
 * The owner took PRISM on 26 September 2026 on top of the streams, had the
 * light argued again in VERSUS the same day, and took CRAWL. The streams and
 * the answers that lost were kept here, on GRAPHICS → EFFECTS, as a library
 * for boss effects to come — each drawn the way it was judged, round THE SLOW.
 */

/** One answer's light: where the boss is, how far up the look stands, and the window. */
export type Light = (
  ctx: CanvasRenderingContext2D,
  l: Layout,
  at: Aim,
  up: number,
  win: SlowWindow,
) => void;

/** The shipped window with `light` where CRAWL is. */
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
