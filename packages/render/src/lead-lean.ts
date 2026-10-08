import type { Layout } from "./layout.js";
import type { Point } from "./lead-shape.js";

/**
 * THE LEAD's lean, past the stalk's own tilt: what a screen shown the lean
 * draws to say it.
 *
 * The design wanted an arrow with a length to it; the game tilts the stalk
 * on a spring and draws nothing else (`lead-draw.ts`, `lead-fx.ts`). This is
 * the record an arrow would be drawn through, and the game draws nothing
 * through it — lifted out on 8 October 2026 so the arrow could be offered in
 * VERSUS (`lead:lean`) without the field changing until the owner chooses.
 * Called only on a screen `showsLeadLean` admits, so nothing drawn through
 * it can reach the navigator's.
 */

/** One frame of the lean, as the stalk is drawn on it. */
export interface LeanDraw {
  ctx: CanvasRenderingContext2D;
  l: Layout;
  /** Where the stalk stands, and its tip as the spring has it this frame. */
  foot: Point;
  tip: Point;
  /** The way the stalk leans: the simulation's own −1, 0 or 1. */
  lean: -1 | 0 | 1;
  /** Columns the body moves a beat now (`leadPace`). */
  pace: number;
  /** Whether it stands dead still. */
  still: boolean;
  time: number;
  fade: number;
}

export interface LeanLook {
  draw: (d: LeanDraw) => void;
}

/** What the game draws for the lean beyond the stalk's tilt: nothing. */
export const LEAN_LOOK: LeanLook = { draw: () => {} };
