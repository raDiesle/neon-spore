import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import type { RepriseFrame } from "./reprise-body.js";

/** How far the sac's sides open and close, in its half-width, and how far it rolls. */
export const REPRISE_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.08, tilt: 0.3 };

/**
 * **THE REPRISE's sac glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE REPRISE is a camera grown into a sac, with no head but itself, so what
 * turns is the whole sac and everything drawn into it — the lens, the ring of
 * eggs, the camera's word (`reprise-draw.ts`). It turns **about the line down
 * its middle** (`glance.ts`, a `hold` of 0), so the lens, which is home in the
 * middle whenever an echo plays and is where the navigator's word stands,
 * stays on the axis; and it rolls about the top of the sac, where its two
 * cords take it, so it swings from them rather than off them. The cords are
 * not the sac and do not turn. The near side swells, the far side narrows into
 * the dark.
 *
 * Its skin already carries a turn of its own (`repriseTurn`), which moves the
 * veins round it; a glance turns the picture they are drawn on.
 *
 * Taken off VERSUS `reprise:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `REPRISE_GLANCE_SIZE`, in the sac's
 * half-width.
 */
export const REPRISE_GLANCE: Glance = glanceOf(cock, REPRISE_GLANCE_SIZE, temperOf("reprise"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** Where it rolls about, in its half-heights above its middle: where the cords take it. */
const PIVOT = 0.7;

/**
 * The sac as `draw` draws it in frame `f`, turned as `REPRISE_GLANCE` says
 * at `time` seconds. `draw` answers with the sac's contour, which the far
 * side's dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawRepriseGlanced(
  ctx: CanvasRenderingContext2D,
  f: RepriseFrame,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const at = { x: f.x, y: f.cy - f.ry * PIVOT, r: f.rx, hold: 0 };
  const g = glanceFrame(REPRISE_GLANCE, time, at);
  if (glanceStill(g)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: REPRISE_GLANCE_SIZE.reach, reach: 2 };
  drawGlancedLayer(ctx, g, shade, (c) => [draw(c)]);
}
