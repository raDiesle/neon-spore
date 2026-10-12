import type { FieldAction } from "./field-actions.js";

/**
 * **Two gestures in one action** on CONTROLS › ON THE FIELD — the owner, 12
 * October 2026, on THE LAMPREY: *treat pull and hold as a new separate
 * category of action, either to wait for other player or just for some time
 * — so combining user on screen actions in a same action.* Each type here is
 * one thumb doing two of the page's gestures one after the other, and it is
 * tried in THE COMBO LAB (`combo-lab.ts`) on the combo its `comboLab` names.
 *
 * A row filed here is one whose gesture changes with the step, so it is on
 * every type a step of it uses with its `steps` line, as THE INSTAR's are.
 */
export const COMBO_ACTIONS: readonly FieldAction[] = [
  {
    key: "pullhold",
    title: "PULL, THEN HOLD",
    says:
      "A pull carried the whole way and kept there: at the end of its channel " +
      "the knob is a hold, and the lift is what ends it.",
    types: [
      {
        key: "pullhold",
        title: "PULL, THEN HOLD",
        says:
          "The whole way is not the count but the start of a hold. It is " +
          "counted when what the hold waits for is done — the partner's own " +
          "gesture, or beats of its own — and let go before then it is " +
          "refused, red, and the knob goes home.",
        suggest:
          "Make it one generic control: the PULL LAB's pull and the HOLD " +
          "LAB's hold, the hold standing where the knob reached, and one " +
          "answer for a lift at the end too soon — refused, red.",
        comboLab: "partner",
        rows: ["THE LAMPREY'S TAIL"],
        steps: {
          "THE LAMPREY'S TAIL":
            "AN APART OR A TOW — pulled all the way out, then held there while the partner pulls the head.",
        },
      },
    ],
  },
];
