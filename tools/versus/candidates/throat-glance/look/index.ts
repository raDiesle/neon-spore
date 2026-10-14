import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/throat-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `throat:glance`: SWAY, LOOK and COCK.
 */
export const THROAT_LOOK_AROUND: Variant = {
  slot: "throat:glance",
  name: "look",
  sentence:
    "look — the mouth holds a turn ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/throat-glance/look",
  patches: [
    patch({
      target: glance.THROAT_GLANCE,
      reached: () => glance.THROAT_GLANCE,
      where: {
        file: "packages/render/src/throat-glance.ts",
        symbol: "THROAT_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.THROAT_GLANCE_SIZE),
    }),
  ],
};
