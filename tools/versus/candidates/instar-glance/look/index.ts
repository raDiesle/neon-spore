import * as glance from "../../../../../packages/render/src/instar-glance.js";
import { patch, type Variant } from "../../../variant.js";
import { lookGlance, lookRoll } from "./paint.js";

/**
 * LOOK — offered 9 October 2026, the owner: *the head of boss just
 * slightly changes angle because he moves head slightly to another side so it
 * is not so static*. One of three answers in `instar:glance`: SWAY, LOOK and
 * COCK.
 */
export const INSTAR_LOOK: Variant = {
  slot: "instar:glance",
  name: "look",
  sentence:
    "look — THE INSTAR's head holds a look to the left, the middle and the right in turn, turning briskly between them with a slight tilt toward where it looks, like an animal watching",
  dir: "tools/versus/candidates/instar-glance/look",
  patches: [
    patch({
      target: glance.INSTAR_GLANCE,
      reached: () => glance.INSTAR_GLANCE,
      where: {
        file: "packages/render/src/instar-glance.ts",
        symbol: "INSTAR_GLANCE",
        type: "Glance",
      },
      fields: { swing: lookGlance, roll: lookRoll },
    }),
  ],
};
