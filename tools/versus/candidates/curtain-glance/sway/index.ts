import * as glance from "../../../../../packages/render/src/curtain-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `curtain:glance`: SWAY, LOOK and COCK.
 */
export const CURTAIN_SWAY: Variant = {
  slot: "curtain:glance",
  name: "sway",
  sentence:
    "sway — the bare core turns from showing its left side to its right and back on one slow sine, about the centre a bolt meets it at.",
  dir: "tools/versus/candidates/curtain-glance/sway",
  patches: [
    patch({
      target: glance.CURTAIN_GLANCE,
      reached: () => glance.CURTAIN_GLANCE,
      where: {
        file: "packages/render/src/curtain-glance.ts",
        symbol: "CURTAIN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.CURTAIN_GLANCE_SIZE),
    }),
  ],
};
