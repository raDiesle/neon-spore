import { drawPlates, type WardenPlatesDraw } from "./warden-plates.js";

/**
 * THE ONE RECORD A CANDIDATE WARDEN ARMOUR PATCHES.
 *
 * The eighth of `magnet-look.ts`'s kind and the first on a boss. It is the
 * armour alone: the body, the opening cut through it, the eye behind the hatch
 * and the fringe outside the rim all stay as they are drawn today, because the
 * question this slot asks is what a *plate* is — a line on a circle, or a piece
 * of something with a thickness — and a candidate that repainted the boss would
 * be four questions in one vote.
 *
 * The record lives here rather than at the bottom of `warden-plates.ts` so that
 * file and this one do not import each other, which is the seam every look
 * record in this package sits on.
 */
export interface WardenLook {
  plates(d: WardenPlatesDraw): void;
}

/** The shipped armour: one stroked arc per plate at `0.94 r`, with the shot
 * lane cut out of any that crosses it. `warden-plates.ts` holds it. */
export const WARDEN_LOOK: WardenLook = { plates: drawPlates };
