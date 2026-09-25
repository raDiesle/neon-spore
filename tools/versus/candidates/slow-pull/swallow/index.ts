import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { swallowWindow } from "./paint.js";

/**
 * SWALLOW — the field's own light, trailed into the boss's middle.
 *
 * Offered 25 September 2026, when the owner said the shipped streams were not
 * it yet and asked for light *sucked into the middle of the boss*. Every
 * answer in `slow:pull` keeps the shipped fuse and replaces the streams.
 */
export const SLOW_SWALLOW: Variant = {
  slot: "slow:pull",
  name: "swallow",
  sentence:
    "swallow — a zoom blur centred on the boss: every lit thing on the field trails inward into its middle, twice a beat, while the room around the trails dims",
  dir: "tools/versus/candidates/slow-pull/swallow",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: swallowWindow },
    }),
  ],
};
