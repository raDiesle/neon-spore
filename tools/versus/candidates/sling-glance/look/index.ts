import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sling-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sling:glance`: SWAY, LOOK and COCK.
 */
export const SLING_LOOK_AROUND: Variant = {
  slot: "sling:glance",
  name: "look",
  sentence:
    "The whole fork turns to one side about its crotch and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/sling-glance/look",
  patches: [
    patch({
      target: glance.SLING_GLANCE,
      reached: () => glance.SLING_GLANCE,
      where: {
        file: "packages/render/src/sling-glance.ts",
        symbol: "SLING_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.SLING_GLANCE_SIZE),
    }),
  ],
};
