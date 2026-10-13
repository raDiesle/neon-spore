import * as glance from "../../../../../packages/render/src/cairn-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `cairn:glance`: SWAY, LOOK and COCK.
 */
export const CAIRN_SWAY: Variant = {
  slot: "cairn:glance",
  name: "sway",
  sentence:
    "sway — the whole pile turns from showing its left side to its right and back on one slow sine, its outer stones held over their columns.",
  dir: "tools/versus/candidates/cairn-glance/sway",
  patches: [
    patch({
      target: glance.CAIRN_GLANCE,
      reached: () => glance.CAIRN_GLANCE,
      where: {
        file: "packages/render/src/cairn-glance.ts",
        symbol: "CAIRN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.CAIRN_GLANCE_SIZE),
    }),
  ],
};
