import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/reprise-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `reprise:glance`: SWAY, LOOK and COCK.
 */
export const REPRISE_SWAY: Variant = {
  slot: "reprise:glance",
  name: "sway",
  sentence:
    "sway — the sac turns from showing its left side to its right and back on one slow sine, lens and eggs with it, under the cords it hangs from.",
  dir: "tools/versus/candidates/reprise-glance/sway",
  patches: [
    patch({
      target: glance.REPRISE_GLANCE,
      reached: () => glance.REPRISE_GLANCE,
      where: {
        file: "packages/render/src/reprise-glance.ts",
        symbol: "REPRISE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.REPRISE_GLANCE_SIZE),
    }),
  ],
};
