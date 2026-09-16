import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { veil, words } from "./paint.js";

/**
 * `lost:screen` / `breach-hole` — the screen goes out except over the place it
 * got through: near-black everywhere, one clear shaft standing over the breach
 * column from the hull to the top of the field, and WAVE LOST at forty points.
 *
 * **What the shipped side is.** A flat grey veil at 64 per cent over the whole
 * field, the wave and the try at eleven points, WAVE LOST at twenty-one, and
 * one line for the pair — a card over a picture (`lost-look.ts`).
 *
 * **What this argues.** That the screen can be full and still leave the lesson
 * standing, which is the tension the slot was opened over. The shaft is cut
 * with `destination-out`, so what shows through it is the held field at full
 * strength — the breach, the scar, the rock lying in it — while everything
 * that is not the answer goes dark. The type can be three times its shipped
 * size because it no longer has to share the screen with the field.
 *
 * **How it can lose.** A wall earths through the dome and scars nothing
 * (`breachUnscarred`), and on those waves this is a black screen with no hole
 * in it at all. A near-black veil also loses the ship: the pair can see where
 * it got through and not what it got through.
 */
export const LOST_BREACH_HOLE: Variant = {
  slot: "lost:screen",
  name: "breach-hole",
  sentence:
    "the screen goes out at ninety-three per cent except for one clear shaft standing over the breach column — cut out of the dark rather than painted lighter, so the held field shows through it at full strength — with WAVE LOST at forty points above it",
  dir: "tools/versus/candidates/lost-screen/breach-hole",
  screenshot: { freezeSeconds: 2.5 },
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil, words },
    }),
  ],
};
