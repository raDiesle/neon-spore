import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type MothSimEvent = Extract<SimEvent, { type: `moth${string}` }>;

/**
 * THE MOTH's twelve, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column, so the pilot hears where it goes
 * before looking. **A tear climbs as its parts run out**, so a moth nearly
 * beaten is heard nearly beaten; a drift is quieter than a hop, which is it
 * flying from the light.
 */
export function mothCue(e: MothSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "mothEnter":
      return { id: "boss.mothEnter", pan };
    case "mothStep":
      return { id: "boss.mothStep", pan };
    case "mothFlit":
      return { id: "boss.mothFlit", pan, gain: Math.abs(e.by) > 1 ? 1 : 0.7 };
    case "mothSettle":
      return { id: "boss.mothSettle", pan };
    case "mothTear":
      return { id: "boss.mothTear", pan, pitch: 1 + Math.max(0, 7 - e.left) * 0.04 };
    case "mothBelly":
      return { id: "boss.mothBelly", pan, pitch: 1 + Math.max(0, 3 - e.left) * 0.06 };
    case "mothHide":
      return { id: "boss.mothHide", pan };
    case "mothSpoil":
      return { id: "boss.mothSpoil", pan };
    case "mothDust":
      return { id: "boss.mothDust", pan };
    case "mothLand":
      return { id: "boss.mothLand", pan };
    case "mothSpent":
      return { id: "boss.mothSpent", pan };
    case "mothOut":
      return { id: "boss.mothOut", pan };
  }
}
