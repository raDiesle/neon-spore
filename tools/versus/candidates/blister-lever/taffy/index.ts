import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawTaffyBody, drawTaffyNeck } from "./draw.js";

/**
 * TAFFY — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:lever`: BELL, ROOT and
 * TAFFY.
 */
export const BLISTER_TAFFY: Variant = {
  slot: "blister:lever",
  name: "taffy",
  sentence:
    "The slime is the lever — the thumb draws a neck of it down the groove to a drop round the knob, and the body above sags and squeezes its eyes shut as it goes.",
  dir: "tools/versus/candidates/blister-lever/taffy",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.lever,
      reached: () => bodies.BLISTER_BODY.lever,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.lever",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawTaffyBody, beyond: drawTaffyNeck },
    }),
  ],
};
