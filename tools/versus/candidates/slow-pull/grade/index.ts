import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { gradeWindow } from "./paint.js";

/**
 * GRADE — the room goes cold and grey, and the boss burns.
 *
 * Offered 25 September 2026, when the owner said the shipped streams were not
 * it yet and asked for light *sucked into the middle of the boss*. Every
 * answer in `slow:pull` keeps the shipped fuse and replaces the streams.
 */
export const SLOW_GRADE: Variant = {
  slot: "slow:pull",
  name: "grade",
  sentence:
    "grade — the field outside the boss drains to a cold grey-blue with dark corners, while the boss keeps every colour it has and flares hotter on each beat",
  dir: "tools/versus/candidates/slow-pull/grade",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: gradeWindow },
    }),
  ],
};
