import type { Creature } from "@neon-spore/sim";
import { isGrippable, NO_GRIP } from "@neon-spore/sim";

/**
 * **What the desk rig's grip key takes hold of.**
 *
 * Cut out of `keys.ts` when the relief's key took that file over its 250-line
 * limit, along the seam `keys-round.ts` and `keys-guide.ts` already cut: next
 * door is the *rig* — which key sends which command, and the repeat clock the
 * held ones run on — and this is the one question any of those keys has to
 * answer about the world in front of it. A phone never asks it: there, the
 * grip is a finger on a body and the body is whichever one is under it.
 */
/**
 * The creature closest to the hull — the one a pair would actually reach for.
 * Never a boss body, which cannot be gripped (`isGrippable` in sim/types.ts).
 *
 * THE WARDEN's tether wins outright whatever else is falling, because it is
 * the only thing on the field a hand is the *only* answer to: a rock a hand
 * misses is still a rock the shield can meet, and a line nobody pulls costs
 * the hull and the plate both. On one screen this key is the whole of player
 * 2's half of that fight.
 */
export function nearestHull(creatures: readonly Creature[]): number {
  const tether = creatures.find((c) => c.kind === "tether");
  if (tether) return tether.id;
  let best = NO_GRIP;
  let bestRow = -1;
  for (const c of creatures) {
    if (!isGrippable(c.kind) || c.row <= bestRow) continue;
    best = c.id;
    bestRow = c.row;
  }
  return best;
}
