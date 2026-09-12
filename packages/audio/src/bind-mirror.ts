import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";
import { MIRROR_STEP_SOUNDS } from "./bind-lookups.js";

/**
 * THE MIRROR's four and THE MAZE's four, cut out of `bind.ts` when it
 * reached its 250-line limit — along the seam the two rounds
 * already share: a step shown, a step answered, a verdict, and the round
 * going down, with the maze reading the mirror's own cues for every one of
 * them because what a shot into a mouth *is* is a turn handed over.
 *
 * Moved whole; every comment is the one that stood beside its case before.
 */
export function mirrorCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "mirrorShow"
        | "mirrorEcho"
        | "mirrorVerdict"
        | "mirrorDown"
        | "mazeCommit"
        | "mazeProbe"
        | "mazeVerdict"
        | "mazeDown";
    }
  >,
  cols: number,
): Cue | null {
  switch (e.type) {
    case "mirrorShow":
      return { id: MIRROR_STEP_SOUNDS[e.step] ?? "mirror.handover", pan: panForCol(e.col, cols) };
    case "mirrorEcho":
      // Each step answered sits a little higher than the one before it, so a
      // long round is heard to be going well without anyone saying so.
      return { id: "mirror.echo", pitch: 1 + (e.index - 1) * 0.06 };
    case "mirrorVerdict":
      if (e.right) return { id: "mirror.verdictRight", pan: panForCol(e.col, cols) };
      return {
        id:
          e.reason === "bait"
            ? "mirror.bait"
            : e.reason === "silence"
              ? "mirror.silence"
              : "mirror.verdictWrong",
        pan: panForCol(e.col, cols),
      };
    case "mirrorDown":
      return { id: "mirror.down", pan: panForCol(e.col, cols) };
    case "mazeCommit":
      // The shot going into a mouth. `mirror.handover` is the cue written for
      // "your turn is over, the answer is out of your hands now", which is
      // exactly what committing to a mouth is.
      return { id: "mirror.handover", pan: panForCol(e.col, cols) };
    case "mazeProbe":
      // One cell further in, and a step higher each time, so a shot still
      // travelling is heard to be getting somewhere without anyone saying so.
      return { id: "mirror.echo", pitch: 1 + e.ring * 0.06 };
    case "mazeVerdict":
      if (e.right) return { id: "mirror.verdictRight", pan: panForCol(e.col, cols) };
      return {
        id: e.reason === "silence" ? "mirror.silence" : "mirror.verdictWrong",
        pan: panForCol(e.col, cols),
      };
    case "mazeDown":
      return { id: "mirror.down", pan: panForCol(e.col, cols) };
  }
}
