import * as bodies from "../../../../../packages/render/src/blister-bodies.js";
import { patch, type Variant } from "../../../variant.js";
import { drawRootBody, drawRootDown } from "./draw.js";

/**
 * ROOT — offered 15 October 2026, from the owner's ask of the 14th: *every
 * control has its own visual related thing around the button visuals
 * integrating it*. One of three answers in `blister:lever`: BELL, ROOT and
 * TAFFY.
 */
export const BLISTER_ROOT: Variant = {
  slot: "blister:lever",
  name: "root",
  sentence:
    "Only a turnip's shoulders and leaves stand up out of the pore — the thumb pulls its root down the groove to the knob, and held in the band its leaves stand up.",
  dir: "tools/versus/candidates/blister-lever/root",
  patches: [
    patch({
      target: bodies.BLISTER_BODY.lever,
      reached: () => bodies.BLISTER_BODY.lever,
      where: {
        file: "packages/render/src/blister-bodies.ts",
        symbol: "BLISTER_BODY.lever",
        type: "BlisterBodyLook",
      },
      fields: { draw: drawRootBody, beyond: drawRootDown },
    }),
  ],
};
