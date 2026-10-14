import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE THROAT's mouth glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head*, one entry per boss.
 *
 * THE THROAT is a gullet with a mouth at its end, and the mouth is its head:
 * the lip and the face of the colour set in it (`throat-mouth.ts`) turn
 * together **about the mouth's centre** (`glance.ts`, a `hold` of 0), which is
 * where the navigator's thumb carries it and where the pump's ring sits
 * (`throat-grip.ts`), so neither moves. The near side of the lip swells, the
 * far side narrows into the dark. What is read off the mouth rather than seen
 * on it — the pull's circle round it, the halo, a swallow's flare — stays
 * level.
 *
 * Shipped, it does not glance: `THROAT_GLANCE` is still, and VERSUS
 * `throat:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `THROAT_GLANCE_SIZE`, in the lip's half-width.
 */
export const THROAT_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the lip's sides open and close, in its half-width, and how far it rolls. */
export const THROAT_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.14, tilt: 0.4 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;

/**
 * The mouth as `draw` draws it about `at` (`r` the lip's half-width), turned
 * as `THROAT_GLANCE` says at `time` seconds. `draw` answers with the lip,
 * which the far side's dark is laid over. Still, it is drawn once and exactly
 * as before.
 */
export function drawThroatGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(THROAT_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: THROAT_GLANCE_SIZE.reach, reach: 1.8 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
