import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { sinkingWash } from "./paint.js";

/**
 * WASH — the far field goes under and the gesture does not.
 *
 * The only answer in the slot that adds no shape at all: the top of the field
 * sinks under a veil of the ground's own colour and comes back up as the
 * window is spent, while the hull, the ship and the band keep every bit of
 * their contrast. It argues that a window is a *condition* rather than a
 * countdown — the game has gone thick, and the two of them can hear how long
 * it lasts without being shown a bar.
 *
 * Against `frame`, which squeezes the whole field evenly, and `drain`, which
 * states the time left as a measured thing: this one says where the pressure
 * is not. Its risk is the bodies it dims, which `paint.ts` sets out.
 */
export const SLOW_WASH: Variant = {
  slot: "slow:window",
  name: "wash",
  sentence:
    "wash — the far half of the field sinks under a veil that clears as the window is spent, while the hull, the ship and the band keep every bit of their contrast",
  dir: "tools/versus/candidates/slow-window/wash",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: sinkingWash },
    }),
  ],
};
