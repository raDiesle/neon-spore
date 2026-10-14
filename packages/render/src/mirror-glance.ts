import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";
import type { Layout } from "./layout.js";

/** How far the chamber's middle swings, in half-widths of the field, and how far it rolls. */
export const MIRROR_GLANCE_SIZE: GlanceSize = { reach: 0.26, cock: 0.03, tilt: 0.1 };

/**
 * **THE MIRROR's insides glance** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * Its hull cannot be the part. The whole claim of this boss is *an exact copy
 * of your ship* (`mirror.ts`), drawn by the ship's own function under a flip,
 * and its two lobes are what a thumb is on (`mirror-grip.ts`) over columns the
 * simulation reads. So the hull stays your ship to the pixel, and what turns
 * is the chamber behind it (`mirror-chamber.ts`): the flesh, the ribs and the
 * slime hanging up into the top of the screen swing their middle toward one
 * side, that half squeezing into the dark and the other opening, as though
 * the copy were turning its belly to look at you. The two screen edges are
 * held, so the chamber never comes away from them.
 *
 * Taken off VERSUS `mirror:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `MIRROR_GLANCE_SIZE`, in half-widths of the field.
 */
export const MIRROR_GLANCE: Glance = glanceOf(cock, MIRROR_GLANCE_SIZE, temperOf("mirror"));

/** How dark the far half goes at the screen's edge, reached at the widest swing. */
const FAR_DARK = 0.6;

/**
 * The chamber as `draw` draws it in the mirror's own flipped layout `l`,
 * turned as `MIRROR_GLANCE` says at `time` about the middle of its band.
 * `draw` answers with the chamber's outline, which the far half's dark is laid
 * over. Still, it is drawn once and exactly as before.
 */
export function drawMirrorGlanced(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const r = l.width / 2;
  const y = l.bandTop + l.bandHeight / 2;
  const f = glanceFrame(MIRROR_GLANCE, time, { x: r, y, r, hold: 1 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const reach = 1.1 + l.bandHeight / r;
  drawGlancedLayer(ctx, f, { dark: FAR_DARK, full: MIRROR_GLANCE_SIZE.reach, reach }, (g) => [
    draw(g),
  ]);
}
