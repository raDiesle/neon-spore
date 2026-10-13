import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pinball-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pinball:glance`: SWAY, LOOK and COCK.
 */
export const PINBALL_COCK: Variant = {
  slot: "pinball:glance",
  name: "cock",
  sentence:
    "cock — every amber target turns left and right on the sine and cocks itself side to side three times a round.",
  dir: "tools/versus/candidates/pinball-glance/cock",
  patches: [
    patch({
      target: glance.PINBALL_GLANCE,
      reached: () => glance.PINBALL_GLANCE,
      where: {
        file: "packages/render/src/pinball-glance.ts",
        symbol: "PINBALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.PINBALL_GLANCE_SIZE),
    }),
  ],
};
