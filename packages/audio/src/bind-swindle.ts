import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type SwindleSimEvent = Extract<SimEvent, { type: `swindle${string}` }>;

/**
 * THE SWINDLE's ten, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column. **Nothing before the receipt sounds
 * different for a fake pod**: the hang, the swap, the hood and the drop are
 * one cue each whatever the pod is, because both screens hear them and the pilot's
 * must not learn from its ears what its picture hides. A real pod taken
 * climbs as her real pods run out, THE MATRON's way.
 */
export function swindleCue(e: SwindleSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "swindleEnter":
      return { id: "boss.swindleEnter", pan };
    case "swindleHang":
      return { id: "boss.swindleHang", pan };
    case "swindleSwap":
      return { id: "boss.swindleSwap", pan };
    case "swindleHood":
      return { id: "boss.swindleHood", pan };
    case "swindleDrop":
      return { id: "boss.swindleDrop", pan };
    case "swindleTaken":
      return { id: "boss.swindleTaken", pan, pitch: 1 + Math.max(0, 6 - e.left) * 0.05 };
    case "swindleRefused":
      return { id: "boss.swindleRefused", pan };
    case "swindleCleared":
      return { id: "boss.swindleCleared", pan, pitch: 1 - Math.min(4, e.level) * 0.08 };
    case "swindleSpent":
      return { id: "boss.swindleSpent", pan };
    case "swindleOut":
      return { id: "boss.swindleOut", pan };
  }
}
