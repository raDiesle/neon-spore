import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE MIRROR's lobes, in a file of their own — `field-controls-page.ts` is
 * at its limit, the split every boss since THE INSTAR has made.
 *
 * One target, `mirrorLobe`, with `id` 0 for its cannon and 1 for its shield
 * — the pair's own two swellings upside down — and two gestures on it read
 * off the round (`mirrorGesture`): the last round given back on the boss's
 * ship rather than on the panel, and the pin that brings it down
 * (`sim/mirror-hand.ts`, `render/mirror-grip.ts`, `docs/spec/bosses.md`
 * §11.3).
 */
export const MIRROR_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE MIRROR'S LOBES",
    where:
      "a ring round each lobe of the mirror's ship this seat answers, while " +
      "it listens on its last round and under the pin: both lobes on player " +
      "1's screen, the cannon on player 2's; the count round both on every " +
      "screen once both thumbs are down",
    seat: "both — P1 its cannon and its shield, P2 its cannon; under the pin one lobe each",
    gesture: "grab and drag",
    does:
      "LAST ROUND: P1 slides its cannon, taps it, presses its shield. P2 swipes " +
      "its cannon left for red, right for cyan. PIN: P1 holds its cannon, P2 " +
      "holds its shield; both, for mirrorHoldBeats.",
    source: "touch.ts — mirrorLobeUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "mirrorLobe",
    sends: ["drag"],
    pose: "THE MIRROR · HOLD",
  },
];
