import * as glance from "../../../../../packages/render/src/antiphon-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `antiphon:glance`: SWAY, LOOK and COCK.
 */
export const ANTIPHON_SWAY: Variant = {
  slot: "antiphon:glance",
  name: "sway",
  sentence:
    "sway — the mantle turns one end toward the field and then the other and back on one slow sine, about its middle, the pits held at their spots.",
  dir: "tools/versus/candidates/antiphon-glance/sway",
  patches: [
    patch({
      target: glance.ANTIPHON_GLANCE,
      reached: () => glance.ANTIPHON_GLANCE,
      where: {
        file: "packages/render/src/antiphon-glance.ts",
        symbol: "ANTIPHON_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.ANTIPHON_GLANCE_SIZE),
    }),
  ],
};
