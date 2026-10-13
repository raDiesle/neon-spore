import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/splice-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `splice:glance`: SWAY, LOOK and COCK.
 */
export const SPLICE_SWAY: Variant = {
  slot: "splice:glance",
  name: "sway",
  sentence:
    "sway — the eater's head turns from showing its left side to its right and back on one slow sine, about the neck it hangs on.",
  dir: "tools/versus/candidates/splice-glance/sway",
  patches: [
    patch({
      target: glance.SPLICE_GLANCE,
      reached: () => glance.SPLICE_GLANCE,
      where: {
        file: "packages/render/src/splice-glance.ts",
        symbol: "SPLICE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SPLICE_GLANCE_SIZE),
    }),
  ],
};
