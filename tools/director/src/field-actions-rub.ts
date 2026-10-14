import type { FieldAction } from "./field-actions.js";

/**
 * **RUB, an action of its own** — the owner, 13 October 2026: *for me
 * "controls" "on the field" to "rub" is a special separate category of way of
 * control. which we need a special visual for it. also build me a lab for it.*
 * It was a type under GRAB AND DRAG until then: a thumb is put on a thing and
 * moved, but nothing it moves goes anywhere, and what counts is how often it
 * turns back. THE RUB LAB stands beside the gesture's card (`rub-lab.ts`).
 */
export const RUB_ACTION: FieldAction = {
  key: "rub",
  title: "RUB",
  says:
    "A thumb put on one thing and scrubbed back and forth over it; what counts " +
    "is how often it turns back.",
  gestures: ["RUB"],
  types: [
    {
      key: "rub",
      title: "RUB",
      says: "Back and forth over one body; what counts is the reversals, or the travel.",
      suggest:
        "Make it generic under THE CAPSTAN's rules and draw it as THE RUB LAB's " +
        "drop. THE MAZE's heart counts travel rather than reversals — move it to " +
        "a rub, or say why not.",
      rubLab: "8-one",
      rows: ["THE CAPSTAN'S RUB", "THE MAZE'S HEART", "THE THROAT'S PUMP", "THE BLISTER'S RUB"],
    },
  ],
};
