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
}
