import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE PLUMB's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the bob hangs over `midCol`, so every one of
 * them is in the middle.
 *
 * **A settle and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 */
export function plumbCue(e: Extract<SimEvent, { type: `plumb${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "plumbEnter":
      return { id: "boss.plumbEnter", pan };
    case "plumbLight":
      return { id: "boss.plumbLight", pan };
    case "plumbDrift":
      return { id: "boss.plumbDrift", pan };
    case "plumbSettle":
      // Higher on a weight's second settle: the line pulled true reads as the note rising.
      return { id: "boss.plumbSettle", pan, pitch: 1 + Math.max(0, e.level - 1) * 0.06 };
    case "plumbSwing":
      return { id: "boss.plumbSwing", pan };
    case "plumbCore":
      return { id: "boss.plumbCore", pan };
    case "plumbHit":
      return { id: "boss.plumbHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "plumbSteady":
      return { id: "boss.plumbSteady", pan };
    case "plumbDim":
      return { id: "boss.plumbDim", pan };
    case "plumbMiss":
      return { id: "boss.plumbMiss", pan };
    case "plumbFree":
      return { id: "boss.plumbFree", pan };
    case "plumbOut":
      return { id: "boss.plumbOut", pan };
  }
}
