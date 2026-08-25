import type { Creature } from "@neon-spore/sim";

/** Where the queen stood the instant a rock might have come out of her body. */
export interface QueenOrigin {
  col: number;
  row: number;
}

/**
 * A meteor reads as hers, freshly out of her body, only for the one beat it
 * spawns on — `fromRow` is her row exactly once, the beat it is pushed, and
 * moves on with the rock from then on. Only `spit()` ever makes a
 * `meteorFastest`, so this heuristic never needs to tell her rocks apart from
 * a wave-authored one of a different kind.
 */
export function isFreshQueenSpawn(c: Creature, origin: QueenOrigin | null): boolean {
  if (origin === null || c.kind !== "meteorFastest") return false;
  return c.fromRow === origin.row && Math.abs(c.col - origin.col) <= 1;
}

/** Which side, if any, a rock is emerging from this beat. */
export function queenSpitSide(creatures: readonly Creature[], origin: QueenOrigin): -1 | 0 | 1 {
  for (const c of creatures) {
    if (c.kind !== "meteorFastest" || c.fromRow !== origin.row) continue;
    if (c.col === origin.col - 1) return -1;
    if (c.col === origin.col + 1) return 1;
  }
  return 0;
}
