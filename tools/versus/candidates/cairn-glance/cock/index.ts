import * as glance from "../../../../../packages/render/src/cairn-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `cairn:glance`: SWAY, LOOK and COCK.
 */
export const CAIRN_COCK: Variant = {
  slot: "cairn:glance",
  name: "cock",
  sentence:
    "cock — the pile turns left and right on the sine and rocks on its foot side to side three times a round.",
  dir: "tools/versus/candidates/cairn-glance/cock",
  patches: [
    patch({
      target: glance.CAIRN_GLANCE,
      reached: () => glance.CAIRN_GLANCE,
      where: {
        file: "packages/render/src/cairn-glance.ts",
        symbol: "CAIRN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.CAIRN_GLANCE_SIZE),
    }),
  ],
};
