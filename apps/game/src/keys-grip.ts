import type { Command, Creature, SimConfig } from "@neon-spore/sim";
import { handMeans, NO_GRIP } from "@neon-spore/sim";

/**
 * **What the desk rig's grip key takes hold of.**
 *
 * Cut out of `keys.ts` when a key too many took that file over its 250-line
 * limit, along the seam `keys-round.ts` and `keys-guide.ts` already cut: next
 * door is the *rig* — which key sends which command, and the repeat clock the
 * held ones run on — and this is the one question any of those keys has to
 * answer about the world in front of it. A phone never asks it: there, the
 * grip is a finger on a body and the body is whichever one is under it.
 */
/**
 * The creature closest to the hull that **this seat's hand would do something
 * to**, which since the brake was narrowed to rocks is a question about the
 * seat and not only about the kind: the desk rig's `G` is player 2's hand, and
 * player 2 has no aim (`sim/hand.ts`). Asked rather than answered here — a key
 * that took hold of a slick for the navigator would send a command the
 * simulation refuses and leave the rig showing a hand that is not there.
 *
 * THE WARDEN's tether wins outright whatever else is falling, because it is
 * the only thing on the field a hand is the *only* answer to: a rock a hand
 * misses is still a rock the shield can meet, and a line nobody pulls costs
 * the hull and the plate both. On one screen this key is the whole of player
 * 2's half of that fight.
 */
export function nearestHull(creatures: readonly Creature[], player: 1 | 2): number {
  const tether = creatures.find((c) => c.kind === "tether");
  if (tether) return tether.id;
  let best = NO_GRIP;
  let bestRow = -1;
  for (const c of creatures) {
    if (handMeans(c.kind, player) === null || c.row <= bestRow) continue;
    best = c.id;
    bestRow = c.row;
  }
  return best;
}

/**
 * **The desk rig's whole hand: the hold, the carry and the release.**
 *
 * A phone sends THE PUSH as a finger sliding across the field, so the distance
 * it reports is measured and the id is whatever was under the thumb. A desk has
 * neither. What it has is `G` for the hold and two keys beside it for the
 * carry, which means this file has to *keep* the two things a pointer carries
 * on its own — which body was taken, and how far the hand has come from where
 * it grabbed.
 *
 * The distance is the part a key cannot fake per press: a `drag` is cumulative
 * from the grab and never an increment (`sim/command-types.ts`), so a press
 * adds `cfg.gripPushMilli` to a running total and sends the total. The count
 * of columns already spent stays where it belongs, on the simulation's own
 * `GripPush.cols`, and nothing here re-derives it.
 */
export interface DeskGrip {
  /** `G` down. The nearest body this seat can hold is taken and the carry
   * starts from nought. */
  take(creatures: readonly Creature[], player: 1 | 2): Command[];
  /** One press of a carry key, one `gripPushMilli` further from the grab. */
  carry(dir: -1 | 1): Command[];
  /** `G` up. The hold ends and the distance is forgotten with it. */
  release(): Command[];
}

export function deskGrip(cfg: SimConfig): DeskGrip {
  let held = NO_GRIP;
  let milli = 0;
  return {
    take(creatures, player) {
      held = nearestHull(creatures, player);
      milli = 0;
      return held === NO_GRIP ? [] : [{ kind: "grip", id: held }];
    },
    carry(dir) {
      // Nothing in hand is nothing to carry. Sending a drag naming `NO_GRIP`
      // would be dropped by `gripPushHeard` anyway, and it would clear a
      // carry the *other* seat's hand had earned on its way past.
      if (held === NO_GRIP) return [];
      milli += dir * cfg.gripPushMilli;
      return [{ kind: "drag", target: "gripBody", on: true, fromMilli: milli, id: held }];
    },
    release() {
      held = NO_GRIP;
      milli = 0;
      // Unconditionally, the way the keyup next door has always sent it: a
      // release for a grip that never took is a no-op in the simulation, and
      // one skipped because `nearestHull` found nothing on the *down* would
      // leave a hand on a body that arrived in between.
      return [{ kind: "grip", id: NO_GRIP }];
    },
  };
}
