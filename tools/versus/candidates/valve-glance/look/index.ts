import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/valve-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `valve:glance`: SWAY, LOOK and COCK.
 */
export const VALVE_LOOK_AROUND: Variant = {
  slot: "valve:glance",
  name: "look",
  sentence:
    "The whole drum turns to one side about its wheel and socket and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/valve-glance/look",
  patches: [
    patch({
      target: glance.VALVE_GLANCE,
      reached: () => glance.VALVE_GLANCE,
      where: {
        file: "packages/render/src/valve-glance.ts",
        symbol: "VALVE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.VALVE_GLANCE_SIZE),
    }),
  ],
};
