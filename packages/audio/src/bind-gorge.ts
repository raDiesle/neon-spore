import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE GORGE's fourteen, in a file of their own for `bind-candle.ts`' reason.
 *
 * Every one of them is panned, because every one of them names a column:
 * the sack is seven intakes wide and which one just swallowed, filled,
 * vented or spat is the whole of what the pair has to say to each other. The
 * swallow rises in pitch with the tally, so the ear can count to four
 * without the eye — player 2's screen has no tally on it.
 */
export function gorgeCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "gorgeSettle"
        | "gorgeSwallow"
        | "gorgeEmptied"
        | "gorgeFull"
        | "gorgeRupture"
        | "gorgeNick"
        | "gorgeVent"
        | "gorgeSpit"
        | "gorgeMouth"
        | "gorgeOut"
        | "gorgePinch"
        | "gorgePry"
        | "gorgePryFill"
        | "gorgeClench";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "gorgeSettle":
      // The sack is wide: panned to its middle, not its left edge.
      return { id: "boss.gorgeSettle", pan: panForCol(e.col + Math.floor(e.width / 2), cols) };
    case "gorgeSwallow":
      // A step up per bead, so four in a row climb to the pierce.
      return { id: "boss.gorgeSwallow", pan, pitch: 0.85 + e.beads * 0.08 };
    case "gorgeEmptied":
      return { id: "boss.gorgeEmptied", pan };
    case "gorgeFull":
      return { id: "boss.gorgeFull", pan };
    case "gorgeRupture":
      return { id: "boss.gorgeRupture", pan };
    case "gorgeNick":
      return { id: "boss.gorgeNick", pan };
    case "gorgeVent":
      return { id: "boss.gorgeVent", pan };
    case "gorgeSpit":
      return { id: "boss.gorgeSpit", pan };
    case "gorgeMouth":
      return { id: "boss.gorgeMouth", pan };
    case "gorgeOut":
      return { id: "boss.gorgeOut", pan };
    case "gorgePinch":
      return { id: "boss.gorgePinch", pan };
    case "gorgePry":
      return { id: "boss.gorgePry", pan };
    case "gorgePryFill":
      return { id: "boss.gorgePryFill", pan };
    case "gorgeClench":
      return { id: "boss.gorgeClench", pan };
  }
}
