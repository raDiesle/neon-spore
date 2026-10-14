import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/gorge-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gorge:glance`: SWAY, LOOK and COCK.
 */
export const GORGE_COCK: Variant = {
  slot: "gorge:glance",
  name: "cock",
  sentence:
    "cock — every bubble turns left and right on the sine and rocks side to side on its intake three times a round, like something sloshing as it digests.",
  dir: "tools/versus/candidates/gorge-glance/cock",
  patches: [
    patch({
      target: glance.GORGE_GLANCE,
      reached: () => glance.GORGE_GLANCE,
      where: {
        file: "packages/render/src/gorge-glance.ts",
        symbol: "GORGE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.GORGE_GLANCE_SIZE),
    }),
  ],
};
