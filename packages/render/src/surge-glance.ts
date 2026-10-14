import { type Glance, glanceFrame, glanceStill } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import { cock, type GlanceSize, glanceOf } from "./glance-styles.js";
import { temperOf } from "./glance-temper.js";

/** How far the bulb's sides open and close, in its half-width, and how far it rolls. */
export const SURGE_GLANCE_SIZE: GlanceSize = { reach: 0.22, cock: 0.1, tilt: 0.2 };

/**
 * **THE SURGE's bulb glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * THE SURGE is one bulb, so the bulb is what turns, with the seam and its
 * gauge round its equator: **about its own middle** (`glance.ts`, a `hold` of
 * 0), inside the rock `surge-sway.ts` already gives it, its near side
 * swelling and its far side narrowing into the dark. The grip marks a thumb
 * lands on are placed off the bulb at rest (`surgeGripCircle`), half-way out
 * to each flank, and are drawn after it, so neither moves — and the far side
 * at its narrowest still reaches past them.
 *
 * Taken off VERSUS `surge:glance` on 14 October 2026, the owner leaving SWAY,
 * LOOK or COCK to each boss: COCK, the turn he found the most real
 * (`glance-styles.ts`), at `SURGE_GLANCE_SIZE`, in the bulb's half-width.
 */
export const SURGE_GLANCE: Glance = glanceOf(cock, SURGE_GLANCE_SIZE, temperOf("surge"));

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.65;

/**
 * The bulb as `draw` draws it about `at` (`r` its half-width, `ry` its
 * half-height), turned as `SURGE_GLANCE` says at `time` seconds. `draw`
 * answers with its outline, which the far side's dark is laid over. Still,
 * it is drawn once and exactly as before.
 */
export function drawSurgeGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  ry: number,
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(SURGE_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = {
    dark: FAR_DARK,
    full: SURGE_GLANCE_SIZE.reach,
    reach: Math.max(1.5, ry / at.r + 1),
  };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
