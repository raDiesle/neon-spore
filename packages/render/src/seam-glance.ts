import { type Glance, glanceFrame, glanceSqueeze, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { seamHalfWidth } from "./seam-shape.js";

/**
 * **THE SEAM glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A shelled ridge, so the whole ridge turns, **about its own spine**
 * (`glance.ts`, a `hold` of 0): the crack runs down the middle column the
 * cannon shoots up, so it stays there while the near flank opens and the far
 * flank closes into the dark. Nothing on the ridge is under a thumb — it is
 * answered with the cannon and the shield — and the grit and the rock are
 * thrown in the field's own frame and do not turn. It turns on top of the
 * story's own turn away (`seam-story.ts`), in the ridge's frame, and a bolt
 * meets each flank as far out as it is drawn (`seamGlanceSqueeze`,
 * `seam-stop.ts`); the roll is too small to move a foot by much and is left
 * out there.
 *
 * Shipped, it does not glance: `SEAM_GLANCE` is still, and VERSUS
 * `seam:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `SEAM_GLANCE_SIZE`, counted in the widest lobe's half-width — small in
 * the roll, because the ridge is more than four times as tall as it is wide.
 */
export const SEAM_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the ridge turns, in its half-width, and how far it rolls. */
export const SEAM_GLANCE_SIZE: GlanceSize = { reach: 0.25, cock: 0.03, tilt: 0.12 };

/** How dark the far flank goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: the ridge is 2.4 tiles either side of its middle. */
const REACH = 3;

/** The ridge's turn at `time`, about its middle, in its own frame. */
const frameAt = (l: Layout, time: number) =>
  glanceFrame(SEAM_GLANCE, time, { x: 0, y: 0, r: seamHalfWidth(l), hold: 0 });

/**
 * The ridge as `draw` draws it about its middle, turned as `SEAM_GLANCE`
 * says. `draw` answers with the outlines the far flank's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawSeamGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: SEAM_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** How far out the turn draws flank `side` of the ridge, as a share of its own width; 1 still. */
export function seamGlanceSqueeze(l: Layout, time: number, side: -1 | 1): number {
  const f = frameAt(l, time);
  return glanceStill(f) ? 1 : glanceSqueeze(f, side);
}
