import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **What THE CAROM and the body it throws out sound like**: a wall, a crack,
 * an ejection and a canopy.
 *
 * Split out of `bind-creatures.ts` when the four of them took that file past
 * its 250-line limit, and along the seam `events-carom.ts` already cuts in the
 * simulation — the two files are the same list read twice, so they are cut the
 * same way or the next reader has to hold both cuts in their head.
 *
 * Every comment here carries the argument the whole of `bind-creatures.ts`
 * carries, and this creature needs it more than any of them: three of these
 * four events happen within a beat of each other, and the pair is deciding
 * which of *two* controls to reach for on the strength of what they heard.
 */
export function caromCue(
  e: Extract<SimEvent, { type: "caromBounce" | "caromCrack" | "caromEject" | "chuteOpen" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "caromBounce":
      // The same bounce THE RECOIL gets, and it is the same word: the thing
      // you were looking at went somewhere else. That one is knocked back up
      // the field by a shot and this one turns at a wall on its own, and the
      // pair does not need those told apart — what they need is to hear, while
      // looking at the cannon strip rather than at the field, that the lane
      // they had agreed on has stopped being on the way there.
      return {
        id: "impact.bounce",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "caromCrack":
      // A crust coming apart, which is what `impact.split` was written for —
      // and deliberately **not** `impact.destroyRed`/`Cyan`, which are the
      // sound of a column closing. This column has not closed: what fell out
      // of the shell is a rock, and the one thing this creature cannot survive
      // is player 1 hearing a kill and taking their thumb off the trigger.
      return {
        id: "impact.split",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "caromEject":
      // The body coming out of the hatch, and the one sound in the catalogue
      // written for exactly this shape of event: `creature.gateLoop` is "the
      // same thing going back up — rising, and clearly a repeat", drafted for
      // an idea that never landed. It is both halves of what the pair has to
      // hear on this tick. Rising, because the only thing in this game that
      // goes up has just done it; a repeat, because the body climbing away is
      // the one they have just shot and they are going to have to shoot it
      // again.
      return {
        id: "creature.gateLoop",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "chuteOpen":
      // The canopy. `creature.moult` is the sound of a covering coming off
      // with something under it, and this is that turned inside out — a
      // covering coming *out*, with the body already under it. It is spent on
      // `shellBare` above and shared rather than duplicated for THE RIND's
      // reason: the ear does not need these told apart, because they never
      // happen in the same wave and both mean "that thing is not finished".
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
