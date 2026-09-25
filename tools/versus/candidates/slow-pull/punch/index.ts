import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { punchWindow } from "./paint.js";

/**
 * PUNCH — the lens jumps in onto the boss, and lets go when it is over.
 *
 * Offered 25 September 2026, when the owner said the shipped streams were not
 * it yet and asked for light *sucked into the middle of the boss*. Every
 * answer in `slow:pull` keeps the shipped fuse and replaces the streams.
 */
export const SLOW_PUNCH: Variant = {
  slot: "slow:pull",
  name: "punch",
  sentence:
    "punch — the field snaps in about the boss as the window opens, rings down onto a closer hold with the corners gone dark, and springs back out on the beat it shuts",
  dir: "tools/versus/candidates/slow-pull/punch",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: punchWindow },
    }),
  ],
};
