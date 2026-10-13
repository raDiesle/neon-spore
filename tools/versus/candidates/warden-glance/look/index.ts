import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/warden-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `warden:glance`: SWAY, LOOK and COCK.
 */
export const WARDEN_LOOK_AROUND: Variant = {
  slot: "warden:glance",
  name: "look",
  sentence:
    "look — THE WARDEN's body holds a turn toward the middle, one side, the middle and the other side in turn, turning briskly between them about its still eye with a slight tilt toward where it looks",
  dir: "tools/versus/candidates/warden-glance/look",
  patches: [
    patch({
      target: glance.WARDEN_GLANCE,
      reached: () => glance.WARDEN_GLANCE,
      where: {
        file: "packages/render/src/warden-glance.ts",
        symbol: "WARDEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.WARDEN_GLANCE_SIZE),
    }),
  ],
};
