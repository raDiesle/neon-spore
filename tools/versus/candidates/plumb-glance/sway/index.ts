import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/plumb-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `plumb:glance`: SWAY, LOOK and COCK.
 */
export const PLUMB_SWAY: Variant = {
  slot: "plumb:glance",
  name: "sway",
  sentence:
    "The bob's sac swings slowly about its middle on the beam — its far flank going away into the dark and coming back.",
  dir: "tools/versus/candidates/plumb-glance/sway",
  patches: [
    patch({
      target: glance.PLUMB_GLANCE,
      reached: () => glance.PLUMB_GLANCE,
      where: {
        file: "packages/render/src/plumb-glance.ts",
        symbol: "PLUMB_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.PLUMB_GLANCE_SIZE),
    }),
  ],
};
