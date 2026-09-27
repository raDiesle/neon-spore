import * as look from "../../../../../packages/render/src/mechanism-swing.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWING — offered 27 September 2026, from the queue's "Living bosses — the
 * mechanisms swing what hangs or hinges". In THE SLING the two tines stand rigid off the crotch, so each springs a little about its root, out of step with the other and carrying its cord, through the part table's hand row.
 *
 * It takes the row's whole range, not the half `docs/spec/living-bosses.md`
 * §1 wrote down: at half, the swing is under three pixels at play size, which
 * is what THE TRIVET's dangle was dropped for (`DECIDED.md`, `trivet:foot`).
 */
export const SLING_TINE_SWING: Variant = {
  slot: "sling:tine",
  name: "swing",
  sentence:
    "swing — each tine springs a few degrees on the crotch, out of step with the other, its cord with it, and holds still while a window asks for the cord",
  dir: "tools/versus/candidates/sling-tine/swing",
  patches: [
    patch({
      target: look.MECHANISM_SWING,
      reached: () => look.MECHANISM_SWING,
      where: {
        file: "packages/render/src/mechanism-swing.ts",
        symbol: "MECHANISM_SWING",
        type: "Record<SwingBoss, number>",
      },
      fields: { sling: 1 },
    }),
  ],
};
