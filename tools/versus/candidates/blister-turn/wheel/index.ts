import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawWheelBody } from "./draw.js";

/**
 * WHEEL — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:turn`: SNAIL, WHEEL and
 * WORM.
 */
export const BLISTER_WHEEL: Variant = {
  slot: "blister:turn",
  name: "wheel",
  sentence:
    "The body is a wheel of six lobes hooked the way the turn runs, like a turbine's blades — the lever turns it, and it goes round with the knob.",
  dir: "tools/versus/candidates/blister-turn/wheel",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.turn,
      reached: () => bodies.BLISTER_BODY.turn,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.turn",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawWheelBody, beyond: bodies.drawNothingBeyond },
    }),
  ],
};
