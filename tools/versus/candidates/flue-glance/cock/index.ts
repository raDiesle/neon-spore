import * as glance from "../../../../../packages/render/src/flue-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `flue:glance`: SWAY, LOOK and COCK.
 */
export const FLUE_COCK: Variant = {
  slot: "flue:glance",
  name: "cock",
  sentence:
    "Each lobe of the flue's flesh turns and tips, one after the next along it — and holds before it turns back.",
  dir: "tools/versus/candidates/flue-glance/cock",
  patches: [
    patch({
      target: glance.FLUE_GLANCE,
      reached: () => glance.FLUE_GLANCE,
      where: {
        file: "packages/render/src/flue-glance.ts",
        symbol: "FLUE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.FLUE_GLANCE_SIZE),
    }),
  ],
};
