import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE TRIVET's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the stand stands over `midCol`, so every one
 * of them is in the middle but a lurch's and a needle's.
 *
 * **A needle turned is the shield's own deflect**, THE GUM's and THE CLING's
 * choice: it is the shield doing what it always does.
 *
 * **A plant and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 */
export function trivetCue(e: Extract<SimEvent, { type: `trivet${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "trivetEnter":
      return { id: "boss.trivetEnter", pan };
    case "trivetLight":
      return { id: "boss.trivetLight", pan };
    case "trivetSlip":
      return { id: "boss.trivetSlip", pan };
    case "trivetPlant":
      // Higher on a foot's second plant: the leg driven home reads as the thud rising.
      return { id: "boss.trivetPlant", pan, pitch: 1 + Math.max(0, e.level - 1) * 0.06 };
    case "trivetSpring":
      return { id: "boss.trivetSpring", pan };
    case "trivetHub":
      return { id: "boss.trivetHub", pan };
    case "trivetHit":
      return { id: "boss.trivetHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "trivetBrace":
      return { id: "boss.trivetBrace", pan };
    case "trivetRock":
      return { id: "boss.trivetRock", pan };
    case "trivetMiss":
      return { id: "boss.trivetMiss", pan };
    case "trivetTurn":
      return { id: "impact.deflect", pan };
    case "trivetCollapse":
      return { id: "boss.trivetCollapse", pan };
    case "trivetOut":
      return { id: "boss.trivetOut", pan };
  }
}
