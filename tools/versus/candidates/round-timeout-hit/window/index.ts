import * as look from "../../../../../packages/render/src/round-strike-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paint } from "./paint.js";

/**
 * WINDOW — offered 30 September 2026, at the owner's direction of 26
 * September (*give me a versus version so i can compare on page*): a round
 * that runs out unattended breaks the hull with a rock nobody saw fall. This
 * is the round's own window closing on the ship instead — a bar the width of
 * the field that narrows onto the struck column, pinches into a spike, and
 * runs out along the membrane as a ring, in the colour a fuse ends in.
 */
export const ROUND_TIMEOUT_WINDOW: Variant = {
  slot: "round:timeout-hit",
  name: "window",
  sentence:
    "window — a round that runs out breaks the hull with its own window closing, a field-wide bar narrowing to a spike on the struck column and a ring along the membrane, instead of a rock nobody saw fall",
  dir: "tools/versus/candidates/round-timeout-hit/window",
  patches: [
    patch({
      target: look.ROUND_STRIKE_LOOK,
      reached: () => look.ROUND_STRIKE_LOOK,
      where: {
        file: "packages/render/src/round-strike-look.ts",
        symbol: "ROUND_STRIKE_LOOK",
        type: "{ paint: RoundStrikePaint | null }",
      },
      fields: { paint },
    }),
  ],
};
