import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/splice-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `splice:glance`: SWAY, LOOK and COCK.
 */
export const SPLICE_COCK: Variant = {
  slot: "splice:glance",
  name: "cock",
  sentence:
    "cock — the eater's head turns left and right on the sine and cocks itself side to side three times a round, like something sizing up its next bite.",
  dir: "tools/versus/candidates/splice-glance/cock",
  patches: [
    patch({
      target: glance.SPLICE_GLANCE,
      reached: () => glance.SPLICE_GLANCE,
      where: {
        file: "packages/render/src/splice-glance.ts",
        symbol: "SPLICE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.SPLICE_GLANCE_SIZE),
    }),
  ],
};
