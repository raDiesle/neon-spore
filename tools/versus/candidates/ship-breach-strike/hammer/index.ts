import * as look from "../../../../../packages/render/src/breach-look.js";
import { patch, type Variant } from "../../../variant.js";
import { hammer, SECONDS } from "./paint.js";

/**
 * `ship:breach-strike` / `hammer` — the hit as a blow: a white core at the
 * point and one crest running away from it along the ship's own membrane, both
 * ways, gone in half a second.
 *
 * **What the shipped side is.** Nothing. Sparks are thrown at the hull by
 * `effects-breach.ts` and a crack opens in the skin, and neither of them is a
 * picture of the moment — the most expensive event in the game is drawn about
 * as loudly as a shot landing (`breach-look.ts`).
 *
 * **What this argues.** That the thing to draw is the *force*, and that force
 * on a ship is a thing that travels through it. The crest is the shock leaving
 * the point along the membrane, pinned to the skin at both of its ends and
 * standing clear of it in the middle; the core is white because at the instant
 * of the hit there is more energy in that point than anything on the field is
 * made of, and the body's own colour is what is left as it dies.
 *
 * **How it can lose.** Half a second is short for the most expensive event in
 * the game, and the field is held for `waveFailBeats` anyway — this spends
 * almost none of that. A crest that has run off both sides of the ship also
 * says nothing about *where* it came in, which is the one thing the pair has
 * to say out loud afterwards.
 */
export const STRIKE_HAMMER: Variant = {
  slot: "ship:breach-strike",
  name: "hammer",
  sentence:
    "a white core at the point and one crest running away along the ship's own membrane both ways, gone in half a second — the force, drawn as a thing travelling through the hull",
  dir: "tools/versus/candidates/ship-breach-strike/hammer",
  patches: [
    patch({
      target: look.BREACH_STRIKE_LOOK,
      reached: () => look.BREACH_STRIKE_LOOK,
      where: {
        file: "packages/render/src/breach-look.ts",
        symbol: "BREACH_STRIKE_LOOK",
        type: "BreachStrikeLook",
      },
      fields: { seconds: SECONDS, paint: hammer },
    }),
  ],
};
