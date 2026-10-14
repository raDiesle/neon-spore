import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sling-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sling:glance`: SWAY, LOOK and COCK.
 */
export const SLING_COCK: Variant = {
  slot: "sling:glance",
  name: "cock",
  sentence:
    "The whole fork turns about its crotch and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/sling-glance/cock",
  patches: [
    patch({
      target: glance.SLING_GLANCE,
      reached: () => glance.SLING_GLANCE,
      where: {
        file: "packages/render/src/sling-glance.ts",
        symbol: "SLING_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.SLING_GLANCE_SIZE),
    }),
  ],
};
