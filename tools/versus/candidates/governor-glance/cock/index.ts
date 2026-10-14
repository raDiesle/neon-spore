import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/governor-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `governor:glance`: SWAY, LOOK and COCK.
 */
export const GOVERNOR_COCK: Variant = {
  slot: "governor:glance",
  name: "cock",
  sentence:
    "The governor's tower turns on its foot and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/governor-glance/cock",
  patches: [
    patch({
      target: glance.GOVERNOR_GLANCE,
      reached: () => glance.GOVERNOR_GLANCE,
      where: {
        file: "packages/render/src/governor-glance.ts",
        symbol: "GOVERNOR_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.GOVERNOR_GLANCE_SIZE),
    }),
  ],
};
