import * as look from "../../../../../packages/render/src/mechanism-swing.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWING — offered 27 September 2026, from the queue's "Living bosses — the
 * mechanisms swing what hangs or hinges". In THE DAVIT the chain and its hook hang off the boom's tip and never swing, so the hook swings about the tip the way a hung hook would, through the part table's hand row.
 *
 * It takes the row's whole range, not the half `docs/spec/living-bosses.md`
 * §1 wrote down: at half, the swing is under three pixels at play size, which
 * is what THE TRIVET's dangle was dropped for (`DECIDED.md`, `trivet:foot`).
 */
export const DAVIT_HOOK_SWING: Variant = {
  slot: "davit:hook",
  name: "swing",
  sentence:
    "swing — the hook swings a few degrees on its chain about the boom's tip, on a wandering period of its own, and holds still while a window asks for it",
  dir: "tools/versus/candidates/davit-hook/swing",
  patches: [
    patch({
      target: look.MECHANISM_SWING,
      reached: () => look.MECHANISM_SWING,
      where: {
        file: "packages/render/src/mechanism-swing.ts",
        symbol: "MECHANISM_SWING",
        type: "Record<SwingBoss, number>",
      },
      fields: { davit: 1 },
    }),
  ],
};
