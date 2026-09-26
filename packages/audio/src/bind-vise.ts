import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE VISE's fourteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the case stands over `midCol`, so every one but
 * the seed's burst is in the middle, and that one is heard over its column.
 *
 * **A crack and a hit are pitched up as they add up**, so how far the pair
 * are along can be heard without either of them counting.
 */
export function viseCue(e: Extract<SimEvent, { type: `vise${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "viseEnter":
      return { id: "boss.viseEnter", pan };
    case "viseLight":
      return { id: "boss.viseLight", pan };
    case "viseSlip":
      return { id: "boss.viseSlip", pan };
    case "viseCrack":
      // Higher on a lobe's second seam: the husk giving reads as the thud rising.
      return { id: "boss.viseCrack", pan, pitch: 1 + Math.max(0, e.cracks - 1) * 0.06 };
    case "viseSpring":
      return { id: "boss.viseSpring", pan };
    case "viseBare":
      return { id: "boss.viseBare", pan };
    case "viseHit":
      return { id: "boss.viseHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "viseBrace":
      return { id: "boss.viseBrace", pan };
    case "viseCover":
      return { id: "boss.viseCover", pan };
    case "viseBlock":
      // The bite met: the shield's own clang, THE SEAM's grit sound.
      return { id: "boss.seamBlock", pan };
    case "viseSeedBurst":
      // The seed burst: the kernel's hit, lower, since the kernel took nothing.
      return { id: "boss.viseHit", pan, pitch: 0.85 };
    case "viseMiss":
      return { id: "boss.viseMiss", pan };
    case "viseSplit":
      return { id: "boss.viseSplit", pan };
    case "viseOut":
      return { id: "boss.viseOut", pan };
  }
}
