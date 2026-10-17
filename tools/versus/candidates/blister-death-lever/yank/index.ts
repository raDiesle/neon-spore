import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawYank } from "./draw.js";

/**
 * YANK — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-lever`: YANK and SNAP. The shipped side is
 * the clover's wedges, cut from a silhouette no LEVER body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_LEVER_YANK: Variant = {
  slot: "blister:death-lever",
  name: "yank",
  sentence:
    "The lever pulls it under — drawn down thin and tall by its cord, the body is sucked through its pore in one go, the skin rippling out after it and three drops thrown up as the hole shuts.",
  dir: "tools/versus/candidates/blister-death-lever/yank",
  patches: [
    patch({
      target: death.BLISTER_DEATH.lever,
      reached: () => death.BLISTER_DEATH.lever,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.lever",
        type: "BlisterDeath",
      },
      fields: { play: { life: 0.9, draw: drawYank } },
    }),
  ],
};
