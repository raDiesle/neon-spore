import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { type GlanceSize, glanceOf, sway } from "./glance-styles.js";

/** How far the core's sides open and close, in its radius, and how far it rolls. */
export const CURTAIN_GLANCE_SIZE: GlanceSize = { reach: 0.36, cock: 0.16, tilt: 0.45 };

/**
 * **THE CURTAIN's core glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * The cloth is a sheet on a rail, and its beads are each held over the column
 * a shot breaks them from, so neither turns. The living thing is the core
 * behind it (`curtain-sheet.ts`), and once it is bare it is what turns:
 * **about its own centre** (`glance.ts`, a `hold` of 0), which is where a bolt
 * meets it (`curtain-stop.ts`), its near side swelling and its far side
 * narrowing into the dark — a thing behind a curtain turning to see who has
 * pulled it aside. Covered, it is a shadow, and a shadow has no side to show.
 *
 * Taken off VERSUS `curtain:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: SWAY, one slow sine, as a thing that hangs
 * or flows swings (`glance-styles.ts`), at `CURTAIN_GLANCE_SIZE`, in the
 * core's radius.
 */
export const CURTAIN_GLANCE: Glance = glanceOf(sway, CURTAIN_GLANCE_SIZE);

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.6;

/**
 * The bare core as `draw` draws it about `at` (`r` its radius), turned as
 * `CURTAIN_GLANCE` says at `time` seconds. `draw` answers with its outline,
 * which the far side's dark is laid over. Still, it is drawn once and exactly
 * as before.
 */
export function drawCurtainCoreGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(CURTAIN_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: CURTAIN_GLANCE_SIZE.reach, reach: 2 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
