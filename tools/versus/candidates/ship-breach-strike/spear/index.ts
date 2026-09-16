import * as look from "../../../../../packages/render/src/breach-look.js";
import { patch, type Variant } from "../../../variant.js";
import { SECONDS, spear } from "./paint.js";

/**
 * `ship:breach-strike` / `spear` — the whole lane lit, from the top of the
 * field down into the point the body went in at, held for most of a second and
 * then drawn back up.
 *
 * **What the shipped side is.** Nothing, for `breach-look.ts`'s reasons.
 *
 * **What this argues.** That the picture should answer the question the pair
 * is about to ask each other. They talk in columns — that is the control
 * scheme — and after a wave is lost what they have to agree on is *which lane
 * it came down*. A flare at the hull says the ship was hit; a lit lane says
 * where from, and stands there long enough to be read out loud. It also uses
 * the pause: `failWave` holds the field from the tick of the hit, so nine
 * tenths of a second costs the pair nothing they were going to do anyway.
 *
 * **How it can lose.** A column of light down the field is the loudest thing
 * this game has ever drawn on the play area, and the lane behind it is where
 * the *next* wave's bodies will be — a pair that reads it as an arrival rather
 * than as a record of one has been told a lie. It is also the one answer here
 * that says nothing about the ship.
 */
export const STRIKE_SPEAR: Variant = {
  slot: "ship:breach-strike",
  name: "spear",
  sentence:
    "the whole lane lit from the top of the field down into the point it went in at — ragged edges, a white spine down the middle, held for most of a second and then drawn back up into the sky",
  dir: "tools/versus/candidates/ship-breach-strike/spear",
  patches: [
    patch({
      target: look.BREACH_STRIKE_LOOK,
      reached: () => look.BREACH_STRIKE_LOOK,
      where: {
        file: "packages/render/src/breach-look.ts",
        symbol: "BREACH_STRIKE_LOOK",
        type: "BreachStrikeLook",
      },
      fields: { seconds: SECONDS, paint: spear },
    }),
  ],
};
