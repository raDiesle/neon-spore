import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { prismWindow } from "./paint.js";

/**
 * PRISM — the room torn into red and blue about the boss, which stays whole.
 *
 * Offered 25 September 2026, when the owner said the shipped streams were not
 * it yet and asked for light *sucked into the middle of the boss*. Every
 * answer in `slow:pull` keeps the shipped fuse and replaces the streams.
 */
export const SLOW_PRISM: Variant = {
  slot: "slow:pull",
  name: "prism",
  sentence:
    "prism — the field splits into its colours about the boss: red swells outward and blue falls inward, so the boss stays sharp and the edges of the room tear, kicked wider on every beat",
  dir: "tools/versus/candidates/slow-pull/prism",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: prismWindow },
    }),
  ],
};
