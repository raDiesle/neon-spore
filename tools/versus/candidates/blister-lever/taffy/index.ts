import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawTaffyBody, drawTaffyNose } from "./draw.js";

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
    "The slime is the lever and its nose is the handle — the knob pinches the tip of a long soft nose, the thumb draws it out down the groove, and the body above sags and squeezes its eyes shut as it goes.",
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
      fields: { draw: drawTaffyBody, beyond: drawTaffyNose },
    }),
  ],
};
