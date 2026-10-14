import * as glance from "../../../../../packages/render/src/antiphon-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `antiphon:glance`: SWAY, LOOK and COCK.
 */
export const ANTIPHON_COCK: Variant = {
  slot: "antiphon:glance",
  name: "cock",
  sentence:
    "cock — the mantle cocks its ends up and down and turns a little, about its middle, the pits held at their spots.",
  dir: "tools/versus/candidates/antiphon-glance/cock",
  patches: [
    patch({
      target: glance.ANTIPHON_GLANCE,
      reached: () => glance.ANTIPHON_GLANCE,
      where: {
        file: "packages/render/src/antiphon-glance.ts",
        symbol: "ANTIPHON_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.ANTIPHON_GLANCE_SIZE),
    }),
  ],
};
