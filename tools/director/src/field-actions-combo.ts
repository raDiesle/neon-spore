import type { FieldAction } from "./field-actions.js";

/**
 * **Two gestures in one action** on CONTROLS › ON THE FIELD — the owner, 12
 * October 2026, on THE LAMPREY: *treat pull and hold as a new separate
 * category of action, either to wait for other player or just for some time
 * — so combining user on screen actions in a same action.* Each type here is
 * one thumb doing two of the page's gestures one after the other.
 *
 * **One category, one lab** — the owner, 13 October 2026: *combine all the
 * combo labs to one, a single standalone category on the "on the field"
 * page*. So COMBO is one action with every combo a type under it, and THE
 * COMBO LAB (`combo-lab.ts`) stands once, at its head; its COMBO choice
 * plays every type. A type's `comboLab` names which choice it is, said under
 * the type (`field-action-cards.ts`) rather than drawn a second time.
 *
 * There are five, of two kinds (`combo-kinds.ts`). **Held while it waits**: a
 * pull held at its end; a hold kept while the partner pulls, or taps. **One,
 * then another**, each whole on its own: a press, then a pull; a hold loosed
 * by a swipe (once DRAW, THEN SWIPE under GRAB AND DRAG), which the lab plays
 * as a hold and then a pull in its place.
 *
 * A row filed here is one whose gesture changes with the step, so it is on
 * every type a step of it uses with its `steps` line, as THE INSTAR's are —
 * THE LAMPREY's tail is three: pulled out and held (an `apart` or a `tow`),
 * held while the head is pulled (a `pull`), held while the teeth are tapped
 * (a `teeth`).
 */
export const COMBO_ACTION: FieldAction = {
  key: "combo",
  title: "COMBO",
  says:
    "Two of the page's gestures as one action: one after the other, or one " +
    "kept while the partner does theirs.",
  comboLab: "partner",
  types: [
    {
      key: "pullhold",
      title: "PULL, THEN HOLD",
      says:
        "A pull carried the whole way and kept there: at the end of its channel " +
        "the knob is a hold, and the lift is what ends it. It is counted when " +
        "what the hold waits for is done — the partner's own gesture, or beats " +
        "of its own — and let go before then it is refused, red, and the knob " +
        "goes home.",
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
    {
      key: "holdpull",
      title: "HOLD WHILE THE PARTNER PULLS",
      says:
        "One seat's thumb rests on its mark, held until the partner has pulled " +
        "their knob the whole way. Let go before, it is refused, red, and the " +
        "partner's pull is lost with it.",
      suggest:
        "Make it one generic control with PULL, THEN HOLD: the same hold, " +
        "the same refusal, and the partner's knob drawn dim on this screen " +
        "so the holder sees what they wait on.",
      comboLab: "holdpull",
      rows: ["THE LAMPREY'S TAIL"],
      steps: {
        "THE LAMPREY'S TAIL": "A PULL — held while the partner pulls the head off its tile.",
      },
    },
    {
      key: "holdtap",
      title: "HOLD WHILE THE PARTNER TAPS",
      says:
        "One seat's thumb rests on its mark, held until the partner has tapped " +
        "theirs enough times. Let go before, it is refused, red, and the taps " +
        "are lost with it.",
      comboLab: "holdtap",
      rows: ["THE LAMPREY'S TAIL"],
      steps: {
        "THE LAMPREY'S TAIL": "A TEETH — held while the partner taps the lit tooth.",
      },
    },
    {
      key: "presspull",
      title: "PRESS, THEN PULL",
      says:
        "Two gestures one after the other, each whole on its own: a press, " +
        "counted and gone, and only then a pull, taken the whole way. In the " +
        "game the press is the worker's and brings the holder's pull; the " +
        "lab plays both on one seat.",
      comboLab: "presspull",
      rows: ["THE LAMPREY'S TAIL, IN A PLUG", "THE BLISTER'S COMBO"],
    },
    {
      key: "loose",
      title: "HOLD, THEN SWIPE",
      says:
        "A finger held for a count of beats, and the lift's direction is the " +
        "answer (`DrawRelease`).",
      suggest:
        "Make it two gestures, each whole: a hold counted on its own, then a " +
        "pull that comes in where the hold was, taken the asked way — THE " +
        "COMBO LAB's HOLD, THEN PULL.",
      gestures: ["HOLD, THEN SWIPE"],
      comboLab: "thenpull",
      rows: ["THE SLING'S LEFT CORD", "THE SLING'S RIGHT CORD"],
    },
  ],
};
