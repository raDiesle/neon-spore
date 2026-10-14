import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/seam-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `seam:glance`: SWAY, LOOK and COCK.
 */
export const SEAM_SWAY: Variant = {
  slot: "seam:glance",
  name: "sway",
  sentence:
    "The whole ridge swings slowly on its spine — its far flank going away into the dark and coming back.",
  dir: "tools/versus/candidates/seam-glance/sway",
  patches: [
    patch({
      target: glance.SEAM_GLANCE,
      reached: () => glance.SEAM_GLANCE,
      where: {
        file: "packages/render/src/seam-glance.ts",
        symbol: "SEAM_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SEAM_GLANCE_SIZE),
    }),
  ],
};
