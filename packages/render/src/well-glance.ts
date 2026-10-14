import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";

/** How far a body's sides open and close, in its half-width, and how far it rolls. */
export const WELL_GLANCE_SIZE: GlanceSize = { reach: 0.28, cock: 0.12, tilt: 0.45 };

/**
 * **THE WELL's bodies glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE WELL has no body: it is the field turned inside out, and what stands on
 * it is the wave its author wrote (`well-draw.ts`). So what turns is each of
 * those bodies, on its hour of the clock, **about its centre** (`glance.ts`, a
 * `hold` of 0) — the centre is where a grip's ring, a lock's frame and a
 * caption find it (`wellBodyAt`), so all of them stay on it. The near side
 * swells, the far side narrows and goes dark. The dark is laid over a disc
 * inside the body rather than its contour, because the bodies are every kind
 * the field has; a disc a little smaller than any of them never reaches past
 * one's edge.
 *
 * Each body runs the round from its own place in it, by its id, so a clock
 * of them does not turn as one.
 *
 * Taken off VERSUS `well:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `WELL_GLANCE_SIZE`, in the body's own half-width.
 */
export const WELL_GLANCE: Glance = glanceOf(cock, WELL_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** Seconds apart in the round one body is from the next. */
const STAGGER = 1.1;
/** The dark disc's radius, as a share of the half-width: inside every body's edge. */
const DISC = 0.75;

/**
 * A body as `draw` draws it about `x`,`y` (`r` its half-width, in the frame
 * `draw` is called in), turned as `WELL_GLANCE` says at `time` from body
 * `id`'s place in the round. Still, it is drawn once and exactly as before.
 */
export function drawWellGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  id: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => void,
): void {
  const f = glanceFrame(WELL_GLANCE, time + (id % 11) * STAGGER, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: WELL_GLANCE_SIZE.reach, reach: 2.4 }, (g) => {
    draw(g);
    const disc = new Path2D();
    disc.arc(at.x, at.y, at.r * DISC, 0, Math.PI * 2);
    return [disc];
  });
}
