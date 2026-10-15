import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawBellBody, drawBellCord } from "./draw.js";

/**
 * BELL — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:lever`: BELL, ROOT and
 * TAFFY.
 */
export const BLISTER_BELL: Variant = {
  slot: "blister:lever",
  name: "bell",
  sentence:
    "A brass bell comes up mouth down and the knob is its clapper — a cord runs from its mouth to the knob, and held in the band the bell swings and rings.",
  dir: "tools/versus/candidates/blister-lever/bell",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.lever,
      reached: () => bodies.BLISTER_BODY.lever,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.lever",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawBellBody, beyond: drawBellCord },
    }),
  ],
};
