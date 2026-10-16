import type { Wave } from "../wave-types.js";

/**
 * Waves 199 to 208 of the game, in the order they are played: THE RIND's block
 * and the boss THE BATON.
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
      { beat: 0, col: 7, kind: "rind", color: "cyan" },
      { beat: 6, col: 2, kind: "rind", color: "red" },
      { beat: 12, col: 7, kind: "rind", color: "red" },
      { beat: 20, col: 8, kind: "rind", color: "cyan" },
      { beat: 27, col: 7, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindSpread",
    name: "RIND SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "rind", color: "cyan" },
      { beat: 5, col: 10, kind: "rind", color: "red" },
      { beat: 11, col: 4, kind: "rind", color: "red" },
      { beat: 16, col: 2, kind: "rind", color: "cyan" },
      { beat: 22, col: 4, kind: "rind", color: "red" },
      { beat: 27, col: 7, kind: "rind", color: "cyan" },
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
    id: "theRindBreathe",
    name: "RIND LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 8, col: 1, kind: "rind", color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 23, col: 2, kind: "meteor", color: null },
      { beat: 29, col: 3, color: "red" },
      { beat: 37, col: 6, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theRindRecall",
    name: "ANCIENT RIND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 10, kind: "rind", color: "cyan" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 17, col: 1, kind: "throb", color: "red" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 28, col: 8, kind: "rind", color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 39, col: 4, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theRindBend",
    name: "RIND MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 6, kind: "rind", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 9, kind: "shell", color: "red" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 27, col: 9, kind: "rind", color: "red" },
      { beat: 32, col: 6, kind: "shell", color: "red" },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 43, col: 4, kind: "rind", color: "red" },
      { beat: 48, col: 3, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theRindPeak",
    name: "RIND THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 0, kind: "rind", color: "red" },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 4, kind: "shell", color: "red" },
      { beat: 16, col: 1, color: "red" },
      { beat: 16, col: 9, color: "red" },
      { beat: 20, col: 5, kind: "throb", color: "red" },
      { beat: 24, col: 9, kind: "rind", color: "cyan" },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 2, kind: "shell", color: "red" },
      { beat: 36, col: 5, kind: "throb", color: "red" },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
      { beat: 44, col: 4, kind: "rind", color: "red" },
      { beat: 48, col: 6, kind: "shell", color: "cyan" },
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
