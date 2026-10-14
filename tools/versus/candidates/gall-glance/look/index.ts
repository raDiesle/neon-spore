import * as glance from "../../../../../packages/render/src/gall-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gall:glance`: SWAY, LOOK and COCK.
 */
export const GALL_LOOK_AROUND: Variant = {
  slot: "gall:glance",
  name: "look",
  sentence:
    "The alien on the seam turns to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/gall-glance/look",
  patches: [
    patch({
      target: glance.GALL_GLANCE,
      reached: () => glance.GALL_GLANCE,
      where: {
        file: "packages/render/src/gall-glance.ts",
        symbol: "GALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.GALL_GLANCE_SIZE),
    }),
  ],
};
