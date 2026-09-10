import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { rupture } from "./paint.js";

/**
 * `slick:hit` / `rupture` — the sac tears open along its veins.
 *
 * **What the shipped side is.** Five squares of the body's red and nine
 * wedges of its skin, the same kill every body in the game gets; nothing
 * about it says a slick was a sac full of something.
 *
 * **What this argues.** The instant is a flash of the whole contour, and
 * then the skin peels back along nine seams — one per vein the interior
 * draws — into petals that swing out and curl, dark on the cut face. What
 * it leaves is the gel: a smear in the body's own red sliding down the
 * column and drying on the ship's skin. Every colour here is the body's,
 * which is the shot's.
 *
 * **How it can lose.** *Two breaks at once.* The shipped wedges still fall
 * under the petals; if the two read as one body coming apart twice, this is
 * too much and not too little.
 */
export const SLICK_HIT_RUPTURE: Variant = {
  slot: "slick:hit",
  name: "rupture",
  sentence:
    "the whole contour flashes white on the beat, then the skin peels back along its nine veins into petals that swing out and curl, dark on the cut face — and the gel slides down the column and dries as a red stain on the ship's skin",
  dir: "tools/versus/candidates/slick-hit/rupture",
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
      fields: { life: 0.9, strike: rupture },
    }),
  ],
};
