import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **What THE VOLLEY sounds like**: a ward that sends it back, and the shell
 * coming apart over the body it was carrying.
 *
 * Its own file rather than two more cases in `bind-creatures.ts`, which is at
 * its limit, and along the seam `events-volley.ts` already cuts in the
 * simulation — the two files are the same list read twice, so they are cut the
 * same way or the next reader has to hold both cuts in their head. It is
 * `bind-carom.ts`'s arrangement next door, and this creature needs the
 * argument as sharply: what the ear must never say here is that a column has
 * closed.
 */
export function volleyCue(
  e: Extract<SimEvent, { type: "volleyReturn" | "volleyHatch" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "volleyReturn":
      // The same bounce THE CAROM's wall and THE RECOIL's knock-back get, and
      // it is the same word a third time: the thing you were looking at went
      // somewhere else. Deliberately **not** the ward's own cue — that is the
      // sound of a column closing, and this column has not closed: the body is
      // eight rows up and on its way back down with one less plate on it. The
      // one thing this creature cannot survive is player 1 hearing "done" and
      // taking their thumb off GUARD.
      return {
        id: "impact.bounce",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "volleyHatch":
      // The cue THE SHELL's last piece gets, and this is the same moment said
      // about a different control: a covering coming off, and something under
      // it that only one colour finishes now. Deliberately not `impact.split`,
      // which is a piece leaving a body that is still armoured — the pair has
      // to be able to hear that this was the *last* one, because it is the
      // beat the arrival stops being the shield's and becomes the cannon's.
      return {
        id: "creature.moult",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
