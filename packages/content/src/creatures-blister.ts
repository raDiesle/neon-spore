import type { CreatureDef } from "./creatures.js";

/**
 * THE BLISTER's row, in a file of its own for `creatures-beatbox.ts`' reason:
 * `creatures-table.ts` is near its limit, and this kind is an ordinary
 * arrival with an empty panel, like the box. The table reads `blister:
 * BLISTER_CREATURE`, so its own key order is untouched.
 */
export const BLISTER_CREATURE: CreatureDef = {
  kind: "blister",
  // **Empty**, the box's argument: a tap on the body is not a `ControlGroup`,
  // and neither the cannon nor the shield reaches it (`sim/blister.ts`).
  controls: [],
  // None, for the box's reason: a colour says which trigger kills it, and no
  // trigger does.
  color: null,
  // The pilot's strip, because the wave's default hand is the navigator's and
  // the seat warned is the seat that has to say *now* — the one shown the
  // pore swelling. A wave that turns `by` over turns the talking over with it
  // (`render/comms.ts`).
  radar: "p1",
  blurb:
    "It comes up out of a pore in the field, stays up a beat or two, and sinks again — and comes up again nearer the ship, somewhere else, until it has been tapped out or comes up on the hull and breaks it. Only one seat's hand may tap it, and only while it is up, and the taps it has taken stay taken while it is under. The other seat sees the pore swell a beat before it comes up, so the hand is told where and when rather than waiting to see it.",
};
