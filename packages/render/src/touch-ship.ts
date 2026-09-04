import { type Point, setHas } from "@neon-spore/content";
import type { Color } from "@neon-spore/sim";
import { type Circle, colFromX, hitCircle, type Layout, tileCX } from "./layout.js";
import type { Field } from "./touch-field.js";
import type { Touch } from "./touch-hold.js";

// What a hand on the ship is *shown* as, lifted out when this file reached its
// length limit and re-exported so nothing that reached for either through here
// had to move (`touch-hand.ts`).
export { type ShipHand, type ShipMark, shipHand } from "./touch-hand.js";

/**
 * The ship as a control: the cannon lobe and the shield lobe answered **where
 * they are drawn on the hull**, not only on the strips below the field.
 *
 * The owner asked for it in those words — touch the cannon and slide it, press
 * the shield and it goes up, and the same two swellings mean the other seat's
 * two things on the other phone. It is here beside `handles.ts` rather than in
 * `touch.ts` for the reason that file gives about itself: it had reached its
 * length limit carrying one decision table, and this is a second table asking
 * the same shape of question (is this seat allowed, does the wave's panel have
 * this control, is the press inside the resting circle).
 *
 * **Nothing here replaces a strip.** Both bands stay exactly as they were, and
 * every wave is still playable with nothing but them — this is a second way to
 * reach two controls that already exist, for a player whose thumb is already
 * up on the field.
 *
 * **The circles are the resting ones**, read off the world's columns rather
 * than off the eased lobe the renderer is carrying towards them. That is
 * `handles.ts`'s rule and it is here for its reason: by the time a lobe has
 * slid, the pointer is captured and nothing is hit-tested again, and a control
 * that could only be grabbed while it was standing still is not a control.
 */

/** How far above the hull line each lobe's grab circle sits, in tiles. */
const CANNON_UP = 0.25;
const SHIELD_UP = 0.1;
/** Grab radius, in tiles. `hitCircle` answers a ring 30% wider again. */
const CANNON_R = 0.7;
const SHIELD_R = 0.8;
/**
 * How far the muzzle has to be carried before a colour locks in, in tiles.
 * Wide enough that a thumb that only meant to rest there fires nothing, short
 * enough to be inside one hand's travel.
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
const TAP_TILES = 0.35;

/** Where the cannon stands on the hull, as something a finger can be inside. */
export function cannonGrab(l: Layout, col: number): Circle {
  return { x: tileCX(l, col), y: l.hullY - l.tile * CANNON_UP, r: l.tile * CANNON_R };
}

/** The same for the shield, which is the wider and flatter of the two lobes. */
export function shieldGrab(l: Layout, col: number): Circle {
  return { x: tileCX(l, col), y: l.hullY - l.tile * SHIELD_UP, r: l.tile * SHIELD_R };
}

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
 */
export function swipeColor(l: Layout, originX: number, x: number): Color | null {
  const d = x - originX;
  if (Math.abs(d) < l.tile * SWIPE_TILES) return null;
  return d < 0 ? "red" : "cyan";
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

/**
 * A press against the ship itself. Null where the hand is not on either lobe,
 * or where this seat has nothing to do with the one it landed on.
 *
 * Asked after the handles and before the creatures, which is the order the
 * three are *drawn* in: a rope hangs over the field, the hull is painted over
 * every body on it, and a hand goes to whatever is on top.
 */
export function shipUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const cannon = cannonGrab(l, field.cannonCol);
  const shield = shieldGrab(l, field.shieldCol);
  const onCannon = hitCircle(cannon, x, y);
  const onShield = hitCircle(shield, x, y);
  if (!onCannon && !onShield) return null;
  // The two lobes may be standing in the same column, and then both circles
  // hold the same finger. **Across, not down**: they sit within a few pixels
  // of each other vertically — one swelling is a little taller than the other
  // and that is all — so the only thing a press really says about which one it
  // meant is which column it is nearer, which is `creatureAt`'s rule one axis
  // at a time.
  //
  // Dead level means the same column, and then **the lobe this seat carries
  // wins**: player 1's cannon, player 2's shield. The other press each seat
  // could have meant — the guard, a colour — still has its own button on the
  // band a thumb's width below, so nothing becomes unreachable; a slide has no
  // second way of being held.
  const own: "cannon" | "shield" = field.seat === 1 ? "cannon" : "shield";
  const on: "cannon" | "shield" = !onShield
    ? "cannon"
    : !onCannon
      ? "shield"
      : across(cannon, x) === across(shield, x)
        ? own
        : across(cannon, x) < across(shield, x)
          ? "cannon"
          : "shield";
  return field.seat === 1 ? pilot(l, on, x, y, field) : navigator(l, on, x, field);
}

/** How far across a lobe's own column the finger is. */
function across(c: Circle, x: number): number {
  return Math.abs(x - c.x);
}

/**
 * Player 1's half: the cannon is theirs to carry, and the shield is theirs to
 * *fire* — the trigger and the aim being in different hands is the rule the
 * whole defence rests on, and it is unchanged here. Pressing the plate player
 * 2 has left somewhere sends `guard` and nothing else; it does not move it.
 *
 * **The cannon is two gestures on one swelling**, which is the owner's own
 * answer to the maw having no way onto the field: carry it and it slides,
 * let go without carrying it and it swallows. The press says the same
 * `cannonCol` either way — it is the *lift* that decides which of the two
 * happened, exactly as player 2's muzzle already works one seat over.
 */
function pilot(
  l: Layout,
  on: "cannon" | "shield",
  x: number,
  y: number,
  field: Field,
): Touch | null {
  if (on === "cannon") {
    if (!setHas(field.controls, "cannon")) return null;
    return {
      player: 1,
      command: { kind: "cannonCol", col: colFromX(l, x) },
      // Where the press landed rides along **only when the panel has a maw**,
      // and that is the whole permission check: a wave played on the lance
      // panel hands back a hold with no origin on it, so no lift of it can
      // open an opening the lance is already using (`control-sets.ts`).
      hold: {
        kind: "cannon",
        direct: true,
        ...(setHas(field.controls, "intake") ? { suck: { x, y } } : {}),
      },
    };
  }
  if (!setHas(field.controls, "guard")) return null;
  return { player: 1, command: { kind: "guard" }, hold: { kind: "guard" } };
}

/**
 * Player 2's half, and the answer to the question the owner asked with it —
 * the navigator has no cannon to slide, so what should the muzzle do under
 * their thumb?
 *
 * It loads. They already hold both colours and the shot always leaves up
 * whichever column player 1 is standing in, so the muzzle is exactly the thing
 * on the ship that is theirs to act on: take hold of it, carry it towards red
 * or towards cyan, and let go. Nothing is sent until the lift, so a thumb that
 * changes its mind on the way back to the middle fires nothing.
 */
function navigator(l: Layout, on: "cannon" | "shield", x: number, field: Field): Touch | null {
  if (on === "shield") {
    if (!setHas(field.controls, "shield")) return null;
    return {
      player: 2,
      command: { kind: "shieldCol", col: colFromX(l, x) },
      hold: { kind: "shield", direct: true },
    };
  }
  if (!setHas(field.controls, "fireRed") && !setHas(field.controls, "fireCyan")) return null;
  return { player: 2, command: null, hold: { kind: "shot", originX: x } };
}
