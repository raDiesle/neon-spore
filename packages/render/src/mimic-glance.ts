import { type Glance, glancedPoint, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";
import type { MimicPose, Point } from "./mimic-shape.js";

/**
 * **THE MIMIC glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn*, one entry per boss.
 *
 * The mantle is the part that turns: its skin, its mottle, its arms and the
 * rim of marks round its edge yaw together **about its middle** (`glance.ts`,
 * a `hold` of 0), on top of its own roll to turn a face, the near side
 * opening and the far side closing into the dark; split, each half turns
 * about the same middle inside its own cut. The crane's arms and grips, the
 * reaching arm, the core and the board stay where they hang, and nothing a
 * thumb meets is on the mantle: a press is a square of the board
 * (`mimic-tap.ts`). The crane's arms leave the mantle where the turn carries
 * their roots (`mimicGlancedPoint`), so they come out from under it still.
 *
 * Shipped, it does not glance: `MIMIC_GLANCE` is still, and VERSUS
 * `mimic:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `MIMIC_GLANCE_SIZE`, counted in the mantle's radius.
 */
export const MIMIC_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the mantle turns, in its radius, and how far it rolls — a soft body's, as THE NETTLE's bell. */
export const MIMIC_GLANCE_SIZE: GlanceSize = { reach: 0.28, cock: 0.08, tilt: 0.3 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in the mantle's radii: its arms stand out past it. */
const REACH = 2.2;

/** The mantle's turn at `time`, about its middle. */
const frameAt = (p: MimicPose, time: number) =>
  glanceFrame(MIMIC_GLANCE, time, { x: p.x, y: p.y, r: p.r, hold: 0 });

/**
 * The mantle as `draw` draws it, turned about its middle as `MIMIC_GLANCE`
 * says. `draw` answers with the outlines the far side's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawMimicGlanced(
  ctx: CanvasRenderingContext2D,
  p: MimicPose,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(p, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: MIMIC_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the mantle's turn carries a point `pt` of it — an arm's root. */
export function mimicGlancedPoint(p: MimicPose, time: number, pt: Point): Point {
  const f = frameAt(p, time);
  return glanceStill(f) ? pt : glancedPoint(f, pt);
}
