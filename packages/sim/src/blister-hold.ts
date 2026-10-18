import {
  blisterBlow,
  blisterByOf,
  blisterGestureOf,
  blisterHoldable,
  blisterIsUp,
} from "./blister.js";
import { blisterHoldTicksOf } from "./blister-numbers.js";
import { gripsCreature, NO_GRIP, setGrip } from "./grip.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BLISTER's HOLD** (`docs/spec/blister.md`, *The gestures*): a press
 * kept on it while it is up, a beat of holding for every blow.
 *
 * The press is the ordinary `grip` — the same command THE WEIGHT's press is,
 * and counted on the tick for its reason: a pair that says *now* hears the
 * answer now. `setGrip` takes the hand only on a HOLD blister that is up and
 * whose `by` names this seat (`blisterHoldable`), so a TAP blister still
 * refuses a hand and a tap that rests on it stays a tap.
 *
 * **A blow is a hold as long as `blisterHoldTicksOf`** — a beat unless the
 * wave or the gesture's default says otherwise — and the last blow owed knocks
 * it out. A release loses the hold in progress. Two hands on an EITHER blister add a tick each,
 * so they finish it twice as fast; a BOTH one counts only while both hands are
 * on it, a tick at a time — THE WEIGHT's press, held together.
 */
export function stepBlisterHolds(world: World): void {
  for (const c of [...world.creatures]) {
    if (c.kind !== "blister" || blisterGestureOf(c) !== "hold") continue;
    if (!blisterIsUp(c)) {
      letGo(world, c);
      c.blisterHeldTicks = undefined;
      continue;
    }
    const on = ([1, 2] as const).filter(
      (seat) => gripsCreature(world, seat, c.id) && blisterHoldable(c, seat),
    ).length;
    const hands = blisterByOf(c) === "both" ? (on === 2 ? 1 : 0) : on;
    if (hands === 0) {
      // Absent rather than nought, THE WEIGHT's way: a blister nobody is
      // holding is the blister that came up.
      c.blisterHeldTicks = undefined;
      continue;
    }
    const held = (c.blisterHeldTicks ?? 0) + hands;
    if (held < blisterHoldTicksOf(world.cfg, c)) {
      c.blisterHeldTicks = held;
      continue;
    }
    blisterBlow(world, c);
  }
}

/** How far through its blow the hold in progress is, 0..1: what the dial runs round. */
export function blisterHoldShare(world: World, c: Creature): number {
  return Math.min(1, (c.blisterHeldTicks ?? 0) / blisterHoldTicksOf(world.cfg, c));
}

function letGo(world: World, c: Creature): void {
  for (const seat of [1, 2] as const) {
    if (gripsCreature(world, seat, c.id)) setGrip(world, seat, NO_GRIP);
  }
}
