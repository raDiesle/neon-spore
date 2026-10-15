import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawWormInChannel, drawWormMound } from "./draw.js";

/**
 * WORM — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:turn`: SNAIL, WHEEL and
 * WORM.
 */
export const BLISTER_WORM: Variant = {
  slot: "blister:turn",
  name: "worm",
  sentence:
    "Only a mound with a burrow comes up — its worm lies curled just inside the turn's channel, its head just ahead of the knob facing the way to go, and crawls round with it.",
  dir: "tools/versus/candidates/blister-turn/worm",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.turn,
      reached: () => bodies.BLISTER_BODY.turn,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.turn",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawWormMound, beyond: drawWormInChannel },
    }),
  ],
};
