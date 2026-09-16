import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `rail` — BACK and NEXT grown out of the two side walls at
 * thumb height, and the header at the foot of the picture rather than the
 * top.
 *
 * **What the shipped side is.** A band across the top with TUTORIAL at ten
 * points and the seat's name at sixteen, a box of words with a leader, and a
 * bar of three signs — two arrows and a loop — on grown bodies.
 *
 * **What this argues.** That the page-turning buttons belong where the two
 * thumbs already rest on a phone held in both hands — one tall lobe on each
 * wall, its name written down it — and that the header belongs at the foot,
 * a hand's width from the cannon the page is about, leaving the top of the
 * picture to the game. A rail in the seat's colour down each wall is what
 * says the picture is held in something.
 *
 * **How it can lose.** A word written down a lobe is read more slowly than
 * one written across it, the lobes stand over the field's edges where a
 * creature can come in, and a header at the foot is not where a header is
 * looked for.
 */
export const GUIDE_RAIL: Variant = {
  slot: "guide:chrome",
  name: "rail",
  sentence:
    "BACK and NEXT as tall lobes grown out of the side walls at thumb height with their names written down them, a rail in the seat's colour down each wall, and TUTORIAL at twenty-four points on a plate at the foot of the picture over a thin bar with REPLAY and the dots",
  dir: "tools/versus/candidates/guide-chrome/rail",
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
