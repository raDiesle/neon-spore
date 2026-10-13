import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/queen-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `queen:glance`: SWAY, LOOK and COCK.
 */
export const QUEEN_SWAY: Variant = {
  slot: "queen:glance",
  name: "sway",
  sentence:
    "sway — THE BULB QUEEN's whole shell slowly turns toward one wing and then the other, the near half opening and the far one going dark, her arms, torches and marks held where they are",
  dir: "tools/versus/candidates/queen-glance/sway",
  patches: [
    patch({
      target: glance.QUEEN_GLANCE,
      reached: () => glance.QUEEN_GLANCE,
      where: {
        file: "packages/render/src/queen-glance.ts",
        symbol: "QUEEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.QUEEN_GLANCE_SIZE),
    }),
  ],
};
