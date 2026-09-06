import type { SimConfig } from "./config.js";
import type { Creature } from "./types.js";

/**
 * THE FENCE: a live line the width of the field, with gaps burnt through it.
 *
 * Every other arrival in this game is a thing standing in a column, and every
 * sentence the pair says about one is *which* column. This one is **all of
 * them at once**, so the sentence turns over: what has to cross the room is
 * not where the danger is but where it is not.
 *
 * **The trigger has nothing to say to it, and that is the creature.** A rock
 * needs two halves — player 2's column and player 1's moment — and a pair who
 * have learned the ward spend most of a wave arguing about the moment. A fence
 * is answered by the column alone, armed or not, so the only thing that saves
 * the ship is the dome standing in a gap when the line arrives. Player 1 is
 * shown where the gaps are; player 2, the one seat that can move the shield,
 * is shown an unbroken wire (`render/fence.ts`). Neither of them can do
 * anything with what they have.
 *
 * **And the cannon can burn a gap of its own, which is the same sentence said
 * backwards.** A bolt that reaches the wire opens the column it was fired up
 * (`fenceBurn`), and the cannon is *player 1's* while the trigger that fires
 * it is player 2's — so making a way through needs the navigator to say where
 * the dome is standing and the pilot to put the cannon there. The creature
 * runs in both directions at once: p1 names a gap and p2 moves to it, or p2
 * names the dome and p1 makes a gap over it. Which of the two a pair reaches
 * for is the wave's own question, and a fence with **no** gaps at all
 * (`WaveEntry.gaps: []`) is a wave that has taken the first answer away.
 *
 * **A burnt gap is public and an authored one is not.** The burn happened in
 * front of both of them — a bolt went up a column and the wire came apart — so
 * hiding it from the seat that fired the shot would be hiding a thing they
 * watched. `fenceGapSeen` is the one place that split is written down.
 *
 * **It is not a rock.** `isMeteorKind` is false for it and so is `isWardable`,
 * which is what keeps `resolveHull` from offering it the trigger and keeps a
 * shot from leaving a crater in it: a bolt does not chip a wire, it cuts one.
 *
 * **Its state is two integers**, and both are sets of columns. `fenceGaps` is
 * what the wave authored and `fenceBurns` is what the pair has cut, and they
 * are separate because only one of them is a secret. Masks rather than lists,
 * for the reason `Creature.shell` is one: two devices have to agree about a
 * set exactly, and an integer is the shape the fingerprint already takes.
 */

/** No way through at all — a solid wire. What a wave authoring no gaps means,
 * and what every fence is before anybody has cut one. */
const SOLID = 0;

/**
 * The columns a wave opened this fence in, as a bitmask: bit `k` set means
 * column `k` lets the dome through.
 *
 * `cols` bounds it, so a gap authored off the end of a field narrower than the
 * one the wave was written for is dropped rather than folded round to the
 * other side — a gap that wrapped would be a way through nobody was shown.
 *
 * **A wall with no gaps is a wall with no gaps.** There used to be a rule here
 * giving one to the middle column, on the argument that a fence nobody can
 * pass is a fixed price with a picture on it rather than a creature. The
 * cannon can cut one now, so the argument is spent: a solid fence is the
 * hardest thing this creature can be and it is still answerable, by the seat
 * the gaps were never for.
 */
export function fenceMask(cfg: SimConfig, gaps: readonly number[]): number {
  let mask = SOLID;
  for (const gap of gaps) {
    for (let k = 0; k < cfg.fenceGapCols; k++) {
      const col = gap + k;
      if (col >= 0 && col < cfg.cols) mask |= 1 << col;
    }
  }
  return mask;
}

/**
 * Whether this fence is open in this column, by either route — authored or
 * burnt. This is the question the shield is answered by and the only one the
 * hull cares about.
 *
 * **Call this, never `c.fenceGaps & (1 << col)` by hand.** The gap render
 * draws, the gap the shield is tested against and the gap a bolt is spared by
 * are three readings of two numbers, and a second spelling of the shift is how
 * the pair comes to be shown a way through the ship has not got.
 */
export function fenceIsOpen(c: Creature, col: number): boolean {
  return (((c.fenceGaps ?? SOLID) | (c.fenceBurns ?? SOLID)) & (1 << col)) !== 0;
}

/**
 * Whether this column was cut rather than authored. The half of a fence that
 * is on **both** screens: the bolt went up in front of the two of them, so
 * there is nothing left to withhold.
 */
export function fenceIsBurnt(c: Creature, col: number): boolean {
  return ((c.fenceBurns ?? SOLID) & (1 << col)) !== 0;
}

/**
 * Whether a screen shows a way through here — the whole of the split, in one
 * place. `secret` is true for the seat that is shown what the wave authored
 * (the pilot's, `showsFenceGaps` in render/) and false for the seat that is
 * shown only what the pair has cut.
 *
 * Here rather than composed at the draw site for `fenceIsOpen`'s reason: it is
 * one fact about the creature — *which of these holes is a secret* — and the
 * day a third kind of opening exists, a `?:` written into a render file would
 * be the copy that does not get it.
 */
export function fenceGapSeen(c: Creature, col: number, secret: boolean): boolean {
  return secret ? fenceIsOpen(c, col) : fenceIsBurnt(c, col);
}

/**
 * Every column a screen shows this fence open in, left to right. Render draws
 * the breaks from it; the simulation asks `fenceIsOpen` about the one column it
 * cares about instead of walking this.
 */
export function fenceGapCols(cfg: SimConfig, c: Creature, secret = true): number[] {
  const out: number[] = [];
  for (let col = 0; col < cfg.cols; col++) if (fenceGapSeen(c, col, secret)) out.push(col);
  return out;
}

/**
 * **A bolt cutting the wire.** The column is opened for good — a fence is
 * never repaired — and the shot is spent on it, which is the whole price: a
 * cannon spent on the wall is a cannon that is not under the slick beside it.
 *
 * Nothing is scored. What the pair bought is a way through, and the score for
 * that arrives when the fence goes over the ship (`resolveFence`); paying
 * twice would make cutting three gaps worth more than needing none.
 */
export function fenceBurn(c: Creature, col: number): void {
  c.fenceBurns = (c.fenceBurns ?? SOLID) | (1 << col);
}

/**
 * The mask a fence arrives with. One roll of nothing at all — the gaps are
 * authored on the wave and remapped onto the real field by `queueFromWave`,
 * the way a column is — because a way through that was rolled would be a wave
 * whose whole difficulty is decided after it starts, and the author could not
 * compose anything else around it.
 */
export function fenceOnSpawn(cfg: SimConfig, gaps: readonly number[] | undefined): number {
  return fenceMask(cfg, gaps ?? []);
}
