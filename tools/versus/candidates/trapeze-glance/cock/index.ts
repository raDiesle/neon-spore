import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/trapeze-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `trapeze:glance`: SWAY, LOOK and COCK.
 */
export const TRAPEZE_COCK: Variant = {
  slot: "trapeze:glance",
  name: "cock",
  sentence:
    "The alien on the swing turns its head to one side and tips it as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/trapeze-glance/cock",
  patches: [
    patch({
      target: glance.TRAPEZE_GLANCE,
      reached: () => glance.TRAPEZE_GLANCE,
      where: {
        file: "packages/render/src/trapeze-glance.ts",
        symbol: "TRAPEZE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.TRAPEZE_GLANCE_SIZE),
    }),
  ],
};
