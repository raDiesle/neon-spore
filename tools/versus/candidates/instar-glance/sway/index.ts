import * as glance from "../../../../../packages/render/src/instar-glance.js";
import { patch, type Variant } from "../../../variant.js";
import { swayGlance, swayRoll } from "./paint.js";

/**
 * SWAY — offered 9 October 2026, the owner: *the head of boss just
 * slightly changes angle because he moves head slightly to another side so it
 * is not so static*. One of three answers in `instar:glance`: SWAY, LOOK and
 * COCK.
 */
export const INSTAR_SWAY: Variant = {
  slot: "instar:glance",
  name: "sway",
  sentence:
    "sway — THE INSTAR's head slowly turns from looking left to looking right and back, the near cheek opening and the far one going dark, so the face is never still",
  dir: "tools/versus/candidates/instar-glance/sway",
  patches: [
    patch({
      target: glance.INSTAR_GLANCE,
      reached: () => glance.INSTAR_GLANCE,
      where: {
        file: "packages/render/src/instar-glance.ts",
        symbol: "INSTAR_GLANCE",
        type: "Glance",
      },
      fields: { swing: swayGlance, roll: swayRoll },
    }),
  ],
};
