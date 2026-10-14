import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/keel-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `keel:glance`: SWAY, LOOK and COCK.
 */
export const KEEL_COCK: Variant = {
  slot: "keel:glance",
  name: "cock",
  sentence:
    "Every vertebra turns on its joint and tips as it does — the spine cocked all along its length — and holds before it turns back.",
  dir: "tools/versus/candidates/keel-glance/cock",
  patches: [
    patch({
      target: glance.KEEL_GLANCE,
      reached: () => glance.KEEL_GLANCE,
      where: {
        file: "packages/render/src/keel-glance.ts",
        symbol: "KEEL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.KEEL_GLANCE_SIZE),
    }),
  ],
};
