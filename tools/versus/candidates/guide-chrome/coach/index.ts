import * as look from "../../../../../packages/render/src/guide-look.js";
import { patch, type Variant } from "../../../variant.js";
import { caption } from "./caption.js";
import { BAND_FOOT, band, buttons, NAV_HEIGHT, nav } from "./paint.js";

/**
 * `guide:chrome` / `coach` — a spore in the corner does the talking, the way
 * Clash Royale's king does, and NEXT is the whole width of the phone.
 *
 * **What the shipped side is.** A band across the top with TUTORIAL at ten
 * points and the seat's name at sixteen, a box of words with a leader, and a
 * bar of three signs — two arrows and a loop — on grown bodies.
 *
 * **What this argues.** That the clearest sign of a tutorial is a character
 * teaching it: a grown body in a mint neither ship wears, at the top left,
 * whose speech bubble says TUTORIAL at thirty points; the field dark but for
 * the subject, which the coach's second bubble points at; and a bar in two
 * rows — NEXT as wide as the phone and lit once the page has played, with
 * BACK, the dots and REPLAY small under it, the way a game puts Skip under
 * Continue.
 *
 * **How it can lose.** Two bubbles from one mouth is one more than a page
 * needs; the coach is a body the game has nowhere else; and a bar this tall
 * takes a row of the field.
 */
export const GUIDE_COACH: Variant = {
  slot: "guide:chrome",
  name: "coach",
  sentence:
    "a mint coach body at the top left whose speech bubble says TUTORIAL at thirty points — mint is the one colour neither ship wears — the field dark but for the subject, a NEXT as wide as the phone, and BACK, the dots and REPLAY small under it",
  dir: "tools/versus/candidates/guide-chrome/coach",
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
