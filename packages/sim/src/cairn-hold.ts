import type { CairnState } from "./cairn.js";
import { gripCount } from "./grip.js";
import { nextInt } from "./rng.js";
import { CAIRN_COLS } from "./span.js";
import type { Creature } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CAIRN's second gesture: hold the pile and it cannot let one go.**
 *
 * The fight `cairn.ts` describes has one sentence in it — *pull it and you
 * choose an edge, wait and the pile chooses the middle* — and one hole: the
 * middle is the pile's, and neither seat has anything to say about it. This
 * file is the answer, and it is a sentence of the same size: **a hand resting
 * on the pile stops its clock, for four beats, and then the pile goes
 * anyway.**
 *
 * **It is the grip they already have.** `handMeans` calls a hand on a cairn a
 * `pull`, the ring is the one `cairn-hand.ts` already draws, and the thumb
 * that does this is the same thumb that drags a rock out when it travels
 * (`grip-push.ts`). So there is nothing new to press and no new word to read:
 * a pair who put a finger on the pile and did not carry it — which every pair
 * does, by accident, in the first ten beats — watch the settle mark stop
 * filling, and that is the whole of the teaching. THE LEAD says the same
 * thing about its stalk in the same words (`leadHoldBeats`).
 *
 * **And it is never the plan.** The hand holding the pile is the hand not
 * pulling from it, the hold runs out at `cairnHoldBeats` and is only given
 * back when a unit leaves, and the wave ends when all seven rocks have been
 * warded — so a pair who only hold have stopped the fight rather than won it.
 * What the four beats buy is the thing the pair actually needs and did not
 * have: time to say a number across the voice delay and get a dome under it.
 *
 * `pickSettle` and `cairnWaited` live here too, because the hold is what they
 * are now about: one draws the column the clock is counting towards and the
 * other is the count with the held beats taken back out of it.
 */

/**
 * The column the pile will drop its own next rock into.
 *
 * Drawn from the rng the moment the clock restarts rather than when it runs
 * out, and that is the whole of the tell: there is something to say for the
 * `cairnShedBeats` before it happens, which is what makes it an announcement
 * instead of a surprise. Every boss in this game is reactive but announced
 * (`docs/spec/bosses.md`'s *fixed and learnable*).
 */
export function pickSettle(world: World, body: Creature): number {
  // Any of the pile's columns a two-tile rock still fits in — four of the
  // five, the two a hand would have chosen among them. The pile is allowed
  // the same answers the pair has and two they do not.
  return body.col + nextInt(world.rng, CAIRN_COLS - 1);
}

/**
 * How many beats the pile has stood whole **and unheld**. What
 * `cairnShedBeats` is measured against, and what render/ fills the settling
 * rock with.
 *
 * The held beats come straight back out of the count rather than pushing
 * `leftBeat` forward, so `leftBeat` keeps its one meaning — the beat a unit
 * last left — and the gauge `cairn-settle.ts` already draws freezes under a
 * thumb without that file learning anything about the hold.
 *
 * On `waveBeat` rather than `beat`, like every other clock a boss keeps: a
 * wave the pair lost and is playing again starts its pile's patience over.
 */
export function cairnWaited(world: World, b: CairnState): number {
  return world.waveBeat - b.leftBeat - b.heldBeats;
}

/** Beats of hold the pile has left in it before it goes anyway. Nought while
 * nobody is on it is the same nought as spent, and that is right: what the
 * picture wants to say is *this is not stopping it any longer*. */
export function cairnHoldLeft(world: World, b: CairnState): number {
  return Math.max(0, world.cfg.cairnHoldBeats - b.heldBeats);
}

/** Is a hand on the pile at all? Either seat's, and one is as good as two —
 * the gesture is *touch it*, and a rule that wanted both hands would be a rule
 * the pair has to be told rather than one they trip over. */
export function cairnHeldNow(world: World, b: CairnState): boolean {
  return gripCount(world, b.creatureId) > 0;
}

/**
 * The beat's first question, asked before the shed clock is read: is a hand on
 * the pile with hold left in it?
 *
 * True means the beat is bought and `stepCairn` stops there. The count goes up
 * by one rather than the clock being frozen outright, so the four beats are a
 * budget a pair spends and not a switch they hold down — which is what makes
 * the mark under the pile worth watching and the hold worth timing.
 */
export function holdCairn(world: World, b: CairnState, body: Creature): boolean {
  if (!cairnHeldNow(world, b)) return false;
  if (b.heldBeats >= world.cfg.cairnHoldBeats) return false;
  b.heldBeats += 1;
  // Every beat it holds, not once at the start: the other seat hears the cost
  // of it going on, which is what `ship.gripStrain` is for and the only way a
  // seat who cannot see the pile's mark knows the hold is still on.
  world.events.push({ type: "cairnHeld", col: body.col, row: body.row });
  return true;
}
