import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE TASTER's sixteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Fourteen of them name a column and are panned to it, because a column is a
 * blade: which one just grew, set, thickened or came off is the whole of what
 * the pair has to say to each other, and player 2's screen does not carry the
 * ledger that says why.
 *
 * The two that do not name one are about the whole fan — the crest going and
 * the re-edge — and they play dead centre, at a pan of nought, so the ear can
 * tell a fan-wide event from a blade without looking. Nought rather than
 * `panForCol(midCol(cfg), cols)`: a cue has the width of the field and not the
 * config, and the centre of the stereo image is a fact about the mix rather
 * than a column anything stands in.
 *
 * `tasterThick` and `tasterPare` are pitched by thickness, in opposite
 * directions: thicker is lower, pared is higher, so the ear hears the edge
 * being worked without counting layers.
 *
 * **The three hands all name a column and are all panned to it**, the pry
 * included: the interlock stands over the middle of the crest and that is
 * where its event is raised, so a pan read off the column is the same answer
 * `tasterRise` gives and one fewer special case (`sim/taster-hand.ts`).
 */
export function tasterCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "tasterRise"
        | "tasterGrow"
        | "tasterSet"
        | "tasterThick"
        | "tasterPare"
        | "tasterShear"
        | "tasterCrest"
        | "tasterLift"
        | "tasterTaste"
        | "tasterClose"
        | "tasterRefused"
        | "tasterPin"
        | "tasterWipe"
        | "tasterPry"
        | "tasterPryFill"
        | "tasterOut";
    }
  >,
  cols: number,
): Cue {
  switch (e.type) {
    case "tasterRise":
      // The crest is a fan wide: panned to its middle, not its left edge.
      return { id: "boss.tasterRise", pan: panForCol(e.col + Math.floor(e.width / 2), cols) };
    case "tasterGrow":
      return { id: "boss.tasterGrow", pan: panForCol(e.col, cols) };
    case "tasterSet":
      return { id: "boss.tasterSet", pan: panForCol(e.col, cols) };
    case "tasterThick":
      // A step down per layer: the blade the pair has been feeding.
      return {
        id: "boss.tasterThick",
        pan: panForCol(e.col, cols),
        pitch: 1.05 - e.layers * 0.1,
      };
    case "tasterPare":
      return {
        id: "boss.tasterPare",
        pan: panForCol(e.col, cols),
        pitch: 1.15 - e.layers * 0.08,
      };
    case "tasterShear":
      return { id: "boss.tasterShear", pan: panForCol(e.col, cols) };
    case "tasterCrest":
      return { id: "boss.tasterCrest", pan: panForCol(e.col, cols) };
    case "tasterLift":
      return { id: "boss.tasterLift", pan: 0 };
    case "tasterTaste":
      return { id: "boss.tasterTaste", pan: 0 };
    case "tasterClose":
      return { id: "boss.tasterClose", pan: panForCol(e.col, cols) };
    case "tasterRefused":
      return { id: "boss.tasterRefused", pan: panForCol(e.col, cols) };
    case "tasterPin":
      return { id: "boss.tasterPin", pan: panForCol(e.col, cols) };
    case "tasterWipe":
      return { id: "boss.tasterWipe", pan: panForCol(e.col, cols) };
    case "tasterPry":
      return { id: "boss.tasterPry", pan: panForCol(e.col, cols) };
    case "tasterPryFill":
      return { id: "boss.tasterPryFill", pan: panForCol(e.col, cols) };
    case "tasterOut":
      return { id: "boss.tasterOut", pan: panForCol(e.col, cols) };
  }
}
