import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { implodeWindow } from "./paint.js";

/**
 * IMPLODE — rings of bent light fall into the middle of the boss.
 *
 * Offered 25 September 2026, when the owner said the shipped streams were not
 * it yet and asked for light *sucked into the middle of the boss*. Every
 * answer in `slow:pull` keeps the shipped fuse and replaces the streams.
 */
export const SLOW_IMPLODE: Variant = {
  slot: "slow:pull",
  name: "implode",
  sentence:
    "implode — once a beat a ring of bent light closes in from the edges of the screen, speeding up as it falls, and vanishes into the middle of the boss with a flash",
  dir: "tools/versus/candidates/slow-pull/implode",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: implodeWindow },
    }),
  ],
};
