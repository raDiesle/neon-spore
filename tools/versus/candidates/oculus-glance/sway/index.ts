import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/oculus-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `oculus:glance`: SWAY, LOOK and COCK.
 */
export const OCULUS_SWAY: Variant = {
  slot: "oculus:glance",
  name: "sway",
  sentence:
    "The whole lens swings slowly about its middle — its far half going away into the dark and coming back.",
  dir: "tools/versus/candidates/oculus-glance/sway",
  patches: [
    patch({
      target: glance.OCULUS_GLANCE,
      reached: () => glance.OCULUS_GLANCE,
      where: {
        file: "packages/render/src/oculus-glance.ts",
        symbol: "OCULUS_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.OCULUS_GLANCE_SIZE),
    }),
  ],
};
