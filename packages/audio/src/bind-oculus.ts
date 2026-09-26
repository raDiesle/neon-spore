import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE OCULUS's twelve, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the eye stands over `midCol`, so every one of
 * them is in the middle.
 *
 * **A leaf shut and a hit are pitched up as they add up**, so how far the
 * pair are along can be heard without either of them counting.
 */
export function oculusCue(e: Extract<SimEvent, { type: `oculus${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "oculusEnter":
      return { id: "boss.oculusEnter", pan };
    case "oculusLight":
      return { id: "boss.oculusLight", pan };
    case "oculusSlip":
      return { id: "boss.oculusSlip", pan };
    case "oculusShut":
      // Higher as the leaves close: the iris shutting reads as the click rising.
      return { id: "boss.oculusShut", pan, pitch: 1 + Math.max(0, e.shut / 2 - 1) * 0.06 };
    case "oculusSpring":
      return { id: "boss.oculusSpring", pan };
    case "oculusBreak":
      return { id: "boss.oculusBreak", pan };
    case "oculusHit":
      return { id: "boss.oculusHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "oculusReseal":
      return { id: "boss.oculusReseal", pan };
    case "oculusSwallow":
      return { id: "boss.oculusSwallow", pan };
    case "oculusMiss":
      return { id: "boss.oculusMiss", pan };
    case "oculusShatter":
      return { id: "boss.oculusShatter", pan };
    case "oculusOut":
      return { id: "boss.oculusOut", pan };
  }
}
