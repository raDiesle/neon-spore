import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GALL's press, as a row of the ON THE FIELD tab.
 *
 * One finger held down on a body that moves — THE VISE's two-finger pinch
 * until the owner swapped it on 7 October 2026, because a desk has one
 * pointer: **both screens draw the whole seam and the gall where it sits**,
 * the two left points are the pilot's and the two right the navigator's, by
 * geometry, and the point a press went down on goes with it as its `id`
 * (`render/gall-grip.ts`, `docs/spec/bosses.md` §11.55).
 */
const PRESS_DOES =
  "A **press**, held: one finger — or the mouse button — down on the seam's " +
  "row, on a point of that seat's half, the one it is nearest. It is sent " +
  "as it lands, with the point as its id, and the lift sends the same point " +
  "let go. A lit close counts the beats it stays down and jumps the gall to " +
  "another point when they run out; a lift before then starts the count " +
  "again, and a hand that wanders while it holds is still holding. **A " +
  "press counts only on the point the gall is on**: one on bare seam does " +
  "nothing, and one left where the gall was stays there when it jumps. " +
  "Taken until the third close bares the root (sim/gall-hand.ts). While it " +
  "asks, the point the gall is on wears the halo on the presser's screen " +
  "and the partner's ring and clock on the other's; a close landed greens " +
  "it, and a slip or a close run out reddens it (render/gall-verdicts.ts).";

export const GALL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GALL'S PRESS",
    where:
      "on the seam's row across the field, on the point of this seat's half nearest the finger, on both screens, until the third close pulls the gall under",
    seat: "either — the pilot on the two left points, the navigator on the two right, by geometry; a finger on the other seat's half falls through",
    gesture: "hold",
    does: PRESS_DOES,
    source: "handles.ts — gallPressUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "gallPress",
    sends: ["drag"],
    pose: "GALL · THE PRESS ON THE LEFT END",
  },
];
