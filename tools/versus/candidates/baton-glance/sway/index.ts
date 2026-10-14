import * as glance from "../../../../../packages/render/src/baton-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `baton:glance`: SWAY, LOOK and COCK.
 */
export const BATON_SWAY: Variant = {
  slot: "baton:glance",
  name: "sway",
  sentence:
    "sway — every knuckle down the arm turns from showing its left side to its right and back on one slow sine, each a little after the one above it.",
  dir: "tools/versus/candidates/baton-glance/sway",
  patches: [
    patch({
      target: glance.BATON_GLANCE,
      reached: () => glance.BATON_GLANCE,
      where: {
        file: "packages/render/src/baton-glance.ts",
        symbol: "BATON_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.BATON_GLANCE_SIZE),
    }),
  ],
};
