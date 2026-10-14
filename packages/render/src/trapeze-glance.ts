import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { Point } from "./trapeze-shape.js";

/**
 * **THE TRAPEZE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn, especially the head*, one entry per boss.
 *
 * The alien's head is the part that turns: it yaws **about its own middle**
 * (`glance.ts`, a `hold` of 0) on top of its lag behind the swing, its
 * feelers and both eyes turning with it, the near cheek opening and the far
 * one closing into the dark. It is turned in the seat's own frame, so it
 * faces the gong whichever way the alien sits. The swing, the seat, the
 * torso and the limbs do not move, and nothing a thumb or a bolt meets is on
 * the head alone: the pilot's lock and a bolt both take the circle round the
 * whole alien (`trapezeAlienCircle`, `trapeze-stop.ts`).
 *
 * Shipped, it does not glance: `TRAPEZE_GLANCE` is still, and VERSUS
 * `trapeze:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`),
 * each at `TRAPEZE_GLANCE_SIZE`, counted in the head's radius.
 */
export const TRAPEZE_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the head turns, in its radius, and how far it rolls — a head's cock, as THE INSTAR's. */
export const TRAPEZE_GLANCE_SIZE: GlanceSize = { reach: 0.36, cock: 0.14, tilt: 0.4 };

/** How dark the far cheek goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in head radii: the feelers stand well above it. */
const REACH = 3.2;

/**
 * The head as `draw` draws it at `head`, `r` its radius, turned as
 * `TRAPEZE_GLANCE` says. `draw` answers with the outlines the far cheek's
 * dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawTrapezeGlanced(
  ctx: CanvasRenderingContext2D,
  head: Point,
  r: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(TRAPEZE_GLANCE, time, { x: head.x, y: head.y, r, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: TRAPEZE_GLANCE_SIZE.reach, reach: REACH }, draw);
}
