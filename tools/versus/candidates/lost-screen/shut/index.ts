import * as look from "../../../../../packages/render/src/lost-look.js";
import { words } from "../../../../../packages/render/src/lost-shutters.js";
import { patch, type Variant } from "../../../variant.js";
import { shutVeil } from "./paint.js";

/**
 * SHUT — the plates the picked sentence described.
 *
 * **What the game draws today** is the shutters going the other way: at `age`
 * 0 both plates cover their halves, and over half a second they draw back, the
 * upper one to the seam and the lower one off the foot of the screen. The
 * settled picture is one plate across the top with the ship, the hole and the
 * buttons in the clear below it.
 *
 * **What this argues** is the sentence that screen was picked on. Quoted on
 * the VERSUS page the vote was made from: plates that *slide in over the field
 * from the top and the foot and close on everything but the column it hit*. So
 * they come in rather than go out, they meet at the seam, and the one thing
 * left of the field is a ragged lit slot in the breach column. The owner asked
 * for this the right way round on 17 September 2026, having read the file and
 * found it disagreeing with its own words, and asked for it through here
 * rather than onto the field — it is a different screen from the one he chose,
 * and a different screen is a question and not a correction.
 *
 * **How it can lose.** `lost-look.ts` states the tension: the field stays
 * under this screen *with the breach still where it was seen*, because the
 * point of the pause is that the pair look at where it got through. The
 * shipped answer uncovers half the screen to do that; this one uncovers one
 * column and bets that one hole in a solid wall points harder than an open
 * field does. If the slot reads as a stripe rather than as a look through,
 * this is the worse screen and it is worse at the one thing the slot is for.
 * It is also darker, and it puts the words and the buttons on plate rather
 * than over the ship.
 *
 * `words` is the shipped stack, unchanged and imported: the slot's four
 * answers patch the same two fields, and this one has nothing to say about the
 * type.
 */
export const LOST_SHUT: Variant = {
  slot: "lost:screen",
  name: "shut",
  sentence:
    "shut — the plates slide in over the field from the top and the foot and close on everything but the column it hit, which is left as a ragged lit slot",
  dir: "tools/versus/candidates/lost-screen/shut",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: shutVeil, words },
    }),
  ],
};
