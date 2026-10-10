import type { Gesture } from "./gesture-types.js";

/**
 * Gestures **the owner ruled out**, each with the date and the reason in its
 * `why` — split from `gesture-missed.ts` for length. The page shows them with
 * the rest of SHOULD STAY MISSED (`gesture-catalogue.ts`).
 */

export const RULED_OUT: readonly Gesture[] = [
  {
    name: "TILT, AS A LEVEL",
    state: "missed",
    does: "The phone leaned left or right and held there; the angle is a level, like a hold. It was THE PLUMB's, until its stones became long drags.",
    hand: [],
    phone: { tilt: 18 },
    timeline: {
      lanes: [{ event: "deviceorientation", marks: [[0.5, 9.5]] }],
      note: "gamma: degrees left and right",
    },
    platform: "Same gate as the shake on an iPhone; Android asks nothing.",
    why: "The owner ruled on 27 September 2026 that no wave may need a tilt sensor (`packages/sim/src/plumb.ts`).",
  },
  {
    name: "CHORD",
    state: "missed",
    does: '"Hold two and five": two or three controls pressed at once, counted only while none has lifted.',
    hand: [
      { k: "hold", at: [22, 128] },
      { k: "hold", at: [60, 128] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2] },
        { event: "pointerdown", finger: 2, marks: [3] },
        { event: "pointerup", marks: [8] },
        { event: "pointerup", finger: 2, marks: [8] },
      ],
      window: { from: 3, to: 8, label: "both down" },
    },
    why: "The owner ruled on 8 October 2026, when THE TRIVET left the game: never more than one finger of the same player at once, because a PC has one pointer. A desk mouse held every pad at once, which is no chord at all.",
  },
  {
    name: "SQUEEZE ONE BODY",
    state: "missed",
    does: "Two fingers on one blob, pinched together or spread apart; the gap is a depth.",
    hand: [
      { k: "body", at: [46, 52], r: 18 },
      {
        k: "path",
        pts: [
          [24, 34],
          [38, 46],
        ],
      },
      {
        k: "path",
        pts: [
          [68, 70],
          [54, 58],
        ],
      },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointerdown", finger: 2, marks: [1.5] },
        { event: "pointermove", marks: [[1.8, 7.5]] },
        { event: "pointerup", marks: [8] },
      ],
      note: "the gap between the two, not either one",
    },
    platform: "iPhone also fires gesturechange for it, which is the one to refuse.",
    why: "The owner ruled on 8 October 2026: never two fingers of one player at once, because a PC has one pointer. THE VISE's lobes, its last body, are carried shut by one thumb now (`packages/render/src/vise-carry.ts`).",
  },
  {
    name: "A DRAWN GLYPH",
    state: "missed",
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
    why: "The owner ruled on 10 October 2026: too fragile, and not a control. A shape is recognised by tapping tiles instead, as THE MIMIC's picture is painted (`packages/sim/src/mimic-hand.ts`).",
  },
  {
    name: "DOUBLE TAP",
    state: "missed",
    does: "Two taps quickly, as a confirm — only on a thing where one tap means nothing.",
    hand: [{ k: "touch", at: [46, 52], n: 2 }],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [2, 4] },
        { event: "pointerup", marks: [2.6, 4.6] },
      ],
      window: { from: 2, to: 5, label: "≈250 ms" },
    },
    why: "The owner ruled on 10 October 2026: not worth a category of its own. TAP COUNT already asks for more than one tap, and on a fire button every single tap would wait ~250 ms to learn it was not a double.",
  },
];
