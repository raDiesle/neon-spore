import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE CYST's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the sac hangs over `midCol`, so every one of
 * them is in the middle.
 *
 * **A hit rises as they add up**, so how far the pair are along can be heard
 * without either of them looking.
 */
export function cystCue(e: Extract<SimEvent, { type: `cyst${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "cystEnter":
      return { id: "boss.cystEnter", pan };
    case "cystLight":
      return { id: "boss.cystLight", pan };
    case "cystStill":
      return { id: "boss.cystStill", pan };
    case "cystShudder":
      return { id: "boss.cystShudder", pan };
    case "cystSlip":
      return { id: "boss.cystSlip", pan };
    case "cystCrack":
      return { id: "boss.cystCrack", pan };
    case "cystSpring":
      return { id: "boss.cystSpring", pan };
    case "cystBare":
      return { id: "boss.cystBare", pan };
    case "cystHit":
      return { id: "boss.cystHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "cystGuard":
      return { id: "boss.cystGuard", pan };
    case "cystSeal":
      return { id: "boss.cystSeal", pan };
    case "cystMiss":
      return { id: "boss.cystMiss", pan };
    case "cystSplit":
      return { id: "boss.cystSplit", pan };
    case "cystOut":
      return { id: "boss.cystOut", pan };
  }
}
