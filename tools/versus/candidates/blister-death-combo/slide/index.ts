import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSlide } from "./draw.js";

/**
 * SLIDE — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-combo`: SNAP and SLIDE. The shipped side is
 * the clover's wedges, cut from a silhouette no COMBO body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_COMBO_SLIDE: Variant = {
  slot: "blister:death-combo",
  name: "slide",
  sentence:
    "Pressed flat, then pulled off — the press squashes the body to a disc on its pore, the pull slides the disc out along its channel whole, and at the end it tips over and drops away.",
  dir: "tools/versus/candidates/blister-death-combo/slide",
  patches: [
    patch({
      target: death.BLISTER_DEATH.combo,
      reached: () => death.BLISTER_DEATH.combo,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.combo",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawSlide } },
    }),
  ],
};
