import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mirror-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mirror:glance`: SWAY, LOOK and COCK.
 */
export const MIRROR_COCK: Variant = {
  slot: "mirror:glance",
  name: "cock",
  sentence:
    "cock — THE MIRROR's insides turn toward one side and the other and tip side to side three times as fast behind its still hull, so the copy's belly keeps changing its angle",
  dir: "tools/versus/candidates/mirror-glance/cock",
  patches: [
    patch({
      target: glance.MIRROR_GLANCE,
      reached: () => glance.MIRROR_GLANCE,
      where: {
        file: "packages/render/src/mirror-glance.ts",
        symbol: "MIRROR_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.MIRROR_GLANCE_SIZE),
    }),
  ],
};
