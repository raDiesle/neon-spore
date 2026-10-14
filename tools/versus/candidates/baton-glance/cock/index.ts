import * as glance from "../../../../../packages/render/src/baton-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `baton:glance`: SWAY, LOOK and COCK.
 */
export const BATON_COCK: Variant = {
  slot: "baton:glance",
  name: "cock",
  sentence:
    "cock — every knuckle turns left and right on the sine and rocks side to side three times a round, so the arm writhes down its length.",
  dir: "tools/versus/candidates/baton-glance/cock",
  patches: [
    patch({
      target: glance.BATON_GLANCE,
      reached: () => glance.BATON_GLANCE,
      where: {
        file: "packages/render/src/baton-glance.ts",
        symbol: "BATON_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.BATON_GLANCE_SIZE),
    }),
  ],
};
