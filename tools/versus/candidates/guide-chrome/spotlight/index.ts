import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `spotlight` — the field goes dark but for the subject, the
 * words are a bubble with a tail, and the bar says BACK and NEXT in type.
 *
 * **What the shipped side is.** A band across the top with TUTORIAL at ten
 * points and the seat's name at sixteen, a box of words with a leader, and a
 * bar of three signs — two arrows and a loop — on grown bodies.
 *
 * **What this argues.** That a tutorial should look the way every mobile game
 * makes one look: the picture dimmed to a pool of light around the one thing
 * the page is about, a speech bubble that points at it, a header twice the
 * size, and a NEXT that is the widest, brightest thing on the bar and says its
 * own name. Nothing in the game ever dims the field, so a dimmed field cannot
 * be taken for play.
 *
 * **How it can lose.** The scrim hides the rest of the screen, and part of
 * the lesson of the first page is what the whole screen looks like; and a
 * band this tall stands over the field's first row.
 */
export const GUIDE_SPOTLIGHT: Variant = {
  slot: "guide:chrome",
  name: "spotlight",
  sentence:
    "the field dimmed to a pool of light around the subject, a speech bubble with a tail, TUTORIAL at twenty-two points, and BACK and NEXT written on the buttons",
  dir: "tools/versus/candidates/guide-chrome/spotlight",
  screenshot: { freezeSeconds: 2.5 },
  patches: [
    patch({
      target: look.GUIDE_LOOK,
      reached: () => look.GUIDE_LOOK,
      where: {
        file: "packages/render/src/guide-look.ts",
        symbol: "GUIDE_LOOK",
        type: "GuideLook",
      },
      fields: { navHeight: NAV_HEIGHT, bandFoot: BAND_FOOT, band, buttons, nav, caption },
    }),
  ],
};
