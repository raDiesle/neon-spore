import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mantle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mantle:glance`: SWAY, LOOK and COCK.
 */
export const MANTLE_COCK: Variant = {
  slot: "mantle:glance",
  name: "cock",
  sentence:
    "The whole shell turns and tips as it does — a hinged case cocked on its straps — and holds before it turns back.",
  dir: "tools/versus/candidates/mantle-glance/cock",
  patches: [
    patch({
      target: glance.MANTLE_GLANCE,
      reached: () => glance.MANTLE_GLANCE,
      where: {
        file: "packages/render/src/mantle-glance.ts",
        symbol: "MANTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.MANTLE_GLANCE_SIZE),
    }),
  ],
};
