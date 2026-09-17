import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE UNDERTOW's nine, in a file of their own for `bind-baton.ts`' reason —
 * and along the seam the fight has: everything here happens *to the hull*,
 * in one column of it, and the pair answers it downward.
 *
 * All but one are panned, and harder than usual: the boss is under the floor,
 * so the only thing the navigator has of it is where. The bow is on the
 * pilot's screen alone, and a bow heard in a lane is the one tell she gets
 * before the lobe stands. `undertowRise` is the whole edge at once and has no
 * column to be in — no pan, like `boss.stareCaught`.
 */
export function undertowCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "undertowBow"
        | "undertowLobe"
        | "undertowTaken"
        | "undertowScar"
        | "undertowWidened"
        | "undertowUnseated"
        | "undertowClosed"
        | "undertowRise"
        | "undertowSwallowed"
        | "undertowThrough";
    }
  >,
  cols: number,
): Cue {
  switch (e.type) {
    case "undertowBow":
      return { id: "boss.undertowBow", pan: panForCol(e.col, cols) };
    case "undertowLobe":
      // The tall one is lower: a bigger thing coming through a bigger hole,
      // and the one the maw will not take.
      return { id: "boss.undertowLobe", pan: panForCol(e.col, cols), pitch: e.tall ? 0.8 : 1 };
    case "undertowTaken":
      return { id: "boss.undertowTaken", pan: panForCol(e.col, cols) };
    case "undertowScar":
      return { id: "boss.undertowScar", pan: panForCol(e.col, cols) };
    case "undertowWidened":
      return { id: "boss.undertowWidened", pan: panForCol(e.col, cols) };
    case "undertowUnseated":
      return { id: "boss.undertowUnseated", pan: panForCol(e.col, cols) };
    case "undertowClosed":
      // The same plate closing as after a take, quieter: nothing went in.
      return { id: "boss.undertowTaken", pan: panForCol(e.col, cols), gain: 0.7 };
    case "undertowRise":
      return { id: "boss.undertowRise" };
    case "undertowSwallowed":
      return { id: "boss.undertowSwallowed", pan: panForCol(e.col, cols) };
    case "undertowThrough":
      return { id: "boss.undertowThrough", pan: panForCol(e.col, cols) };
  }
}
