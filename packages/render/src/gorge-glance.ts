import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far a bubble's sides open and close, in its half-width, and how far it rolls. */
export const GORGE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.1, tilt: 0.3 };

/**
 * **THE GORGE's bubbles glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * The sack already turns in depth, its ends coming forward and going back
 * (`gorge-depth.ts`), and every bubble stays over its column while it does. So
 * what turns here is each bubble hung in it (`gorge-lobe.ts`), with the beads
 * it has swallowed, **about the line up its middle** (`glance.ts`, a `hold` of
 * 0) and rolling about its intake — the mouth under it a shot goes into, which
 * is the one point of it the rule reads, and stays where it is. The near side
 * swells, the far side narrows and goes dark.
 *
 * Each bubble runs the round from its own place in it, so a row of them does
 * not turn as one.
 *
 * Taken off VERSUS `gorge:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `GORGE_GLANCE_SIZE`, in the bubble's half-width.
 */
export const GORGE_GLANCE: Glance = glanceOf(cock, GORGE_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.5;
/** Seconds apart in the round one bubble is from the next. */
const STAGGER = 1.4;

/**
 * A bubble as `draw` draws it over its intake `at` (`r` its half-width),
 * turned as `GORGE_GLANCE` says at `time` from bubble `i`'s place in the
 * round. `draw` answers with the bubble's skin, which the far side's dark is
 * laid over. Still, it is drawn once and exactly as before.
 */
export function drawGorgeGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(GORGE_GLANCE, time + i * STAGGER, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: GORGE_GLANCE_SIZE.reach, reach: 4 }, (g) => [
    draw(g),
  ]);
}
