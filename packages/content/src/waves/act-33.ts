import type { Wave } from "../wave-types.js";

/**
 * Waves 395 to 404 of the game, in the order they are played: THE GYRE's block,
 * the filler before THE WELL and the boss THE WELL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_33: Wave[] = [
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
      { beat: 7, col: 1, kind: "echo", color: "cyan" },
      { beat: 15, col: 6, kind: "gyre", color: null },
      { beat: 21, col: 4, kind: "echo", color: "cyan" },
      { beat: 27, col: 6, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreReach",
    name: "OUTER GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 5, kind: "echo", color: "red" },
      { beat: 11, col: 10, kind: "meteor", color: null },
      { beat: 17, col: 3, kind: "gyre", color: null },
      { beat: 22, col: 9, kind: "echo", color: "cyan" },
      { beat: 27, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    id: "theGyrePair",
    name: "GYRE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 9, kind: "gyre", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 18, col: 10, kind: "echo", color: "cyan" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 32, col: 0, kind: "rind", color: "cyan" },
      { beat: 38, col: 2, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreRecall",
    name: "GYRE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "gyre", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 8, kind: "clasp", color: "cyan" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 26, col: 1, kind: "gyre", color: null },
      { beat: 32, col: 5, kind: "clasp", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 3, kind: "gyre", color: null },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 9, kind: "echo", color: "red" },
      { beat: 20, col: 6, kind: "throb", color: "red" },
      { beat: 25, col: 1, color: "red" },
      { beat: 25, col: 9, color: "red" },
      { beat: 29, col: 4, kind: "gyre", color: null },
      { beat: 33, col: 7, kind: "echo", color: "cyan" },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 41, col: 2, kind: "throb", color: "red" },
      { beat: 45, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "fillerWellBreathe",
    name: "SOFT GYRE",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 7, col: 9, kind: "gyre", color: null },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 21, col: 0, kind: "echo", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 35, col: 0, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "fillerWellRecall",
    name: "GYRE RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 4, kind: "gyre", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 8, kind: "countdown", color: "red" },
      { beat: 23, col: 2, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 7, kind: "gyre", color: null },
      { beat: 34, col: 6, kind: "countdown", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
    ],
  },
  {
    id: "fillerWellBend",
    name: "GYRE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 4, kind: "gyre", color: null },
      { beat: 10, col: 3, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 16, col: 1, kind: "echo", color: "red" },
      { beat: 22, col: 8, kind: "gyre", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 34, col: 0, kind: "echo", color: "cyan" },
      { beat: 39, col: 4, kind: "gyre", color: null },
      { beat: 44, col: 3, color: "red" },
      { beat: 44, col: 7, color: "red" },
    ],
  },
  {
    id: "theWell",
    name: "THE WELL",
    guide: {
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 5, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
];
