import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/oculus-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `oculus:glance`: SWAY, LOOK and COCK.
 */
export const OCULUS_COCK: Variant = {
  slot: "oculus:glance",
  name: "cock",
  sentence:
    "The whole lens turns about its middle and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/oculus-glance/cock",
  patches: [
    patch({
      target: glance.OCULUS_GLANCE,
      reached: () => glance.OCULUS_GLANCE,
      where: {
        file: "packages/render/src/oculus-glance.ts",
        symbol: "OCULUS_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.OCULUS_GLANCE_SIZE),
    }),
  ],
};
