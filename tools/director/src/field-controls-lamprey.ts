import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE LAMPREY's tail, head and teeth, as rows of the ON THE FIELD tab: the
 * holder's thumb on the tail, the other seat's pull on the head or tap on the
 * one lit tooth (`sim/lamprey-hand.ts`, `docs/spec/bosses-choreographed.md`
 * §41). The body is drawn (`render/src/lamprey-draw.ts`); the rows name the
 * parts the touch reads, the knobs on the tail and the head
 * (`render/src/lamprey-handles.ts`) and the ring round the lit tooth.
 */
const SOURCE =
  "sim/lamprey-hand.ts — the tail and the head read the drag's offset, the teeth its `id`";

export const LAMPREY_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE LAMPREY'S TAIL",
    where:
      "the knob at the tail's tip, laid away from the tile the eel leaps to next, while a bite is on",
    seat: "the stay's holder — player 1 in the first stay, player 2 in the fifth",
    gesture: "grab and drag",
    does:
      "A **level** in a `pull` or a `teeth`: the tail is held while the holder's " +
      "thumb is down, and the head's pull and the teeth's taps only count while " +
      "it is. In an `apart` it is a **pull** of its own, " +
      "`lampreyTailPullMilli` along the body away from the head, at the same " +
      "time as the head's (sim/lamprey-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "lampreyTail",
    sends: ["drag"],
    pose: "LAMPREY · THE TAIL HELD",
  },
  {
    name: "THE LAMPREY'S HEAD",
    where: "the knob on the bitten tile, in a `pull` or an `apart`",
    seat: "the seat not holding the tail",
    gesture: "grab and drag",
    does:
      "A **pull**, THE CURTAIN's hem: dragged up `lampreyHeadPullMilli`, the " +
      "mouth comes off the tile and the stay is won — in a `pull` only with the " +
      "tail held, or it slips; in an `apart` only with the tail pulled the " +
      "other way at once (sim/lamprey-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "lampreyHead",
    sends: ["drag"],
    pose: "LAMPREY · THE HEAD PULLED",
  },
  {
    name: "THE LAMPREY'S TEETH",
    where: "the one lit tooth of the ring, in a `teeth`",
    seat: "the seat not holding the tail",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin. A tap on the lit tooth with the tail held " +
      "cracks it and the light jumps two teeth round the ring; a tap on any " +
      "other tooth, or with the tail loose, snaps the last cracked tooth back " +
      "in. A thumb resting on the ring has to lift and come down again " +
      "(sim/lamprey-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "lampreyTooth",
    sends: ["drag"],
    pose: "LAMPREY · THE LIT TOOTH",
  },
];
