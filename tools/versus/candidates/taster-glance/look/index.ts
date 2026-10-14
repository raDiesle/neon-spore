import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/taster-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `taster:glance`: SWAY, LOOK and COCK.
 */
export const TASTER_LOOK_AROUND: Variant = {
  slot: "taster:glance",
  name: "look",
  sentence:
    "look — each blade holds one flat to the field, then twists to show the other, about the root a thumb pins it at, out of step with its neighbours.",
  dir: "tools/versus/candidates/taster-glance/look",
  patches: [
    patch({
      target: glance.TASTER_GLANCE,
      reached: () => glance.TASTER_GLANCE,
      where: {
        file: "packages/render/src/taster-glance.ts",
        symbol: "TASTER_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.TASTER_GLANCE_SIZE),
    }),
  ],
};
