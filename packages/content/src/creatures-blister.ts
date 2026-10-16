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
  // **No strip and no wall mark, on either screen** — the owner, 16 October
  // 2026: *for "controls" brushes to not show the early indicator on the
  // borders of screen … but increase … the time players have to succeed it,
  // at least double.* The warning is the pore swelling on the partner's
  // screen, and only that; the time the marks bought is in the up beats now
  // (`sim/config-blister.ts`).
  radar: "none",
  blurb:
    "It comes up out of a pore in the field and stays up for a few beats. One hit from the right seat's hand while it is up and it is gone; still up when its time runs out, it breaks the hull and the wave is lost. The other seat sees the pore swell a beat before it comes up, so the hand is told where and when rather than waiting to see it.",
};
