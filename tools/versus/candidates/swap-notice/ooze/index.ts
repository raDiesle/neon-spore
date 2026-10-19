import * as swapLook from "../../../../../packages/render/src/swap-look.js";
import { patch, type Variant } from "../../../variant.js";
import { oozeAnnounce } from "./paint.js";

/**
 * `swap:notice` / `ooze` — the other seat's colour seeping in, and the old
 * panel dissolving.
 *
 * **What the shipped side is.** THE HANDOVER's plate on the band's lip,
 * counting THE SWAP down in words; at the change the panel snaps to the other
 * seat's in one frame.
 *
 * **What this argues.** That the countdown is best read as a level rather
 * than a number: the colour of the seat you are about to be rises up your
 * band a beat at a time, flaring on the beat, and creeps along the hull's rim
 * from both ends — when it is full, it is theirs. And that the change is the
 * old panel melting into cells and draining away, so it is a body changing
 * rather than a picture being swapped.
 *
 * **How it can lose.** A translucent fill over the buttons costs contrast
 * exactly when the pair is about to need them most.
 */
export const SWAP_OOZE: Variant = {
  slot: "swap:notice",
  name: "ooze",
  sentence:
    "a countdown read as a level — the colour of the seat you are about to be rising up your band as a rippling slime a beat at a time and creeping along the hull's rim from both ends, flaring on each beat, and at the change the old panel breaking into soft cells that shrink away while the slime drains",
  dir: "tools/versus/candidates/swap-notice/ooze",
  patches: [
    patch({
      target: swapLook.SWAP_LOOK,
      // No accessor: `swap-look.ts`'s `announceSwap` reads the export itself.
      reached: () => swapLook.SWAP_LOOK,
      where: { file: "packages/render/src/swap-look.ts", symbol: "SWAP_LOOK" },
      fields: { announce: oozeAnnounce },
    }),
  ],
};
