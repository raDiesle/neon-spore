import { blisterBlow, blisterGestureOf, blisterHoldable, blisterIsUp } from "./blister.js";
import { ticksPerBeat } from "./config-derived.js";
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
 * **A blow is a beat held, and the count is kept across surfacings**, as a
 * tap's is: a blister up for two beats with three owed is held for two,
 * sinks, and owes one when it comes up again. What a release or a sink
 * loses is the beat in progress, never a blow already dealt — the only
 * reading under which a count larger than `blisterUpBeats` can be won.
 * Two hands on a BOTH blister add a tick each, so they finish it twice as
 * fast, as two tapping hands do.
 *
 * A hand left on one that sinks is let go of, on the tick: the body comes up
 * again somewhere else, and a thumb resting where it was is not on it.
 */
export function stepBlisterHolds(world: World): void {
  const beat = ticksPerBeat(world.cfg);
  for (const c of [...world.creatures]) {
    if (c.kind !== "blister" || blisterGestureOf(c) !== "hold") continue;
    if (!blisterIsUp(c)) {
      letGo(world, c);
      c.blisterHeldTicks = undefined;
      continue;
    }
    const hands = ([1, 2] as const).filter(
      (seat) => gripsCreature(world, seat, c.id) && blisterHoldable(c, seat),
    ).length;
    if (hands === 0) {
      // Absent rather than nought, THE WEIGHT's way: a blister nobody is
      // holding is the blister that came up.
      c.blisterHeldTicks = undefined;
      continue;
    }
    const held = (c.blisterHeldTicks ?? 0) + hands;
    if (held < beat) {
      c.blisterHeldTicks = held;
      continue;
    }
    c.blisterHeldTicks = held - beat;
    blisterBlow(world, c);
  }
}

/** How far through its beat the hold in progress is, 0..1: what the dial runs round. */
export function blisterHoldShare(world: World, c: Creature): number {
  return Math.min(1, (c.blisterHeldTicks ?? 0) / ticksPerBeat(world.cfg));
}

function letGo(world: World, c: Creature): void {
  for (const seat of [1, 2] as const) {
    if (gripsCreature(world, seat, c.id)) setGrip(world, seat, NO_GRIP);
  }
}
