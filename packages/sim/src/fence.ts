import { type SimConfig, ticksPerBeat } from "./config.js";
import { fenceCrackAt } from "./fence-crack.js";
import { fallTilesPerBeat } from "./kinds.js";
import type { Color, Creature } from "./types.js";
import type { World } from "./world.js";

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
 * **And the cannon can burn a gap of its own, at a crack and nowhere else.** A
 * wall may carry breaking points — a column and a colour each, drawn on the
 * pilot's screen beside the gaps — and a bolt that arrives on one in its own
 * colour opens that column for good (`fence-crack.ts`, `fenceBurn`). The
 * cannon is *player 1's* and both triggers are player 2's, so cutting the wall
 * needs the pilot to say a number and a colour and the navigator to load and
 * fire. The creature runs in both directions at once: p1 names a gap and p2
 * steers the dome to it, or p1 names a crack and p2 sends the colour that
 * opens it. Which of the two a pair reaches for is the wave's own question,
 * and a fence with **no** gaps at all (`WaveEntry.gaps: []`) is a wave that
 * has taken the first answer away and left only the second.
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
 * cannon can cut one now — at a crack, which `queueFromWave` gives a solid
 * wall nobody authored one on — so the argument is spent: a solid fence is the
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
 *
 * Callers ask `fenceCrackAt` first. It is not asked here because the two
 * answers to a bolt that lands nowhere — the shot is still spent, and the pair
 * is still told it bounced — belong to the shot rather than to the wall
 * (`bullet-hit.ts`).
 */
export function fenceBurn(c: Creature, col: number): void {
  c.fenceBurns = (c.fenceBurns ?? SOLID) | (1 << col);
}

/**
 * **How long the dome has to stand still before a way through counts as
 * found**, in ticks: the time this wall takes to fall half a tile.
 *
 * The current a fence throws at the ship goes out when the dome has settled in
 * one of its gaps (`render/fence-arc.ts`), and the owner asked for the pause —
 * *after half a tile time when it stays there.* Without one, sliding the
 * shield across the field would strobe the arc on and off a column at a time
 * and read as a fault rather than as an answer.
 *
 * A rule here rather than the arithmetic written out in render/, for
 * `fenceIsOpen`'s reason: it is half of this creature's own fall, and a second
 * spelling of that in a draw call is a number free to disagree with the tier
 * the wall actually comes down at.
 */
export function fenceSettleTicks(cfg: SimConfig): number {
  return Math.max(1, Math.round(ticksPerBeat(cfg) / (2 * fallTilesPerBeat("fence"))));
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

/**
 * **What a bolt does when it meets a wall**, and the one thing in this game a
 * shot does to a body without touching what is inside it.
 *
 * Two answers and the bolt is spent either way, which is the whole price: a
 * cannon spent on the wall is a cannon that is not under the slick beside it.
 * A bolt that arrives on a **crack**, in the crack's own colour, comes through
 * it — the wall opens in that column and stays open, and the event goes to
 * both devices because a cut is the one hole in a fence that is not a secret.
 * Anywhere else, or in the other colour, the wall refuses and the shot is
 * rejected out loud, because a bolt that vanished with nothing to show for it
 * would read as the game having missed the press.
 *
 * **The colour matters, and it is the whole of why this creature needs two
 * mouths twice over.** The crack is drawn on the pilot's screen and the
 * cannon under it is the pilot's to slide, while both triggers are the
 * navigator's — so the pilot has to say a number *and* a colour, and neither
 * half opens the wall on its own (`fence-crack.ts`).
 *
 * Here rather than inline in `bullet-hit.ts`, which is at its 250-line limit
 * and where every other creature is already one call — `caromStruck`,
 * `claspStruck`, `veilStruck` and nine more. This was the odd one out.
 */
export function fenceStruck(world: World, c: Creature, col: number, color: Color): void {
  if (fenceCrackAt(c, col) !== color) {
    world.events.push({ type: "reject", col, row: c.row });
    return;
  }
  fenceBurn(c, col);
  world.events.push({ type: "fenceBurn", col, row: c.row });
}
