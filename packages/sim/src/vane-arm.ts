import { midCol, type SimConfig } from "./config.js";
import { clampSpanCol } from "./types.js";
import { vaneOpening, vanePhase, vaneReachMilli } from "./vane-cycle.js";

/**
 * THE VANE's arm laid over a field: the five answers that come in columns.
 *
 * `vane-cycle.ts` says where the tip stands in thousandths of the reach and
 * which beat the housing is split on, and never sees a field; this file takes
 * a `SimConfig` and turns that into the column the tip stands in, the column a
 * body is thrown into and the column a shot has to leave from. Split out of
 * the cycle because the two grow apart: a retune of the choreography touches
 * the table there and nothing here, and a change to the fold rule touches
 * `vaneFold` here and nothing there.
 */

/**
 * The column the bearing hangs in. Dead centre and never anywhere else: an arm
 * on an off-centre pivot has a long side and a short one.
 */
export function vanePivotCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * How far the tip actually reaches, held to what the field can carry. An arm
 * that pointed off the grid would fold about a column the pair cannot name,
 * which is the one thing this boss may never do.
 */
export function vaneReach(cfg: SimConfig, pins: number): number {
  const pivot = vanePivotCol(cfg);
  return Math.min(vanePhase(pins).reach, pivot, cfg.cols - 1 - pivot);
}

/**
 * The column the arm's tip stands in this beat — the fold line, and the only
 * thing about this boss anybody has to watch.
 *
 * Signed magnitude rather than a plain `Math.round`, so the two ends of a
 * sweep are mirror images of each other down to the last column: `Math.round`
 * breaks ties upwards, which at an odd reach would put the arm a column
 * further right on the way out than on the way back.
 */
export function vaneTipCol(cfg: SimConfig, pins: number, waveBeat: number): number {
  const m = vaneReachMilli(waveBeat);
  const reach = vaneReach(cfg, pins);
  const out = Math.sign(m) * Math.round((reach * Math.abs(m)) / 1000);
  return vanePivotCol(cfg) + out;
}

/**
 * **The whole boss, as one line of arithmetic.** Something crossing the arm
 * three columns to its left comes out three columns to its right: the field is
 * folded about the column the tip stands in, and nothing else about the thing
 * changes — same kind, same colour, same speed, same beat.
 *
 * Clamped, because a body thrown past the edge is pinned against it rather than
 * lost. Two arrivals can therefore land in the same column, which is a thing
 * the pair can see coming and is not allowed to be surprised by.
 */
export function vaneFold(cfg: SimConfig, tipCol: number, col: number, span: number): number {
  return clampSpanCol(2 * tipCol - col, cfg.cols, span);
}

/**
 * The column a shot has to leave the top of the field in to reach the bearing,
 * or -1 while there is nothing to reach.
 *
 * A lever slamming to a stop loads its bearing on the side away from the throw,
 * and that is the side that splits: the arm hard right opens the housing on the
 * left. So which column the pilot stands in is the fold's own direction, in
 * miniature, twice a cycle — the rule taught by a column rather than by a card.
 */
export function vaneWeakCol(cfg: SimConfig, waveBeat: number): number {
  if (vaneOpening(waveBeat) === -1) return -1;
  const pivot = vanePivotCol(cfg);
  return Math.max(0, Math.min(cfg.cols - 1, pivot - Math.sign(vaneReachMilli(waveBeat))));
}
