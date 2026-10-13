import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mirror-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mirror:glance`: SWAY, LOOK and COCK.
 */
export const MIRROR_SWAY: Variant = {
  slot: "mirror:glance",
  name: "sway",
  sentence:
    "sway — THE MIRROR's insides slowly turn toward one side and then the other behind its hull, the near half opening and the far one going dark, while the hull stays your ship to the pixel",
  dir: "tools/versus/candidates/mirror-glance/sway",
  patches: [
    patch({
      target: glance.MIRROR_GLANCE,
      reached: () => glance.MIRROR_GLANCE,
      where: {
        file: "packages/render/src/mirror-glance.ts",
        symbol: "MIRROR_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.MIRROR_GLANCE_SIZE),
    }),
  ],
};
