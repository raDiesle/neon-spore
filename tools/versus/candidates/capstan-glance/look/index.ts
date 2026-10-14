import * as glance from "../../../../../packages/render/src/capstan-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `capstan:glance`: SWAY, LOOK and COCK.
 */
export const CAPSTAN_LOOK_AROUND: Variant = {
  slot: "capstan:glance",
  name: "look",
  sentence:
    "The whole drum turns to one side between its faces and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/capstan-glance/look",
  patches: [
    patch({
      target: glance.CAPSTAN_GLANCE,
      reached: () => glance.CAPSTAN_GLANCE,
      where: {
        file: "packages/render/src/capstan-glance.ts",
        symbol: "CAPSTAN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.CAPSTAN_GLANCE_SIZE),
    }),
  ],
};
