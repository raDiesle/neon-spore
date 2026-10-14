import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/undertow-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `undertow:glance`: SWAY, LOOK and COCK.
 */
export const UNDERTOW_COCK: Variant = {
  slot: "undertow:glance",
  name: "cock",
  sentence:
    "cock — every lobe turns left and right on the sine and rocks side to side on its foot three times a round, like something feeling for a way out.",
  dir: "tools/versus/candidates/undertow-glance/cock",
  patches: [
    patch({
      target: glance.UNDERTOW_GLANCE,
      reached: () => glance.UNDERTOW_GLANCE,
      where: {
        file: "packages/render/src/undertow-glance.ts",
        symbol: "UNDERTOW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.UNDERTOW_GLANCE_SIZE),
    }),
  ],
};
