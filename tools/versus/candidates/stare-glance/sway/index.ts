import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/stare-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `stare:glance`: SWAY, LOOK and COCK.
 */
export const STARE_SWAY: Variant = {
  slot: "stare:glance",
  name: "sway",
  sentence:
    "sway — the cowled head turns from showing its left side to its right and back on one slow sine, eye and brow with it, about the eye's centre.",
  dir: "tools/versus/candidates/stare-glance/sway",
  patches: [
    patch({
      target: glance.STARE_GLANCE,
      reached: () => glance.STARE_GLANCE,
      where: {
        file: "packages/render/src/stare-glance.ts",
        symbol: "STARE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.STARE_GLANCE_SIZE),
    }),
  ],
};
