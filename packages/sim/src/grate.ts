import { midCol, type SimConfig } from "./config.js";
import type { Creature } from "./types.js";

/**
 * THE GRATE: a live line the width of the field, with gaps burnt through it.
 *
 * Every other arrival in this game is a thing standing in a column, and every
 * sentence the pair says about one is *which* column. This one is **all of
 * them at once**, so the sentence turns over: what has to cross the room is
 * not where the danger is but where it is not.
 *
 * **The trigger has nothing to say to it, and that is the creature.** A rock
 * needs two halves — player 2's column and player 1's moment — and a pair who
 * have learned the ward spend most of a wave arguing about the moment. A wall
 * is answered by the column alone, armed or not, so the only thing that can
 * save the ship is the dome standing in a gap when the line arrives. Player 1
 * is shown where the gaps are; player 2, the one seat that can move the
 * shield, is shown an unbroken wall (`render/grate.ts`). Neither of them can
 * do anything with what they have.
 *
 * **It is not a rock.** `isMeteorKind` is false for it and so is `isWardable`,
 * which is what keeps `resolveHull` from offering it the trigger and keeps a
 * shot from leaving a crater in it — a bolt passes straight through a wall
 * (`bullets.ts`), because a body that also swallowed shots would make the
 * cannon's whole job *wait*, which is not a thing anybody says out loud.
 *
 * **Its state is one integer.** `Creature.grateGaps` is a bitmask of the
 * columns that are open, and nothing else about a wall changes while it falls.
 * A mask rather than a list, for the reason `Creature.shell` is one: it is a
 * set of columns, two devices have to agree about it exactly, and an integer
 * is the shape the fingerprint already takes.
 */

/** No way through at all. Never a wall on the field — see `grateMask`. */
const SOLID = 0;

/**
 * The columns a wall is open in, as a bitmask: bit `k` set means column `k`
 * lets the dome through.
 *
 * `cols` bounds it, so a gap authored off the end of a field narrower than the
 * one the wave was written for is dropped rather than folded round to the
 * other side — a gap that wrapped would be a way through nobody was shown.
 *
 * **A wall with no gaps left is given one in the middle.** That is a rule and
 * not a guard: a wall nobody can pass is not a creature, it is a fixed price
 * with a picture on it, and the pair would learn in one wave that there is
 * nothing to say about this body at all.
 */
export function grateMask(cfg: SimConfig, gaps: readonly number[]): number {
  let mask = SOLID;
  for (const gap of gaps) {
    for (let k = 0; k < cfg.grateGapCols; k++) {
      const col = gap + k;
      if (col >= 0 && col < cfg.cols) mask |= 1 << col;
    }
  }
  if (mask === SOLID) mask = 1 << midCol(cfg);
  return mask;
}

/**
 * Whether this wall is open in this column.
 *
 * **Call this, never `c.grateGaps & (1 << col)` by hand.** The gap render
 * draws, the gap the shield is tested against and the gap a caption counts are
 * three readings of one number, and a second spelling of the shift is how the
 * pair comes to be shown a way through the ship does not have.
 */
export function grateIsOpen(c: Creature, col: number): boolean {
  return ((c.grateGaps ?? SOLID) & (1 << col)) !== 0;
}

/**
 * Every column this wall is open in, left to right. Render draws the breaks
 * from it and the guide counts them; the simulation asks `grateIsOpen` about
 * the one column it cares about instead of walking this.
 */
export function grateGapCols(cfg: SimConfig, c: Creature): number[] {
  const out: number[] = [];
  for (let col = 0; col < cfg.cols; col++) if (grateIsOpen(c, col)) out.push(col);
  return out;
}

/**
 * The mask a wall arrives with. One roll of nothing at all — the gaps are
 * authored on the wave and remapped onto the real field by `queueFromWave`,
 * the way a column is — because a way through that was rolled would be a wave
 * whose whole difficulty is decided after it starts, and the author could not
 * compose anything else around it.
 */
export function grateOnSpawn(cfg: SimConfig, gaps: readonly number[] | undefined): number {
  return grateMask(cfg, gaps ?? []);
}
