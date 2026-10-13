import { drawGlanced, type Glance, glanceFrame, glanceStill, STILL_GLANCE } from "./glance.js";
import type { GlanceSize } from "./glance-styles.js";
import { QUEEN_FIGURE } from "./queen-figure.js";

/**
 * **THE BULB QUEEN's shell glances** — the owner, 9 and 10 October 2026: *body
 * parts of living things turn, especially the head, but also feet and hands,
 * or if mechanical the full boss shape*. She is armour from wing to wing with
 * no head, so what turns is her whole shell (`glance.ts`): its middle swings
 * toward one wing, that wing's half squeezes and goes dark, the other opens.
 *
 * **What is held is where her arms meet her.** The shell turns about her
 * centre with the two points `QUEEN_GLANCE_HOLD` out held, which is where each
 * crane arm's shoulder sits (`queen-crane.ts`), so neither arm comes off her
 * and neither torch moves. Her marks are not on the shell — they hang under
 * it over the columns the simulation fires up (`queenMarkCenter`) — so a turn
 * leaves them and their hit test exactly where they were, and only the lip
 * that closes over each slides by a few pixels.
 *
 * Shipped, she does not glance: `QUEEN_GLANCE` is still, and VERSUS
 * `queen:glance` offers SWAY, LOOK and COCK for it (`glance-styles.ts`), each
 * at `QUEEN_GLANCE_SIZE`. Her shell's seams already ride a turn of their own
 * (`queen-surface.ts`); a glance turns the picture they are drawn on.
 */
export const QUEEN_GLANCE: Glance = { ...STILL_GLANCE };

/** How far her middle swings, in shares of her half-width, and how far she rolls. */
export const QUEEN_GLANCE_SIZE: GlanceSize = { reach: 0.32, cock: 0.05, tilt: 0.12 };

/** Where her crane arms' shoulders sit, as a share of her half-width: the points a turn holds. */
export const QUEEN_GLANCE_HOLD = 1.35 / QUEEN_FIGURE.bodyRx;

/** How dark the far half goes at its edge, reached at the widest swing. */
const FAR_DARK = 0.55;

/**
 * Her shell as `draw` draws it about the origin — her body's centre, `rx` her
 * half-width in pixels — turned as `QUEEN_GLANCE` says at `time`. `draw`
 * answers with her contour, which the far half's dark is laid over. Still,
 * it is drawn once and exactly as before.
 */
export function drawQueenGlanced(
  ctx: CanvasRenderingContext2D,
  rx: number,
  time: number,
  draw: () => Path2D,
): void {
  const f = glanceFrame(QUEEN_GLANCE, time, { x: 0, y: 0, r: rx, hold: QUEEN_GLANCE_HOLD });
  if (glanceStill(f)) {
    draw();
    return;
  }
  const shade = { dark: FAR_DARK, full: QUEEN_GLANCE_SIZE.reach, reach: 2 };
  drawGlanced(ctx, f, shade, () => [draw()]);
}
