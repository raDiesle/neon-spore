import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE STARE's lid, in a file of its own — `field-controls-page.ts` is at its
 * limit, the way it was for the filament before it.
 *
 * The first handle on a boss that **is not the boss's body**: the eye takes
 * no damage and cannot be answered, and the lid is not an answer to it but a
 * way of taking the other seat's look onto yourself. One `stareLid` target,
 * a depth on the y, and the ring is drawn only on the seat the eye is *not*
 * looking at, because that is the one seat whose thumb the simulation hears
 * (`sim/stare-hand.ts`, `render/stare-lid.ts`, `docs/spec/bosses.md` §11.16).
 */
export const STARE_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE STARE'S LID",
    where:
      "a red ring on the brow of the eye over the top of the field, with " +
      "SHUT beside it, while the eye is looking — on the screen of the seat " +
      "it is not looking at, never on the watched seat's, and on the test " +
      "screen; the lid itself, a fold of rock coming down over the socket, " +
      "is on both",
    seat:
      "the seat the eye is not looking at — the one that is free to move; " +
      "the watched seat's thumb on it is nothing",
    gesture: "grab and drag",
    does:
      "Carried down, the lid follows the thumb's depth; at stareLidPullMilli " +
      "it is shut and the watched seat is free, the look over. The eye " +
      "strains under a held lid and forces it up after stareLidHoldBeats, or " +
      "the thumb lets go first — and either way, when it opens it looks at " +
      "whoever shut it, for a whole look, after stareReopenBeats of the lid " +
      "rising. So the lid is not a way out of the boss; it is one seat " +
      "taking the other's look (sim/stare-hand.ts).",
    source: "handles.ts — stareLidUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "stareLid",
    sends: ["drag"],
    pose: "THE STARE · SHUT",
  },
];
