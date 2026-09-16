import * as look from "../../../../../packages/render/src/breach-look.js";
import { patch, type Variant } from "../../../variant.js";
import { rend, SECONDS } from "./paint.js";

/**
 * `ship:breach-strike` / `rend` — the plating giving way: the skin around the
 * point chars, and forks of light tear out of the char along the membrane.
 *
 * **What the shipped side is.** Nothing, for `breach-look.ts`'s reasons.
 *
 * **What this argues.** That a breach should read as *material failing*
 * rather than as energy arriving. The other two answers in this slot are both
 * light at a point, and a field this bright has plenty of that already; this
 * one takes light away first, and the eye goes to the hole because it is the
 * only dark thing on a lit ship. It is also the only one of the three that
 * leaves the frame changed — the char is still there when the forks have gone
 * out, which is the patch the crack in the skin then hangs in (`scars.ts`).
 *
 * **How it can lose.** A dark patch on a dark ship is the hardest thing on
 * this list to see on a phone in daylight, and 1.2 seconds is long enough for
 * a pair to start talking over it. Charred plating is also a material the game
 * does not otherwise have — every other surface here is lit from within.
 */
export const STRIKE_REND: Variant = {
  slot: "ship:breach-strike",
  name: "rend",
  sentence:
    "the skin around the point chars to a dark patch with no light in it, and seven forks of light tear out of the char along the membrane — the plating failing rather than energy arriving",
  dir: "tools/versus/candidates/ship-breach-strike/rend",
  patches: [
    patch({
      target: look.BREACH_STRIKE_LOOK,
      reached: () => look.BREACH_STRIKE_LOOK,
      where: {
        file: "packages/render/src/breach-look.ts",
        symbol: "BREACH_STRIKE_LOOK",
        type: "BreachStrikeLook",
      },
      fields: { seconds: SECONDS, paint: rend },
    }),
  ],
};
