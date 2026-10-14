import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/trapeze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `trapeze:glance`: SWAY, LOOK and COCK.
 */
export const TRAPEZE_LOOK_AROUND: Variant = {
  slot: "trapeze:glance",
  name: "look",
  sentence:
    "The alien on the swing turns its head to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/trapeze-glance/look",
  patches: [
    patch({
      target: glance.TRAPEZE_GLANCE,
      reached: () => glance.TRAPEZE_GLANCE,
      where: {
        file: "packages/render/src/trapeze-glance.ts",
        symbol: "TRAPEZE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.TRAPEZE_GLANCE_SIZE),
    }),
  ],
};
