import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { LatchBody } from "./latch-shape.js";

/** How far the colony turns, in its half-width, and how far it rolls — a creature's cock, as THE GALL's. */
export const LATCH_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.1, tilt: 0.35 };

/**
 * **THE LATCH glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn, especially the head*, one entry per boss.
 *
 * The colony is the slime's whole head, so the colony is the part that turns:
 * it yaws **about its core** (`glance.ts`, a `hold` of 0), every body on the
 * skin and its nucleus turning with it, the near bodies opening and the far
 * ones closing into the dark. The tendril, its knots and coil, and both grips
 * stay where they are, so nothing a thumb is on moves: a grip is a circle a
 * column either side of the rope (`latch-grip.ts`), and the blow leaves from
 * the colony at rest (`latch-blow.ts`), never from the turned skin.
 *
 * Taken off VERSUS `latch:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `LATCH_GLANCE_SIZE`, counted in the colony's
 * half-width.
 */
export const LATCH_GLANCE: Glance = glanceOf(cock, LATCH_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: the skin's outline and its flush stand just past the bodies. */
const REACH = 1.6;

/**
 * The colony as `draw` draws `bodies`, turned as `LATCH_GLANCE` says about
 * the core, the first of them. `draw` answers with the outlines the far
 * side's dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawLatchGlanced(
  ctx: CanvasRenderingContext2D,
  bodies: readonly LatchBody[],
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const core = bodies[0];
  if (core === undefined) {
    draw(ctx);
    return;
  }
  const r = Math.max(...bodies.map((b) => Math.hypot(b.x - core.x, b.y - core.y) + b.r));
  const f = glanceFrame(LATCH_GLANCE, time, { x: core.x, y: core.y, r, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: LATCH_GLANCE_SIZE.reach, reach: REACH }, draw);
}
