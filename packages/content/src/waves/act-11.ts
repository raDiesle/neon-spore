import type { Wave } from "../wave-types.js";

/**
 * Waves 132 to 141 of the game, in the order they are played: THE WEIGHT's
 * block, the filler before THE PLUMB and the boss THE PLUMB.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "theWeight",
    name: "THE WEIGHT",
    guide: {
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 5, kind: "weight", color: null },
      { beat: 14, col: 8, kind: "weight", color: null },
      { beat: 22, col: 3, color: "red" },
      { beat: 34, col: 2, kind: "weight", color: null },
      { beat: 42, col: 10, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightAgain",
    name: "WEIGHT DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "weight", color: null },
      { beat: 7, col: 4, kind: "weight", color: null },
      { beat: 13, col: 6, kind: "weight", color: null },
      { beat: 20, col: 3, kind: "weight", color: null },
      { beat: 28, col: 6, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightReach",
    name: "OUTER WEIGHT",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "weight", color: null },
      { beat: 6, col: 5, color: "red" },
      { beat: 12, col: 9, kind: "weight", color: null },
      { beat: 18, col: 5, color: "red" },
      { beat: 24, col: 9, kind: "weight", color: null },
      { beat: 30, col: 5, color: "red" },
    ],
  },
  {
    id: "theWeightPair",
    name: "WEIGHT MEETS BEATBOX",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 3, kind: "weight", color: null },
      { beat: 8, col: 2, color: "red" },
      { beat: 13, col: 10, kind: "beatbox", color: null, beats: 3 },
      { beat: 21, col: 1, color: "red" },
      { beat: 26, col: 5, kind: "glutton", color: "cyan" },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 5, kind: "weight", color: null },
    ],
  },
  {
    id: "theWeightRecall",
    name: "WEIGHT LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 10, kind: "weight", color: null },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 16, col: 3, kind: "morsel", color: "cyan" },
      { beat: 21, col: 0, color: "red" },
      { beat: 28, col: 10, kind: "weight", color: null },
      { beat: 33, col: 0, color: "red" },
    ],
  },
  {
    id: "theWeightPeak",
    name: "WEIGHT APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 7, kind: "weight", color: null },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 12, col: 7, kind: "beatbox", color: null, beats: 4 },
      { beat: 17, col: 1, color: "red" },
      { beat: 17, col: 9, color: "red" },
      { beat: 21, col: 0, kind: "weight", color: null },
      { beat: 28, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 34, col: 3, color: "red" },
      { beat: 34, col: 7, color: "red" },
      { beat: 40, col: 10, kind: "weight", color: null },
      { beat: 47, col: 1, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "fillerPlumbBreathe",
    name: "LAZY WEIGHT",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 1, kind: "weight", color: null },
      { beat: 13, col: 3, color: "cyan" },
      { beat: 20, col: 4, kind: "weight", color: null },
      { beat: 26, col: 2, color: "cyan" },
      { beat: 32, col: 4, kind: "weight", color: null },
      { beat: 38, col: 10, color: "cyan" },
    ],
  },
  {
    id: "fillerPlumbRecall",
    name: "WEIGHT REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 8, kind: "weight", color: null },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 1, kind: "torch", color: null },
      { beat: 21, col: 6, color: "red" },
      { beat: 26, col: 5, kind: "weight", color: null },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 37, col: 2, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerPlumbBend",
    name: "WEIGHT MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 9, kind: "weight", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 8, kind: "weight", color: null },
      { beat: 31, col: 9, kind: "beatbox", color: null, beats: 4 },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 43, col: 8, kind: "weight", color: null },
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
