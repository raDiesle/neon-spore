import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { closingFrame } from "./paint.js";

/**
 * FRAME — the walls come in, and stop coming in when it is over.
 *
 * The slot's question is what a window THE SLOW opened should look like, and
 * this answers it as *room*: four bars inside the field's edge, nothing at the
 * open and thickest on the beat it shuts. The end is exact — the frame stops
 * growing on the same frame the game comes back up to speed — so a pair who
 * have learnt the picture know how much answer they have left without reading
 * anything.
 *
 * It is the answer here that says least about *where* the pressure is: the
 * field is squeezed evenly, including the half nothing is in. `wash`, `gutter`
 * and `drain` each pick a different thing to be honest about.
 */
export const SLOW_FRAME: Variant = {
  slot: "slow:window",
  name: "frame",
  sentence:
    "frame — four bars stand inside the edge of the field and thicken as the window runs down, so the room closes in and stops closing the instant the game comes back up to speed",
  dir: "tools/versus/candidates/slow-window/frame",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: closingFrame },
    }),
  ],
};
