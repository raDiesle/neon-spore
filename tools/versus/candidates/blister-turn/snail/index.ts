import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSnailBody } from "./draw.js";

/**
 * SNAIL — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:turn`: SNAIL, WHEEL and
 * WORM.
 */
export const BLISTER_SNAIL: Variant = {
  slot: "blister:turn",
  name: "snail",
  sentence:
    "A snail comes up all shell, its foot on the lip — the spiral on its shell winds the way the turn runs and turns with the knob, as if the lever wound it.",
  dir: "tools/versus/candidates/blister-turn/snail",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.turn,
      reached: () => bodies.BLISTER_BODY.turn,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.turn",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawSnailBody, beyond: bodies.drawNothingBeyond },
    }),
  ],
};
