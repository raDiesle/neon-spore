import type { Point } from "@neon-spore/content";
import { capstanFaceAt, capstanSize } from "./capstan-shape.js";
import { type Glance, glancedPoint, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { Layout } from "./layout.js";

/** How far the drum's middle swings, in its half-length, and how far it rolls. */
export const CAPSTAN_GLANCE_SIZE: GlanceSize = { reach: 0.13, cock: 0.04, tilt: 0.2 };

/**
 * **THE CAPSTAN glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn ... or if mechanical the full boss shape*, one entry per
 * boss.
 *
 * A machine, so the drum turns whole: the body, both end faces and the core
 * between them yaw together, on top of the yaw its cradle's roll already
 * gives it (`capstan-shape.ts`). The two faces are what a rubbing thumb is
 * on, read where they stand with no clock (`capstan-grip.ts`), so they are
 * **held** (`glance.ts`, THE VALVE's way): each sits where the drum's length
 * puts it, and the half of the drum round each is squeezed about it, so
 * neither moves while the middle swings toward the near end and the far
 * half closes into the dark. The cradle and its horns stand under the drum
 * and do not turn, and a bolt meets the drum where it is drawn
 * (`capstanGlancedPoint`, `capstan-stop.ts`).
 *
 * Taken off VERSUS `capstan:glance` on 14 October 2026, the owner leaving
 * SWAY, LOOK or COCK to each boss: COCK, the turn he found the most
 * real (`glance-styles.ts`), at `CAPSTAN_GLANCE_SIZE`, counted in the drum's
 * half-length as drawn — no more than the core's own radius at the drum's
 * longest, because the core rides the middle as it swings and a bolt up the
 * middle column must still meet it. With the faces held so near the ends the
 * outline hardly changes: what is seen is the near face swelling, the far face
 * shrinking into the dark, and everything between them carried toward the near
 * end. A turn about the middle that let the faces travel would need the hit
 * test to read the same clock, and `Field` carries none.
 */
export const CAPSTAN_GLANCE: Glance = glanceOf(cock, CAPSTAN_GLANCE_SIZE);

/** How dark the far half goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-lengths: the near half grows past its own, and a face stands proud of the end. */
const REACH = 1.8;

/** The drum's turn at `time`, `squeeze` of its length showing, held at its two faces. */
function frameAt(l: Layout, squeeze: number, time: number) {
  const r = capstanSize(l).rx * squeeze;
  const hold = capstanFaceAt(l, 1, squeeze).x / r;
  return glanceFrame(CAPSTAN_GLANCE, time, { x: 0, y: 0, r, hold });
}

/**
 * The drum as `draw` draws it about its middle, `squeeze` of its length
 * showing, turned as `CAPSTAN_GLANCE` says. `draw` answers with the outlines
 * the far half's dark is laid over. Still, it is drawn once and exactly as
 * before.
 */
export function drawCapstanGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  squeeze: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = frameAt(l, squeeze, time);
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: CAPSTAN_GLANCE_SIZE.reach, reach: REACH }, draw);
}

/** Where the drum's turn carries a point `p` of it, about its middle — a bolt's stop. */
export function capstanGlancedPoint(l: Layout, squeeze: number, time: number, p: Point): Point {
  const f = frameAt(l, squeeze, time);
  return glanceStill(f) ? p : glancedPoint(f, p);
}
