import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/scuttle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `scuttle:glance`: SWAY, LOOK and COCK.
 */
export const SCUTTLE_LOOK_AROUND: Variant = {
  slot: "scuttle:glance",
  name: "look",
  sentence:
    "look — each hanging part holds one end to the field, then twists to show the other, about the middle a thumb takes it by, out of step with the others.",
  dir: "tools/versus/candidates/scuttle-glance/look",
  patches: [
    patch({
      target: glance.SCUTTLE_GLANCE,
      reached: () => glance.SCUTTLE_GLANCE,
      where: {
        file: "packages/render/src/scuttle-glance.ts",
        symbol: "SCUTTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.SCUTTLE_GLANCE_SIZE),
    }),
  ],
};
