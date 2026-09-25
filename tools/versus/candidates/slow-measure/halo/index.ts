import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { haloWindow } from "./paint.js";

/**
 * HALO — one ring round the whole boss, closing onto its skin.
 *
 * Offered against the shipped fuse along the top of the screen
 * (`packages/render/src/slow-fuse.ts`), 25 September 2026: the owner asked for
 * the fuse built into the game and the other answers here. Each one keeps the
 * shipped streams and changes only how the time left is shown.
 */
export const SLOW_HALO: Variant = {
  slot: "slow:measure",
  name: "halo",
  sentence:
    "halo — one ring round the whole boss, open where it hangs from, closing onto its skin as the window runs out and red for the last two beats",
  dir: "tools/versus/candidates/slow-measure/halo",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: haloWindow },
    }),
  ],
};
