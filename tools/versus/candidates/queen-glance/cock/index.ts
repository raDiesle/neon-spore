import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/queen-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `queen:glance`: SWAY, LOOK and COCK.
 */
export const QUEEN_COCK: Variant = {
  slot: "queen:glance",
  name: "cock",
  sentence:
    "cock — THE BULB QUEEN's shell turns toward one wing and the other and tips side to side three times as fast, so her armour keeps changing its angle while her arms, torches and marks stay put",
  dir: "tools/versus/candidates/queen-glance/cock",
  patches: [
    patch({
      target: glance.QUEEN_GLANCE,
      reached: () => glance.QUEEN_GLANCE,
      where: {
        file: "packages/render/src/queen-glance.ts",
        symbol: "QUEEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.QUEEN_GLANCE_SIZE),
    }),
  ],
};
