import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far a lobe's sides open and close, in its half-width, and how far it rolls. */
export const UNDERTOW_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.08, tilt: 0.2 };

/**
 * **THE UNDERTOW's lobes glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE UNDERTOW is under the floor and all that is seen of it is its lobes, up
 * through the plating (`undertow-lobe.ts`), so each lobe is what turns —
 * **about the line up its middle** (`glance.ts`, a `hold` of 0), rolling about
 * where it leaves the skin, so its foot stays in the opening the plate parted
 * for it. The near side swells, the far side narrows and goes dark. A lobe's
 * answer and its tap are judged by column, and the column is the axis.
 *
 * Each lobe runs the round from its own place in it, by its column, so two
 * standing do not turn as one.
 *
 * Taken off VERSUS `undertow:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: SWAY, one slow sine, as a thing that hangs
 * or flows swings (`glance-styles.ts`), at `UNDERTOW_GLANCE_SIZE`, in the
 * lobe's half-width at the skin.
 */
export const UNDERTOW_GLANCE: Glance = glanceOf(sway, UNDERTOW_GLANCE_SIZE, temperOf("undertow"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** Seconds apart in the round one column's lobe is from the next. */
const STAGGER = 1.7;

/**
 * A lobe as `draw` draws it standing on `root` (`r` its half-width there,
 * `tall` how far it stands above the skin and is buried under it, in the same
 * pixels), turned as `UNDERTOW_GLANCE` says at `time` from column `col`'s place
 * in the round. `draw` answers with the lobe's outline, which the far side's
 * dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawUndertowGlanced(
  ctx: CanvasRenderingContext2D,
  root: { x: number; y: number; r: number },
  tall: number,
  col: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(UNDERTOW_GLANCE, time + col * STAGGER, { ...root, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: UNDERTOW_GLANCE_SIZE.reach, reach: tall / root.r + 1 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
