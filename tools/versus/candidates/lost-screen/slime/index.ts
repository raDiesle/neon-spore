import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { slimeVeil } from "./paint.js";

/**
 * SLIME — one body, the width of the phone, down to the middle and no further.
 *
 * The slot was decided once and is reopened on the fluid rather than on the
 * plates: the owner asked on 19 September 2026 for answers to the thirteen
 * fast rivulets with *much slower and less elements* in them, and named this
 * one — a single slime flowing full width, top to the middle, in red. So this
 * draws the shipped plates and then its own fluid over them, which is why
 * `shutPlates` is exported (`lost-shut.ts`).
 *
 * Against the shipped `bleed` it trades *never stops* for *has weight*.
 * Thirteen rivulets loop for as long as the screen is up and none of them is
 * ever the thing you are looking at; one body arrives, settles and goes on
 * dripping, and the pair can see the whole of it at once. Against `splash` it
 * is the answer that stays out of the way — it never crosses the hull, so the
 * breach is on plain ground at every age.
 */
export const LOST_SLIME: Variant = {
  slot: "lost:screen",
  name: "slime",
  sentence:
    "slime — one body of red the full width of the phone crawls down from the top edge, stops half way to the hull, and goes on hanging lower edge by lower edge after it has stopped",
  dir: "tools/versus/candidates/lost-screen/slime",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: slimeVeil },
    }),
  ],
};
