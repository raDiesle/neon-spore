import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/vane-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `vane:glance`: SWAY, LOOK and COCK.
 */
export const VANE_LOOK_AROUND: Variant = {
  slot: "vane:glance",
  name: "look",
  sentence:
    "look — THE VANE's bearing holds a turn toward the middle, one end, the middle and the other end in turn, turning briskly between them on its still hub with a slight tilt",
  dir: "tools/versus/candidates/vane-glance/look",
  patches: [
    patch({
      target: glance.VANE_GLANCE,
      reached: () => glance.VANE_GLANCE,
      where: { file: "packages/render/src/vane-glance.ts", symbol: "VANE_GLANCE", type: "Glance" },
      fields: glanceOf(look, glance.VANE_GLANCE_SIZE),
    }),
  ],
};
