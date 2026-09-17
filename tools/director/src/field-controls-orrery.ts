import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE ORRERY's ring, as a row of the ON THE FIELD tab — its own file for
 * `field-controls-balloon.ts`'s reason: `field-controls-page.ts` is at its
 * length limit and a row is twenty lines.
 *
 * One row rather than three, although the hand moves inward as the rings come
 * off: it is one control with one target and one gesture, and *which* ring it
 * is on is the fight's own arithmetic rather than a second entry on this page
 * (`sim/orrery-hand.ts`).
 */
export const ORRERY_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE ORRERY'S RING",
    where:
      "on the outermost unbroken orbit itself, anywhere round it — the one control in the game that is an ellipse the width of the field",
    seat: "player 1 — the pilot turns it, player 2 keeps both colours and the count he cannot see",
    gesture: "grab and drag",
    does:
      "Turns that ring by whole organs: one and a half turns of the thumb " +
      "buys one organ, and anything short of that is banked against the next " +
      "one. What it writes is the ring's anchor, so the gap goes on being a " +
      "function of the beat and player 2's readout stays answerable — the " +
      "alignment can be brought forward rather than waited for. The knurl " +
      "across the ring says which one a hand answers, and lights while it is " +
      "held (sim/orrery-hand.ts, render/orrery-grab.ts).",
    source: "handles.ts — orreryRingUnder() under handleUnder(); orrery-grab.ts on the move",
    holdKind: "drag",
    dragTarget: "orreryRing",
    sends: ["drag"],
    pose: "ORRERY · THE RING UNDER A THUMB",
  },
];
