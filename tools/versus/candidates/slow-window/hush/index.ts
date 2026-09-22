import * as look from "../../../../../packages/render/src/slow-look.js";
import { patch, type Variant } from "../../../variant.js";
import { hushedField } from "./paint.js";

/**
 * HUSH — the screen takes a breath, and nothing in it moves.
 *
 * Two gradients: the corners sink a fifth to a third, and one wide soft
 * clearing stands over the thing the pair are answering. No particle, no bar,
 * no border, no line — the smallest picture that is still an answer, and the
 * cheapest in the slot.
 *
 * It is `gather` with the motes taken out, and it exists to test the first
 * line of the owner's brief against its third: if high readability is what
 * matters most, every mote on the field is ink spent against it, and the
 * question is whether the light changing on its own says enough. `indraw` bets
 * the other way and joins the motes into streams.
 *
 * Its risk is `wash`'s and is the reason this slot was worth re-shooting: a
 * picture the pair do not notice is not a smaller answer, it is the question
 * still open.
 */
export const SLOW_HUSH: Variant = {
  slot: "slow:window",
  name: "hush",
  sentence:
    "hush — the screen's corners sink and one soft clearing stands over the mark the pair are answering, with nothing on the field moving and no edge anywhere in it",
  dir: "tools/versus/candidates/slow-window/hush",
  patches: [
    patch({
      target: look.SLOW_LOOK,
      reached: () => look.SLOW_LOOK,
      where: {
        file: "packages/render/src/slow-look.ts",
        symbol: "SLOW_LOOK",
        type: "SlowLook",
      },
      fields: { paint: hushedField },
    }),
  ],
};
