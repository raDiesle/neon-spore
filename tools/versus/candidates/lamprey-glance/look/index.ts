import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/lamprey-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `lamprey:glance`: SWAY, LOOK and COCK.
 */
export const LAMPREY_LOOK_AROUND: Variant = {
  slot: "lamprey:glance",
  name: "look",
  sentence:
    "The eel turns its head to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/lamprey-glance/look",
  patches: [
    patch({
      target: glance.LAMPREY_GLANCE,
      reached: () => glance.LAMPREY_GLANCE,
      where: {
        file: "packages/render/src/lamprey-glance.ts",
        symbol: "LAMPREY_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.LAMPREY_GLANCE_SIZE),
    }),
  ],
};
