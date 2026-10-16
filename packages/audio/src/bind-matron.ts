import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type MatronSimEvent = Extract<SimEvent, { type: `matron${string}` }>;

/**
 * THE MATRON's seven, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column: a throw to the column it comes down, a
 * lobe to the pod that took it. **A lobe going climbs as she empties**, so
 * the last pods are heard as the last; a clutch cleared falls lower each
 * level, THE HYDRA's way, so the fight is heard going deeper.
 */
export function matronCue(e: MatronSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "matronEnter":
      return { id: "boss.matronEnter", pan };
    case "matronHang":
      return { id: "boss.matronHang", pan };
    case "matronThrow":
      return { id: "boss.matronThrow", pan };
    case "matronLobe":
      return { id: "boss.matronLobe", pan, pitch: 1 + Math.max(0, 8 - e.left) * 0.04 };
    case "matronCleared":
      return { id: "boss.matronCleared", pan, pitch: 1 - Math.min(4, e.level) * 0.08 };
    case "matronSpent":
      return { id: "boss.matronSpent", pan };
    case "matronOut":
      return { id: "boss.matronOut", pan };
  }
}
