import * as swapLook from "../../../../../packages/render/src/swap-look.js";
import { patch, type Variant } from "../../../variant.js";
import { moltAnnounce } from "./paint.js";

/**
 * `swap:notice` / `molt` — siren lamps on the band, and the old panel shed
 * like a skin.
 *
 * **What the shipped side is.** THE HANDOVER's plate on the band's lip,
 * counting THE SWAP down in words; at the change the panel snaps to the other
 * seat's in one frame.
 *
 * **What this argues.** That a warning should look like an alarm and stand
 * where the thumbs are: a revolving lamp on each of the band's shoulders, the
 * lip and the hull's rim strobing red on the beat, pips going out one a beat
 * in place of a number. And that the change is a body growing out of its
 * old skin — the old panel peels off top to bottom with a curled edge, the
 * new one already under it and already answering.
 *
 * **How it can lose.** Red is the hull's danger colour; a strobing red rim
 * may read as *we are being hit* rather than *hands off in three*.
 */
export const SWAP_MOLT: Variant = {
  slot: "swap:notice",
  name: "molt",
  sentence:
    "an alarm where the thumbs are — a revolving siren lamp on each of the band's shoulders, the lip and the hull's rim strobing red on every beat of the countdown with pips going out one a beat, and at the change the old panel peeling off top to bottom like a shed skin over the new one",
  dir: "tools/versus/candidates/swap-notice/molt",
  patches: [
    patch({
      target: swapLook.SWAP_LOOK,
      // No accessor: `swap-look.ts`'s `announceSwap` reads the export itself.
      reached: () => swapLook.SWAP_LOOK,
      where: { file: "packages/render/src/swap-look.ts", symbol: "SWAP_LOOK" },
      fields: { announce: moltAnnounce },
    }),
  ],
};
