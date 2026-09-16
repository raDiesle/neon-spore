import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { veil, words } from "./paint.js";

/**
 * `lost:screen` / `shutters` — two heavy plates slide in over the field, one
 * from the top and one from the foot, and they close on everything except the
 * column the ship was hit in, where the lower plate is torn open.
 *
 * **What the shipped side is.** A flat grey veil and a card of type, for
 * `breach-hole`'s reasons.
 *
 * **What this argues.** That a lost wave should feel like something shutting.
 * The field really is held at that moment — nothing falls and nothing fires —
 * and a veil is a poor picture of a stop where a bulkhead coming down is the
 * picture the pause already is. The words are stamped on the upper plate
 * rather than floating over the field, so the screen is one object.
 *
 * **How it can lose.** It hides more of the ship than anything else in this
 * slot: the plates close over the hull itself, and what is left is a tear
 * rather than the breach. The closing also takes most of half a second on a
 * screen the pair reach for at once.
 */
export const LOST_SHUTTERS: Variant = {
  slot: "lost:screen",
  name: "shutters",
  sentence:
    "two heavy plates slide in over the field from the top and the foot and close on everything but the column it hit — where the lower plate is torn open, ragged and lit — with the words stamped on the upper plate",
  dir: "tools/versus/candidates/lost-screen/shutters",
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
