import type { Wave } from "../wave-types.js";

/**
 * Waves 385 to 394 of the game, in the order they are played: THE GYRE's block,
 * the filler before THE CAIRN and the boss THE CAIRN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_31: Wave[] = [
  {
    id: "theGyre",
    name: "THE GYRE",
    guide: {
      scene: "theGyre",
    },
    entries: [{ beat: 0, col: 5, kind: "gyre", color: null }],
  },
  {
    id: "theGyreAgain",
    name: "HELLO GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 7, col: 1, color: "cyan" },
      { beat: 15, col: 6, kind: "gyre", color: null },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 27, col: 6, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreReach",
    name: "OUTER GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 6, col: 3, kind: "echo", color: "cyan" },
      { beat: 18, col: 6, kind: "gyre", color: null },
      { beat: 24, col: 10, kind: "echo", color: "red" },
    ],
    pods: [{ beat: 12, col: 10, row: 3, kind: "pod" }],
  },
  {
    id: "theGyrePair",
    name: "GYRE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 9, kind: "gyre", color: null },
      { beat: 12, col: 4, color: "red" },
      { beat: 18, col: 0, kind: "echo", color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 30, col: 5, kind: "choir", color: "red" },
      { beat: 34, col: 9, color: "red" },
      { beat: 38, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreRecall",
    name: "GYRE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "gyre", color: null },
      { beat: 13, col: 10, color: "red" },
      { beat: 21, col: 9, kind: "countdown", color: "red" },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 32, col: 6, kind: "gyre", color: null },
      { beat: 37, col: 4, color: "red" },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 3, col: 4, kind: "gyre", color: null },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 16, col: 3, kind: "echo", color: "cyan" },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 25, col: 1, kind: "coil", color: null },
      { beat: 31, col: 9, kind: "gyre", color: null },
      { beat: 37, col: 1, color: "red" },
      { beat: 37, col: 9, color: "red" },
      { beat: 41, col: 3, kind: "echo", color: "red" },
      { beat: 47, col: 10, kind: "coil", color: null },
    ],
  },
  {
    id: "fillerCairnBreathe",
    name: "GYRE PICNIC",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "gyre", color: null },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 20, col: 5, kind: "echo", color: "cyan" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 33, col: 4, kind: "countdown", color: "cyan" },
      { beat: 40, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerCairnRecall",
    name: "OLD GYRE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 1, kind: "gyre", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 28, col: 7, kind: "gyre", color: null },
      { beat: 39, col: 5, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 3, row: 3, kind: "pod" },
      { beat: 33, col: 1, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerCairnBend",
    name: "GYRE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 5, kind: "gyre", color: null },
      { beat: 10, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 9, kind: "echo", color: "red" },
      { beat: 20, col: 0, kind: "gyre", color: null },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "echo", color: "red" },
      { beat: 39, col: 6, kind: "gyre", color: null },
      { beat: 44, col: 5, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theCairn",
    name: "THE CAIRN",
    guide: {
      scene: "theCairn",
    },
    entries: [],
    boss: { kind: "cairn" },
    bossType: "normal",
  },
];
