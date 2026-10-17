import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawScrew } from "./draw.js";

/**
 * SCREW — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-turn`: SCREW and SPRING. The shipped side is
 * the clover's wedges, cut from a silhouette no TURN body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_TURN_SCREW: Variant = {
  slot: "blister:death-turn",
  name: "screw",
  sentence:
    "Wound all the way in — the turn keeps going faster after the blow and screws the body down into its pore like a cap onto a jar, flat rings of the turn spiralling round the hole.",
  dir: "tools/versus/candidates/blister-death-turn/screw",
  patches: [
    patch({
      target: death.BLISTER_DEATH.turn,
      reached: () => death.BLISTER_DEATH.turn,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.turn",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawScrew } },
    }),
  ],
};
