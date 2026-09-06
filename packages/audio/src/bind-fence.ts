import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol, pitchForRow } from "./bind.js";

/**
 * **What THE FENCE sounds like**: the wire going over the ship, and a bolt
 * cutting a way through it.
 *
 * Its own file rather than two more cases in `bind-creatures.ts`, which is at
 * its limit, and along the seam `events-fence.ts` already cuts in the
 * simulation — the two files are the same list read twice, so they are cut the
 * same way or the next reader has to hold both cuts in their head. It is
 * `bind-volley.ts`'s arrangement next door.
 *
 * The two cues are the pair's two answers, and the ear has to tell them apart
 * instantly: one is the ship being threaded through a hole that was already
 * there, and the other is the cannon making one.
 */
export function fenceCue(
  e: Extract<SimEvent, { type: "fencePass" | "fenceBurn" }>,
  cols: number,
  rows: number,
): Cue | null {
  switch (e.type) {
    case "fencePass":
      // Air and no body, which is exactly what a pass is: the fence touches
      // nothing on its way over a dome standing in one of its gaps. Panned to
      // the gap the pair found and pitched at the row it went through on, so
      // the ear is told where as well as whether — and it is the one beat in
      // this creature where either of them finds out whether the number that
      // crossed the room was the right one.
      return {
        id: "impact.graze",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
    case "fenceBurn":
      // A crack and two halves ringing — a piece leaving a body that is still
      // there afterwards, which is what a burnt column is. Deliberately not a
      // `destroy`: nothing died, and a kill sound here would teach the pair
      // that a shot at the wire finishes it.
      return {
        id: "impact.split",
        pan: panForCol(e.col, cols),
        pitch: pitchForRow(e.row, rows),
      };
  }
}
