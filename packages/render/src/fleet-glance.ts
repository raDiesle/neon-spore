import { hullOutline } from "./fleet-hull-body.js";
import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far a hull's middle swings, in halves of its length, and how far it rolls. */
export const FLEET_GLANCE_SIZE: GlanceSize = { reach: 0.14, cock: 0.04, tilt: 0.25 };

/**
 * **THE FLEET's hulls glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * A ship is a made thing, so the whole hull turns: drawn in its own frame
 * (`fleet-hull-body.ts`, along `+x` toward the bow), its middle swings toward
 * the bow or the stern, the end it turns toward opens and the other closes
 * and goes dark. **What is held is the two ends** (`glance.ts`, a `hold` of
 * 1): the bow stays on its first square and the transom on its last, so the
 * length the pilot counts out loud is the same length, and a scar — drawn
 * after, on the square the simulation struck (`fleet-hulls.ts` `drawScars`) — stays
 * where it was while the seams round it slide by a fraction of a square.
 *
 * Each hull runs the same round from its own place in it, so a chart of five
 * does not turn as one.
 *
 * Taken off VERSUS `fleet:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `FLEET_GLANCE_SIZE`, in halves of a hull's length —
 * small, because a long hull's half is two squares and more.
 */
export const FLEET_GLANCE: Glance = glanceOf(cock, FLEET_GLANCE_SIZE);

/** How dark the far end goes, reached at the widest swing. */
const FAR_DARK = 0.6;
/** Seconds apart in the round one hull is from the next. */
const STAGGER = 1.7;

/**
 * One hull as `draw` paints it about the origin of its own frame, `long` its
 * half-length, turned as `FLEET_GLANCE` says at `time` from hull `at`'s place
 * in the round. Still, it is painted once and exactly as before.
 */
export function drawFleetGlanced(
  ctx: CanvasRenderingContext2D,
  hull: { long: number; across: number; nose: number },
  at: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => void,
): void {
  const { long, across, nose } = hull;
  const f = glanceFrame(FLEET_GLANCE, time + at * STAGGER, { x: 0, y: 0, r: long, hold: 1 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: FLEET_GLANCE_SIZE.reach, reach: 1.3 }, (g) => {
    draw(g);
    const shape = new Path2D();
    hullOutline(shape, long, across, nose);
    return [shape];
  });
}
