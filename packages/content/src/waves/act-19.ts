import type { Wave } from "../wave-types.js";

/**
 * Waves 201 to 210 of the game, in the order they are played: THE VEER's block
 * and the boss THE UNDERTOW.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_19: Wave[] = [
  {
    id: "theVeer",
    name: "THE VEER",
    guide: {
      scene: "theVeer",
    },
    entries: [
      { beat: 0, col: 5, kind: "veer", color: null },
      { beat: 18, col: 8, kind: "veer", color: null },
      { beat: 34, col: 3, kind: "veer", color: null },
      { beat: 38, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerAgain",
    name: "VEER AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "veer", color: null },
      { beat: 8, col: 7, kind: "veer", color: null },
      { beat: 15, col: 8, kind: "veer", color: null },
      { beat: 22, col: 2, kind: "veer", color: null },
      { beat: 28, col: 4, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerSpread",
    name: "VEER RAIN",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 11, col: 6, kind: "veer", color: null },
      { beat: 16, col: 0, kind: "veer", color: null },
      { beat: 22, col: 1, kind: "veer", color: null },
      { beat: 27, col: 6, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerReach",
    name: "VEER HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 5, col: 5, kind: "rind", color: "red" },
      { beat: 10, col: 9, kind: "veer", color: null },
      { beat: 16, col: 5, kind: "rind", color: "red" },
      { beat: 21, col: 1, kind: "veer", color: null },
      { beat: 26, col: 5, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theVeerPair",
    name: "VEER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 10, kind: "veer", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 14, col: 3, kind: "rind", color: "cyan" },
      { beat: 19, col: 7, color: "red" },
      { beat: 25, col: 4, kind: "beatbox", color: null, beats: 3 },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 37, col: 3, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerBreathe",
    name: "VEER HUSH",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 6, kind: "veer", color: null },
      { beat: 15, col: 5, color: "red" },
      { beat: 22, col: 10, kind: "meteor", color: null },
      { beat: 29, col: 3, color: "red" },
      { beat: 35, col: 8, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 2, kind: "veer", color: null },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 17, col: 10, kind: "weight", color: null },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 0, kind: "veer", color: null },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 39, col: 7, kind: "weight", color: null },
    ],
  },
  {
    id: "theVeerBend",
    name: "VEER PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 3, kind: "veer", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 17, col: 7, kind: "rind", color: "cyan" },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 29, col: 4, kind: "veer", color: null },
      { beat: 34, col: 2, kind: "rind", color: "red" },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
      { beat: 45, col: 6, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER FURY",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 4, col: 0, kind: "veer", color: null },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 0, kind: "rind", color: "red" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 10, kind: "meteorMedium", color: null },
      { beat: 24, col: 0, kind: "veer", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 4, kind: "rind", color: "red" },
      { beat: 36, col: 9, kind: "meteorMedium", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 4, kind: "veer", color: null },
      { beat: 48, col: 7, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    guide: {
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 2, color: "red" },
      { beat: 62, col: 8, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 10, color: "red" },
      { beat: 86, col: 3, color: "red" },
      { beat: 94, col: 7, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
];
