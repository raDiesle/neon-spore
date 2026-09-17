import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE CURTAIN's ten, in a file of their own for `bind-gorge.ts`' reason.
 *
 * Every one of them is panned, because every one of them names a column —
 * and here the column is the whole sentence: which lobe is soft, which
 * column the core stands in, where the fabric's edge is after a shove. The
 * two that name the *fabric* are panned to its middle, not its left edge:
 * a sheet seven columns wide has no side to speak of, and its middle is the
 * one place both hands can agree on.
 */
export function curtainCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "curtainUnroll"
        | "curtainShadow"
        | "curtainSoft"
        | "curtainShove"
        | "curtainReroll"
        | "curtainLobeOff"
        | "curtainCoreHit"
        | "curtainFire"
        | "curtainTear"
        | "curtainOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "curtainUnroll":
      return { id: "boss.curtainUnroll", pan: panForCol(e.col + Math.floor(e.width / 2), cols) };
    case "curtainShadow":
      return { id: "boss.curtainShadow", pan };
    case "curtainSoft":
      return { id: "boss.curtainSoft", pan };
    case "curtainShove":
      // Two columns at a stride is a lighter sheet, and it sounds lighter.
      return { id: "boss.curtainShove", pan, pitch: e.stride > 1 ? 1.2 : 1 };
    case "curtainReroll":
      return { id: "boss.curtainReroll", pan };
    case "curtainLobeOff":
      // A step up per lobe gone, so the hem thinning can be counted by ear.
      return { id: "boss.curtainLobeOff", pan, pitch: 1.1 - e.left * 0.02 };
    case "curtainCoreHit":
      return { id: "boss.curtainCoreHit", pan };
    case "curtainFire":
      return { id: "boss.curtainFire", pan };
    case "curtainTear":
      return { id: "boss.curtainTear", pan };
    case "curtainOut":
      return { id: "boss.curtainOut", pan };
  }
}
