import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/vane-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `vane:glance`: SWAY, LOOK and COCK.
 */
export const VANE_SWAY: Variant = {
  slot: "vane:glance",
  name: "sway",
  sentence:
    "sway — THE VANE's whole bearing slowly turns on its hub toward one end and then the other, the near end of the mount growing longer and the far end shortening into the dark, the hub and the arm staying on their column",
  dir: "tools/versus/candidates/vane-glance/sway",
  patches: [
    patch({
      target: glance.VANE_GLANCE,
      reached: () => glance.VANE_GLANCE,
      where: { file: "packages/render/src/vane-glance.ts", symbol: "VANE_GLANCE", type: "Glance" },
      fields: glanceOf(sway, glance.VANE_GLANCE_SIZE),
    }),
  ],
};
