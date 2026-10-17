import type { Wave } from "../wave-types.js";

/**
 * Waves 209 to 218 of the game, in the order they are played: THE VEER's block
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
      { beat: 42, col: 10, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerAgain",
    name: "VEER AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "veer", color: null },
      { beat: 8, col: 2, kind: "veer", color: null },
      { beat: 14, col: 7, kind: "veer", color: null },
      { beat: 20, col: 8, kind: "veer", color: null },
      { beat: 26, col: 7, kind: "veer", color: null },
      { beat: 32, col: 4, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerSpread",
    name: "VEER RAIN",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "veer", color: null },
      { beat: 7, col: 6, color: "red" },
      { beat: 12, col: 3, kind: "veer", color: null },
      { beat: 19, col: 7, color: "red" },
      { beat: 25, col: 2, kind: "veer", color: null },
      { beat: 30, col: 5, color: "red" },
    ],
  },
  {
    id: "theVeerReach",
    name: "VEER HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "veer", color: null },
      { beat: 6, col: 6, kind: "rind", color: "red" },
      { beat: 12, col: 2, color: "red" },
      { beat: 18, col: 6, kind: "veer", color: null },
      { beat: 24, col: 10, kind: "rind", color: "cyan" },
      { beat: 29, col: 2, color: "red" },
    ],
  },
  {
    id: "theVeerPair",
    name: "VEER DUET",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "veer", color: null },
      { beat: 10, col: 10, color: "red" },
      { beat: 14, col: 2, kind: "rind", color: "cyan" },
      { beat: 19, col: 3, color: "red" },
      { beat: 24, col: 5, kind: "veer", color: null },
      { beat: 30, col: 2, color: "red" },
      { beat: 36, col: 3, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theVeerBreathe",
    name: "VEER HUSH",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 8, kind: "veer", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 18, col: 7, kind: "rind", color: "cyan" },
      { beat: 26, col: 1, color: "red" },
      { beat: 34, col: 5, kind: "veer", color: null },
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
      { beat: 17, col: 10, kind: "glutton", color: "red" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 0, kind: "veer", color: null },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 39, col: 7, kind: "glutton", color: "red" },
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
      { beat: 0, col: 3, color: "red" },
      { beat: 4, col: 6, kind: "veer", color: null },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 3, kind: "rind", color: "red" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 20, col: 7, kind: "morsel", color: "red" },
      { beat: 24, col: 10, kind: "veer", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 0, kind: "rind", color: "red" },
      { beat: 36, col: 3, kind: "morsel", color: "cyan" },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 44, col: 1, kind: "veer", color: null },
      { beat: 48, col: 4, kind: "rind", color: "red" },
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
