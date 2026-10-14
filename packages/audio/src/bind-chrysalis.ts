import type { SimEvent } from "@neon-spore/sim";
import type { Cue } from "./bind-cue.js";
import { panForCol } from "./bind-place.js";

type ChrysalisSimEvent = Extract<SimEvent, { type: `chrysalis${string}` }>;

/** How deep a skin lies, nought the outer slime: each skin in is heard a step lower. */
const DEPTH = { slime: 0, quills: 1, sacs: 2, heart: 3 } as const;

/**
 * THE CHRYSALIS's fifteen, routed by their prefix (`bind-prefixed.ts`).
 *
 * Everything is panned to its column: a rub and a quill to its own side, a
 * sac and the heart to where they stand. **A skin coming off is pitched down
 * the deeper it lay**, THE BASTION's way, so the four peels are heard as a
 * cocoon getting smaller; so is a skin lighting. A turn of the rub climbs a
 * little with every turn, so a half nearly clear is heard nearly clear.
 */
export function chrysalisCue(e: ChrysalisSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "chrysalisEnter":
      return { id: "boss.chrysalisEnter", pan };
    case "chrysalisSkin":
      return { id: "boss.chrysalisSkin", pan, pitch: 1 - DEPTH[e.skin] * 0.08 };
    case "chrysalisRub":
      return { id: "boss.chrysalisRub", pan, pitch: 1 + Math.min(12, e.rubbed) * 0.02 };
    case "chrysalisWipe":
      return { id: "boss.chrysalisWipe", pan };
    case "chrysalisRip":
      return { id: "boss.chrysalisRip", pan, pitch: 1 + (e.piece % 4) * 0.05 };
    case "chrysalisSnap":
      return { id: "boss.chrysalisSnap", pan };
    case "chrysalisWrong":
      return { id: "boss.chrysalisWrong", pan };
    case "chrysalisSwell":
      return { id: "boss.chrysalisSwell", pan };
    case "chrysalisBurst":
      return { id: "boss.chrysalisBurst", pan };
    case "chrysalisSpray":
      return { id: "boss.chrysalisSpray", pan };
    case "chrysalisHeart":
      return { id: "boss.chrysalisHeart", pan };
    case "chrysalisShed":
      return { id: "boss.chrysalisShed", pan, pitch: 1 - DEPTH[e.skin] * 0.1 };
    case "chrysalisRegrow":
      return { id: "boss.chrysalisRegrow", pan };
    case "chrysalisSpent":
      return { id: "boss.chrysalisSpent", pan };
    case "chrysalisOut":
      return { id: "boss.chrysalisOut", pan };
  }
}
