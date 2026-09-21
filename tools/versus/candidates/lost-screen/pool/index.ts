import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { risingPool } from "./paint.js";

/**
 * POOL — a level comes up the foot of the phone and stops under the hull.
 *
 * The one answer in the slot that is not a thing arriving. The other three all
 * say *it is still happening*; this says *it has happened*, which is what a
 * lost wave is by the time the screen is up. It is also the only one a pair
 * can come back to after a minute of arguing and find exactly where they left
 * it — the shipped fluid loops, and a loop is the one thing a surface with
 * weight never does.
 */
export const LOST_POOL: Variant = {
  slot: "lost:screen",
  name: "pool",
  sentence:
    "pool — a level of red rises up the foot of the phone over nine seconds, stops half a tile under the hull with the breach standing clear above it, and after that only its surface breathes",
  dir: "tools/versus/candidates/lost-screen/pool",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: risingPool },
    }),
  ],
};
