import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawMoleBody } from "./draw.js";

/**
 * MOLE — offered 14 October 2026, from the owner's ask the same day: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:tap`: MOLE, RIDER and
 * CRADLE.
 */
export const BLISTER_MOLE: Variant = {
  slot: "blister:tap",
  name: "mole",
  sentence:
    "The button is its face — a round head comes up out of the pore with the press set in the middle of it, two eyes over it and its paws on the lip.",
  dir: "tools/versus/candidates/blister-tap/mole",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.tap,
      reached: () => bodies.BLISTER_BODY.tap,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.tap",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawMoleBody },
    }),
  ],
};
