import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSpring } from "./draw.js";

/**
 * SPRING — offered 17 October 2026, from the owner's ask the same day:
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
export const BLISTER_DEATH_TURN_SPRING: Variant = {
  slot: "blister:death-turn",
  name: "spring",
  sentence:
    "Wound too far and let go — the body spins hard back the other way, up and shrinking to a point, while the turn it held uncoils out of it as a lit spiral.",
  dir: "tools/versus/candidates/blister-death-turn/spring",
  patches: [
    patch({
      target: death.BLISTER_DEATH.turn,
      reached: () => death.BLISTER_DEATH.turn,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.turn",
        type: "BlisterDeath",
      },
      fields: { play: { life: 0.9, draw: drawSpring } },
    }),
  ],
};
