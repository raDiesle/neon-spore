import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/latch-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `latch:glance`: SWAY, LOOK and COCK.
 */
export const LATCH_COCK: Variant = {
  slot: "latch:glance",
  name: "cock",
  sentence: "The colony turns to one side and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/latch-glance/cock",
  patches: [
    patch({
      target: glance.LATCH_GLANCE,
      reached: () => glance.LATCH_GLANCE,
      where: {
        file: "packages/render/src/latch-glance.ts",
        symbol: "LATCH_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.LATCH_GLANCE_SIZE),
    }),
  ],
};
