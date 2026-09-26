import type { Gesture } from "./gesture-types.js";

/**
 * What the game does not read yet: eight the spec already asks for by name.
 * The three worth having but not yet asked for are `gesture-unbuilt-b.ts`,
 * split off once this page passed 250 lines. The list, and the argument for
 * each, is §4.3 of `docs/spec/transfers-touch.md`; the eight named ones are
 * in the gesture library of `docs/spec/bosses-choreographed.md`.
 */

const SPEC = "docs/spec/bosses-choreographed.md";

export const SPECIFIED: readonly Gesture[] = [
  {
    name: "FREEZE TAP",
    state: "specd",
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
    where: [`${SPEC} §25 THE VALVE`, `${SPEC} §34 THE CYST`, `${SPEC} §39 THE BURGEE`],
  },
  {
    name: "SENDING NOTHING",
    state: "specd",
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
    where: [
      `${SPEC} RestraintGate`,
      `${SPEC} §24 THE KEEL`,
      `${SPEC} §25 THE VALVE`,
      `${SPEC} §36 THE HALTER`,
      `${SPEC} §40 THE FLUE`,
    ],
  },
  {
    name: "TAPS ON A MOVING TARGET",
    state: "specd",
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
    where: [
      `${SPEC} RepeatedTap`,
      "docs/spec/bosses-cinematic.md THE RATCHET",
      `${SPEC} §38 THE GALL`,
      `${SPEC} §40 THE FLUE`,
      `${SPEC} §43 THE GOVERNOR`,
    ],
  },
  {
    name: "RUB",
    state: "specd",
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
    where: [
      `${SPEC} §25 THE VALVE`,
      `${SPEC} §29 THE RIME`,
      `${SPEC} §33 THE GRINDSTONE`,
      `${SPEC} §37 THE CAPSTAN`,
    ],
  },
  {
    name: "SQUEEZE ONE BODY",
    state: "specd",
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
    where: [
      `${SPEC} §28 THE VISE`,
      `${SPEC} §34 THE CYST`,
      `${SPEC} §38 THE GALL`,
      `${SPEC} §42 THE SLUICE`,
    ],
  },
  {
    name: "CHORD",
    state: "specd",
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
    where: [
      `${SPEC} §23 THE MANTLE`,
      `${SPEC} §24 THE KEEL`,
      `${SPEC} §25 THE VALVE`,
      `${SPEC} §30 THE TRIVET`,
      `${SPEC} §33 THE GRINDSTONE`,
      `${SPEC} §36 THE HALTER`,
      `${SPEC} §41 THE WINCH`,
      `${SPEC} §43 THE GOVERNOR`,
    ],
  },
  {
    name: "TILT, AS A LEVEL",
    state: "specd",
    does: "The phone leaned left or right and held there; the angle is a level, like a hold. THE PLUMB's `LevelTilt`: a weight brought level by a held lean.",
    hand: [],
    phone: { tilt: 18 },
    timeline: {
      lanes: [{ event: "deviceorientation", marks: [[0.5, 9.5]] }],
      note: "gamma: degrees left and right",
    },
    platform: "Same gate as the shake on an iPhone; Android asks nothing.",
    where: [`${SPEC} §31 THE PLUMB`, `${SPEC} §35 THE DAVIT`, `${SPEC} §37 THE CAPSTAN`],
  },
  {
    name: "HOLD, THEN SWIPE",
    state: "specd",
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
    where: [
      `${SPEC} §32 THE SLING`,
      `${SPEC} §35 THE DAVIT`,
      `${SPEC} §39 THE BURGEE`,
      `${SPEC} §41 THE WINCH`,
      `${SPEC} §42 THE SLUICE`,
    ],
  },
];
