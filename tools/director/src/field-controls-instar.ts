import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE INSTAR's marks, in a file of their own.
 *
 * The split `field-controls-antiphon.ts` made, for the same reason —
 * `field-controls-page.ts` is at its limit — and with a thing no row on
 * that page has had before: **one target that is six gestures**. Every
 * mark is the one `instarMark` target with `id` naming which, and what a
 * thumb on it means is the mark's own `gesture`, read off the script
 * (`sim/instar-hand.ts`, `render/instar-marks.ts`, `docs/spec/bosses.md`
 * §11.32). The rows below are one per gesture, because that is what the
 * reader of the ON THE FIELD tab is asking: what does this ring want.
 */
export const INSTAR_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE INSTAR'S MARKS",
    where:
      "a red ring on the part of the body the script wants moved — the jaw, " +
      "the eggs, the tail, the head, an eye, the fire — with the gesture drawn " +
      "inside it and its word in a scanner box over it, on both screens, while " +
      "the step's window is open; a second ring closing in on it is the window",
    seat:
      "the seat the mark names — bright with the gesture's word on that seat's " +
      "screen, dim with P1'S or P2'S on the other; a middle mark wants " +
      "both thumbs; the test screen is both",
    // The hold is a drag; what the drag *means* — a tap, a swipe, a turn, a
    // hold — is the mark's gesture, said in `does`.
    gesture: "grab and drag",
    does:
      "One target that is six gestures, the mark's own. PULL DOWN / PULL UP: carried in its direction the part stands at the " +
      "depth the thumb has it, back to nought on a lift. TAP TAP: every grab " +
      "is one slap. SWIPE DOWN: a carry past instarSwipeMilli then a lift is " +
      "one egg off. TURN: wound clockwise round the ring like the crank, a " +
      "quarter turn a ratchet. HOLD BOTH: both thumbs down for the mark's " +
      "beats. A mark done alone slips back if its partner is not done " +
      "within instarTogetherBeats; the wrong seat's thumb is refused and " +
      "the body flinches; every mark of the step done together lands it, " +
      "in THE SLOW (sim/instar-hand.ts, sim/instar-marks.ts).",
    source: "touch.ts — instarMarkUnder() under handleUnder(); turnAbout() for a turn mark",
    holdKind: "drag",
    dragTarget: "instarMark",
    sends: ["drag"],
    pose: "INSTAR · THE JAW HALF PULLED",
  },
];
