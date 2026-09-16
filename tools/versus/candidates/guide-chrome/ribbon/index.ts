import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `ribbon` — striped tape across the top with TUTORIAL as
 * the biggest word on the phone, and BACK and NEXT as the two corners of the
 * bar.
 *
 * **What the shipped side is.** A band across the top with TUTORIAL at ten
 * points and the seat's name at sixteen, a box of words with a leader, and a
 * bar of three signs — two arrows and a loop — on grown bodies.
 *
 * **What this argues.** That the surest way to say *not the game* is a
 * marking the game never makes: diagonal tape in the seat's colour, across
 * the top, along the bar's edge and along the top of the box of words, so the
 * chrome is one kit and everything else on the screen is the real thing. And
 * that BACK and NEXT belong at the two bottom corners, tall and wide with
 * their names on, where the thumbs already are.
 *
 * **How it can lose.** Tape reads as *warning* as much as *practice*, and a
 * striped band is busier than a lit one over a field that is already moving.
 */
export const GUIDE_RIBBON: Variant = {
  slot: "guide:chrome",
  name: "ribbon",
  sentence:
    "diagonal tape in the seat's colour across the top, along the bar and over the words, TUTORIAL at twenty-six points on a badge, and BACK and NEXT as tall word lobes in the bottom corners",
  dir: "tools/versus/candidates/guide-chrome/ribbon",
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
