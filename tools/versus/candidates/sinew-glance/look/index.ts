import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sinew-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sinew:glance`: SWAY, LOOK and COCK.
 */
export const SINEW_LOOK_AROUND: Variant = {
  slot: "sinew:glance",
  name: "look",
  sentence:
    "look — the mass holds one side to the field, then turns to show the other, about the centre its handles rest beside.",
  dir: "tools/versus/candidates/sinew-glance/look",
  patches: [
    patch({
      target: glance.SINEW_GLANCE,
      reached: () => glance.SINEW_GLANCE,
      where: {
        file: "packages/render/src/sinew-glance.ts",
        symbol: "SINEW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.SINEW_GLANCE_SIZE),
    }),
  ],
};
