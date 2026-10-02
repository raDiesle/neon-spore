import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE GORGE's nine, in a file of their own because `bind.ts` is full.
 *
 * Every one of them is panned, because every one of them names a column:
 * which bubble just swallowed, sated or spat is the whole of what the pair
 * has to say to each other. The swallow rises in pitch with what the bubble
 * holds and the tap with the taps given, so the ear can count without the
 * eye — player 2's screen has no count on it.
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
        | "gorgeSpit"
        | "gorgeTap"
        | "gorgeTurn"
        | "gorgeCleared"
        | "gorgeOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "gorgeSettle":
      // A level is wide: panned to its middle, not its left edge.
      return { id: "boss.gorgeSettle", pan: panForCol(e.col + Math.floor(e.width / 2), cols) };
    case "gorgeSwallow":
      // A step up per shot held, so a bubble's fill climbs to its sating.
      return { id: "boss.gorgeSwallow", pan, pitch: 0.85 + e.beads * 0.08 };
    case "gorgeEmptied":
      return { id: "boss.gorgeEmptied", pan };
    case "gorgeFull":
      return { id: "boss.gorgeFull", pan };
    case "gorgeSpit":
      return { id: "boss.gorgeSpit", pan };
    case "gorgeTap":
      // Higher as fewer are left, so the opening tap is the top of the climb.
      return { id: "boss.gorgeTap", pan, pitch: 1.2 - Math.min(e.left, 4) * 0.1 };
    case "gorgeTurn":
      return { id: "boss.gorgeTurn", pan };
    case "gorgeCleared":
      return { id: "boss.gorgeCleared", pan };
    case "gorgeOut":
      return { id: "boss.gorgeOut", pan };
  }
}
