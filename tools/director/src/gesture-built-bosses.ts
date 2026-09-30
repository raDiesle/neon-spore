import type { Gesture } from "./gesture-types.js";

/**
 * The gestures the boss roster brought in: each was one the spec asked for by
 * name in the gesture library of `docs/spec/bosses-choreographed.md` and
 * stamped SPECIFIED here, and each is read by a boss's own hand file now.
 * Split off `gesture-built.ts` and `gesture-built-moves.ts` on line count.
 * TILT, AS A LEVEL was the eighth, and the owner ruled it out on 27 September
 * 2026; it is in `gesture-missed.ts`.
 */

export const BUILT_FOR_BOSSES: readonly Gesture[] = [
  {
    name: "FREEZE TAP",
    state: "built",
    does: "One seat taps, timed against a mark, and whatever the other seat is dragging stops dead for a few beats. THE VALVE: the only new verb on that sheet.",
    hand: [
      { k: "arc", c: [46, 48], r: 18, from: 0, to: 250 },
      { k: "touch", at: [70, 128] },
      { k: "text", at: [8, 96], text: "② turns it" },
      { k: "text", at: [8, 104], text: "① taps: frozen" },
    ],
    timeline: {
      lanes: [
        { event: "pointermove", finger: 2, marks: [[0.5, 5]] },
        { event: "pointerdown", marks: [5] },
        { event: "pointerup", marks: [5.6] },
      ],
      window: { from: 5, to: 9, label: "frozen" },
    },
    where: ["packages/sim/src/valve-hand.ts"],
  },
  {
    name: "SENDING NOTHING",
    state: "built",
    does: "A step passed by not touching for N beats. The one thing the input layer has never had to express — an absence, graded.",
    hand: [
      { k: "text", at: [20, 60], text: "hands off" },
      { k: "cross", at: [46, 90] },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [0.5] },
        { event: "pointerup", marks: [1.2] },
      ],
      beats: [2, 4, 6, 8],
      window: { from: 2, to: 8, label: "nothing, three beats" },
    },
    where: ["packages/sim/src/halter-hand.ts", "packages/sim/src/flue-hand.ts"],
  },
  {
    name: "TAPS ON A MOVING TARGET",
    state: "built",
    does: "A count of presses on a mark that moves between them, so the count cannot be spent in one place. THE RATCHET.",
    hand: [
      { k: "touch", at: [22, 30], n: 1 },
      { k: "touch", at: [64, 48], n: 2 },
      { k: "touch", at: [34, 76], n: 3 },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1.5, 4.5, 7.5] },
        { event: "pointerup", marks: [2, 5, 8] },
      ],
    },
    where: ["packages/sim/src/flue-hand.ts"],
  },
  {
    name: "RUB",
    state: "built",
    does: "Back and forth over one body, counting the reversals — wipe it clean. THE RIME's `RubCount`: the level a seat reports without a shared clock, since it is only pointer events.",
    hand: [
      { k: "body", at: [46, 52], r: 16 },
      { k: "zigzag", from: [30, 52], to: [62, 52], n: 5 },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[1.2, 8.8]] },
        { event: "pointerup", marks: [9] },
      ],
      note: "a reversal is where x changes sign",
    },
    where: ["packages/sim/src/rime-hand.ts", "packages/sim/src/grindstone-hand.ts"],
  },
  {
    name: "SQUEEZE ONE BODY",
    state: "built",
    does: "Two fingers on one blob, pinched together or spread apart; the gap is a depth. THE VISE's `SqueezeGap`: a lobe cracked by pinching it shut.",
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
    where: ["packages/sim/src/vise-hand.ts", "packages/sim/src/gall-hand.ts"],
  },
  {
    name: "CHORD",
    state: "built",
    does: '"Hold two and five": two or three controls pressed at once. THE TRIVET\'s `ChordHold`: a foot planted only while a chord holds.',
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
    where: ["packages/sim/src/trivet-hand.ts", "packages/sim/src/governor-hand.ts"],
  },
  {
    name: "HOLD, THEN SWIPE",
    state: "built",
    does: "A held note that ends in a direction (Beatstar). THE SLING's `DrawRelease`: a draw held, then loosed toward whichever column is lit.",
    hand: [
      { k: "hold", at: [30, 60] },
      {
        k: "path",
        pts: [
          [30, 60],
          [70, 40],
        ],
      },
    ],
    timeline: {
      lanes: [
        { event: "pointerdown", marks: [1] },
        { event: "pointermove", marks: [[6, 7.7]] },
        { event: "pointerup", marks: [8] },
      ],
      window: { from: 1, to: 6, label: "held" },
    },
    where: ["packages/sim/src/sling-hand.ts"],
  },
];
