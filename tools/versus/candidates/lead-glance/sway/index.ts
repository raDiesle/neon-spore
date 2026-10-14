import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/lead-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `lead:glance`: SWAY, LOOK and COCK.
 */
export const LEAD_SWAY: Variant = {
  slot: "lead:glance",
  name: "sway",
  sentence:
    "sway — on the navigator's screen the mound, the stalk and its head turn from showing their left side to their right and back on one slow sine, about the foot, never tilting.",
  dir: "tools/versus/candidates/lead-glance/sway",
  patches: [
    patch({
      target: glance.LEAD_GLANCE,
      reached: () => glance.LEAD_GLANCE,
      where: {
        file: "packages/render/src/lead-glance.ts",
        symbol: "LEAD_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.LEAD_GLANCE_SIZE),
    }),
  ],
};
