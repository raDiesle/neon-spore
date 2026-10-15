import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawUrchinBody } from "./draw.js";

/**
 * URCHIN — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:rub`: URCHIN, WASHBOARD
 * and PURR.
 */
export const BLISTER_URCHIN: Variant = {
  slot: "blister:rub",
  name: "urchin",
  sentence:
    "A sea urchin comes up with the rub's drop in its middle — every blow lays another third of its spines flat from the top down, so the ones still standing are the blows owed.",
  dir: "tools/versus/candidates/blister-rub/urchin",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.rub,
      reached: () => bodies.BLISTER_BODY.rub,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.rub",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawUrchinBody },
    }),
  ],
};
