import type { Wave } from "../wave-types.js";

/**
 * Waves 344 to 353 of the game, in the order they are played: THE CLASP's
 * block, the filler before THE WELL and the boss THE WELL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_30: Wave[] = [
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
      { beat: 0, col: 1, kind: "clasp", color: "cyan" },
      { beat: 8, col: 7, kind: "meteor", color: null },
      { beat: 14, col: 9, kind: "clasp", color: "red" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 26, col: 8, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspReach",
    name: "FAR CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "clasp", color: "cyan" },
      { beat: 6, col: 5, kind: "lure", color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 17, col: 6, kind: "clasp", color: "cyan" },
      { beat: 22, col: 10, kind: "lure", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
    ],
  },
  {
    id: "theClaspPair",
    name: "CLASP AND LURE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 4, col: 5, kind: "clasp", color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 18, col: 2, kind: "lure", color: "cyan" },
      { beat: 23, col: 1, color: "red" },
      { beat: 33, col: 9, color: "cyan" },
      { beat: 40, col: 0, kind: "clasp", color: "cyan" },
    ],
    pods: [{ beat: 28, col: 3, row: 3, kind: "pod" }],
  },
  {
    id: "theClaspRecall",
    name: "CLASP MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 10, kind: "clasp", color: "cyan" },
      { beat: 12, col: 0, color: "red" },
      { beat: 17, col: 10, kind: "shell", color: "red" },
      { beat: 25, col: 3, color: "red" },
      { beat: 31, col: 2, kind: "clasp", color: "red" },
      { beat: 37, col: 8, color: "red" },
    ],
  },
  {
    id: "theClaspPeak",
    name: "CLASP ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 3, col: 8, kind: "clasp", color: "red" },
      { beat: 7, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "lure", color: "cyan" },
      { beat: 18, col: 4, color: "cyan" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 22, col: 3, kind: "throb", color: "red" },
      { beat: 26, col: 4, kind: "clasp", color: "red" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 34, col: 1, kind: "lure", color: "red" },
      { beat: 42, col: 0, kind: "throb", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerWellBreathe",
    name: "CLASP SIESTA",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 3, kind: "clasp", color: "cyan" },
      { beat: 14, col: 0, color: "red" },
      { beat: 22, col: 1, kind: "lure", color: "cyan" },
      { beat: 28, col: 5, color: "cyan" },
      { beat: 35, col: 9, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerWellRecall",
    name: "CLASP RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 5, kind: "clasp", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 6, kind: "clasp", color: "red" },
      { beat: 38, col: 5, color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
    pods: [
      { beat: 17, col: 2, row: 3, kind: "pod" },
      { beat: 33, col: 2, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerWellBend",
    name: "CLASP ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 5, kind: "clasp", color: "red" },
      { beat: 10, col: 3, color: "red" },
      { beat: 10, col: 7, color: "red" },
      { beat: 15, col: 8, kind: "lure", color: "red" },
      { beat: 20, col: 1, kind: "clasp", color: "cyan" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 34, col: 8, kind: "lure", color: "red" },
      { beat: 39, col: 6, kind: "clasp", color: "cyan" },
      { beat: 45, col: 3, color: "red" },
      { beat: 45, col: 7, color: "red" },
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
