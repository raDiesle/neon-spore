import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/well-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `well:glance`: SWAY, LOOK and COCK.
 */
export const WELL_COCK: Variant = {
  slot: "well:glance",
  name: "cock",
  sentence:
    "cock — every body on the well turns left and right on the sine and cocks itself side to side three times a round.",
  dir: "tools/versus/candidates/well-glance/cock",
  patches: [
    patch({
      target: glance.WELL_GLANCE,
      reached: () => glance.WELL_GLANCE,
      where: { file: "packages/render/src/well-glance.ts", symbol: "WELL_GLANCE", type: "Glance" },
      fields: glanceOf(cock, glance.WELL_GLANCE_SIZE),
    }),
  ],
};
