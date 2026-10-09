import * as glance from "../../../../../packages/render/src/instar-glance.js";
import { patch, type Variant } from "../../../variant.js";
import { cockGlance, cockRoll } from "./paint.js";

/**
 * COCK — offered 9 October 2026, the owner: *the head of boss just
 * slightly changes angle because he moves head slightly to another side so it
 * is not so static*. One of three answers in `instar:glance`: SWAY, LOOK and
 * COCK.
 */
export const INSTAR_COCK: Variant = {
  slot: "instar:glance",
  name: "cock",
  sentence:
    "cock — THE INSTAR's head slowly turns left and right and cocks side to side on a clock of its own, so the face keeps changing its angle",
  dir: "tools/versus/candidates/instar-glance/cock",
  patches: [
    patch({
      target: glance.INSTAR_GLANCE,
      reached: () => glance.INSTAR_GLANCE,
      where: {
        file: "packages/render/src/instar-glance.ts",
        symbol: "INSTAR_GLANCE",
        type: "Glance",
      },
      fields: { swing: cockGlance, roll: cockRoll },
    }),
  ],
};
