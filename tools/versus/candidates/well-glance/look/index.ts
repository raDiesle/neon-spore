import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/well-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `well:glance`: SWAY, LOOK and COCK.
 */
export const WELL_LOOK_AROUND: Variant = {
  slot: "well:glance",
  name: "look",
  sentence:
    "look — every body on the well holds a look ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/well-glance/look",
  patches: [
    patch({
      target: glance.WELL_GLANCE,
      reached: () => glance.WELL_GLANCE,
      where: { file: "packages/render/src/well-glance.ts", symbol: "WELL_GLANCE", type: "Glance" },
      fields: glanceOf(look, glance.WELL_GLANCE_SIZE),
    }),
  ],
};
