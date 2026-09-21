import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { drainingBar } from "./paint.js";

/**
 * DRAIN — the window as a measured thing, on the line the hands are on.
 *
 * A notched bar above the hull, as wide as the window when it opens, closing
 * to a point at the instant the game comes back up to speed. It is the exact
 * answer: a pair can say how much is left, in beats, without hearing anything.
 *
 * It is also the answer that argues *against* the other three, and it is in the
 * slot to be beaten on purpose. This game carries no health bar, no timer and
 * no score, and a window that has to be read is a window that is not being
 * felt — which is the thing the owner asked for. If an instrument wins here it
 * wins on being unmistakable, and `frame`, `wash` and `gutter` each have to
 * beat it without one.
 */
export const SLOW_DRAIN: Variant = {
  slot: "slow:window",
  name: "drain",
  sentence:
    "drain — a notched bar above the hull, as wide as the window when it opens and closed to a point when it shuts, one notch swallowed per beat",
  dir: "tools/versus/candidates/slow-window/drain",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: drainingBar },
    }),
  ],
};
