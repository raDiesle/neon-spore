import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SLING's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the fork is bolted over `midCol`, so every one
 * of them is in the middle.
 *
 * **A loose and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 */
export function slingCue(e: Extract<SimEvent, { type: `sling${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "slingEnter":
      return { id: "boss.slingEnter", pan };
    case "slingLight":
      return { id: "boss.slingLight", pan };
    case "slingSlack":
      return { id: "boss.slingSlack", pan };
    case "slingLoose":
      // Higher on an arm's second draw: the band pulled tighter reads as the note rising.
      return { id: "boss.slingLoose", pan, pitch: 1 + Math.max(0, e.draws - 1) * 0.06 };
    case "slingSpring":
      return { id: "boss.slingSpring", pan };
    case "slingYoke":
      return { id: "boss.slingYoke", pan };
    case "slingHit":
      return { id: "boss.slingHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "slingSteady":
      return { id: "boss.slingSteady", pan };
    case "slingDim":
      return { id: "boss.slingDim", pan };
    case "slingMiss":
      return { id: "boss.slingMiss", pan };
    case "slingFree":
      return { id: "boss.slingFree", pan };
    case "slingOut":
      return { id: "boss.slingOut", pan };
  }
}
