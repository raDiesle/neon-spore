import { markMoment } from "./balance.js";
import { msToTicks } from "./config-derived.js";
import { removeCreatures } from "./field.js";
import { gripsCreature } from "./grip.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE WEIGHT: the body two thumbs crush, and neither thumb can see the other.**
 *
 * A heavy sac comes down a row a beat and answers nothing either panel can do —
 * no bolt reaches it, the shield has nothing to say to it, and one hand on it
 * does not slow it by a thousandth. What answers it is a hand from **each**
 * seat, on the body itself, held together for `weightCrushMs`.
 *
 * **The whole creature is in what each screen does not draw.** A hand on a
 * weight brightens it on that seat's screen and on no other (`render/weight.ts`),
 * so a player pressing one has no way to tell whether their partner is pressing
 * too. THE BALLOON — the only other body two hands answer — draws *both* pulls
 * on *both* screens, and what the pair has to say there is which balloon. Here
 * there is nothing to see and nothing to infer, so the only thing left is a
 * count said out loud: **on the three**. That is the one sentence this body
 * exists to make them say, and the reason the press is a moment rather than a
 * task.
 *
 * **Nothing here is a new gesture.** The hand is the ordinary `grip`, and
 * `handMeans` is where a weight's hand is named `"press"` — the third thing a
 * hand can be, and the first that is worth nothing without the other seat's. A
 * `drag` of its own would have been a second way to put a finger on a body, and
 * the finger is not what is interesting about this creature.
 */

/** Ticks both hands have been on this body, and 0 for one nobody is pressing
 * with both. Read this rather than the field: absent and nought are the same
 * answer to a caller and two different worlds to the fingerprint. */
export function weightPressTicks(c: Creature): number {
  return c.weightPressTicks ?? 0;
}

/** Whether both seats have a hand on this body right now. */
export function weightPressed(world: World, c: Creature): boolean {
  return gripsCreature(world, 1, c.id) && gripsCreature(world, 2, c.id);
}

/** Ticks a press has to hold. A window authored in milliseconds and lived in
 * ticks, like every other one (`config-derived.ts`). */
export function weightCrushTicks(world: World): number {
  return msToTicks(world.cfg, world.cfg.weightCrushMs);
}

/**
 * How far this body's press has come, in thousandths — 0 for one nobody is
 * pressing, 1000 for one about to give.
 *
 * For the picture, and **only** for the picture: the moment is decided by the
 * tick count against `weightCrushTicks` below, never by this. A rounded
 * thousandth a hair short of full would read as a press earned on a screen a
 * tick before the body gave on both, which is the arrangement `balloonTension`
 * and `lidIsOpen` are already on.
 */
export function weightPressMilli(world: World, c: Creature): number {
  const need = weightCrushTicks(world);
  if (need <= 0) return 1000;
  return Math.min(1000, Math.round((weightPressTicks(c) * 1000) / need));
}

/**
 * One tick of every weight on the field: the press counts up while both hands
 * are on it, goes back to nothing the instant either lifts, and the body gives
 * when the count is full.
 *
 * Run on the **tick** rather than on the beat, with the other hands
 * (`step.ts`), and for their reason with the most riding on it: the pair counts
 * itself into the instant both thumbs land, and an instant answered on the next
 * beat would land up to a whole beat after the one they said out loud.
 *
 * **A lifted hand spends nothing.** The count is discarded rather than held, so
 * two players who each press for half a second separately have done exactly
 * nothing — which is the creature. Holding it back would make this a body worn
 * down by two people taking turns, and taking turns is the one thing it must
 * not reward.
 */
export function stepWeights(world: World): void {
  const need = weightCrushTicks(world);
  const crushed: Creature[] = [];
  for (const c of world.creatures) {
    if (c.kind !== "weight") continue;
    if (!weightPressed(world, c)) {
      // Absent rather than nought: a weight nobody has touched this wave is
      // byte-for-byte the weight that arrived.
      c.weightPressTicks = undefined;
      continue;
    }
    const held = weightPressTicks(c) + 1;
    c.weightPressTicks = held;
    if (held >= need) crushed.push(c);
  }
  if (crushed.length === 0) return;
  removeCreatures(
    world,
    crushed.map((c) => c.id),
  );
  for (const c of crushed) {
    // **The fourth place a joint moment happens**, and the only one where both
    // halves are the same gesture. A shot is the pair agreeing about a colour,
    // the hull about a column and the maw about a beat; this one is the two of
    // them agreeing about *now*, with nothing on either screen to agree from.
    markMoment(world, true);
    // Its own event rather than the plain `destroy`: what comes apart is not a
    // body of a colour, so there is no colour to shower, and `destroy` requires
    // one. What the pair should see is pressure — the contour giving between
    // two hands rather than bursting outwards (`render/weight-crush.ts`).
    world.events.push({ type: "weightCrushed", col: c.col, row: c.row });
  }
}
