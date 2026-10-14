import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/vise-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `vise:glance`: SWAY, LOOK and COCK.
 */
export const VISE_COCK: Variant = {
  slot: "vise:glance",
  name: "cock",
  sentence:
    "The whole seed-case turns on its spine and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/vise-glance/cock",
  patches: [
    patch({
      target: glance.VISE_GLANCE,
      reached: () => glance.VISE_GLANCE,
      where: {
        file: "packages/render/src/vise-glance.ts",
        symbol: "VISE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.VISE_GLANCE_SIZE),
    }),
  ],
};
