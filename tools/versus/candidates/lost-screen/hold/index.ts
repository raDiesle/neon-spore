import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { holdVeil, holdWords } from "./paint.js";

/**
 * HOLD — the hit stays on the screen that tells you about it.
 *
 * **What the game draws today** is the shutters: two plates that draw back off
 * the field, the lower one torn open where the hull was broken, the ship
 * bleeding violet down the whole width, and WAVE LOST stamped near the top of
 * the upper plate. The breach itself is over by then — `breach-strike.ts` runs
 * its tear or its blow for a second and a bit while the field is *held*, and
 * the lost screen comes up after that, so the picture of the hit has gone out
 * before the screen that says the hit happened is up.
 *
 * **What this argues** is that those two should be one moment. The owner asked
 * for it on 17 September 2026 — *the damaging animation of where it hit should
 * stay during the "wave lost" screen* — and named the combination: the crest
 * running away along the membrane (`breach-hammer.ts`), once and not looping,
 * with the char over it (`breach-rend.ts`) and the char held for as long as
 * the screen is up. So a wave is not lost in the abstract: it is lost *here*,
 * and the burnt patch is still burning while the pair decide whether to go
 * again. The words come down the plate to meet it.
 *
 * **How it can lose.** The char is a dark patch with no light in it, drawn on
 * a screen whose whole job is to point at the place it sits — an answer that
 * holds it too long, or too wide, hides the tear the plate was torn open to
 * show. And a hit that replays *after* the pair watched it happen is a hit
 * shown twice: if the second telling reads as a second rock rather than as the
 * first one still smoking, this is worse than nothing and the owner will say
 * so at a glance.
 */
export const LOST_HOLD: Variant = {
  slot: "lost:screen",
  name: "hold",
  sentence:
    "the hit held — the crest runs once and the char it leaves stays burning under the words, which come down the plate to meet it",
  dir: "tools/versus/candidates/lost-screen/hold",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: holdVeil, words: holdWords },
    }),
  ],
};
