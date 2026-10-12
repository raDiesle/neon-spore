import type { FieldAction } from "./field-actions.js";

/**
 * **Two gestures in one action** on CONTROLS › ON THE FIELD — the owner, 12
 * October 2026, on THE LAMPREY: *treat pull and hold as a new separate
 * category of action, either to wait for other player or just for some time
 * — so combining user on screen actions in a same action.* Each type here is
 * one thumb doing two of the page's gestures one after the other, and it is
 * tried in THE COMBO LAB (`combo-lab.ts`) on the combo its `comboLab` names.
 *
 * There are four: a pull held at its end; a hold kept while the partner
 * does their part; a pull that waits on the partner's press; a hold loosed
 * by a swipe (moved here from GRAB AND DRAG, where it was DRAW, THEN SWIPE),
 * which the lab plays as a hold and then a pull in its place.
 *
 * A row filed here is one whose gesture changes with the step, so it is on
 * every type a step of it uses with its `steps` line, as THE INSTAR's are —
 * THE LAMPREY's tail is three: pulled out and held (an `apart` or a `tow`),
 * held while the head is pulled (a `pull`), held while the teeth are tapped
 * (a `teeth`).
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
  {
    key: "holdpartner",
    title: "HOLD WHILE THE PARTNER WORKS",
    says:
      "One seat's thumb rests on its mark, and only while it stays does the " +
      "other seat's gesture count; the hold ends when the partner is done.",
    types: [
      {
        key: "holdpull",
        title: "HOLD WHILE THE PARTNER PULLS",
        says:
          "Held until the partner has pulled their knob the whole way. Let go " +
          "before, it is refused, red, and the partner's pull is lost with it.",
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
          "Held until the partner has tapped their mark enough times. Let go " +
          "before, it is refused, red, and the taps are lost with it.",
        comboLab: "holdtap",
        rows: ["THE LAMPREY'S TAIL"],
        steps: {
          "THE LAMPREY'S TAIL": "A TEETH — held while the partner taps the lit tooth.",
        },
      },
    ],
  },
  {
    key: "pullpressed",
    title: "PULL ONCE THE PARTNER HAS PRESSED",
    says:
      "A pull whose whole way only counts after the partner has pressed their " +
      "button; there before them, it is thrown back.",
    types: [
      {
        key: "plug",
        title: "PULL ONCE THE PARTNER HAS PRESSED",
        says:
          "The thumb may take the knob at once but must wait part of the way, " +
          "holding, for the press — the pull and the hold in the other order. " +
          "Reached early, the pull is refused, red, and goes home.",
        suggest:
          "Draw the partner's button on this screen too, waiting then green, " +
          "so the puller sees when the way is open rather than learning it " +
          "from a refusal.",
        comboLab: "plug",
        rows: ["THE LAMPREY'S TAIL, IN A PLUG"],
      },
    ],
  },
  {
    key: "holdswipe",
    title: "HOLD, THEN SWIPE",
    says: "A mark held for its beats, and then the lift is a swipe: its direction is the answer.",
    types: [
      {
        key: "loose",
        title: "DRAW, THEN SWIPE",
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
  },
];
