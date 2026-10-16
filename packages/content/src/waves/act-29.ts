import type { Wave } from "../wave-types.js";

/**
 * Waves 301 to 310 of the game, in the order they are played: THE CLASP's block
 * and the boss THE HIVE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_29: Wave[] = [
  {
    id: "theClasp",
    name: "THE CLASP",
    guide: {
      scene: "theClasp",
    },
    entries: [
      { beat: 0, col: 5, kind: "clasp", color: "cyan" },
      { beat: 6, col: 2, kind: "clasp", color: "red" },
      { beat: 12, col: 8, kind: "clasp", color: "red" },
      { beat: 20, col: 3, kind: "clasp", color: "cyan" },
      { beat: 28, col: 7, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspAgain",
    name: "NEW CLASP MOON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "clasp", color: "red" },
      { beat: 6, col: 2, kind: "clasp", color: "red" },
      { beat: 13, col: 5, kind: "clasp", color: "cyan" },
      { beat: 20, col: 1, kind: "clasp", color: "cyan" },
      { beat: 26, col: 9, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "theClaspSpread",
    name: "CLASP SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "clasp", color: "cyan" },
      { beat: 6, col: 4, kind: "lure", color: "cyan" },
      { beat: 12, col: 3, kind: "clasp", color: "red" },
      { beat: 19, col: 5, kind: "lure", color: "red" },
      { beat: 25, col: 3, kind: "clasp", color: "cyan" },
      { beat: 31, col: 1, kind: "lure", color: "red" },
    ],
  },
  {
    id: "theClaspReach",
    name: "FAR CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "clasp", color: "cyan" },
      { beat: 6, col: 1, kind: "lure", color: "cyan" },
      { beat: 18, col: 0, kind: "clasp", color: "cyan" },
      { beat: 24, col: 6, kind: "lure", color: "red" },
    ],
    pods: [{ beat: 12, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "theClaspPair",
    name: "CLASP AND LURE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 0, kind: "clasp", color: "red" },
      { beat: 10, col: 3, color: "red" },
      { beat: 15, col: 10, kind: "lure", color: "cyan" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 26, col: 0, kind: "rind", color: "red" },
      { beat: 30, col: 3, color: "red" },
      { beat: 34, col: 2, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspBreathe",
    name: "CLASP PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 8, col: 8, kind: "clasp", color: "red" },
      { beat: 16, col: 4, color: "cyan" },
      { beat: 24, col: 2, kind: "lure", color: "cyan" },
      { beat: 32, col: 5, color: "cyan" },
      { beat: 39, col: 10, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theClaspRecall",
    name: "CLASP MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 3, kind: "clasp", color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 3, kind: "choir", color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 1, kind: "clasp", color: "red" },
      { beat: 34, col: 2, color: "cyan" },
      { beat: 39, col: 7, kind: "choir", color: "red" },
    ],
  },
  {
    id: "theClaspBend",
    name: "CLASP TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 0, kind: "clasp", color: "cyan" },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 5, kind: "lure", color: "cyan" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 10, kind: "clasp", color: "cyan" },
      { beat: 35, col: 6, kind: "lure", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 46, col: 7, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspPeak",
    name: "CLASP ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 2, kind: "clasp", color: "cyan" },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 12, col: 1, kind: "lure", color: "red" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 20, col: 9, kind: "meteorMedium", color: null },
      { beat: 24, col: 8, kind: "clasp", color: "cyan" },
      { beat: 28, col: 1, color: "cyan" },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 32, col: 7, kind: "lure", color: "cyan" },
      { beat: 36, col: 4, kind: "meteorMedium", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 0, kind: "clasp", color: "cyan" },
      { beat: 48, col: 5, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "theHive",
    name: "THE HIVE",
    guide: {
      scene: "theHive",
    },
    entries: [],
    boss: { kind: "hive" },
    bossType: "normal",
  },
];
