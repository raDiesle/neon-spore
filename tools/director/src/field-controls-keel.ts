import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE KEEL's one control, as a row of the ON THE FIELD tab: a tap on the lit
 * joint, whose seat is **read off where the joint sits**, so it moves
 * (`render/keel-grip.ts`, `docs/spec/bosses.md` §11.41).
 */
export const KEEL_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE KEEL'S JOINT",
    where:
      "inside the white ring round the lit segment of the spine arched along the top of the field, on both screens, for as long as the joint's window is open",
    seat: "whoever's half the lit joint sits over — the left half the pilot's, the right the navigator's, the middle column either; both screens draw the ring",
    gesture: "press",
    does:
      "A **tap** locks the segment: a white seam, the arch a little tauter, " +
      "and THE SLOW shut on the spot. The other seat's tap is refused by " +
      "the simulation, **silently**, and taken here rather than falling " +
      "through to the cannon behind the ring. A window let run out is a " +
      "miss, and the next joint lights on the next beat (sim/keel-hand.ts).",
    source: "handles.ts — keelJointUnder() under handleUnder()",
    holdKind: "drag",
    dragTarget: "keelJoint",
    sends: ["drag"],
    pose: "KEEL · THE LIT JOINT UNDER A THUMB",
  },
];
