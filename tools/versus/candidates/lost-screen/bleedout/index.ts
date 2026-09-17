import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bleedoutVeil, bleedoutWords } from "./paint.js";

/**
 * BLEEDOUT — the ship loses it in every direction, and in red.
 *
 * **What the game draws today** is thirteen violet rivulets falling from the
 * top edge of the phone to the foot, at their own speeds, the full width
 * (`lost-blood.ts`). They fall the same way on every wave and they fall the
 * same way wherever the hull was broken: the picture is a mood over the
 * screen, and the one thing the screen is for — *this is where it got through*
 * — is left entirely to the tear in the plate below.
 *
 * **What this argues** is that a bleed has a source. The owner asked for it on
 * 17 September 2026: *some "versus" variants which show clear that ship got
 * damaged, maybe colour also in red or let it see some heavy damage across the
 * full area, maybe blooding out in red in all directions.* So the hole is the
 * source and everything on the screen comes out of it — thirteen arms thrown
 * outward, thick where they leave the hull and threads by the time they reach
 * a corner, sagging a little under their own weight, with a wash growing
 * behind them and the whole thing pumping on one slow pulse. The wound is the
 * brightest thing on the screen, so the answer to *where* is the first thing
 * read and not the last.
 *
 * The red is the point of the argument and is also its risk, which
 * `lost-blood.ts` states against itself: WAVE LOST is already written in red,
 * and red behind red is one colour. This answers that much and no more — the
 * upper plate keeps a dark band so the sign still reads as type on metal —
 * and leaves the rest of the screen as red as the owner asked for.
 *
 * **How it can lose.** A star of arms out of one point is a firework, and a
 * firework is a celebration; if it reads as the ship *exploding* rather than
 * as the ship emptying, it has said the opposite of what a held field means.
 * And red across the whole phone is the colour every body in this game already
 * is — a screen that looks like a wave still happening, rather than one that
 * stopped, loses on the spot.
 */
export const LOST_BLEEDOUT: Variant = {
  slot: "lost:screen",
  name: "bleedout",
  sentence:
    "blooding out — the hole is the source and the whole screen is what came out of it, red, in every direction, on one slow pulse",
  dir: "tools/versus/candidates/lost-screen/bleedout",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: bleedoutVeil, words: bleedoutWords },
    }),
  ],
};
