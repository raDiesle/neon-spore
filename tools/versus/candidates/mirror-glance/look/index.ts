import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mirror-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mirror:glance`: SWAY, LOOK and COCK.
 */
export const MIRROR_LOOK_AROUND: Variant = {
  slot: "mirror:glance",
  name: "look",
  sentence:
    "look — THE MIRROR's insides hold a turn toward the middle, one side, the middle and the other side in turn, turning briskly between them with a slight tilt, the far half going dark behind the still hull",
  dir: "tools/versus/candidates/mirror-glance/look",
  patches: [
    patch({
      target: glance.MIRROR_GLANCE,
      reached: () => glance.MIRROR_GLANCE,
      where: {
        file: "packages/render/src/mirror-glance.ts",
        symbol: "MIRROR_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.MIRROR_GLANCE_SIZE),
    }),
  ],
};
