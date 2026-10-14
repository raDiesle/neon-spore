import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE HIVE's lobes glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE HIVE is a mass the width of the field, and a mass that wide turning
 * would slide across every column a shot is aimed up. What turns is each
 * lobe hung from its underside (`hive-sites.ts`), like a drop on a thread,
 * **about the point it hangs from** (`glance.ts`, a `hold` of 0): the near
 * side swells, the far side narrows and goes dark, and a roll swings its tip
 * about where it meets the mass, so no lobe ever comes off it. The site's
 * centre — where a grip's ring and a breach's socket are found — stays on the
 * axis the lobe turns about.
 *
 * Each lobe runs the round from its own place in it, by its site, so a row of
 * them does not turn as one.
 *
 * Shipped, they do not glance: `HIVE_GLANCE` is still, and VERSUS
 * `hive:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `HIVE_GLANCE_SIZE`, in the lobe's half-width.
 */
export const HIVE_GLANCE: Glance = { ...STILL_GLANCE };

/** How far a lobe's sides open and close, in its half-width, and how far it rolls. */
export const HIVE_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.12, tilt: 0.35 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;
/** Seconds apart in the round one lobe is from the next. */
const STAGGER = 1.3;

/**
 * A lobe as `draw` draws it hung from `c` (`r` its half-width, in the frame
 * `draw` is called in), turned as `HIVE_GLANCE` says at `time` from site
 * `i`'s place in the round. `draw` answers with the lobe's outline, which the
 * far side's dark is laid over. Still, it is drawn once and exactly as before.
 */
export function drawHiveGlanced(
  ctx: CanvasRenderingContext2D,
  c: { x: number; y: number; r: number },
  i: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(HIVE_GLANCE, time + i * STAGGER, { ...c, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: HIVE_GLANCE_SIZE.reach, reach: 5 }, (g) => [
    draw(g),
  ]);
}
