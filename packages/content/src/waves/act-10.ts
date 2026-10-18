import type { Wave } from "../wave-types.js";

/**
 * Waves 200 to 209 of the game, in the order they are played: HOLD TOGETHER's
 * block, the filler before THE PLUMB and the boss THE PLUMB.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theWeight",
    name: "HOLD TOGETHER",
    guide: {
      scene: "holdTogether",
    },
    entries: [
      { beat: 0, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 14, col: 8, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 22, col: 3, color: "red" },
      { beat: 34, col: 2, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 42, col: 10, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
    ],
  },
  {
    id: "theWeightAgain",
    name: "TOGETHER DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 7, col: 4, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 13, col: 6, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 20, col: 3, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 28, col: 6, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
    ],
  },
  {
    id: "theWeightReach",
    name: "LONG TOGETHER ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 6, col: 5, color: "red" },
      { beat: 12, col: 9, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 18, col: 5, color: "red" },
      { beat: 24, col: 9, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 30, col: 5, color: "red" },
    ],
  },
  {
    id: "theWeightPair",
    name: "TOGETHER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 3, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 8, col: 2, color: "red" },
      { beat: 13, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 21, col: 1, color: "red" },
      { beat: 26, col: 5, kind: "morsel", color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 5, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
    ],
  },
  {
    id: "theWeightRecall",
    name: "OLD TOGETHER SONG",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 3, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 11, col: 2, color: "red" },
      { beat: 16, col: 0, kind: "shell", color: "cyan" },
      { beat: 23, col: 10, color: "red" },
      { beat: 30, col: 0, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "theWeightPeak",
    name: "TOGETHER STORM",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 2, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 7, col: 0, color: "cyan" },
      { beat: 11, col: 8, kind: "beatbox", color: null, beats: 4 },
      { beat: 19, col: 5, color: "cyan" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 23, col: 9, kind: "meteor", color: null },
      { beat: 26, col: 7, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 30, col: 3, color: "red" },
      { beat: 30, col: 6, color: "red" },
      { beat: 35, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 42, col: 10, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerPlumbBreathe",
    name: "LAZY TOGETHER",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 1, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 20, col: 4, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 26, col: 2, color: "cyan" },
      { beat: 32, col: 4, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 38, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerPlumbRecall",
    name: "TOGETHER REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 0, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 12, col: 5, color: "red" },
      { beat: 17, col: 1, kind: "torch", color: null },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 10, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 35, col: 4, color: "cyan" },
    ],
  },
  {
    id: "fillerPlumbBend",
    name: "TOGETHER MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 9, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 8, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 31, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 43, col: 8, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 48, col: 9, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "thePlumb",
    name: "THE PLUMB",
    guide: {
      both: "Each drags a stone. Pull away from the low side, together, until the bob hangs true. Both weights true light the core. Shoot it in its colour.",
      p1: "1. When a weight lights, drag the left stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. When the core shows a colour, fire it.",
      p2: "1. When a weight lights, drag the right stone.\n2. Pull away from the low side. Say how far you are.\n3. One pull is not enough: hold it with the other until the bob is true.\n4. White takes either colour.",
    },
    entries: [],
    boss: {
      kind: "plumb",
      steps: [
        { ask: "left", skewMilli: -3000, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "left", skewMilli: 2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "right", skewMilli: 3200, rangeMilli: 600, color: "either", beats: 6 },
        { ask: "right", skewMilli: -2800, rangeMilli: 400, color: "either", beats: 4 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 6 },
        { ask: "both", skewMilli: -2800, rangeMilli: 500, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "cyan", beats: 6 },
        { ask: "both", skewMilli: 3000, rangeMilli: 450, color: "either", beats: 3 },
        { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "either", beats: 6 },
      ],
    },
    bossType: "normal",
  },
];
