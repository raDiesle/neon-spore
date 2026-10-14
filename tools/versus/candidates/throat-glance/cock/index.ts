import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/throat-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `throat:glance`: SWAY, LOOK and COCK.
 */
export const THROAT_COCK: Variant = {
  slot: "throat:glance",
  name: "cock",
  sentence:
    "cock — the mouth turns left and right on the sine and cocks itself side to side three times a round, like a mouth casting about for food.",
  dir: "tools/versus/candidates/throat-glance/cock",
  patches: [
    patch({
      target: glance.THROAT_GLANCE,
      reached: () => glance.THROAT_GLANCE,
      where: {
        file: "packages/render/src/throat-glance.ts",
        symbol: "THROAT_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.THROAT_GLANCE_SIZE),
    }),
  ],
};
