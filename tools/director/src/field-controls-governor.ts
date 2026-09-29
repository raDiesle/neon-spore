import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GOVERNOR's brake and tap, as rows of the ON THE FIELD tab: a seat's
 * chord on the works around the dial, and the tapper's tap on the dial
 * itself (`render/governor-grip.ts`, `docs/spec/bosses.md` §11.58).
 */
const SOURCE =
  "handles.ts — governorGripUnder() under handleUnder(); the pads counted by chord-pads.ts";

const CHORD = {
  where:
    "the works around the dial — over the spindle, beside and under the flywheel, never on its face — while this seat is braking, or no tap is lit",
  gesture: "chord",
  does:
    "One finger of a **chord**, `id` the pad, counted by the order the fingers " +
    "land (`chord-pads.ts`). Both pads down shut the yoke's jaws and ease the " +
    "needle back to 1×; lifting either lets it climb toward 2×. The chord never " +
    "decides whether the tap counts, only how fast the needle runs (sim/governor-hand.ts).",
  source: SOURCE,
  holdKind: "drag",
  sends: ["drag"],
  pose: "GOVERNOR · THE BRAKE HELD",
} as const;

export const GOVERNOR_CONTROLS: readonly FieldControlDef[] = [
  {
    ...CHORD,
    name: "THE GOVERNOR'S BRAKE (PILOT)",
    seat: "player 1, while the navigator taps",
    dragTarget: "governorChordLeft",
  },
  {
    ...CHORD,
    name: "THE GOVERNOR'S BRAKE (NAVIGATOR)",
    seat: "player 2, while the pilot taps",
    dragTarget: "governorChordRight",
  },
  {
    name: "THE GOVERNOR'S NEEDLE",
    where: "anywhere on the dial's face, while a tap or a retap is lit",
    seat: "the lit step's tapper; the braking seat's thumb on the dial is not answered",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin. It lands while the needle is within " +
      "`governorMarkMilli` of the lit mark, however fast the needle is running; " +
      "a tap anywhere else is a skid, and the needle goes round again. A thumb " +
      "resting on the glass has to lift and come down again (sim/governor-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "governorTap",
    sends: ["drag"],
    pose: "GOVERNOR · THE MARK LIT",
  },
];
