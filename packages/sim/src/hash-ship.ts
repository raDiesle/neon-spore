import type { World } from "./world.js";

/**
 * The ship's own fields, folded into the world hash: where the cannon and the
 * shield stand, what each hand is holding and has carried, the thumb on a
 * colour, the hull's remembered ticks, THE CLAW's arm and THE CHOIR's gesture.
 *
 * Cut out of `hash.ts` on 26 September 2026, when `hashWorld` stood at its
 * 250th line, along the seam `hash-pods.ts` and `hash-faults.ts` cut before
 * it. What the two players' controls have left on the world is one group and
 * reads as one; the shape of the world — its wave, its script, its lists — is
 * what stays next door. Which fields are *not* hashed, and why, is still said
 * there, where `hash-coverage.test.ts` and CLAUDE.md point.
 *
 * A list of numbers rather than a `push` handed in, the way `podHashParts`
 * answers one: the caller folds them in its own order, and this list is in the
 * order `hash.ts` pushed them, so no replay's fingerprint moved.
 */
export function shipHashParts(world: World): number[] {
  const out: number[] = [];
  out.push(world.cannonCol);
  out.push(world.shieldCol);
  out.push(world.shieldSinceTick);
  out.push(world.gripP1);
  out.push(world.gripP2);
  // And what each of those hands has carried. Two devices that disagreed about
  // either number would disagree about which column a rock is about to step
  // into — and so about whether the shield is standing in front of it, which
  // is the loudest desync a field can have (`grip-push.ts`). Nought and
  // nothing are two states: a hand may be holding a body and have carried it
  // nowhere, which is not the same as a hand carrying nothing at all.
  out.push(world.pushP1 === null ? 0 : 1);
  out.push(world.pushP1?.milli ?? 0);
  out.push(world.pushP1?.cols ?? 0);
  out.push(world.pushP2 === null ? 0 : 1);
  out.push(world.pushP2?.milli ?? 0);
  out.push(world.pushP2?.cols ?? 0);
  // The thumb on a colour. All three parts: two devices that disagreed about
  // when the fill started, about which colour is in it, or about whether the
  // lance has already left, would disagree about a shot that clears a whole
  // column (`lance.ts`).
  const held = world.prime;
  out.push(held === null ? -1 : held.tick);
  out.push(held === null ? 0 : held.color === "red" ? 1 : 2);
  out.push(held?.spent ? 1 : 0);
  // The four ticks the hull remembers. Cosmetic while nothing branched on
  // them, and not cosmetic any more: a call whose `need` is `guard` or
  // `fire(color)` is released by reading them, so a device that disagrees
  // about `guardTick` disagrees about whether the field advanced — a desync
  // that reads like a network bug. `wardUntilTick` was already here, further
  // down, for its own half of the same argument (a ward pod arms the shield
  // with no command, so two devices could run the same inputs and the same
  // tick count and still disagree about whether a rock is deflected); it
  // moves up so the four read as the one group they are, in the order
  // `World` declares them.
  out.push(world.guardTick);
  out.push(world.intakeTick);
  // THE CLAW's arm. Two devices that disagree about where it is are two
  // devices about to close it on different things.
  out.push(world.reachDir);
  out.push(world.reachCol);
  out.push(world.reachMilli);
  out.push(world.reachHeld);
  // And the hand on the crank. It is only a reference bearing, but the *step*
  // to the next one is rope, so two devices that disagree about where the
  // finger last was disagree about how far the arm came down for the sample
  // after it (`crank.ts`).
  out.push(world.crankAtMilli);
  // THE CHOIR's half-made gesture. Two devices that disagree about which
  // arrow is out, or about the tick its window shuts on, disagree about
  // whether the next pull merges a body or makes it sing — and therefore about
  // what the hull is worth a beat later (`choir-gesture.ts`).
  out.push(world.choirArm);
  out.push(world.choirArmTick);
  out.push(world.wardUntilTick);
  out.push(world.lastFireTick);
  return out;
}
