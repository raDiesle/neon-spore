import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE LATCH's two grips, as two rows of the ON THE FIELD tab.
 *
 * **Both screens draw the one colony and both grips, and which grip is whose
 * is the simulation's** — the pilot's the left and the navigator's the right,
 * crossed in a `cross` level (`sim/latch.ts`, `docs/spec/bosses.md` §11.61).
 * A press on the partner's grip is sent through for the simulation to refuse
 * aloud (`render/latch-grip.ts`).
 */
const does = (side: "left" | "right") =>
  `A **hold and pull**: a thumb on the ${side} grip takes hold of the tendril ` +
  "on the press alone, and carried down hauls it, as far as the grip's anchor " +
  "and latchReachMilli of depth — but only the grip whose turn it is moves " +
  "the rope; the other only holds. A lift after a pull of latchStrokeMilli " +
  "passes the turn; a lift while the other grip is off too slips the rope back " +
  "to the last knot. In a yank level both grips must be down on the yank " +
  "(sim/latch-hand.ts). The grip to pull wears the arrow down and, on its own " +
  "seat's screen, a channel one pull long; the holding grip is a knob with no " +
  "arrow (render/latch-handles.ts).";

export const LATCH_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE LATCH'S LEFT GRIP",
    where:
      "on the knob a column left of the tendril, on both screens, from the drop in until the colony is torn loose",
    seat: "player 1, or player 2 in a cross level",
    gesture: "grab and drag",
    does: does("left"),
    source: "handles.ts — latchGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "latchGripLeft",
    sends: ["drag"],
    pose: "LATCH · HAND OVER HAND",
  },
  {
    name: "THE LATCH'S RIGHT GRIP",
    where:
      "on the knob a column right of the tendril, on both screens, from the drop in until the colony is torn loose",
    seat: "player 2, or player 1 in a cross level",
    gesture: "grab and drag",
    does: does("right"),
    source: "handles.ts — latchGripUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "latchGripRight",
    sends: ["drag"],
    pose: "LATCH · HAND OVER HAND",
  },
];
