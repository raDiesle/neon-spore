import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BULB QUEEN's marks, in a file of their own — `field-controls-page.ts`
 * is at its limit, the split every boss since THE INSTAR has made.
 *
 * One target, `queenMark`, with `id` 0 for the left mark and 1 for the
 * right, and two gestures on it read off `on` the way THE INSTAR's are:
 * pressed under BROOD, held under SCREAM. It is the first field control
 * whose seat is the one **not** shown the answer — player 1 presses a mark
 * without being told which is real, and player 2, who sees it, cannot
 * press (`sim/queen-hand.ts`, `render/queen-grip.ts`,
 * `docs/spec/bosses.md` §11.0).
 */
export const QUEEN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE QUEEN'S MARKS",
    where:
      "a faint ring round each of her two marks on player 1's screen, from " +
      "the announcement to the close, under BROOD and under SCREAM; nowhere " +
      "on player 2's, where the real one is shown bare instead; both on the " +
      "test screen",
    seat: "player 1 only — the seat that is not shown which mark is real",
    gesture: "press",
    does:
      "BROOD: P1 presses the real mark to open it — the other flinches shut. " +
      "P2 says which. SCREAM: P1 holds the real mark to keep it open, up to " +
      "queenHoldBeats; a dial round it counts the beats down. P2 fires its " +
      "colour (sim/queen-hand.ts).",
    source: "touch.ts — queenMarkUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "queenMark",
    sends: ["drag"],
    pose: "BULB QUEEN · PRIED",
  },
];
