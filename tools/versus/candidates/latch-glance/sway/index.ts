import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/latch-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `latch:glance`: SWAY, LOOK and COCK.
 */
export const LATCH_SWAY: Variant = {
  slot: "latch:glance",
  name: "sway",
  sentence:
    "The colony turns slowly from side to side over the rope — its far bodies going into the dark and coming back.",
  dir: "tools/versus/candidates/latch-glance/sway",
  patches: [
    patch({
      target: glance.LATCH_GLANCE,
      reached: () => glance.LATCH_GLANCE,
      where: {
        file: "packages/render/src/latch-glance.ts",
        symbol: "LATCH_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.LATCH_GLANCE_SIZE),
    }),
  ],
};
