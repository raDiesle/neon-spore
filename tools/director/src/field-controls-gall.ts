import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GALL's pinch, as a row of the ON THE FIELD tab.
 *
 * THE VISE's pinch (`field-controls-vise.ts`) on a body that moves: **both
 * screens draw the whole seam and the gall where it sits**, the two left
 * points are the pilot's and the two right the navigator's, by geometry, and
 * the point a pinch went down on goes with it as its `id`
 * (`render/gall-grip.ts`, `docs/spec/bosses.md` §11.55).
 */
const PINCH_DOES =
  "A **pinch**: two fingers of the same seat laid on the seam's row, on a " +
  "point of that seat's half — the one the first finger is nearest — and " +
  "closed. **A finger alone sends nothing.** Once the second is down, the gap " +
  "between the fingertips is sent on every move that changes it, with the " +
  "point as its id; a lit close counts the beats it stays at or under the " +
  "shut line (`gallShutMilli`) and jumps the gall to another point when they " +
  "run out, and the gap widening past the line starts the count again. **A " +
  "pinch counts only on the point the gall is on**: one on bare seam does " +
  "nothing, and one left where the gall was stays there when it jumps. Either " +
  "finger lifting lets go. Taken until the third close bares the root " +
  "(sim/gall-hand.ts). While it asks, the point the gall is on wears the " +
  "halo on the pincher's screen and the partner's ring and clock on the " +
  "other's; a close landed greens it, and a slip or a close run out reddens " +
  "it (render/gall-verdicts.ts).";

export const GALL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GALL'S PINCH",
    where:
      "on the seam's row across the field, on the point of this seat's half nearest the first finger, on both screens, until the third close pulls the gall under",
    seat: "either — the pilot on the two left points, the navigator on the two right, by geometry; fingers on the other seat's half fall through",
    gesture: "pinch",
    does: PINCH_DOES,
    source:
      "handles.ts — gallPinchUnder() under handleUnder(); the pair in packages/render/src/pinch-pair.ts",
    holdKind: "drag",
    dragTarget: "gallPinch",
    sends: ["drag"],
    pose: "GALL · THE PINCH ON THE LEFT END",
  },
];
