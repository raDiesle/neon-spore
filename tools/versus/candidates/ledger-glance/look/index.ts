import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/ledger-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `ledger:glance`: SWAY, LOOK and COCK.
 */
export const LEDGER_LOOK_AROUND: Variant = {
  slot: "ledger:glance",
  name: "look",
  sentence:
    "look — the whole body holds one half to the field, then turns to show the other, about the seam a bolt goes up.",
  dir: "tools/versus/candidates/ledger-glance/look",
  patches: [
    patch({
      target: glance.LEDGER_GLANCE,
      reached: () => glance.LEDGER_GLANCE,
      where: {
        file: "packages/render/src/ledger-glance.ts",
        symbol: "LEDGER_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.LEDGER_GLANCE_SIZE),
    }),
  ],
};
