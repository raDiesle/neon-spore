import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawUnzip } from "./draw.js";

/**
 * UNZIP — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-swipe`: SMEAR and UNZIP. The shipped side is
 * the clover's wedges, cut from a silhouette no SWIPE body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_SWIPE_UNZIP: Variant = {
  slot: "blister:death-swipe",
  name: "unzip",
  sentence:
    "The stroke was a zip — a lit slider runs down the body the way it was stroked, opening a toothed seam, and the two halves part either side of it and drop out.",
  dir: "tools/versus/candidates/blister-death-swipe/unzip",
  patches: [
    patch({
      target: death.BLISTER_DEATH.swipe,
      reached: () => death.BLISTER_DEATH.swipe,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.swipe",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawUnzip } },
    }),
  ],
};
