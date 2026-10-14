import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { type Dial, spindleAt } from "./governor-shape.js";
import type { Layout } from "./layout.js";

/** How far the works turn, in `WORKS_R`, and how far they roll — a machine's, as THE PLUMB's. */
export const GOVERNOR_GLANCE_SIZE: GlanceSize = { reach: 0.3, cock: 0.04, tilt: 0.2 };

/**
 * **THE GOVERNOR glances** — the owner, 9 and 10 October 2026: *... or if
 * mechanical the full boss shape*, one entry per boss.
 *
 * The works are the part that turns: the spindle standing behind the dial,
 * its casing and crown, the drum and the yoke at its foot and the two
 * flyweights yaw together **about the spindle** (`glance.ts`, a `hold` of 0),
 * pivoting on its foot so a roll tips the tower rather than sliding it, the
 * near side opening and the far one closing into the dark. The dial — the
 * track, the marks a thumb taps as the needle crosses, the needle, the tip
 * and the gap a bolt goes up through — lies flat under it and does not move,
 * so nothing a thumb or a bolt meets is turned.
 *
 * Taken off VERSUS `governor:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `GOVERNOR_GLANCE_SIZE`, counted in `WORKS_R`.
 */
export const GOVERNOR_GLANCE: Glance = glanceOf(cock, GOVERNOR_GLANCE_SIZE);

/** The works' half-width the turn is counted in, in tiles: about as far as a flyweight's arm reaches out. */
const WORKS_R = 1.9;
/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** How far the layer reaches from the foot, in `WORKS_R`: up past the crown on the spindle's head. */
const REACH = 3;

/**
 * The works as `draw` draws them, turned about the spindle's foot as
 * `GOVERNOR_GLANCE` says. `draw` answers with the outlines the far side's
 * dark is laid over. Still, they are drawn once and exactly as before.
 */
export function drawGovernorGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  d: Dial,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const foot = spindleAt(l, d, 0);
  const f = glanceFrame(GOVERNOR_GLANCE, time, { ...foot, r: WORKS_R * l.tile, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(
    ctx,
    f,
    { dark: FAR_DARK, full: GOVERNOR_GLANCE_SIZE.reach, reach: REACH },
    draw,
  );
}
