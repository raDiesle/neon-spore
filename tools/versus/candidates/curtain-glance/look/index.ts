import * as glance from "../../../../../packages/render/src/curtain-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `curtain:glance`: SWAY, LOOK and COCK.
 */
export const CURTAIN_LOOK_AROUND: Variant = {
  slot: "curtain:glance",
  name: "look",
  sentence:
    "look — the bare core holds a turn ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/curtain-glance/look",
  patches: [
    patch({
      target: glance.CURTAIN_GLANCE,
      reached: () => glance.CURTAIN_GLANCE,
      where: {
        file: "packages/render/src/curtain-glance.ts",
        symbol: "CURTAIN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.CURTAIN_GLANCE_SIZE),
    }),
  ],
};
