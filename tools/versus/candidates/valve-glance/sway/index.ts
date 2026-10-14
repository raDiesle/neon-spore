import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/valve-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `valve:glance`: SWAY, LOOK and COCK.
 */
export const VALVE_SWAY: Variant = {
  slot: "valve:glance",
  name: "sway",
  sentence:
    "The whole drum swings slowly about its wheel and socket — its far end going away into the dark and coming back.",
  dir: "tools/versus/candidates/valve-glance/sway",
  patches: [
    patch({
      target: glance.VALVE_GLANCE,
      reached: () => glance.VALVE_GLANCE,
      where: {
        file: "packages/render/src/valve-glance.ts",
        symbol: "VALVE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.VALVE_GLANCE_SIZE),
    }),
  ],
};
