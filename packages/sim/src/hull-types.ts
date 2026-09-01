import type { CreatureKind } from "./creature-kinds.js";

/**
 * What the hull remembers: where it broke, and how the pair have been doing at
 * stopping it breaking.
 *
 * Their own file rather than fields of `types.ts` next door, which is at its
 * length limit — and the seam is a real one: everything left in that file is
 * something that *lives* on the field, while these two are the ship's own
 * record of what has already happened to it.
 */

/** A broken segment of the hull. Damage is visible and stays visible. */
export interface Scar {
  col: number;
  /** Beat at which it was made, for the render fade-in. */
  beat: number;
  /** What hit here — a rock crater is only ever drawn for a rock kind. */
  kind: CreatureKind;
  /**
   * How wide the thing that made it was, in tiles, when that was not its
   * kind's own width — a plain meteor tier authored two tiles wide
   * (`RockSize`). Absent otherwise, and read through `spanOf`, which takes
   * exactly these two fields: a crater is drawn at the size of the rock that
   * made it, so a wide rock leaving narrow dents would read as two small hits
   * rather than one big one.
   */
  span?: number;
}

export interface GuardStats {
  /** Every meteor that reached the hull. The denominator of the HUD balance. */
  tries: number;
  /** Right column and right moment. */
  deflected: number;
  /** Right column, wrong moment — the interesting failure class. */
  mistimed: number;
}
