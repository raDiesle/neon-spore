import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { ebbWindow } from "./paint.js";

/**
 * EBB — no new element: the light round the boss thins as the window runs out.
 *
 * Offered against the shipped fuse along the top of the screen
 * (`packages/render/src/slow-fuse.ts`), 25 September 2026: the owner asked for
 * the fuse built into the game and the other answers here. Each one keeps the
 * shipped streams and changes only how the time left is shown.
 */
export const SLOW_EBB: Variant = {
  slot: "slow:measure",
  name: "ebb",
  sentence:
    "ebb — no fuse: the streams of light round the boss come in at full strength and thin as the window runs out, gone on the beat the step fails",
  dir: "tools/versus/candidates/slow-measure/ebb",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: ebbWindow },
    }),
  ],
};
