import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { splashVeil } from "./paint.js";

/**
 * SPLASH — six blots on the front of the phone, thrown out of the breach.
 *
 * The second of the two answers the owner named on 19 September 2026 against
 * the shipped thirteen rivulets, and the opposite kind of answer to `slime`.
 * Both are slower and have fewer things in them; `slime` keeps the screen a
 * window and puts one heavy body behind the glass, and this one treats the
 * glass as a surface and puts the fluid on the pair's own side of it.
 *
 * The vote between them is really a vote on whether WAVE LOST is allowed to
 * address the pair directly. Nothing else in the game does — the field is a
 * thing watched, and the one rule of the whole design is that nothing the pair
 * control travels. This screen is not the field, and a loss is the one moment
 * the game has something to say rather than something to show.
 */
export const LOST_SPLASH: Variant = {
  slot: "lost:screen",
  name: "splash",
  sentence:
    "splash — the hit throws six blots of red out of the breach onto the front of the phone, where they swell and go soft as they land and then run slowly down the glass",
  dir: "tools/versus/candidates/lost-screen/splash",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: splashVeil },
    }),
  ],
};
