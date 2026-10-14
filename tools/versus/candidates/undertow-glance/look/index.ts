import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/undertow-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `undertow:glance`: SWAY, LOOK and COCK.
 */
export const UNDERTOW_LOOK_AROUND: Variant = {
  slot: "undertow:glance",
  name: "look",
  sentence:
    "look — every lobe holds a turn ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it turns.",
  dir: "tools/versus/candidates/undertow-glance/look",
  patches: [
    patch({
      target: glance.UNDERTOW_GLANCE,
      reached: () => glance.UNDERTOW_GLANCE,
      where: {
        file: "packages/render/src/undertow-glance.ts",
        symbol: "UNDERTOW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.UNDERTOW_GLANCE_SIZE),
    }),
  ],
};
