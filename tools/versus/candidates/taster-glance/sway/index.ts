import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/taster-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `taster:glance`: SWAY, LOOK and COCK.
 */
export const TASTER_SWAY: Variant = {
  slot: "taster:glance",
  name: "sway",
  sentence:
    "sway — each blade twists in its socket from one flat to the other and back on one slow sine, about the root a thumb pins it at, out of step with its neighbours.",
  dir: "tools/versus/candidates/taster-glance/sway",
  patches: [
    patch({
      target: glance.TASTER_GLANCE,
      reached: () => glance.TASTER_GLANCE,
      where: {
        file: "packages/render/src/taster-glance.ts",
        symbol: "TASTER_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.TASTER_GLANCE_SIZE),
    }),
  ],
};
