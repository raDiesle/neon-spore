import * as glance from "../../../../../packages/render/src/capstan-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `capstan:glance`: SWAY, LOOK and COCK.
 */
export const CAPSTAN_SWAY: Variant = {
  slot: "capstan:glance",
  name: "sway",
  sentence:
    "The whole drum swings slowly between its two faces — its far half going away into the dark and coming back.",
  dir: "tools/versus/candidates/capstan-glance/sway",
  patches: [
    patch({
      target: glance.CAPSTAN_GLANCE,
      reached: () => glance.CAPSTAN_GLANCE,
      where: {
        file: "packages/render/src/capstan-glance.ts",
        symbol: "CAPSTAN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.CAPSTAN_GLANCE_SIZE),
    }),
  ],
};
