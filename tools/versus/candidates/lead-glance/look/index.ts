import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/lead-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `lead:glance`: SWAY, LOOK and COCK.
 */
export const LEAD_LOOK_AROUND: Variant = {
  slot: "lead:glance",
  name: "look",
  sentence:
    "look — on the navigator's screen the mound, the stalk and its head hold one side to the field, then turn to show the other, about the foot, never tilting.",
  dir: "tools/versus/candidates/lead-glance/look",
  patches: [
    patch({
      target: glance.LEAD_GLANCE,
      reached: () => glance.LEAD_GLANCE,
      where: {
        file: "packages/render/src/lead-glance.ts",
        symbol: "LEAD_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.LEAD_GLANCE_SIZE),
    }),
  ],
};
