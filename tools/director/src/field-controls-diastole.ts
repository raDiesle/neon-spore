import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE DIASTOLE's clamp, in a file of its own — `field-controls-page.ts` is
 * at its limit, the split every boss since THE INSTAR has made.
 *
 * One target, `diastoleChamber`, one gesture, and the second field control
 * whose seat is the one **not** shown the answer: player 1's screen draws
 * the right chamber grey and never sees it beat, and it is player 1's thumb
 * the clamp is. Player 2, who sees the beat, cannot clamp — the beat is
 * theirs to say out loud (`sim/diastole-open.ts`, `render/diastole-clamp.ts`,
 * `docs/spec/bosses.md` §11.17).
 */
export const DIASTOLE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE DIASTOLE'S CLAMP",
    where:
      "a ring on the right chamber over the top of the field, on player 1's " +
      "screen, from the beat the left chamber collapses until the right one " +
      "bursts; nowhere on player 2's, where that chamber is seen beating; on " +
      "the test screen",
    seat: "player 1 only — the seat whose screen shows the chamber grey",
    gesture: "hold",
    does:
      "Clamps the alone chamber. Down on its contraction, or the beat before, " +
      "the contraction is held open for diastoleClampBeats and the beam in the " +
      "bridge lands under it; a dial round the ring runs the window out. Down " +
      "on any other beat, or held past the window, the chamber spasms for " +
      "diastoleSpasmBeats and nothing lands. P2 says when (sim/diastole-open.ts).",
    source: "touch.ts — diastoleClampUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "diastoleChamber",
    sends: ["drag"],
    pose: "THE DIASTOLE · ALONE",
  },
];
