import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawWashboardBody } from "./draw.js";

/**
 * WASHBOARD — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:rub`: URCHIN, WASHBOARD
 * and PURR.
 */
export const BLISTER_WASHBOARD: Variant = {
  slot: "blister:rub",
  name: "washboard",
  sentence:
    "A washboard stands up out of the pore with the drop on its ridged face — every blow lights another third of the ridges green from the bottom, and a scrub raises suds.",
  dir: "tools/versus/candidates/blister-rub/washboard",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.rub,
      reached: () => bodies.BLISTER_BODY.rub,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.rub",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawWashboardBody },
    }),
  ],
};
