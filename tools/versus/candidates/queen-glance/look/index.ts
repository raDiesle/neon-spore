import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/queen-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `queen:glance`: SWAY, LOOK and COCK.
 */
export const QUEEN_LOOK_AROUND: Variant = {
  slot: "queen:glance",
  name: "look",
  sentence:
    "look — THE BULB QUEEN's shell holds a turn toward the middle, one wing, the middle and the other wing in turn, turning briskly between them with a slight tilt toward the side she faces, the far half going dark",
  dir: "tools/versus/candidates/queen-glance/look",
  patches: [
    patch({
      target: glance.QUEEN_GLANCE,
      reached: () => glance.QUEEN_GLANCE,
      where: {
        file: "packages/render/src/queen-glance.ts",
        symbol: "QUEEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.QUEEN_GLANCE_SIZE),
    }),
  ],
};
