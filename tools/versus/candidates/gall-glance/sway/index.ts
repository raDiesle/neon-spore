import * as glance from "../../../../../packages/render/src/gall-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gall:glance`: SWAY, LOOK and COCK.
 */
export const GALL_SWAY: Variant = {
  slot: "gall:glance",
  name: "sway",
  sentence:
    "The alien on the seam turns slowly from side to side where it sits — its far flank going away into the dark and coming back.",
  dir: "tools/versus/candidates/gall-glance/sway",
  patches: [
    patch({
      target: glance.GALL_GLANCE,
      reached: () => glance.GALL_GLANCE,
      where: {
        file: "packages/render/src/gall-glance.ts",
        symbol: "GALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.GALL_GLANCE_SIZE),
    }),
  ],
};
