import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/taster-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `taster:glance`: SWAY, LOOK and COCK.
 */
export const TASTER_COCK: Variant = {
  slot: "taster:glance",
  name: "cock",
  sentence:
    "cock — each blade cocks its tip aside and twists a little, about the root a thumb pins it at, out of step with its neighbours.",
  dir: "tools/versus/candidates/taster-glance/cock",
  patches: [
    patch({
      target: glance.TASTER_GLANCE,
      reached: () => glance.TASTER_GLANCE,
      where: {
        file: "packages/render/src/taster-glance.ts",
        symbol: "TASTER_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.TASTER_GLANCE_SIZE),
    }),
  ],
};
