import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import type { Point } from "./spool-shape.js";

/** How far the far end swings, in the barrel's whole length, and how far it rolls. */
export const SPOOL_GLANCE_SIZE: GlanceSize = { reach: 0.2, cock: 0.05, tilt: 0.1 };

/**
 * **THE SPOOL glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so the full shape turns: casing, winding, ribs and both flanges
 * yaw together **about the brake's flange** (`glance.ts`, a `hold` of 0 at
 * the pivot the barrel already rolls on, `spool-sway.ts`). That is where the
 * shoe bites and the rail and knob a thumb holds stand, so they do not move;
 * the far flange swings away into the dark and back toward the pair, and the
 * line's top is carried with the winding (`spoolGlancedTop`). The slack spool
 * has its own turn, to face the ship, and takes none of this.
 *
 * Taken off VERSUS `spool:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `SPOOL_GLANCE_SIZE`, counted in the whole barrel's
 * length.
 */
export const SPOOL_GLANCE: Glance = glanceOf(cock, SPOOL_GLANCE_SIZE, temperOf("spool"));

/** How dark the far end goes, reached at the widest turn. */
const FAR_DARK = 0.6;

/** The turn about `pivot`, the barrel `length` long, at `time` seconds. */
const frameAt = (pivot: Point, length: number, time: number) =>
  glanceFrame(SPOOL_GLANCE, time, { ...pivot, r: Math.max(1, length), hold: 0 });

/**
 * The body as `draw` draws it, turned about the brake's flange `pivot` as
 * `SPOOL_GLANCE` says. `draw` answers with the outlines the far end's dark is
 * laid over. Still, or `off`, it is drawn once and exactly as before.
 */
export function drawSpoolGlanced(
  ctx: CanvasRenderingContext2D,
  pivot: Point,
  length: number,
  time: number,
  off: boolean,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(pivot, length, time);
  if (off || glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: SPOOL_GLANCE_SIZE.reach, reach: 1.2 };
  drawGlancedLayer(ctx, f, shade, draw);
}

/** Where the turn carries the winding's middle `at`, before the barrel's roll. */
export function spoolGlancedTop(
  pivot: Point,
  length: number,
  time: number,
  off: boolean,
  at: Point,
): Point {
  const f = frameAt(pivot, length, time);
  return off || glanceStill(f) ? at : glancedPoint(f, at);
}
