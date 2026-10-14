import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/seam-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `seam:glance`: SWAY, LOOK and COCK.
 */
export const SEAM_COCK: Variant = {
  slot: "seam:glance",
  name: "cock",
  sentence:
    "The whole ridge turns on its spine and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/seam-glance/cock",
  patches: [
    patch({
      target: glance.SEAM_GLANCE,
      reached: () => glance.SEAM_GLANCE,
      where: {
        file: "packages/render/src/seam-glance.ts",
        symbol: "SEAM_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.SEAM_GLANCE_SIZE),
    }),
  ],
};
