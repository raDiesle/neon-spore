import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE DAVIT's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the boom hangs over `midCol`, so every one of
 * them is in the middle.
 *
 * **A hit rises as they add up**, and so does a loose within its swing, so
 * how far the pair are along can be heard without either of them looking.
 */
export function davitCue(e: Extract<SimEvent, { type: `davit${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "davitEnter":
      return { id: "boss.davitEnter", pan };
    case "davitLight":
      return { id: "boss.davitLight", pan };
    case "davitDrift":
      return { id: "boss.davitDrift", pan };
    case "davitSlack":
      return { id: "boss.davitSlack", pan };
    case "davitLoose":
      return { id: "boss.davitLoose", pan, pitch: 1 + Math.max(0, e.looses - 1) * 0.08 };
    case "davitSway":
      return { id: "boss.davitSway", pan };
    case "davitPivot":
      return { id: "boss.davitPivot", pan };
    case "davitHit":
      return { id: "boss.davitHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "davitReland":
      return { id: "boss.davitReland", pan };
    case "davitDim":
      return { id: "boss.davitDim", pan };
    case "davitMiss":
      return { id: "boss.davitMiss", pan };
    case "davitSpent":
      return { id: "boss.davitSpent", pan };
    case "davitOut":
      return { id: "boss.davitOut", pan };
  }
}
