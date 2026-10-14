import type { FieldControlDef } from "./field-control-def.js";

/**
 * THE CHRYSALIS's four thumbs, as four rows of the ON THE FIELD tab: a half
 * of slime each while the slime is lit, and a quill knob a side while the
 * quills are (`sim/chrysalis-hand.ts`, `docs/spec/bosses.md` §11.63).
 *
 * **Both screens draw the one cocoon and every mark**, and whose a mark is is
 * the simulation's; a press on the partner's is sent through for the
 * simulation to refuse aloud (`render/chrysalis-grip.ts`).
 */
const rub = (side: "left" | "right") =>
  `A **rub**: a thumb anywhere on the ${side} half of the slime, held and ` +
  "turned back and forth. Each drag says how many times it has turned back " +
  "since it went down, and every fresh turn is one turn of the rub on that " +
  "half (sim/chrysalis-hand.ts, packages/render/src/rub.ts). At the step's " +
  "rubs the half is wiped clear. **A half keeps its turns when the thumb " +
  "lifts.** It wears THE RUB LAB's drop, its strokes lit by the turns made " +
  "(render/boss-cue-read-zw.ts).";

const quill = (side: "left" | "right") =>
  `A **pull**: a thumb on the knob of the next quill on the ${side} takes ` +
  "hold of it, and carried along the quill's track pulls it out of the " +
  "cocoon — THE BASTION's slab track exactly, straight out bastionPullMilli " +
  "long or a curve a thumb must keep within bastionSlackMilli of " +
  "(sim/bastion-track.ts). At the track's end the quill rips free on the " +
  "tick; let go before that and it sinks back, and only that quill starts " +
  "over. The knob wears the arrow along the track and, on its own seat's " +
  "screen, the channel of the whole track (render/chrysalis-handles.ts).";

const source = "handles.ts — chrysalisGripUnder() under handleUnder()";

export const CHRYSALIS_CONTROLS: readonly FieldControlDef[] = [
  {
    name: "THE CHRYSALIS'S LEFT SLIME",
    where:
      "anywhere on the left half of the cocoon's slime, on both screens, while the slime is lit",
    seat: "player 1",
    gesture: "grab and drag",
    does: rub("left"),
    source: `${source}; the turns counted in packages/render/src/rub.ts`,
    holdKind: "drag",
    dragTarget: "chrysalisRubLeft",
    sends: ["drag"],
    pose: "CHRYSALIS · RUBBING THE SLIME",
  },
  {
    name: "THE CHRYSALIS'S RIGHT SLIME",
    where:
      "anywhere on the right half of the cocoon's slime, on both screens, while the slime is lit",
    seat: "player 2",
    gesture: "grab and drag",
    does: rub("right"),
    source: `${source}; the turns counted in packages/render/src/rub.ts`,
    holdKind: "drag",
    dragTarget: "chrysalisRubRight",
    sends: ["drag"],
    pose: "CHRYSALIS · RUBBING THE SLIME",
  },
  {
    name: "THE CHRYSALIS'S LEFT QUILL",
    where:
      "on the knob on the next quill on the left of the cocoon, on both screens, while the quills are lit",
    seat: "player 1",
    gesture: "grab and drag",
    does: quill("left"),
    source,
    holdKind: "drag",
    dragTarget: "chrysalisQuillLeft",
    sends: ["drag"],
    pose: "CHRYSALIS · PULLING A QUILL",
  },
  {
    name: "THE CHRYSALIS'S RIGHT QUILL",
    where:
      "on the knob on the next quill on the right of the cocoon, on both screens, while the quills are lit",
    seat: "player 2",
    gesture: "grab and drag",
    does: quill("right"),
    source,
    holdKind: "drag",
    dragTarget: "chrysalisQuillRight",
    sends: ["drag"],
    pose: "CHRYSALIS · PULLING A QUILL",
  },
];
