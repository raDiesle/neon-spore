import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE RIME's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the lens stands over `midCol`, so every one of
 * them is in the middle.
 *
 * **A clear and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 */
export function rimeCue(e: Extract<SimEvent, { type: `rime${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "rimeEnter":
      return { id: "boss.rimeEnter", pan };
    case "rimeLight":
      return { id: "boss.rimeLight", pan };
    case "rimeShave":
      return { id: "boss.rimeShave", pan };
    case "rimeClear":
      // Higher on a half's second wipe: the glass coming clear reads as the ring rising.
      return { id: "boss.rimeClear", pan, pitch: 1 + Math.max(0, e.wipes - 1) * 0.06 };
    case "rimeFrost":
      return { id: "boss.rimeFrost", pan };
    case "rimeBare":
      return { id: "boss.rimeBare", pan };
    case "rimeHit":
      return { id: "boss.rimeHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "rimeBlock":
      return { id: "boss.rimeBlock", pan };
    case "rimeCloud":
      return { id: "boss.rimeCloud", pan };
    case "rimeMiss":
      return { id: "boss.rimeMiss", pan };
    case "rimeShatter":
      return { id: "boss.rimeShatter", pan };
    case "rimeOut":
      return { id: "boss.rimeOut", pan };
  }
}
