import * as glance from "../../../../../packages/render/src/gall-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gall:glance`: SWAY, LOOK and COCK.
 */
export const GALL_COCK: Variant = {
  slot: "gall:glance",
  name: "cock",
  sentence:
    "The alien on the seam turns its body to one side and tips its head as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/gall-glance/cock",
  patches: [
    patch({
      target: glance.GALL_GLANCE,
      reached: () => glance.GALL_GLANCE,
      where: {
        file: "packages/render/src/gall-glance.ts",
        symbol: "GALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.GALL_GLANCE_SIZE),
    }),
  ],
};
