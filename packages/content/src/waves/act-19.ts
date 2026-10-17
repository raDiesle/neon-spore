import type { Wave } from "../wave-types.js";

/**
 * Waves 212 to 221 of the game, in the order they are played: THE VEER's block,
 * the filler before THE UNDERTOW and the boss THE UNDERTOW.
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
      { beat: 0, col: 6, kind: "veer", color: null },
      { beat: 7, col: 4, kind: "veer", color: null },
      { beat: 13, col: 9, kind: "veer", color: null },
      { beat: 21, col: 2, kind: "veer", color: null },
      { beat: 28, col: 8, kind: "veer", color: null },
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
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 3, kind: "veer", color: null },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 2, kind: "rind", color: "red" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 1, kind: "glutton", color: "cyan" },
      { beat: 34, col: 5, color: "red" },
      { beat: 39, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 6, kind: "veer", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 17, col: 1, kind: "beatbox", color: null, beats: 2 },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 10, kind: "veer", color: null },
      { beat: 34, col: 0, color: "red" },
      { beat: 39, col: 10, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER FURY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 3, kind: "veer", color: null },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 12, col: 6, kind: "rind", color: "cyan" },
      { beat: 16, col: 5, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 20, col: 1, kind: "glutton", color: "cyan" },
      { beat: 24, col: 10, kind: "veer", color: null },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 7, kind: "rind", color: "red" },
      { beat: 36, col: 6, kind: "glutton", color: "cyan" },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 44, col: 6, kind: "veer", color: null },
      { beat: 48, col: 0, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "fillerUndertowBreathe",
    name: "VEER LULLABY",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 7, col: 0, kind: "veer", color: null },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 23, col: 5, kind: "rind", color: "cyan" },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 36, col: 4, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerUndertowRecall",
    name: "ANCIENT VEER",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 5, kind: "veer", color: null },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 17, col: 2, kind: "weight", color: null },
      { beat: 22, col: 5, color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
      { beat: 33, col: 10, color: "red" },
      { beat: 39, col: 8, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerUndertowBend",
    name: "VEER MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 6, kind: "veer", color: null },
      { beat: 12, col: 3, color: "red" },
      { beat: 18, col: 7, kind: "rind", color: "cyan" },
      { beat: 23, col: 5, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 29, col: 8, kind: "veer", color: null },
      { beat: 35, col: 4, kind: "rind", color: "red" },
      { beat: 41, col: 3, color: "cyan" },
      { beat: 41, col: 7, color: "cyan" },
      { beat: 47, col: 2, kind: "veer", color: null },
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
