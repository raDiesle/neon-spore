import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE CAIRN's pile glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * A pile of rocks has no head, so the whole stack turns (`cairn-look.ts`'s
 * pile, its stones and its outline). It turns with **its two outer edges
 * held** (`glance.ts`, a `hold` of 1): the stones at either end stay over the
 * columns a pull drags them out of, while the middle swings toward one side,
 * that side's stones opening and the far side's closing into the dark. The
 * hand on the pile, the lane mark and the verdict are drawn after it and do
 * not turn; the stones under them move by a fraction of a tile at most.
 *
 * Shipped, it does not glance: `CAIRN_GLANCE` is still, and VERSUS
 * `cairn:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `CAIRN_GLANCE_SIZE`, in halves of the pile's width.
 */
export const CAIRN_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the pile's middle swings, in halves of its width, and how far it rolls. */
export const CAIRN_GLANCE_SIZE: GlanceSize = { reach: 0.14, cock: 0.05, tilt: 0.3 };

/** How dark the far side goes, reached at the widest swing. */
const FAR_DARK = 0.6;

/**
 * The pile as `draw` draws it about `x`,`y` (`r` half its width), turned as
 * `CAIRN_GLANCE` says at `time`; `outline` is the pile's outline, which the
 * far side's dark is laid over, asked for only while it turns. Still, it is
 * drawn once and exactly as before.
 */
export function drawCairnGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  draw: (g: CanvasRenderingContext2D) => void,
  outline: () => Path2D,
): void {
  const f = glanceFrame(CAIRN_GLANCE, time, { ...at, hold: 1 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: CAIRN_GLANCE_SIZE.reach, reach: 1.4 }, (g) => {
    draw(g);
    return [outline()];
  });
}
