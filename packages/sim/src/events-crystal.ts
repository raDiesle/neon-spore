import type { Color } from "./types.js";

/**
 * **Everything THE CRYSTAL does**, as events: it turns at a wall, a wrong shot
 * drives it down, and the right one breaks it in two. Its own file on
 * `events-carom.ts`' terms — one arrival taken apart rather than incidents
 * that share a creature — and one arm of `CreatureEvent`, so every consumer
 * still switches over the whole list.
 */
export type CrystalEvent =
  /**
   * THE CRYSTAL touched a side wall and turned. `dir` is which way it is going
   * **now**, on `caromBounce`'s terms and for its reason: the lane the pair
   * had agreed the middle would be in has stopped being on the way there.
   */
  | { type: "crystalBounce"; col: number; row: number; dir: -1 | 1 }
  /**
   * A shot met the shell and was thrown off — anywhere but the middle, or the
   * middle without the ship's shield standing armed in that lane, or the
   * middle in the wrong colour — and the whole body dove `crystalDiveRows`
   * toward the ship. `col` is the **middle** column and `row` the row it now
   * stands on. Beside the ordinary `reject` rather than in place of it: the
   * spark is the spark, and this is the price that rides on it.
   */
  | { type: "crystalDive"; col: number; row: number }
  /**
   * The middle broke and the shell came off. `col` is the **middle** column —
   * the tile that broke, and the one the burst belongs on — and `color` the
   * shot that broke it, which is the colour the join was authored in. From
   * this beat the two halves are an ordinary red slick one lane to the left
   * and an ordinary cyan bulb one lane to the right, each falling its own
   * column. Its own event rather than a `destroy`, for `caromCrack`'s reason:
   * nothing died, and a kill sound would tell the pair a column is closed at
   * the moment two opened.
   */
  | { type: "crystalSplit"; col: number; row: number; color: Color };
