import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/throat-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `throat:glance`: SWAY, LOOK and COCK.
 */
export const THROAT_SWAY: Variant = {
  slot: "throat:glance",
  name: "sway",
  sentence:
    "sway — the mouth at the gullet's end turns from showing its left side to its right and back on one slow sine, lip and colour with it.",
  dir: "tools/versus/candidates/throat-glance/sway",
  patches: [
    patch({
      target: glance.THROAT_GLANCE,
      reached: () => glance.THROAT_GLANCE,
      where: {
        file: "packages/render/src/throat-glance.ts",
        symbol: "THROAT_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.THROAT_GLANCE_SIZE),
    }),
  ],
};
