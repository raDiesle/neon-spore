import { midCol, type SimConfig } from "./config.js";
import { clampSpanCol } from "./types.js";
import { vaneCycle, vaneOpening, vaneReachMilli } from "./vane-cycle.js";
import { vanePhase } from "./vane-phases.js";

/**
 * THE VANE's arm laid over a field: the six answers that come in columns.
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
 * The column the bearing is at home in: dead centre, where it hangs through
 * every form but the last. The last one wanders off it (`vaneDriftCol`); the
 * functions below take the pivot of the moment and default to this one.
 */
export function vanePivotCol(cfg: SimConfig): number {
  return midCol(cfg);
}

/**
 * **Where the pivot has wandered to**, in the last form only — the owner, 30
 * September 2026: *The boss in later levels should probably start to move
 * around*. One column a cycle, out to `vaneDriftCols` on the right, back
 * through the centre to as far on the left, and home again, counted from the
 * cycle the form began on so a re-form starts it at the centre. A column a
 * cycle rather than a slide: the pivot moves while the arm is swinging back,
 * and stands still across both ends of the sweep, where the housing splits.
 *
 * Never within a column of a wall, so the arm has a short side of at least
 * one column; `vaneReach` shortens both sides to the short one.
 */
export function vaneDriftCol(
  cfg: SimConfig,
  form: number,
  formBeat: number,
  waveBeat: number,
): number {
  const home = vanePivotCol(cfg);
  const d = cfg.vaneDriftCols;
  if (form < cfg.vaneForms - 1 || d <= 0) return home;
  const t = Math.max(0, vaneCycle(waveBeat) - vaneCycle(formBeat)) % (4 * d);
  const off = t <= d ? t : t <= 3 * d ? 2 * d - t : t - 4 * d;
  return Math.max(1, Math.min(cfg.cols - 2, home + off));
}

/**
 * How far the tip actually reaches, held to what the field can carry. An arm
 * that pointed off the grid would fold about a column the pair cannot name,
 * which is the one thing this boss may never do. Held to the short side on
 * both sides, so an arm on a wandered pivot still sweeps a mirror image.
 */
export function vaneReach(cfg: SimConfig, pins: number, pivot = vanePivotCol(cfg)): number {
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
export function vaneTipCol(
  cfg: SimConfig,
  pins: number,
  waveBeat: number,
  pivot = vanePivotCol(cfg),
): number {
  const m = vaneReachMilli(waveBeat);
  const reach = vaneReach(cfg, pins, pivot);
  const out = Math.sign(m) * Math.round((reach * Math.abs(m)) / 1000);
  return pivot + out;
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
export function vaneWeakCol(cfg: SimConfig, waveBeat: number, pivot = vanePivotCol(cfg)): number {
  if (vaneOpening(waveBeat) === -1) return -1;
  return Math.max(0, Math.min(cfg.cols - 1, pivot - Math.sign(vaneReachMilli(waveBeat))));
}
