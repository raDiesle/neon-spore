import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/stare-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `stare:glance`: SWAY, LOOK and COCK.
 */
export const STARE_COCK: Variant = {
  slot: "stare:glance",
  name: "cock",
  sentence:
    "cock — the head turns left and right on the sine and cocks itself side to side three times a round, like something watching for a hand to move.",
  dir: "tools/versus/candidates/stare-glance/cock",
  patches: [
    patch({
      target: glance.STARE_GLANCE,
      reached: () => glance.STARE_GLANCE,
      where: {
        file: "packages/render/src/stare-glance.ts",
        symbol: "STARE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.STARE_GLANCE_SIZE),
    }),
  ],
};
