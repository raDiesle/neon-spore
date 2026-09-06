import type { SimConfig } from "./config.js";
import type { Color, Creature } from "./types.js";

/**
 * **A crack in THE FENCE: the one column a bolt can open, and the colour it
 * has to arrive in.**
 *
 * A wall used to be cuttable anywhere or nowhere — a fence the wave gave no
 * way through came apart in whichever column the cannon happened to be in, and
 * a fence with a gap refused every shot. That made the solid wall the easy one:
 * point at the dome, fire, done. The owner asked for the other shape. *Instead
 * there is a breaking point, in the colour of a slick or a bulb, immediately
 * visible for player 1 — related to colour, the cannon breaks the crack. Only
 * on this position can you shoot the cannon and break through.*
 *
 * So a crack is a **place and a colour at once**, and that is what makes it a
 * sentence rather than a mark. The pilot is the seat shown it (`fence.ts`'s
 * split, the same half that is shown the gaps) and the pilot slides the cannon
 * — but the pilot cannot fire, and the colour on the crack is one of the two
 * triggers the *navigator* is holding. Neither of them can open the wall
 * alone: the number and the colour both have to cross the room, in one mouth,
 * to two thumbs.
 *
 * **It is not tied to a wall with no gaps.** Any fence may carry any number of
 * cracks, up to one per column, which is what the owner asked the brush editor
 * for — a wall with three ways through and a crack in it is a wall where the
 * pair may choose which answer is cheaper. What *is* true is that a wall with
 * no gaps at all has nothing but its cracks, so `queueFromWave` gives one to a
 * solid wall nobody authored cracks on, exactly as it gives a gap to a wall
 * nobody authored gaps on.
 *
 * **Two masks and not one field of colours**, for `fenceGaps`' reason: a set
 * of columns is what two devices have to agree about exactly, and an integer
 * is the shape the fingerprint already takes. One mask per colour keeps a
 * column's crack a single bit in each, so "no crack here" and "a red one" are
 * never one value read two ways.
 */

/** No crack at all. What every fence carries before a wave authors one, and
 * what a mask outside the field's own width collapses to. */
const NONE = 0;

/**
 * The mask for one colour's cracks, bounded by the field.
 *
 * `cols` bounds it for `fenceMask`'s reason: a crack authored off the end of a
 * field narrower than the one the wave was written for is dropped rather than
 * folded round to the other side, because a crack that wrapped would be a way
 * through nobody was shown.
 *
 * One column wide, always. A gap is `fenceGapCols` wide because the dome has
 * to be *steered* into it; a crack is aimed at with the cannon, which is a
 * column exactly, so there is no width to tune.
 */
export function crackMask(cfg: SimConfig, cols: readonly number[]): number {
  let mask = NONE;
  for (const col of cols) if (col >= 0 && col < cfg.cols) mask |= 1 << col;
  return mask;
}

/**
 * **The colour a bolt has to be to open this column, or `null` for a column
 * that no bolt opens.**
 *
 * Call this, never `c.fenceCracksRed & (1 << col)` by hand — `fenceIsOpen`'s
 * rule said about the other mask. The crack render draws, the crack a shot is
 * tested against and the crack the duty word counts are three readings of two
 * numbers, and a second spelling of the shift is how the pilot comes to be
 * shown a way through the cannon has not got.
 *
 * Red wins a column that somehow carries both, which is a state no author can
 * reach: the brush cycles one chip through dark, red and cyan, and
 * `queueFromWave` writes the two lists into disjoint masks. It is decided here
 * rather than left to whichever call site asked first.
 */
export function fenceCrackAt(c: Creature, col: number): Color | null {
  const bit = 1 << col;
  if (((c.fenceCracksRed ?? NONE) & bit) !== 0) return "red";
  if (((c.fenceCracksCyan ?? NONE) & bit) !== 0) return "cyan";
  return null;
}

/**
 * Every crack in this wall, left to right, with the colour each one wants.
 * Render draws the marks from it and `duty.ts` counts it; the simulation asks
 * `fenceCrackAt` about the one column it cares about instead of walking this.
 */
export function fenceCrackCols(cfg: SimConfig, c: Creature): { col: number; color: Color }[] {
  const out: { col: number; color: Color }[] = [];
  for (let col = 0; col < cfg.cols; col++) {
    const color = fenceCrackAt(c, col);
    if (color) out.push({ col, color });
  }
  return out;
}

/**
 * The two masks a fence arrives with. Authored on the wave and remapped onto
 * the real field by `queueFromWave`, `fenceOnSpawn`'s argument word for word:
 * a breaking point that was rolled would be a wave whose whole difficulty is
 * decided after it starts.
 *
 * Cyan is masked against red rather than beside it, so a column both lists name
 * — which only a hand-edited wave file can produce — arrives as one crack and
 * not as a body whose colour depends on who asked.
 */
export function fenceCracksOnSpawn(
  cfg: SimConfig,
  red: readonly number[] | undefined,
  cyan: readonly number[] | undefined,
): { fenceCracksRed: number; fenceCracksCyan: number } {
  const fenceCracksRed = crackMask(cfg, red ?? []);
  return { fenceCracksRed, fenceCracksCyan: crackMask(cfg, cyan ?? []) & ~fenceCracksRed };
}
