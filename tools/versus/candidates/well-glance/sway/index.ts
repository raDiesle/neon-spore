import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/well-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `well:glance`: SWAY, LOOK and COCK.
 */
export const WELL_SWAY: Variant = {
  slot: "well:glance",
  name: "sway",
  sentence:
    "sway — every body standing on the well turns from showing its left side to its right and back on one slow sine, about the centre a grip and a lock find it by.",
  dir: "tools/versus/candidates/well-glance/sway",
  patches: [
    patch({
      target: glance.WELL_GLANCE,
      reached: () => glance.WELL_GLANCE,
      where: { file: "packages/render/src/well-glance.ts", symbol: "WELL_GLANCE", type: "Glance" },
      fields: glanceOf(sway, glance.WELL_GLANCE_SIZE),
    }),
  ],
};
