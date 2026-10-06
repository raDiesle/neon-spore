import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE GOVERNOR's tap, as a row of the ON THE FIELD tab: a seat's tap on the
 * dial, for its own mark (`render/governor-grip.ts`, `docs/spec/bosses.md`
 * §11.58). The brake's two chords stood here until the owner's rework of
 * 6 October 2026 gave each seat a mark of its own.
 */
const SOURCE = "handles.ts — governorGripUnder() under handleUnder()";

export const GOVERNOR_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE GOVERNOR'S NEEDLE",
    where: "anywhere on the dial's face, while a tap or a retap is lit",
    seat: "either, while it has a mark left to land in the lit step",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin. It lands one of the seat's own open " +
      "marks while the needle is within `governorMarkMilli` of it; on an " +
      "ordered step only the next mark is open. A tap anywhere else is a " +
      "skid, and the needle goes round again. A thumb resting on the glass " +
      "has to lift and come down again (sim/governor-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "governorTap",
    sends: ["drag"],
    pose: "GOVERNOR · BOTH MARKS LIT",
  },
];
