import * as body from "../../../../../packages/render/src/surge-body.js";
import { patch, type Variant } from "../../../variant.js";
import { paintTurnedEversion } from "./paint.js";

/**
 * TURNED — offered 8 October 2026, the second of THE SURGE's three unbuilt
 * looks (bosses.md §11.28): an eversion that turns the bulb inside out rather
 * than folding its outline. The game flattens the body through its equator
 * and draws it pale past the half; this rolls the pale inside out of the
 * seam and over the body, rib by rib, until only the turned skin is left.
 */
export const SURGE_TURNED: Variant = {
  slot: "surge:evert",
  name: "turned",
  sentence:
    "turned — the inside rolls out of the seam and back over the bulb like a sock turned out, a lip at the seam and the ribs coming through one at a time",
  dir: "tools/versus/candidates/surge-evert/turned",
  patches: [
    patch({
      target: body.EVERT_LOOK,
      reached: () => body.EVERT_LOOK,
      where: {
        file: "packages/render/src/surge-body.ts",
        symbol: "EVERT_LOOK",
        type: "EvertLook",
      },
      fields: { draw: paintTurnedEversion },
    }),
  ],
};
