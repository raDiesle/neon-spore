import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE LAMPREY's jaw and teeth, as rows of the ON THE FIELD tab: the pinner's
 * thumb on the crawling jaw, and the tapper's tap on the one lit tooth
 * (`sim/lamprey-hand.ts`, `docs/spec/bosses-choreographed.md` §41). The body
 * is drawn (`render/src/lamprey-draw.ts`); the rows name the parts the touch
 * reads, the jaw's band on the hull and the ring round the lit tooth.
 */
const SOURCE =
  "sim/lamprey-hand.ts — the drag's `id` is the column for the jaw, the tooth for the teeth";

export const LAMPREY_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE LAMPREY'S JAW",
    where: "on the mouth bitten onto the hull, wherever it has crawled to, while a bite is on",
    seat: "the bite's pinner — player 1 in the first bite, player 2 in the second",
    gesture: "grab and drag",
    does:
      "A **level**, THE GALL's pinch. The jaw is held while the pinner's thumb " +
      "is within `lampreyGripCols` of the column it has crawled to; held, the " +
      "bite stops deepening. Let go, or left behind by a crawl, it chews a step " +
      "deeper a beat, and a full bite is a hull hit (sim/lamprey-step.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "lampreyJaw",
    sends: ["drag"],
    pose: "LAMPREY · THE JAW PINNED",
  },
  {
    name: "THE LAMPREY'S TEETH",
    where: "the one lit tooth of the ring, while a bite is on",
    seat: "the seat not pinning the jaw",
    gesture: "press",
    does:
      "An **edge**, THE VALVE's pin. A tap on the lit tooth cracks it and the " +
      "light jumps two teeth round the ring; a tap on any other tooth, or the " +
      "lit one's window run out, snaps the last cracked tooth back in. A thumb " +
      "resting on the ring has to lift and come down again (sim/lamprey-hand.ts).",
    source: SOURCE,
    holdKind: "drag",
    dragTarget: "lampreyTooth",
    sends: ["drag"],
    pose: "LAMPREY · THE LIT TOOTH",
  },
];
