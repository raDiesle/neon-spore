import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/undertow-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `undertow:glance`: SWAY, LOOK and COCK.
 */
export const UNDERTOW_SWAY: Variant = {
  slot: "undertow:glance",
  name: "sway",
  sentence:
    "sway — every lobe up through the plating turns from showing its left side to its right and back on one slow sine, about the column it stands in.",
  dir: "tools/versus/candidates/undertow-glance/sway",
  patches: [
    patch({
      target: glance.UNDERTOW_GLANCE,
      reached: () => glance.UNDERTOW_GLANCE,
      where: {
        file: "packages/render/src/undertow-glance.ts",
        symbol: "UNDERTOW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.UNDERTOW_GLANCE_SIZE),
    }),
  ],
};
