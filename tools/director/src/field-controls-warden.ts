import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE WARDEN's second and third hands, in a file of their own —
 * `field-controls-page.ts` is at its limit, the split every boss since THE
 * INSTAR has made. The rope is `field-controls-tether.ts`'s row still.
 *
 * Two targets on one circle, the eye shut where the pupil stands, and the
 * phase and the seat say which a press is (`sim/warden-hand.ts`,
 * `render/warden-grip.ts`): player 2's thumb rests on it under NARROW,
 * player 1's swipe throws the hatch under GLARE. Two rows because they are
 * two rings on two screens, each with a pose of its own
 * (`docs/spec/bosses.md` §11.4, *Three phases, three gestures*).
 */
export const WARDEN_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE WARDEN'S THUMB",
    where:
      "a ring on the shut eye, where the pupil stands, on player 2's screen " +
      "under NARROW — from the second plate off; nowhere on player 1's; on " +
      "the test screen",
    seat: "player 2 only — the seat firing into an eye that will not show until she holds it",
    gesture: "hold",
    does:
      "Parts the lids behind the hatch and pins the pupil where it is for as " +
      "long as the thumb stays. The eye shows only while P1's rope is taut " +
      "and this thumb is down — both hands, then the shot, from the same " +
      "seat as the thumb (sim/warden-hand.ts).",
    source: "touch.ts — wardenGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "wardenEye",
    sends: ["drag"],
    pose: "THE WARDEN · NARROW",
  },
  {
    name: "THE WARDEN'S SWIPE",
    where:
      "a ring on the hatch on player 1's screen under GLARE — the last " +
      "plate, with no rope coming down; nowhere on player 2's; on the test " +
      "screen; a dial round the eye on both while it is thrown",
    seat: "player 1 only — the seat whose rope is gone, given the door instead",
    gesture: "grab and drag",
    does:
      "Carried wardenThrowMilli of a tile and let go, the hatch is thrown " +
      "open for wardenThrowBeats — the dial on both screens is that count " +
      "running out — then slams. A lift short of the swipe throws nothing " +
      "(sim/warden-hand.ts).",
    source: "touch.ts — wardenGripUnder() under handleUnder(); the lift carries the travel",
    holdKind: "drag",
    dragTarget: "wardenHatch",
    sends: ["drag"],
    pose: "THE WARDEN · GLARE",
  },
];
