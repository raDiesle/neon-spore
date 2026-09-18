import type { Point } from "@neon-spore/content";
import type { Color } from "@neon-spore/sim";
import { colFromX, type Layout } from "./layout.js";
import type { Hold } from "./touch-hold.js";

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
/**
 * How far the muzzle has to be carried before a colour locks in, in tiles.
 * Wide enough that a resting thumb fires nothing, short enough for one hand.
 */
const SWIPE_TILES = 0.6;
/**
 * How far player 1's hand may travel and still be a **tap** on the cannon
 * rather than a slide of it, in tiles.
 *
 * Shorter than the swipe above, and it has to be: the muzzle swipe is a
 * gesture a thumb sets out to make, while this is the gesture a thumb makes
 * by *not* making one. A hand that took hold of the cannon to carry it
 * somewhere has already left this circle by the time it lets go.
 */
export const TAP_TILES = 0.35;

/**
 * Which colour a lift at `x` would fire, for a thumb that took hold of the
 * muzzle at `originX`. Null while the swipe is still short of the threshold,
 * which is both "nothing yet" to the eye and "nothing at all" to the lift —
 * one rule, read by the feedback and by `touchUp`, so what the muzzle lights
 * up as is what actually leaves it.
 *
 * Left is red and right is cyan because that is the order the two lobes stand
 * in on player 2's own band (`bandLobes` walks `setControls`, and `fireRed`
 * is listed first). A player who has learnt the panel already knows this one.
 *
 * `only` is a panel with one colour on it — the ladder's first two rungs — and
 * then the direction says nothing, because a single lobe has no order to read.
 * The swipe still has to clear the threshold: a thumb resting on the muzzle
 * fires nothing on any panel.
 */
export function swipeColor(l: Layout, originX: number, x: number, only?: Color): Color | null {
  const d = x - originX;
  if (Math.abs(d) < l.tile * SWIPE_TILES) return null;
  return only ?? (d < 0 ? "red" : "cyan");
}

/**
 * Whether a lift at `at` opens the maw, for a hand that took hold of the
 * cannon at `origin`.
 *
 * Two conditions, and both of them are the same sentence said twice so that
 * it is true whichever way it is read: **the hand has not travelled**, and
 * **the cannon has not moved**. A press that stayed inside the circle but
 * crossed a column boundary is still a slide as far as the ship is concerned,
 * and a tap that slid the cannon a column and swallowed as well would be one
 * gesture doing two things nobody asked for.
 *
 * Written once and read twice — by `touchUp`, which sends the maw open, and
 * by `shipHand`, which lights the mark that says it would. That is
 * `swipeColor`'s rule next door and it is here for its reason: what the
 * swelling lights up as has to be what actually happens on the lift.
 */
export function sucksOnLift(l: Layout, origin: Point, at: Point | undefined): boolean {
  if (at === undefined) return false;
  const dx = at.x - origin.x;
  const dy = at.y - origin.y;
  if (dx * dx + dy * dy >= (l.tile * TAP_TILES) ** 2) return false;
  return colFromX(l, at.x) === colFromX(l, origin.x);
}

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
  /**
   * The hand is on THE MIRROR's lobe, not the pair's own: drawn upside down
   * over the boss (`mirror-grip.ts`) and not over the hull (`frame-ship.ts`).
   */
  mirror?: true;
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
  if (hold.kind === "drag" && hold.target === "mirrorLobe") return mirrorHand(l, hold, x, held);
  return null;
}

/**
 * A hand on one of THE MIRROR's lobes: the same picture the pair's own lobe
 * gets, because it is the same gesture on the same swelling upside down —
 * with one threshold for the swipe and the tap alike, the boss's own
 * (`carryMilli`), so what the ring lights is what the sim will hear. Under
 * the pin there is nothing to read out: the thumb is there or it is not.
 */
function mirrorHand(
  l: Layout,
  hold: Extract<Hold, { kind: "drag" }>,
  x: number,
  held: boolean,
): ShipHand {
  const on: ShipHand["on"] = hold.id === 1 ? "shield" : hold.player === 2 ? "muzzle" : "cannon";
  if (hold.pin || hold.carryMilli === undefined) {
    return { on, held, color: null, marks: [], mirror: true };
  }
  const carry = (x - hold.originX) * 1000 >= hold.carryMilli * l.tile;
  const carryBack = (hold.originX - x) * 1000 >= hold.carryMilli * l.tile;
  if (on === "muzzle") {
    const color: Color | null = carryBack ? "red" : carry ? "cyan" : null;
    return { on, held, color, marks: [], mirror: true };
  }
  if (on === "shield") return { on, held, color: null, marks: ["guard"], mirror: true };
  return {
    on,
    held,
    color: null,
    marks: carry || carryBack ? ["slide"] : ["slide", "suck"],
    mirror: true,
  };
}
