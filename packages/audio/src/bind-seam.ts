import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SEAM's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the ridge stands over `midCol`, so all but a
 * rock's are in the middle, and a rock spat to one side is heard on that side.
 *
 * **The seal is pitched up per point closed**, so how far the pair are along
 * can be heard without either of them counting.
 *
 * **The two steps that ask for nothing borrow**: the false point fired at is
 * the miss, for it is one; its flicker fading is the dim click, low; and a
 * bolt into the dark is the seal again, low, the ridge shutting on it.
 */
export function seamCue(e: Extract<SimEvent, { type: `seam${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "seamEnter":
      return { id: "boss.seamEnter", pan };
    case "seamLight":
      return { id: "boss.seamLight", pan };
    case "seamDim":
      return { id: "boss.seamDim", pan };
    case "seamQuench":
      // The glow's own dimming: the dim click, lower the more is left to put out.
      return { id: "boss.seamDim", pan, pitch: 1 - Math.min(3, e.left) * 0.08 };
    case "seamSeal":
      // Higher as the points close: the crack shutting reads as the click rising.
      return { id: "boss.seamSeal", pan, pitch: 1 + Math.max(0, e.sealed - 1) * 0.06 };
    case "seamRockOut":
      return { id: "boss.seamRockOut", pan };
    case "seamBlock":
      return { id: "boss.seamBlock", pan };
    case "seamBaited":
      return { id: "boss.seamMiss", pan, pitch: 0.85 };
    case "seamFade":
      return { id: "boss.seamDim", pan, pitch: 0.7 };
    case "seamReseal":
      return { id: "boss.seamSeal", pan, pitch: 0.8 };
    case "seamMiss":
      return { id: "boss.seamMiss", pan };
    case "seamSplit":
      return { id: "boss.seamSplit", pan };
    case "seamOut":
      return { id: "boss.seamOut", pan };
  }
}
