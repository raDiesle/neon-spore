import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/gorge-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gorge:glance`: SWAY, LOOK and COCK.
 */
export const GORGE_SWAY: Variant = {
  slot: "gorge:glance",
  name: "sway",
  sentence:
    "sway — every bubble in the sack turns from showing its left side to its right and back on one slow sine, beads and all, about the intake a shot goes into.",
  dir: "tools/versus/candidates/gorge-glance/sway",
  patches: [
    patch({
      target: glance.GORGE_GLANCE,
      reached: () => glance.GORGE_GLANCE,
      where: {
        file: "packages/render/src/gorge-glance.ts",
        symbol: "GORGE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.GORGE_GLANCE_SIZE),
    }),
  ],
};
