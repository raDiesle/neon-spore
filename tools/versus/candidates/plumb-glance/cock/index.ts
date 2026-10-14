import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/plumb-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `plumb:glance`: SWAY, LOOK and COCK.
 */
export const PLUMB_COCK: Variant = {
  slot: "plumb:glance",
  name: "cock",
  sentence:
    "The bob's sac turns under the beam and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/plumb-glance/cock",
  patches: [
    patch({
      target: glance.PLUMB_GLANCE,
      reached: () => glance.PLUMB_GLANCE,
      where: {
        file: "packages/render/src/plumb-glance.ts",
        symbol: "PLUMB_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.PLUMB_GLANCE_SIZE),
    }),
  ],
};
