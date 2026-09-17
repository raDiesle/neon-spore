import type { CreatureKind } from "./creature-kinds.js";
import type { Color } from "./types.js";

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
  /**
   * **What colour the thing that made it was**, when its kind does not say.
   *
   * `breachHue` takes a kind *and* a colour, because a body that is not a
   * rock, a fence or a gum is drawn in what it was shot with — cyan or red.
   * The live strike had that colour off the `breach` event and the scar did
   * not, so anything replaying a remembered hit had to hand `breachHue` a
   * `null` and got red for every cyan body: the hit and the record of the hit
   * disagreeing about what hit the ship, which is the one thing
   * `breach-hue.ts`'s own header says must not happen. The lost screen replays
   * the breach that ended the wave (`lost-screen.ts`) and is where it showed.
   *
   * Absent for every hit whose colour is not a fact about it — a rock, a
   * round that costs the hull from off the field, a lobe withdrawing — and
   * `breachHue` reads absent exactly as it reads `null`.
   */
  color?: Color;
  /**
   * **The plating itself is gone here**, not cracked. One maker: a tall lobe
   * of THE UNDERTOW withdrawing untaken takes a plate of hull with it, its own
   * column's and the neighbour's (`undertow-step.ts`, the design's step 9).
   * Absent for every other scar, which is a tear in plating still there. The
   * picture reads it as a hole in the outline rather than a crack on it, and
   * it is in the hash because two devices that disagreed about it would draw
   * two different hulls for the rest of the run.
   */
  plate?: true;
}

export interface GuardStats {
  /** Every meteor that reached the hull. The denominator of the HUD balance. */
  tries: number;
  /** Right column and right moment. */
  deflected: number;
  /** Right column, wrong moment — the interesting failure class. */
  mistimed: number;
}

/**
 * One scar, as numbers, for whichever fingerprint is asking.
 *
 * Two places keep scars — the hull's own list and a boss's (`maze-state.ts`) —
 * and each used to spell out which of a scar's fields went into the hash. A
 * field added to the type then had to be found twice, and on 17 September 2026
 * it was: `color` landed in `hash.ts` and `hash-coverage.test.ts` failed on
 * `boss.scars.*.color`, which is the same test doing the finding both times.
 * One function, called rather than re-derived — `purity.test.ts`'s rule.
 *
 * `kind` and `span` are deliberately not here: neither can differ between two
 * devices that agree about the rest, and `hash.ts`'s own exceptions table is
 * where that argument lives.
 */
export function scarHashParts(scar: Scar): number[] {
  // Absent is its own value and is not the same as either colour.
  return [
    scar.col,
    scar.beat,
    scar.color === undefined ? 0 : scar.color === "red" ? 1 : 2,
    scar.plate === true ? 1 : 0,
  ];
}
