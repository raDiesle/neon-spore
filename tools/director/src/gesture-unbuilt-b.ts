import type { Gesture } from "./gesture-types.js";

/**
 * The eight worth having, continued from `gesture-unbuilt.ts` — split here
 * once that page passed 250 lines. §4.3 of `docs/spec/transfers-touch.md`
 * is the argument for each.
 */

export const WORTH_CONSIDERING: readonly Gesture[] = [
  {
    name: "A DRAWN GLYPH",
    state: "consider",
    does: "One phone shows a shape, the other draws it. Recognised on the drawing phone, which then sends one command — as the shake does.",
    hand: [
      {
        k: "path",
        pts: [
          [20, 80],
          [46, 24],
          [72, 80],
          [16, 46],
          [76, 46],
          [20, 80],
        ],
      },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.2, 7.8]] },
        { event: "pointerup", marks: [8] },
      ],
      window: { from: 8, to: 9, label: "recognised: one command" },
    },
    why: "Describing a shape across a room is exactly the talking the game is for.",
  },
  {
    name: "DOUBLE TAP",
    state: "consider",
    does: "Two taps quickly, as a confirm — only on a thing where one tap means nothing.",
    hand: [{ k: "touch", at: [46, 52], n: 2 }],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2, 4] },
        { event: "pointerup", marks: [2.6, 4.6] },
      ],
      window: { from: 2, to: 5, label: "≈250 ms" },
    },
    why: "Never on a fire button: every single tap there would wait ~250 ms to learn it was not a double.",
  },
  {
    name: "CALL AND RESPONSE",
    state: "consider",
    does: "One phone shows a rhythm on the beat, the other taps it back. THE BEATBOX's grading already does the judging.",
    hand: [
      { k: "touch", at: [46, 52] },
      { k: "text", at: [14, 84], text: "ta · ta-ta · ta" },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2, 3, 3.5, 5] },
        { event: "pointerup", marks: [2.3, 3.2, 3.8, 5.3] },
      ],
      beats: [2, 3, 4, 5, 6],
    },
    why: "Graded against the beat, not against the voice, so the delay does not matter.",
  },
];
