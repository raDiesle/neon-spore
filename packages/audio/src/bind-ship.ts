import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * **The two moments that are the ship's own** rather than a body's: the dome
 * running onto a barb, and a seat holding its broken control off.
 *
 * Its own file on `bind-breach.ts`'s terms — `bind.ts` is at its limit, and
 * the seam is honest either way. Everything in `bind-creatures.ts` is a sound
 * something *arriving* made; both of these are made by the ship, and one of
 * them is not on the field at all.
 */
export function shipCue(e: Extract<SimEvent, { type: "barbTear" | "relief" }>, cols: number): Cue {
  // The dome torn open, panned to the column it was standing in — the pair has
  // to know *where* the ship is holed, because that is also where the ward
  // they were counting on has stopped being there (`sim/barb.ts`).
  if (e.type === "barbTear") return { id: "ship.domeTear", pan: panForCol(e.col, cols) };
  // And the relief, with no pan at all. It is not a place on the field, it is
  // the seat's own thumb — a quiet panned to a column would put the pair's one
  // moment of it somewhere neither of them is looking.
  return { id: "ship.reliefHold" };
}
