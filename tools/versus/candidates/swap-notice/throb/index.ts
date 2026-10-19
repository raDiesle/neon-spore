import * as swapLook from "../../../../../packages/render/src/swap-look.js";
import { patch, type Variant } from "../../../variant.js";
import { throbAnnounce } from "./paint.js";

/**
 * `swap:notice` / `throb` — a heartbeat on every button, wig-wag lamps on
 * the hull, and new buttons budding out of the old.
 *
 * **What the shipped side is.** THE HANDOVER's plate on the band's lip,
 * counting THE SWAP down in words; at the change the panel snaps to the other
 * seat's in one frame.
 *
 * **What this argues.** That the warning belongs *on the thing that is about
 * to leave*: each button the thumb is resting on throbs, a ring closing on it
 * every beat and twice a beat at the end, red turning to the other seat's
 * colour; and the ship sounds it too, with two lamps on the hull flashing in
 * turn like a siren. And that each control turns into its replacement from
 * its own middle — a bud that swells out of the button and eats the old
 * panel — so the eye that was on a button sees that button change.
 *
 * **How it can lose.** Rings on every button are busy over a panel that is
 * still being played, and a ring closing on a button is the look a timing
 * game uses for *press now*.
 */
export const SWAP_THROB: Variant = {
  slot: "swap:notice",
  name: "throb",
  sentence:
    "the warning on the thing about to leave — a ring closing on every button on each beat of the countdown, twice a beat at the end, red turning to the other seat's colour, two siren lamps on the hull flashing in turn, and at the change a bud swelling out of each button that eats the old panel",
  dir: "tools/versus/candidates/swap-notice/throb",
  patches: [
    patch({
      target: swapLook.SWAP_LOOK,
      // No accessor: `swap-look.ts`'s `announceSwap` reads the export itself.
      reached: () => swapLook.SWAP_LOOK,
      where: { file: "packages/render/src/swap-look.ts", symbol: "SWAP_LOOK" },
      fields: { announce: throbAnnounce },
    }),
  ],
};
