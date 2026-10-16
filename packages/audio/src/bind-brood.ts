import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type BroodSimEvent = Extract<SimEvent, { type: `brood${string}` }>;

/**
 * THE BROOD's twelve, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column, so a bud is heard where it hangs
 * before it is seen. **A pop climbs as the lobes run out**, so a sac nearly
 * beaten is heard nearly beaten; a red bud and a cyan one are a step apart,
 * the way a slick and a bulb are on the ordinary field.
 */
export function broodCue(e: BroodSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "broodEnter":
      return { id: "boss.broodEnter", pan };
    case "broodBud":
      return { id: "boss.broodBud", pan, pitch: e.color === "red" ? 0.94 : 1.06 };
    case "broodPop":
      return { id: "boss.broodPop", pan, pitch: 1 + Math.max(0, 10 - e.left) * 0.03 };
    case "broodDrop":
      return { id: "boss.broodDrop", pan, pitch: e.color === "red" ? 0.94 : 1.06 };
    case "broodSpoil":
      return { id: "boss.broodSpoil", pan };
    case "broodHide":
      return { id: "boss.broodHide", pan };
    case "broodSpent":
      return { id: "boss.broodSpent", pan };
    case "broodOut":
      return { id: "boss.broodOut", pan };
    // A body beginning inside is a bud's swelling, lower: it is under the skin.
    case "broodEgg":
      return { id: "boss.broodBud", pan, pitch: e.color === "red" ? 0.7 : 0.78, gain: 0.7 };
    case "broodLay":
      return { id: "boss.broodLay", pan, pitch: e.color === "red" ? 0.94 : 1.06 };
    case "broodShudder":
      return { id: "boss.broodShudder", pan };
    case "broodLurch":
      return { id: "boss.broodLurch", pan };
  }
}
