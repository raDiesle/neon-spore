import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `console` — the phone as a viewer: a slate bezel at the
 * top with the header and the two small buttons, a slate bezel at the foot
 * with one wide NEXT, and the game in the window between them.
 *
 * **What the shipped side is.** A band across the top with TUTORIAL at ten
 * points and the seat's name at sixteen, a box of words with a leader, and a
 * bar of three signs — two arrows and a loop — on grown bodies.
 *
 * **What this argues.** That the three buttons are not equals and should not
 * sit in a row: NEXT is pressed on every page and should be the whole foot of
 * the phone, its name on it, while BACK and REPLAY are pressed now and then
 * and can go up beside the header. And that a picture in a case — cold slate
 * at both ends, viewfinder marks in the corners, a dashed ring on the subject
 * — cannot be taken for the live field.
 *
 * **How it can lose.** BACK at the top of a tall phone is a reach, and the
 * bezels take more of the screen than the shipped band and bar together.
 */
export const GUIDE_CONSOLE: Variant = {
  slot: "guide:chrome",
  name: "console",
  sentence:
    "slate bezels top and foot with viewfinder marks, TUTORIAL at twenty-four points in the top one beside small BACK and REPLAY lobes, one NEXT the width of the phone at the foot, and a dashed ring on the subject",
  dir: "tools/versus/candidates/guide-chrome/console",
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
