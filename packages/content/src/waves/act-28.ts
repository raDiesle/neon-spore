import type { Wave } from "../wave-types.js";

/**
 * Waves 355 to 364 of the game, in the order they are played: THE CLASP's
 * block, the filler before THE SCUTTLE and the boss THE SCUTTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_28: Wave[] = [
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
      { beat: 0, col: 2, kind: "clasp", color: "cyan" },
      { beat: 8, col: 5, color: "red" },
      { beat: 15, col: 2, kind: "clasp", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 31, col: 6, kind: "clasp", color: "red" },
    ],
  },
  {
    id: "theClaspReach",
    name: "CLASP AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "clasp", color: "cyan" },
      { beat: 6, col: 8, kind: "lure", color: "cyan" },
      { beat: 19, col: 4, kind: "clasp", color: "cyan" },
      { beat: 25, col: 8, kind: "lure", color: "cyan" },
    ],
    pods: [{ beat: 11, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theClaspPair",
    name: "CLASP WALTZ",
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
    name: "CLASP HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 10, kind: "clasp", color: "cyan" },
      { beat: 12, col: 0, color: "red" },
      { beat: 17, col: 10, kind: "rind", color: "red" },
      { beat: 25, col: 3, color: "red" },
      { beat: 31, col: 2, kind: "clasp", color: "red" },
      { beat: 37, col: 8, color: "red" },
    ],
  },
  {
    id: "theClaspPeak",
    name: "CLASP RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 3, col: 8, kind: "clasp", color: "red" },
      { beat: 7, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "lure", color: "cyan" },
      { beat: 18, col: 4, color: "cyan" },
      { beat: 18, col: 7, color: "cyan" },
      { beat: 22, col: 3, kind: "countdown", color: "red" },
      { beat: 26, col: 4, kind: "clasp", color: "red" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 34, col: 1, kind: "lure", color: "red" },
      { beat: 42, col: 0, kind: "countdown", color: "red" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerScuttleBreathe",
    name: "CLASP PICNIC",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 10, kind: "clasp", color: "red" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 1, kind: "lure", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 35, col: 8, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "fillerScuttleRecall",
    name: "CLASP REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 10, kind: "clasp", color: "cyan" },
      { beat: 10, col: 1, color: "red" },
      { beat: 18, col: 2, kind: "fence", color: null },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 6, color: "cyan" },
      { beat: 30, col: 5, kind: "clasp", color: "red" },
      { beat: 35, col: 10, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerScuttleBend",
    name: "CROOKED CLASP",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 1, kind: "clasp", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 10, kind: "lure", color: "red" },
      { beat: 21, col: 7, kind: "clasp", color: "red" },
      { beat: 27, col: 4, color: "cyan" },
      { beat: 27, col: 7, color: "cyan" },
      { beat: 32, col: 3, kind: "lure", color: "cyan" },
      { beat: 38, col: 1, kind: "clasp", color: "red" },
      { beat: 44, col: 2, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
];
