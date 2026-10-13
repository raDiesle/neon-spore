import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/splice-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `splice:glance`: SWAY, LOOK and COCK.
 */
export const SPLICE_LOOK_AROUND: Variant = {
  slot: "splice:glance",
  name: "look",
  sentence:
    "look — the eater's head holds a look ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/splice-glance/look",
  patches: [
    patch({
      target: glance.SPLICE_GLANCE,
      reached: () => glance.SPLICE_GLANCE,
      where: {
        file: "packages/render/src/splice-glance.ts",
        symbol: "SPLICE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.SPLICE_GLANCE_SIZE),
    }),
  ],
};
