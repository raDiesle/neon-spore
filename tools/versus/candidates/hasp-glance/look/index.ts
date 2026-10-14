import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/hasp-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `hasp:glance`: SWAY, LOOK and COCK.
 */
export const HASP_LOOK_AROUND: Variant = {
  slot: "hasp:glance",
  name: "look",
  sentence:
    "The door's three shells turn on their hubs and hold there — then come round toward the pair and hold again.",
  dir: "tools/versus/candidates/hasp-glance/look",
  patches: [
    patch({
      target: glance.HASP_GLANCE,
      reached: () => glance.HASP_GLANCE,
      where: {
        file: "packages/render/src/hasp-glance.ts",
        symbol: "HASP_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.HASP_GLANCE_SIZE),
    }),
  ],
};
