import type { Wave } from "../wave-types.js";

/**
 * Waves 395 to 404 of the game, in the order they are played: THE LID's block,
 * the filler before THE SPOOL and the boss THE SPOOL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_35: Wave[] = [
  {
    id: "theLid",
    name: "THE LID",
    guide: {
      scene: "theLid",
    },
    entries: [
      { beat: 0, col: 5, kind: "lid", color: "cyan" },
      { beat: 14, col: 2, kind: "lid", color: "red" },
      { beat: 24, col: 8, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidAgain",
    name: "NEW LID MOON",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "lid", color: "red" },
      { beat: 8, col: 0, kind: "gyre", color: null },
      { beat: 16, col: 5, kind: "lid", color: "red" },
      { beat: 23, col: 2, kind: "gyre", color: null },
      { beat: 31, col: 7, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidReach",
    name: "FAR LID",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "lid", color: "cyan" },
      { beat: 5, col: 4, kind: "gyre", color: null },
      { beat: 11, col: 8, kind: "moult", color: null },
      { beat: 16, col: 3, kind: "lid", color: "red" },
      { beat: 22, col: 10, kind: "gyre", color: null },
      { beat: 28, col: 3, kind: "moult", color: null },
    ],
  },
  {
    id: "theLidPair",
    name: "LID AND GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 1, kind: "lid", color: "red" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 16, col: 10, kind: "gyre", color: null },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 25, col: 6, kind: "fence", color: null },
      { beat: 30, col: 10, kind: "lid", color: "red" },
      { beat: 37, col: 1, color: "cyan" },
      { beat: 37, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theLidRecall",
    name: "LID MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 9, kind: "lid", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 19, col: 10, kind: "lure", color: "red" },
      { beat: 25, col: 1, color: "cyan" },
      { beat: 25, col: 9, color: "cyan" },
      { beat: 30, col: 6, kind: "lid", color: "red" },
      { beat: 36, col: 0, kind: "lure", color: "red" },
    ],
  },
  {
    id: "theLidPeak",
    name: "LID ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 3, col: 8, kind: "lid", color: "red" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 6, kind: "gyre", color: null },
      { beat: 15, col: 2, kind: "rind", color: "red" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 27, col: 8, kind: "lid", color: "red" },
      { beat: 31, col: 10, kind: "gyre", color: null },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 42, col: 4, kind: "rind", color: "red" },
      { beat: 45, col: 6, kind: "lid", color: "red" },
    ],
  },
  {
    id: "fillerSpoolBreathe",
    name: "LID HUSH",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 9, kind: "lid", color: "red" },
      { beat: 13, col: 5, color: "red" },
      { beat: 21, col: 10, kind: "gyre", color: null },
      { beat: 28, col: 0, color: "red" },
      { beat: 35, col: 2, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerSpoolRecall",
    name: "LID HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 2, kind: "lid", color: "red" },
      { beat: 12, col: 5, color: "red" },
      { beat: 17, col: 9, kind: "balloon", color: null },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 28, col: 4, kind: "lid", color: "red" },
      { beat: 33, col: 2, kind: "balloon", color: null },
      { beat: 39, col: 0, color: "red" },
      { beat: 39, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerSpoolBend",
    name: "LID PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 1, kind: "lid", color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 10, col: 10, color: "red" },
      { beat: 16, col: 5, kind: "gyre", color: null },
      { beat: 21, col: 7, kind: "lid", color: "cyan" },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 32, col: 2, kind: "gyre", color: null },
      { beat: 37, col: 3, kind: "lid", color: "cyan" },
      { beat: 42, col: 0, color: "cyan" },
      { beat: 42, col: 10, color: "cyan" },
      { beat: 48, col: 8, kind: "gyre", color: null },
    ],
  },
  {
    id: "theSpool",
    name: "THE SPOOL",
    guide: {
      scene: "theSpool",
    },
    entries: [],
    boss: { kind: "spool" },
    bossType: "normal",
  },
];
