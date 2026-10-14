import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far the head's sides open and close, in half its width, and how far it rolls. */
export const SPLICE_GLANCE_SIZE: GlanceSize = { reach: 0.26, cock: 0.12, tilt: 0.4 };

/**
 * **THE SPLICE eater's head glances** — the owner, 9 and 10 October 2026:
 * *body parts of living things turn, especially the head*, one entry per boss.
 *
 * The eater is the one living thing in the hold, and its head is the part
 * (`splice-eater-head.ts`): cranium, jaw, eyes and mouth turn together **about
 * the head's centre** (`glance.ts`, a `hold` of 0), which is where the neck
 * meets it, so the head never comes off its neck. The near side swells, the
 * far side narrows into the dark, and the mouth — where the tongue starts —
 * is asked of the same turn (`glancedPoint`), so the tongue leaves the mouth
 * where it is drawn.
 *
 * Taken off VERSUS `splice:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `SPLICE_GLANCE_SIZE`, in half the head's width.
 */
export const SPLICE_GLANCE: Glance = glanceOf(cock, SPLICE_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;

/**
 * The head as `draw` draws it about `h`, `wide` across, turned as
 * `SPLICE_GLANCE` says at `time` seconds. `draw` answers with the mouth and
 * the head's parts, which the far side's dark is laid over; this answers with
 * the mouth where the turn has put it. Still, it is drawn once and exactly as
 * before.
 */
export function drawSpliceHeadGlanced(
  ctx: CanvasRenderingContext2D,
  h: { x: number; y: number },
  wide: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => { x: number; y: number; parts: readonly Path2D[] },
): { x: number; y: number } {
  const f = glanceFrame(SPLICE_GLANCE, time, { ...h, r: wide / 2, hold: 0 });
  if (glanceStill(f)) {
    const m = draw(ctx);
    return { x: m.x, y: m.y };
  }
  let mouth = { x: h.x, y: h.y };
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: SPLICE_GLANCE_SIZE.reach, reach: 1.6 }, (g) => {
    const m = draw(g);
    mouth = { x: m.x, y: m.y };
    return m.parts;
  });
  return glancedPoint(f, mouth);
}
