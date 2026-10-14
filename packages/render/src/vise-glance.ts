import { type Glance, glancedPoint, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { Layout } from "./layout.js";
import { type Point, viseRadius } from "./vise-shape.js";

/**
 * **THE VISE glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A dry seed-case, so the full case turns: the hollow, the kernel in it, both
 * lobes with their seams and the spine between them yaw together **about the
 * spine** (`glance.ts`, a `hold` of 0), on top of the swing from its hinge
 * (`vise-sway.ts`). The spine stays on the middle column the kernel is shot
 * up; the near lobe opens and the far one closes into the dark. A lobe is
 * carried shut by a drag anywhere on its seat's side of the screen
 * (`vise-grip.ts`), so nothing a thumb is on moves. The bite's bar and the
 * spat seed are thrown at the hull and do not turn, and a bolt meets each
 * lobe where the turn draws it (`viseGlancedPoint`, `vise-stop.ts`).
 *
 * Shipped, it does not glance: `VISE_GLANCE` is still, and VERSUS
 * `vise:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `VISE_GLANCE_SIZE`, counted in the case's half-width — a large share,
 * because the case is barely more than two tiles across.
 */
export const VISE_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the case turns, in its half-width, and how far it rolls. */
export const VISE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.05, tilt: 0.25 };

/** How dark the far lobe goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: the case is taller than wide, and a lobe swings out. */
const REACH = 2.4;

/** The case's turn at `time`, about its spine, in its own frame. */
const frameAt = (l: Layout, time: number) =>
  glanceFrame(VISE_GLANCE, time, { x: 0, y: 0, r: viseRadius(l).rx, hold: 0 });

/**
 * The case as `draw` draws it about its middle, turned as `VISE_GLANCE`
 * says. `draw` answers with the outlines the far lobe's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawViseGlanced(
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
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: VISE_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the case's turn carries a point `p` of it, about its middle — a bolt's stop. */
export function viseGlancedPoint(l: Layout, time: number, p: Point): Point {
  const f = frameAt(l, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
