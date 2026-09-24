import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE BATON's two thumbs on its own arm, in a file of their own —
 * `field-controls-page.ts` is at its limit, the split every boss since THE
 * INSTAR has made.
 *
 * One target, `batonSocket`, and the first whose **seat is decided by the
 * beat** rather than fixed: the strip belongs to whichever seat the lock is on
 * this beat, which is the seat whose panel is grey. Under `merging` the seats
 * go back to being fixed and are fixed by geometry — the upper bead the
 * pilot's, the one that waited the navigator's (`sim/baton-hand.ts`,
 * `render/baton-grip.ts`, `docs/spec/bosses.md` §11.30).
 */
export const BATON_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE BATON'S STRIP",
    where:
      "a ring on the socket whose shell is swelling, down the arm in the " +
      "middle of the field, on the screen of whichever seat the beat has " +
      "locked out of the ship — and on neither, on a beat neither of them " +
      "acted in; on the test screen",
    seat: "whichever seat is locked this beat — the one whose panel is grey",
    gesture: "press",
    does:
      "batonSwellStrips fresh presses strip the shell off clean — a thumb " +
      "dragged across it is one — and the socket sheds with no rock under it; " +
      "the arm's next shell begins swelling on the count it was going to " +
      "anyway. THE SLOW spans the swell. A dial round the ring runs the " +
      "batonSwellBeats window out; the " +
      "shell nobody takes falls down the arm's column as a rock, which is what " +
      "it always did. The other seat's press is refused with a sound, because " +
      "both screens draw the arm and it can see what it was refused " +
      "(sim/baton-hand.ts).",
    source: "touch.ts — batonSocketUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "batonSocket",
    sends: ["drag"],
    pose: "THE BATON · PASSING",
  },
  {
    name: "THE BATON'S DRAW",
    where:
      "a ring on each of the two beads at rest in the last two sockets, one " +
      "per screen — the upper on player 1's, the one that waited on player " +
      "2's — from the beat they are both there; both on the test screen",
    seat: "both, one bead each — P1 the upper, P2 the one that waited",
    gesture: "hold",
    does:
      "Draws the two beads into one. The count runs only while both thumbs are " +
      "down and goes back to nought the moment either lifts, and it takes " +
      "batonMergeBeats of both; a dial runs the batonMergeWindowBeats out, and " +
      "the window closing short shakes the bead that waited back to the top " +
      "socket. Neither ring says whether the other is down: that is the " +
      "sentence, and it is the only beat of this fight the pair may act on " +
      "together (sim/baton-pair.ts).",
    source: "touch.ts — batonSocketUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "batonSocket",
    sends: ["drag"],
    pose: "THE BATON · MERGING",
  },
];
