import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sling-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sling:glance`: SWAY, LOOK and COCK.
 */
export const SLING_SWAY: Variant = {
  slot: "sling:glance",
  name: "sway",
  sentence:
    "The whole fork swings slowly about its crotch — its far tine going away into the dark and coming back.",
  dir: "tools/versus/candidates/sling-glance/sway",
  patches: [
    patch({
      target: glance.SLING_GLANCE,
      reached: () => glance.SLING_GLANCE,
      where: {
        file: "packages/render/src/sling-glance.ts",
        symbol: "SLING_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SLING_GLANCE_SIZE),
    }),
  ],
};
