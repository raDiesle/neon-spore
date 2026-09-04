import type { Color } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import type { Hold } from "./touch-hold.js";
import { sucksOnLift, swipeColor } from "./touch-ship.js";

/**
 * What a hand on the ship should be *shown* as — the cup that says which
 * swelling is under the finger, and what letting go of it would do.
 *
 * Split out of `touch-ship.ts` when the cannon grew its second gesture and
 * that file went past its 250-line limit, along the seam `touch-field.ts` and
 * `touch-hold.ts` were already cut on: next door is the decision procedure for
 * a press, and this is the second table — what that same press should be
 * *told about itself*. Both are re-exported from `touch-ship.ts`, so nothing
 * that already reached for a `ShipHand` through that file had to move.
 *
 * **Nothing here decides anything.** Every mark below is read out of the rule
 * that answers the lift — `sucksOnLift` and `swipeColor`, both next door — so
 * what a swelling lights up as is what actually happens when the hand comes
 * off it. A second copy of either would be a picture that lies for exactly as
 * long as it takes somebody to change one of them.
 */

/**
 * What else to say about a hand on the ship, beside the cup itself. One entry
 * per thing this seat could do with the swelling it is holding, and a hand
 * that can do two things carries two.
 *
 * `slide` is the pair of arrows the owner asked for by name: a swelling on the
 * hull looks like part of the ship, and nothing about it says it travels until
 * something points both ways. `suck` and `guard` are the other half of the
 * same request — a mark on the field in the colour the button in the band
 * already wears, so the gesture and the button read as one control rather than
 * two (`band-control.ts`).
 */
export type ShipMark = "slide" | "suck" | "guard";

export interface ShipHand {
  /**
   * Which swelling, and — for the cannon — which of the two things a hand on
   * it can be. `muzzle` is player 2's load and is drawn with their two
   * colours either side of it; `cannon` is player 1's slide and is not,
   * because a pilot shown a red mark and a cyan one is being told about a
   * gesture their seat does not have.
   */
  on: "cannon" | "muzzle" | "shield";
  /** True once a finger is down; false while a mouse is only hovering. */
  held: boolean;
  /** The colour a lift would fire, for a hand on the muzzle. */
  color: Color | null;
  /** What this hand would do, in the order the marks are drawn. */
  marks: readonly ShipMark[];
}

/**
 * The hand as a picture, from the hold and where it has got to.
 *
 * `y` is here for one reason: player 1's tap on the cannon is a *distance*
 * from where the press landed, and a distance has two axes. The muzzle swipe
 * next door still reads `x` alone, because a swipe is one number across and
 * always was.
 */
export function shipHand(
  l: Layout,
  hold: Hold,
  x: number,
  y: number,
  held: boolean,
): ShipHand | null {
  if (hold.kind === "cannon") {
    if (!hold.direct) return null;
    // The maw is offered while the hand is still standing still and withdrawn
    // the moment it carries the cannon anywhere, which is the same answer the
    // lift will give (`sucksOnLift`).
    const sucks = hold.suck !== undefined && sucksOnLift(l, hold.suck, { x, y });
    return { on: "cannon", held, color: null, marks: sucks ? ["slide", "suck"] : ["slide"] };
  }
  if (hold.kind === "shield") {
    return hold.direct ? { on: "shield", held, color: null, marks: ["slide"] } : null;
  }
  // Player 1 on the plate: it is a trigger in this seat's hands and not a
  // thing that travels, so there are no arrows on it — the bolt says what the
  // press already did.
  if (hold.kind === "guard") return { on: "shield", held, color: null, marks: ["guard"] };
  if (hold.kind === "shot") {
    return { on: "muzzle", held, color: swipeColor(l, hold.originX, x, hold.only), marks: [] };
  }
  return null;
}
