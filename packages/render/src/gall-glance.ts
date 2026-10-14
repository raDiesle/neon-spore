import { gallSize } from "./gall-shape.js";
import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import type { Layout } from "./layout.js";

/** How far the body turns, in its half-width, and how far it rolls — a creature's cock, as THE THROAT's. */
export const GALL_GLANCE_SIZE: GlanceSize = { reach: 0.36, cock: 0.14, tilt: 0.4 };

/**
 * **THE GALL glances** — the owner, 9 and 10 October 2026: *body parts of
 * living things turn, especially the head*, one entry per boss.
 *
 * The alien is small and all head, so the whole body is the part that turns:
 * it yaws **about its own middle** (`glance.ts`, a `hold` of 0) where it
 * stands on the seam, the lit core inside it, its rim and its flash turning
 * with it, the near flank opening and the far one closing into the dark. The
 * seam, its four points and the knob stay where they are, so nothing a thumb
 * is on moves: a hand is taken in its point's share of the seam
 * (`gall-grip.ts`), and a bolt is stopped by the seam and the core's column
 * (`gall-stop.ts`), never by the body's outline.
 *
 * Taken off VERSUS `gall:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `GALL_GLANCE_SIZE`, counted in the body's
 * half-width.
 */
export const GALL_GLANCE: Glance = glanceOf(cock, GALL_GLANCE_SIZE);

/** How dark the far flank goes, reached at the widest turn. */
const FAR_DARK = 0.6;
/** How far the layer reaches, in half-widths: wound by its taps, the body stands tall, and its rim glows past it. */
const REACH = 3;

/**
 * The body as `draw` draws it about its middle, turned as `GALL_GLANCE`
 * says. `draw` answers with the outlines the far flank's dark is laid over.
 * Still, it is drawn once and exactly as before.
 */
export function drawGallGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  draw: (g: CanvasRenderingContext2D) => readonly Path2D[],
): void {
  const f = glanceFrame(GALL_GLANCE, time, { x: 0, y: 0, r: gallSize(l).rx, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: GALL_GLANCE_SIZE.reach, reach: REACH }, draw);
}
