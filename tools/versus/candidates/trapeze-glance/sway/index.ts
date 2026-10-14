import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/trapeze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `trapeze:glance`: SWAY, LOOK and COCK.
 */
export const TRAPEZE_SWAY: Variant = {
  slot: "trapeze:glance",
  name: "sway",
  sentence:
    "The alien on the swing turns its head slowly from side to side — its far cheek going away into the dark and coming back.",
  dir: "tools/versus/candidates/trapeze-glance/sway",
  patches: [
    patch({
      target: glance.TRAPEZE_GLANCE,
      reached: () => glance.TRAPEZE_GLANCE,
      where: {
        file: "packages/render/src/trapeze-glance.ts",
        symbol: "TRAPEZE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.TRAPEZE_GLANCE_SIZE),
    }),
  ],
};
