import type { Wave } from "../wave-types.js";

/**
 * Waves 203 to 212 of the game, in the order they are played: THE RIND's block,
 * the filler before THE BATON and the boss THE BATON.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_18: Wave[] = [
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 21, col: 8, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindAgain",
    name: "FIRST RIND",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "rind", color: "red" },
      { beat: 8, col: 7, kind: "rind", color: "cyan" },
      { beat: 15, col: 8, kind: "rind", color: "cyan" },
      { beat: 21, col: 2, kind: "rind", color: "red" },
      { beat: 27, col: 8, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindReach",
    name: "RIND WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "rind", color: "cyan" },
      { beat: 6, col: 5, kind: "shell", color: "cyan" },
      { beat: 11, col: 1, kind: "rind", color: "red" },
      { beat: 16, col: 5, kind: "shell", color: "cyan" },
      { beat: 21, col: 1, kind: "rind", color: "cyan" },
      { beat: 27, col: 5, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theRindPair",
    name: "RIND TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 8, kind: "rind", color: "red" },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 18, col: 10, kind: "shell", color: "red" },
      { beat: 22, col: 0, color: "red" },
      { beat: 27, col: 9, kind: "meteorMedium", color: null },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 36, col: 3, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theRindRecall",
    name: "ANCIENT RIND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 10, kind: "rind", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 10, kind: "weight", color: null },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 10, kind: "rind", color: "cyan" },
      { beat: 35, col: 8, color: "red" },
    ],
  },
  {
    id: "theRindPeak",
    name: "RIND THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 4, col: 9, kind: "rind", color: "cyan" },
      { beat: 8, col: 1, color: "red" },
      { beat: 12, col: 10, kind: "shell", color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 20, col: 9, kind: "morsel", color: "cyan" },
      { beat: 24, col: 10, kind: "rind", color: "red" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 32, col: 8, kind: "shell", color: "cyan" },
      { beat: 36, col: 1, kind: "morsel", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 8, kind: "rind", color: "cyan" },
      { beat: 48, col: 2, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerBatonBreathe",
    name: "RIND LULLABY",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 8, col: 5, kind: "rind", color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 20, col: 2, kind: "shell", color: "cyan" },
      { beat: 27, col: 3, color: "red" },
      { beat: 35, col: 7, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
  },
  {
    id: "fillerBatonRecall",
    name: "RIND HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 5, col: 7, kind: "rind", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 16, col: 0, kind: "rind", color: "cyan" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 27, col: 2, kind: "rind", color: "cyan" },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 39, col: 7, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "fillerBatonBend",
    name: "RIND MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 2, kind: "rind", color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 2, kind: "shell", color: "red" },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 29, col: 3, kind: "rind", color: "cyan" },
      { beat: 34, col: 7, kind: "shell", color: "red" },
      { beat: 39, col: 4, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 44, col: 6, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [],
    boss: { kind: "baton" },
    bossType: "normal",
  },
];
