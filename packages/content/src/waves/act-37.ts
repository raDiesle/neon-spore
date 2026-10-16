import type { Wave } from "../wave-types.js";

/**
 * Waves 392 to 401 of the game, in the order they are played: THE LID's block
 * and the boss THE SPOOL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_37: Wave[] = [
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
      { beat: 0, col: 2, kind: "lid", color: "red" },
      { beat: 7, col: 9, kind: "gyre", color: null },
      { beat: 14, col: 8, kind: "lid", color: "red" },
      { beat: 22, col: 5, kind: "gyre", color: null },
      { beat: 30, col: 7, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidSpread",
    name: "LID SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "lid", color: "red" },
      { beat: 5, col: 1, kind: "gyre", color: null },
      { beat: 11, col: 8, kind: "meteorMedium", color: null },
      { beat: 17, col: 3, kind: "lid", color: "red" },
      { beat: 23, col: 1, kind: "gyre", color: null },
      { beat: 29, col: 6, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theLidReach",
    name: "FAR LID",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "lid", color: "red" },
      { beat: 6, col: 2, kind: "gyre", color: null },
      { beat: 12, col: 10, kind: "morsel", color: "cyan" },
      { beat: 18, col: 4, kind: "lid", color: "red" },
      { beat: 23, col: 0, kind: "gyre", color: null },
      { beat: 28, col: 10, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theLidPair",
    name: "LID AND GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 4, kind: "lid", color: "red" },
      { beat: 10, col: 1, color: "red" },
      { beat: 16, col: 3, kind: "gyre", color: null },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 26, col: 0, kind: "dart", color: "cyan" },
      { beat: 32, col: 6, kind: "lid", color: "cyan" },
      { beat: 38, col: 0, color: "cyan" },
      { beat: 38, col: 10, color: "cyan" },
    ],
  },
  {
    id: "theLidBreathe",
    name: "LID PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 6, kind: "lid", color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "gyre", color: null },
      { beat: 28, col: 10, color: "red" },
      { beat: 34, col: 0, kind: "beatbox", color: null, beats: 2 },
    ],
  },
  {
    id: "theLidRecall",
    name: "LID MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 6, kind: "lid", color: "red" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 5, kind: "shell", color: "cyan" },
      { beat: 24, col: 0, color: "red" },
      { beat: 24, col: 10, color: "red" },
      { beat: 29, col: 5, kind: "lid", color: "red" },
      { beat: 35, col: 10, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theLidBend",
    name: "LID TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 9, kind: "lid", color: "red" },
      { beat: 12, col: 2, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 17, col: 7, kind: "gyre", color: null },
      { beat: 22, col: 6, kind: "lid", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 33, col: 2, kind: "gyre", color: null },
      { beat: 39, col: 9, kind: "lid", color: "red" },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theLidPeak",
    name: "LID ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 0, kind: "lid", color: "red" },
      { beat: 8, col: 1, color: "red" },
      { beat: 8, col: 9, color: "red" },
      { beat: 12, col: 6, kind: "gyre", color: null },
      { beat: 15, col: 9, kind: "glutton", color: "cyan" },
      { beat: 18, col: 5, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 21, col: 10, kind: "lid", color: "red" },
      { beat: 24, col: 9, kind: "gyre", color: null },
      { beat: 27, col: 2, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 30, col: 7, kind: "glutton", color: "red" },
      { beat: 34, col: 5, kind: "lid", color: "red" },
      { beat: 37, col: 1, color: "red" },
      { beat: 37, col: 9, color: "red" },
      { beat: 41, col: 8, kind: "gyre", color: null },
      { beat: 45, col: 5, kind: "glutton", color: "red" },
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
