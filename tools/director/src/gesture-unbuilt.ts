import type { Gesture } from "./gesture-types.js";

/**
 * What the game does not read yet: three the spec already asks for by name,
 * and eight worth having. The list, and the argument for each, is §4.3 of
 * `docs/spec/transfers-touch.md`; the three named ones are in the gesture
 * library of `docs/spec/bosses-choreographed.md`.
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
    where: [`${SPEC} §25 THE VALVE`],
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
    where: [`${SPEC} RestraintGate`],
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
    where: [`${SPEC} RepeatedTap`, "docs/spec/bosses-cinematic.md THE RATCHET"],
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
    where: [`${SPEC} §29 THE RIME`],
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
    where: [`${SPEC} §28 THE VISE`],
  },
];

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
    name: "CHORD",
    state: "consider",
    does: '"Hold two and five": two or three controls pressed at once. Easy to say, and indifferent to the beat.',
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
    why: "Inside the iPhone's five-finger limit at two or three, and the pointer map already tracks two.",
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
    name: "TILT, AS A LEVEL",
    state: "consider",
    does: "The phone leaned left or right and held there; the angle is a level, like a hold.",
    hand: [],
    phone: { tilt: 18 },
    timeline: {
      lanes: [{ event: "deviceorientation", marks: [[0.5, 9.5]] }],
      note: "gamma: degrees left and right",
    },
    why: "Always with an on-screen twin (THE CHOIR's rule), and only once the iPhone permission is asked for.",
    platform: "Same gate as the shake on an iPhone; Android asks nothing.",
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
  {
    name: "HOLD, THEN SWIPE",
    state: "consider",
    does: "A held note that ends in a direction (Beatstar). Two verbs the game has, joined.",
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
    why: "Both halves are built and tested; only the join is new.",
  },
];
