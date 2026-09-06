/**
 * The shape of a **pod**: the one thing on the field that is neither a body nor
 * a shot.
 *
 * Its own file beside `hull-types.ts`, and lifted out of `types.ts` when THE
 * GYRE arrived and that file went over its limit for the fourth time. The seam
 * is the one the pod's own comment below already draws: everything left next
 * door is a thing that *lives* on the grid — a creature and the bolt fired at
 * one — and this is the thing that does neither, is never cleared, and does
 * not even have a row and a column. `pods.ts` holds what one does; this is
 * what one is, which is why the two are not one file (a world imports the
 * shape, and the shape must not import a world).
 */

/**
 * What a pod gives when it is swallowed. Every pod is one of exactly these:
 * `mend` gives hull back, `purge` sweeps the field, `ward` holds the shield
 * armed without a trigger.
 */
export type PodKind = "mend" | "purge" | "ward";

/**
 * The three, as data. `hashWorld` folds a pod's kind in by its index here
 * rather than by a ternary chain, for `BOSS_KINDS`' reason: a fourth pod added
 * to the type and not to a chain would hash as the third, and two devices
 * would agree about a ship they disagree about.
 */
export const POD_KINDS: readonly PodKind[] = ["mend", "purge", "ward"];

/**
 * A supply pod. It is not a creature: it does not live, does not travel of its
 * own accord and is never a target that must be cleared. It hangs where it was
 * left until a shot knocks it loose, and then falls like a burning wreck —
 * which is the only reason its position is not a plain row and column.
 *
 * Both coordinates are in thousandths of a tile, counted the way the grid is:
 * `colMilli` from the left edge, `rowMilli` down from the top.
 */
export interface Pod {
  id: number;
  colMilli: number;
  rowMilli: number;
  /**
   * Sideways travel per tick, in thousandths, signed. Zero while it is moored;
   * drawn from the seeded rng the moment a shot frees it, because which way a
   * wreck falls away is the one thing neither player may know in advance
   * (docs/spec/structure.md).
   */
  driftMilli: number;
  /** False while it hangs, true once it is falling. */
  loose: boolean;
  /** What it gives when it is swallowed. Authored, never random. */
  kind: PodKind;
  /**
   * How fast it crosses the field while it is still moored, in thousandths of
   * a tile per tick, signed — negative leftwards. Nought is a pod that hangs
   * where the wave left it, which is every pod authored before THE CLAW.
   *
   * It is separate from `driftMilli` rather than reusing it because the two
   * are different facts about different halves of a pod's life: this is how it
   * *arrives*, authored and constant, and that is how it *falls*, drawn from
   * the rng at the moment a shot frees it and zeroed again as it homes. One
   * field carrying both would be cleared by the homing and the pod would stop
   * crossing halfway along a row nobody had reached yet.
   */
  crossMilli: number;
  /**
   * Which seat is shown it: `0` for both, or the player who alone can see it.
   *
   * The first thing in this game that hides a *pod* rather than a body, and it
   * is authored per pod rather than fixed per wave, so a wave can put one
   * power-up on one screen and the next on both. THE CLAW's panel is what it
   * was added for — the seat that cannot reach is the seat that can see — but
   * nothing about it is particular to that panel, which is why it is a field
   * here and not a rule in `reach.ts`.
   */
  seen: 0 | 1 | 2;
}
