import { metColor, missedColor } from "./balance.js";
import type { SimConfig } from "./config.js";
import { removeCreature } from "./field.js";
import { livingKindForColor, otherColor } from "./kinds.js";
import { nextInt } from "./rng.js";
import { clampSpanCol, spanOf } from "./span.js";
import type { Bullet, Creature, CreatureKind } from "./types.js";
import type { World } from "./world.js";

/**
 * THE RECOIL: a slick or a bulb inside a sprung cage, and the first body a
 * landed shot sends the **wrong way**.
 *
 * `docs/tower-defence.md` has carried the row since the conversion — the PvZ
 * pole vault, turned upside down: the vaulter spends one leap and is ordinary
 * afterwards, and this spends one *hit*. A shot in the matching colour throws
 * it `recoilRows` back up the field on a jet of its own fire, a column to one
 * side, and the body inside turns over to the other colour on the way. It does
 * that `recoilBounces` times, and the shot after the last one kills it exactly
 * the way an ordinary body dies.
 *
 * **The mistake it punishes is trusting a sentence that has already been
 * said.** THE RIND next door costs the pair a repeat — the same colour, the
 * same column, twice more — so what it teaches is patience. This one costs
 * them the sentence itself: the column is wrong, the colour is wrong and the
 * row is wrong, all on the beat their own shot landed, and none of the three
 * can be worked out without looking again and saying it again. A pair who fire
 * and move on lose the lane behind them.
 *
 * **The side is rolled, and that is the one thing neither of them can plan.**
 * `docs/spec/structure.md` 7.3 keeps randomness for what one player knows and
 * the other does not, and a bounce is the narrower case it also allows: what
 * *nobody* knows yet. An authored side would be a pattern the pair learns in
 * three arrivals, and then the creature is a rind that moves.
 *
 * **The count is the damage, and that is why there is no health bar.** THE
 * RIND's size is its own readout and this one's cage is: render draws one more
 * split strut and one more scorched plate per bounce spent
 * (`render/recoil.ts`), so how many are left is a thing both seats can see
 * from where they are sitting. `recoilBounces` is the only state it carries.
 *
 * **The colour turns over, so the silhouette does too.** A red recoil is a
 * slick in a cage and a cyan one is a bulb in the same cage — `wornKind`
 * resolves it, `livingKindForColor` is the one copy of the pairing, and the
 * body visibly *becomes the other creature* as it is knocked back. That is
 * THE VEIL's grammar rather than a new one, which is deliberate: the pair
 * already has a word for what a turn-over means, and this creature is asking
 * them to say it under a deadline instead of on a beat they can count.
 */

/**
 * How many times this body still survives a shot. Absent on every other kind,
 * and zero on a recoil that has spent them all — which is the only state in
 * which it is an ordinary slick or bulb in a broken cage.
 *
 * Call this rather than reading `c.recoilBounces` by hand: the count is what
 * the kill, the score and the wreckage drawn around the body all read, and a
 * second spelling of the fallback is how the picture and the shot come to
 * disagree about whether the next one finishes it.
 */
export function recoilBouncesLeft(c: Creature): number {
  return c.recoilBounces ?? 0;
}

/** The fields a recoil arrives with: every bounce ahead of it. */
export function recoilOnSpawn(cfg: SimConfig): { recoilBounces: number } {
  return { recoilBounces: cfg.recoilBounces };
}

/**
 * The body a recoil is drawn as — the slick or the bulb its *current* colour
 * names, which is not the one it was authored in once a bounce has turned it
 * over. Reached through `wornKind` and never called at a draw site directly,
 * for the reason every other worn body has one: what a thing *is* and what it
 * *looks like* are two questions, and a second copy of the pairing is how a
 * body comes to be drawn in a colour a shot does not match.
 *
 * A slick for a recoil built without a colour, the same fallback `rindBecomes`
 * and `echoBecomes` reach for and for the same reason: a body has to be drawn
 * as some body. Nothing in the game builds one — a wave authors red or cyan.
 */
export function recoilBecomes(c: Creature): CreatureKind {
  return c.color === null ? "slick" : livingKindForColor(c.color);
}

/**
 * The row a bounce lands this body on, clamped to the top of the field.
 *
 * A rule rather than the subtraction written at the one site that does it,
 * because two things read it: the simulation moves the body here, and
 * `recoil.test.ts` asserts where it went. The clamp is what stops a body
 * struck in the first two rows being knocked off the top of the world — it
 * comes to rest on row zero and falls again, which is the honest picture of a
 * shot that had nowhere left to push it.
 */
export function recoilRow(cfg: SimConfig, row: number): number {
  return Math.max(0, row - cfg.recoilRows);
}

/**
 * A shot met a recoil. Returns whether the bullet goes on, the same contract
 * `resolve` has.
 *
 * **A bounce stops the shot, a lance included.** What stopped it is a cage,
 * and a cage is a body's worth of material however split it looks by the third
 * one — a lance that tore through the whole ladder in one press would take the
 * four-shot sentence out of the creature and leave a slick behind. Only the
 * kill at the end passes a lance on, exactly as an ordinary body's does, and
 * exactly as `rindStruck` does for its own layers.
 *
 * A wrong colour is an ordinary colour miss. Both players see a recoil whole
 * and both see what colour it is at every instant, so getting it wrong is the
 * same mistake it would be against a slick and is scored as one.
 *
 * It lives here rather than in `bullet-hit.ts` for `rindStruck`'s reason: it
 * is a rule about one creature, and that file is at its length limit.
 */
export function recoilStruck(world: World, b: Bullet, hit: Creature): boolean {
  if (hit.color !== b.color) {
    missedColor(world);
    world.events.push({ type: "reject", col: hit.col, row: hit.row });
    return false;
  }

  metColor(world);
  const left = recoilBouncesLeft(hit) - 1;
  if (left >= 0) {
    // Where it was struck, kept before anything moves: the jet of fire vents
    // downward out of the tile the shot arrived in (`render/recoil-vent.ts`),
    // and the body is two rows and a lane away by the time anything draws it.
    const fromCol = hit.col;
    const fromRow = hit.row;
    hit.recoilBounces = left;
    // Where it came from, sideways and down, so render glides the knock-back
    // instead of teleporting it. Written here rather than left to the next
    // beat because the bounce happens mid-tick: `onBeat` seeds both fields at
    // the top of a beat, and a body that moved after that would be drawn
    // sliding out of a tile it had already left (`drawnRow`, `drawnCol`).
    hit.fromRow = fromRow;
    hit.fromCol = fromCol;
    hit.row = recoilRow(world.cfg, fromRow);
    // A lane to one side, rolled from the world's own stream — the one thing
    // about this creature nobody may plan against. `clampSpanCol` rather than
    // a pair of comparisons written here: keeping a body's whole width on the
    // field is a rule this file calls and does not re-derive (`span.ts`), and
    // a body knocked into the wall simply stays in the outermost lane.
    const side = nextInt(world.rng, 2) === 0 ? -1 : 1;
    hit.col = clampSpanCol(fromCol + side, world.cfg.cols, spanOf(hit));
    // And the colour the pair now has to load. Not null: a recoil is authored
    // red or cyan and `resolve` has already matched the bullet against it, so
    // there is no colourless branch to reach here.
    hit.color = otherColor(b.color);
    world.score += world.cfg.scoreRecoilBounce;
    world.events.push({
      type: "recoilBounce",
      id: hit.id,
      col: fromCol,
      row: fromRow,
      toCol: hit.col,
      toRow: hit.row,
      color: hit.color,
      left,
    });
    return false;
  }

  // Out of bounces, and killed the way a slick is killed: the same score, the
  // same event, the same burst. Deliberately not a kill of its own — the last
  // shot at a recoil is an ordinary shot at an ordinary body, and the pair has
  // to be able to feel that it is finally over.
  world.score += world.cfg.scoreDestroy;
  world.events.push({ type: "destroy", col: hit.col, row: hit.row, color: b.color });
  removeCreature(world, hit.id);
  b.pierced += 1;
  return b.lance && b.pierced < world.cfg.lancePierce;
}
