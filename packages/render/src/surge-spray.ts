import type { Layout } from "./layout.js";

/**
 * THE SURGE's burst, past its first instant: what the bulb throws across the
 * ship when the pressure goes over.
 *
 * The design has a burst spray the whole ship; the game has three gums down
 * the bulb's own columns, a puff of sparks and the jolt (`surge-fx.ts`). This
 * is the record a spray would be drawn through, and the game draws nothing
 * through it — it was lifted out on 8 October 2026 so the spray could be
 * offered in VERSUS (`surge:spray`) without the field changing until the
 * owner chooses. `SurgeFx` keeps the clock and calls it every frame of the
 * `SPRAY_BEATS` after a burst; the clock is cleared in `Effects.reset()` with
 * the rest of the boss's.
 */

/** How many beats a burst's spray is drawn for. */
export const SPRAY_BEATS = 2.5;

/** One frame of a burst's spray. */
export interface SprayDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  /** Where the bulb was drawn on the frame it burst. */
  x: number;
  y: number;
  /** 0 on the burst, 1 as the spray goes. */
  age: number;
}

export interface SprayLook {
  draw: (d: SprayDraw) => void;
}

/** What the game draws after a burst beyond the sparks and the jolt: nothing. */
export const SPRAY_LOOK: SprayLook = { draw: () => {} };
