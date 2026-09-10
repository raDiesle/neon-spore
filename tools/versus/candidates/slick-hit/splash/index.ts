import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { splash } from "./paint.js";

/**
 * `slick:hit` / `splash` — the sac was full of liquid.
 *
 * **What the shipped side is.** Five squares and nine wedges, dry as a
 * rock's, for the wettest body in the game.
 *
 * **What this argues.** A shot going into a bag of fluid from below: the
 * contour blows out into a crown — a hoop of the body's red rising and
 * widening — whose rim lets go as a dozen drops thrown up and out, each an
 * elongated drop with a bright point on top, falling to the ship. Every drop
 * that lands joins a puddle on the skin line that spreads as they arrive and
 * dries away. One colour throughout: the body's, which is the shot's.
 *
 * **How it can lose.** *The crown is the slick still standing.* It is a hoop
 * and not a fill, and it is gone by a third of the strike; if the lane does
 * not read as cleared on the beat, it loses.
 */
export const SLICK_HIT_SPLASH: Variant = {
  slot: "slick:hit",
  name: "splash",
  sentence:
    "a crown of the body's red rises off the contour and lets go as a dozen drops thrown up and out, each falling to the ship — what lands spreads as a wet puddle on the skin line and dries away",
  dir: "tools/versus/candidates/slick-hit/splash",
  patches: [
    patch({
      target: bodyHit.SLICK_HIT,
      // The route the effects take: `body-strike.ts` and `effects-break.ts`
      // both ask `hitFor` for the record, per kind, every kill.
      reached: () => bodyHit.hitFor("slick"),
      where: {
        file: "packages/render/src/body-hit.ts",
        symbol: "SLICK_HIT",
        type: "HitLook",
      },
      fields: { life: 0.9, strike: splash },
    }),
  ],
};
