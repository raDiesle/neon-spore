import type { Creature, World } from "@neon-spore/sim";
import {
  beatboxCorrect,
  beatboxHitsMade,
  beatboxRunOpen,
  beatboxSpentRun,
  beatboxWaitThrough,
  beatboxWanted,
} from "@neon-spore/sim";
import { beatboxMissThrough, beatboxWrongThrough } from "./beatbox.js";

/**
 * **What the counter over a soundbox is saying**, as a shape rather than as a
 * drawing — how many slots, how many are lit, and in what colour.
 *
 * The row of dots was taken off this creature when every counted beat started
 * growing an arm instead, and the owner asked for it back: *bring back some
 * additional indicator of correct beated dots performed*. The two are not the
 * same picture and that is why both are worth having. An arm is a **fact about
 * the body** — it is on the thing the thumb is touching, it reads from across a
 * room, and it can only ever say how far in the run is. A dot is a **slot in a
 * row**, and a row can say things a body cannot: *this one has not happened
 * yet*, *that press was not on the beat*, *all of this is now wrong*, *all of
 * this is now right*.
 *
 * So the four states below are the four things the owner asked the row to say,
 * and none of them is something an arm could have said instead.
 *
 * **The split still holds.** Player 1 sees every slot the box is asking for
 * with the run lit inside it; player 2 sees only their own presses and never an
 * empty one, so a row of three lit dots says *you are three in* and never *and
 * three is the answer* (`beatbox-marks.ts` hands the two different numbers).
 * The one slot player 2 is shown that they did not press is the red one after a
 * missed beat, and it is gone inside half a beat for exactly that reason.
 *
 * Everything here is read off the world — the run, the count, and the three
 * ticks the simulation stamps (`creature-state-beatbox.ts`). Nothing is
 * remembered between frames, so there is nothing for `Effects.reset` to clear.
 */

/**
 * How far into its last waiting beat a run has to be before player 2's row goes
 * green (`beatboxWaitThrough`).
 *
 * Nine tenths: at the shipped tempo that is a little under a tenth of a second
 * before the box is silenced, which is long enough to be seen and far too short
 * to be a instruction. The pilot's row is not gated at all — they are holding
 * the number already, and telling them what they can read off their own screen
 * costs nothing.
 */
const REVEAL_AT = 0.9;

/** What a dot is filled with. `plain` is the field's own text colour, and the
 * other three are the three things that can happen to a run. */
export type DotHue = "plain" | "good" | "wrong";

export interface BeatboxCount {
  /** How many slots this screen draws. */
  shown: number;
  /** How many of them are filled. The rest are outlines, and player 2 is
   * handed `lit === shown` so no outline is ever drawn on that screen. */
  lit: number;
  /** What the filled ones are filled with. */
  hue: DotHue;
  /**
   * One extra slot, drawn red, for a thumb that landed between two beats — the
   * owner's *if misclicked next circle counter is red*. It is the slot the
   * press was reaching for and did not reach, so it goes where the next dot
   * would have gone; `0` when there is none, otherwise how bright.
   */
  missed: number;
}

/**
 * The counter for one box on one screen.
 *
 * `tell` is whether this screen carries the target — player 1's and the rig's,
 * never player 2's (`showsBeatboxCount`).
 *
 * The order of the branches is the creature. A discharge outranks everything,
 * because the pair has to be told what went wrong before anything else; then a
 * finished run waiting out its last beat, which is the one moment this row goes
 * green; then the ordinary case, where a missed press may be sitting on top of
 * it.
 */
export function beatboxCount(world: World, c: Creature, tell: boolean): BeatboxCount {
  // **Too many, or too few: the whole row goes red.** The owner asked for the
  // over-count in those words — *when its too many, all become red* — and a run
  // that stopped short gets the same answer, because they are one mistake
  // counted from either side and the body itself makes no distinction either
  // (`beatbox-round.ts`).
  //
  // `beatboxSpentRun` and not `beatboxHitsMade`: the discharge wiped the run to
  // give the pair another go at the body, so the live count is already nought
  // and the row would empty on the exact frame it is being read.
  const wrong = beatboxWrongThrough(world, c);
  // ...unless the pair has already started again. The red lasts two beats and a
  // run can open inside one of them, and a row showing the count that failed
  // over a body that has visibly grown a new arm is two accounts of the same
  // box disagreeing. The moment a thumb lands, the row is the new run's.
  if (wrong !== null && !beatboxRunOpen(c)) {
    const ran = beatboxSpentRun(c);
    const shown = tell ? Math.max(beatboxWanted(c), ran) : ran;
    return { shown, lit: shown, hue: "wrong", missed: 0 };
  }

  const hits = beatboxHitsMade(c);
  // **Waiting on the last beat with the right count: the row goes green.** The
  // owner asked for *when waiting and correct, all become green before enemies
  // dies*, and the moment is real rather than invented — a run is committed by
  // *stopping*, so between the last tap and the deadline there is a beat in
  // which the answer is already right and the box is still standing there.
  // Green through that beat is the game saying *yes, now take the thumb off*.
  //
  // It tells player 2 the target, and only at the moment it stops being worth
  // anything: the box goes quiet a fraction of a beat later, which says the
  // same thing louder. Nothing carries to the next box — the count is authored
  // per body (`beatboxOnSpawn`).
  //
  // **Player 2 is told last, and that is the owner's correction.** The green
  // used to arrive on the frame the count became right, a whole beat before the
  // box went — which handed the navigator the answer with time left to act on
  // it, and a pair who can read *stop now* off their own screen do not have to
  // agree about anything. So the seat that already knows the number gets it
  // when it is true, and the seat that does not gets it in the last stretch
  // before the body goes, when saying it out loud would be too late to matter.
  if (beatboxRunOpen(c) && beatboxCorrect(c)) {
    const wait = beatboxWaitThrough(world.cfg, world, c);
    if (tell || (wait !== null && wait >= REVEAL_AT)) {
      return { shown: hits, lit: hits, hue: "good", missed: 0 };
    }
  }

  // Otherwise the plain row, with the next slot red if a thumb has just landed
  // off the beat. The extra slot is only drawn on the screen that has no empty
  // ones of its own — player 1 already has an outline there, and painting it
  // red is enough.
  const miss = beatboxMissThrough(world, c);
  const missed = miss === null ? 0 : (1 - miss) ** 0.6;
  const shown = tell ? Math.max(beatboxWanted(c), hits) : hits + (missed > 0 ? 1 : 0);
  return { shown, lit: hits, hue: "plain", missed };
}
