import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawErase } from "./draw.js";

/**
 * ERASE — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-rub`: ERASE and FOAM. The shipped side is
 * the clover's wedges, cut from a silhouette no RUB body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_RUB_ERASE: Variant = {
  slot: "blister:death-rub",
  name: "erase",
  sentence:
    "Rubbed out like pencil — a zigzag edge scrubs down the body from the top and everything above it is gone, the white rub stroke along the edge and crumbs of the body dropping round the pore.",
  dir: "tools/versus/candidates/blister-death-rub/erase",
  patches: [
    patch({
      target: death.BLISTER_DEATH.rub,
      reached: () => death.BLISTER_DEATH.rub,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.rub",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawErase } },
    }),
  ],
};
