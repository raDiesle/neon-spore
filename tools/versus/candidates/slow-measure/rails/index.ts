import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { railsWindow } from "./paint.js";

/**
 * RAILS — both side edges of the screen, burning down to the hull.
 *
 * Offered against the shipped fuse along the top of the screen
 * (`packages/render/src/slow-fuse.ts`), 25 September 2026: the owner asked for
 * the fuse built into the game and the other answers here. Each one keeps the
 * shipped streams and changes only how the time left is shown.
 */
export const SLOW_RAILS: Variant = {
  slot: "slow:measure",
  name: "rails",
  sentence:
    "rails — two lines up the side edges of the screen that burn from the top down and reach the hull on the beat the step fails, red for the last two beats",
  dir: "tools/versus/candidates/slow-measure/rails",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: railsWindow },
    }),
  ],
};
