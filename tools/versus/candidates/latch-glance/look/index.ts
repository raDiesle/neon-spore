import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/latch-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `latch:glance`: SWAY, LOOK and COCK.
 */
export const LATCH_LOOK_AROUND: Variant = {
  slot: "latch:glance",
  name: "look",
  sentence:
    "The colony turns to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/latch-glance/look",
  patches: [
    patch({
      target: glance.LATCH_GLANCE,
      reached: () => glance.LATCH_GLANCE,
      where: {
        file: "packages/render/src/latch-glance.ts",
        symbol: "LATCH_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.LATCH_GLANCE_SIZE),
    }),
  ],
};
