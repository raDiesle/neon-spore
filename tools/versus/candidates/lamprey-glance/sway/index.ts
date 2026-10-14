import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/lamprey-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `lamprey:glance`: SWAY, LOOK and COCK.
 */
export const LAMPREY_SWAY: Variant = {
  slot: "lamprey:glance",
  name: "sway",
  sentence:
    "The eel turns its head slowly from side to side — the far side of its lip going into the dark and coming back.",
  dir: "tools/versus/candidates/lamprey-glance/sway",
  patches: [
    patch({
      target: glance.LAMPREY_GLANCE,
      reached: () => glance.LAMPREY_GLANCE,
      where: {
        file: "packages/render/src/lamprey-glance.ts",
        symbol: "LAMPREY_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.LAMPREY_GLANCE_SIZE),
    }),
  ],
};
