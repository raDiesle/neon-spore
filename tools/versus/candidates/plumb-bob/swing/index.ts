import * as look from "../../../../../packages/render/src/mechanism-swing.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWING — offered 27 September 2026, from the queue's "Living bosses — the
 * mechanisms swing what hangs or hinges". In THE PLUMB the bob hangs dead still on its hook except for the tilt that is its health, so it swings a little on the hook, on top of that tilt, through the part table's arm row — heavy and slow.
 *
 * It takes the row's whole range, not the half `docs/spec/living-bosses.md`
 * §1 wrote down: at half, the swing is under three pixels at play size, which
 * is what THE TRIVET's dangle was dropped for (`DECIDED.md`, `trivet:foot`).
 */
export const PLUMB_BOB_SWING: Variant = {
  slot: "plumb:bob",
  name: "swing",
  sentence:
    "swing — the bob swings a few degrees on its hook on top of its tilt, its beam and chains with it, and holds still while a window asks for its core",
  dir: "tools/versus/candidates/plumb-bob/swing",
  patches: [
    patch({
      target: look.MECHANISM_SWING,
      reached: () => look.MECHANISM_SWING,
      where: {
        file: "packages/render/src/mechanism-swing.ts",
        symbol: "MECHANISM_SWING",
        type: "Record<SwingBoss, number>",
      },
      fields: { plumb: 1 },
    }),
  ],
};
