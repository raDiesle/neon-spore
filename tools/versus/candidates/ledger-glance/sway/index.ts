import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/ledger-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `ledger:glance`: SWAY, LOOK and COCK.
 */
export const LEDGER_SWAY: Variant = {
  slot: "ledger:glance",
  name: "sway",
  sentence:
    "sway — the whole body turns from showing its left half to its right and back on one slow sine, about the seam a bolt goes up.",
  dir: "tools/versus/candidates/ledger-glance/sway",
  patches: [
    patch({
      target: glance.LEDGER_GLANCE,
      reached: () => glance.LEDGER_GLANCE,
      where: {
        file: "packages/render/src/ledger-glance.ts",
        symbol: "LEDGER_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.LEDGER_GLANCE_SIZE),
    }),
  ],
};
