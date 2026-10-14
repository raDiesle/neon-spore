import { type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import { drawGlancedLayer } from "./glance-layer.js";
import type { GlanceSize } from "./glance-styles.js";

/**
 * **THE SINEW's mass glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn ... or if mechanical the full boss shape*, one
 * entry per boss.
 *
 * The crown flies and the tendon is a rope, and the handles a thumb takes are
 * placed off the mass's centre (`sinew-handles.ts`, `sinewMassCentre`), not off
 * its outline. So what turns is the mass on the end of the rope, **about its
 * own centre** (`glance.ts`, a `hold` of 0): its near side swells, its far
 * side narrows into the dark, and a roll swings it a little on the fibres
 * that go into its top — a weight on a rope turning as it hangs. The handles
 * and their cords are drawn after it and do not turn.
 *
 * Shipped, it does not glance: `SINEW_GLANCE` is still, and VERSUS
 * `sinew:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `SINEW_GLANCE_SIZE`, in the mass's half-width.
 */
export const SINEW_GLANCE: Glance = { ...STILL_GLANCE };

/** How far the mass's sides open and close, in its half-width, and how far it rolls. */
export const SINEW_GLANCE_SIZE: GlanceSize = { reach: 0.38, cock: 0.12, tilt: 0.25 };

/** How dark the far side goes, reached at the widest turn. */
const FAR_DARK = 0.55;

/**
 * The mass as `draw` draws it about `at` (`r` its half-width), turned as
 * `SINEW_GLANCE` says at `time` seconds. `draw` answers with its outline,
 * which the far side's dark is laid over. Still, it is drawn once and exactly
 * as before.
 */
export function drawSinewMassGlanced(
  ctx: CanvasRenderingContext2D,
  at: { x: number; y: number; r: number },
  time: number,
  draw: (g: CanvasRenderingContext2D) => Path2D,
): void {
  const f = glanceFrame(SINEW_GLANCE, time, { ...at, hold: 0 });
  if (glanceStill(f)) {
    draw(ctx);
    return;
  }
  const shade = { dark: FAR_DARK, full: SINEW_GLANCE_SIZE.reach, reach: 1.6 };
  drawGlancedLayer(ctx, f, shade, (g) => [draw(g)]);
}
