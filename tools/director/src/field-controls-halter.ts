import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE HALTER's two grips, as rows of the ON THE FIELD tab.
 *
 * THE TRIVET's chord without its geometry: **both screens draw the whole
 * seam and either seat's thumbs are taken on either grip**, because which
 * seat grips and which rests is the step's and not the seat's — the pilot on
 * the left segment, the navigator on the right, either on a guard
 * (`render/halter-grip.ts`, `docs/spec/bosses.md` §11.53).
 */
const GRIP_DOES =
  "One **finger of a chord**: a thumb within most of a tile of the grip, " +
  "whichever of the lit segment's two grips it is nearer. It says the grip " +
  "down as it lands and up as it lifts, and nothing as it wanders " +
  "(packages/render/src/chord-pads.ts). **Both grips down is the chord**; " +
  "it cracks the segment once the other seat has sent nothing for three " +
  "beats and the two have held together for two more. Any command from the " +
  "resting seat is a stir that starts its count again, and a grip lifted " +
  "while the pair holds is a slip. Only while a rest-and-chord step is lit " +
  "(sim/halter-hand.ts).";

const WHERE =
  "on the lit segment's seam, near each end of it, on both screens, while a rest-and-chord step is lit";
const SEAT =
  "either — the seat that grips is the one the step does not rest: player 1 on the left segment, player 2 on the right, either on a guard";
const SOURCE =
  "handles.ts — halterGripUnder() under handleUnder(); the grips said down and up in packages/render/src/chord-pads.ts";

export const HALTER_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE HALTER'S LEFT GRIP",
    where: WHERE,
    seat: SEAT,
    gesture: "chord",
    does: GRIP_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "halterChordLeft",
    sends: ["drag"],
    pose: "HALTER · THE LEFT SEGMENT GRIPPED",
  },
  {
    name: "THE HALTER'S RIGHT GRIP",
    where: WHERE,
    seat: SEAT,
    gesture: "chord",
    does: GRIP_DOES,
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "halterChordRight",
    sends: ["drag"],
    pose: "HALTER · THE LEFT SEGMENT RESTED",
  },
];
