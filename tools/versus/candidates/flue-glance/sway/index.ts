import * as glance from "../../../../../packages/render/src/flue-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `flue:glance`: SWAY, LOOK and COCK.
 */
export const FLUE_SWAY: Variant = {
  slot: "flue:glance",
  name: "sway",
  sentence:
    "The flue's flesh turns slowly lobe by lobe, a ripple running along it — each far flank going into the dark and back.",
  dir: "tools/versus/candidates/flue-glance/sway",
  patches: [
    patch({
      target: glance.FLUE_GLANCE,
      reached: () => glance.FLUE_GLANCE,
      where: {
        file: "packages/render/src/flue-glance.ts",
        symbol: "FLUE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.FLUE_GLANCE_SIZE),
    }),
  ],
};
