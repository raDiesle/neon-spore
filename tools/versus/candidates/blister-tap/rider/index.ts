import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawRiderBody } from "./draw.js";

/**
 * RIDER — offered 14 October 2026, from the owner's ask the same day: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:tap`: MOLE, RIDER and
 * CRADLE.
 */
export const BLISTER_RIDER: Variant = {
  slot: "blister:tap",
  name: "rider",
  sentence:
    "The press is a round pad come up out of the pore, and a small amber slime rides on its shoulder with its arms over the rim — THE VEER's rider, on a button.",
  dir: "tools/versus/candidates/blister-tap/rider",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.tap,
      reached: () => bodies.BLISTER_BODY.tap,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.tap",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawRiderBody },
    }),
  ],
};
