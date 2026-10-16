import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type GeodeSimEvent = Extract<SimEvent, { type: `geode${string}` }>;

/**
 * THE GEODE's nine, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column: a cleave and a chip to where the shot
 * went up, the strike to where the stone lands. **A level is heard a step
 * higher the further in it is**, the stone breaking towards its crystal, so
 * the heart's cracks ring where the boulder's rumbled.
 */
export function geodeCue(e: GeodeSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "geodeEnter":
      return { id: "boss.geodeEnter", pan };
    case "geodeCracks":
      return { id: "boss.geodeCracks", pan, pitch: 1 + Math.min(4, e.level) * 0.08 };
    case "geodeCleave":
      return { id: "boss.geodeCleave", pan, pitch: 1 + Math.min(4, e.level) * 0.06 };
    case "geodeChip":
      return { id: "boss.geodeChip", pan };
    case "geodeWrong":
      return { id: "boss.geodeWrong", pan };
    case "geodeSplit":
      return { id: "boss.geodeSplit", pan, pitch: 1 + Math.min(4, e.level) * 0.06 };
    case "geodeStrike":
      return { id: "boss.geodeStrike", pan };
    case "geodeShatter":
      return { id: "boss.geodeShatter", pan };
    case "geodeOut":
      return { id: "boss.geodeOut", pan };
  }
}
