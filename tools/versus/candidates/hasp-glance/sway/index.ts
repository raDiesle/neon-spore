import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/hasp-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `hasp:glance`: SWAY, LOOK and COCK.
 */
export const HASP_SWAY: Variant = {
  slot: "hasp:glance",
  name: "sway",
  sentence:
    "The door's three shells swing slowly on their hubs — each far half going away into the dark and coming back.",
  dir: "tools/versus/candidates/hasp-glance/sway",
  patches: [
    patch({
      target: glance.HASP_GLANCE,
      reached: () => glance.HASP_GLANCE,
      where: {
        file: "packages/render/src/hasp-glance.ts",
        symbol: "HASP_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.HASP_GLANCE_SIZE),
    }),
  ],
};
