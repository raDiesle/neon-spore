import type { Wave } from "../wave-types.js";

/**
 * Waves 352 to 361 of the game, in the order they are played: THE LID's block
 * and the boss THE SPLICE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_34: Wave[] = [
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
      { beat: 8, col: 9, color: "cyan" },
      { beat: 15, col: 6, kind: "lid", color: "red" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 29, col: 8, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidSpread",
    name: "LID SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "lid", color: "red" },
      { beat: 5, col: 4, kind: "gyre", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 18, col: 6, kind: "lid", color: "red" },
      { beat: 24, col: 10, kind: "gyre", color: null },
      { beat: 31, col: 9, color: "red" },
    ],
  },
  {
    id: "theLidReach",
    name: "FAR LID",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "lid", color: "red" },
      { beat: 6, col: 2, kind: "gyre", color: null },
      { beat: 12, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 18, col: 4, kind: "lid", color: "red" },
      { beat: 23, col: 0, kind: "gyre", color: null },
      { beat: 28, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
    ],
  },
  {
    id: "theLidPair",
    name: "LID AND GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 8, kind: "lid", color: "red" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 5, kind: "gyre", color: null },
      { beat: 19, col: 10, color: "red" },
      { beat: 24, col: 0, kind: "balloon", color: null },
      { beat: 30, col: 10, color: "red" },
      { beat: 36, col: 2, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidBreathe",
    name: "LID PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 0, kind: "lid", color: "red" },
      { beat: 14, col: 4, color: "red" },
      { beat: 20, col: 10, kind: "gyre", color: null },
      { beat: 26, col: 2, color: "red" },
      { beat: 33, col: 4, kind: "moult", color: null },
    ],
  },
  {
    id: "theLidRecall",
    name: "LID MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 1, kind: "lid", color: "red" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 21, col: 8, color: "red" },
      { beat: 26, col: 10, kind: "lid", color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
    ],
    pods: [{ beat: 15, col: 9, row: 3, kind: "pod" }],
  },
  {
    id: "theLidBend",
    name: "LID TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 3, kind: "lid", color: "red" },
      { beat: 10, col: 6, color: "red" },
      { beat: 15, col: 9, kind: "gyre", color: null },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 26, col: 9, kind: "lid", color: "cyan" },
      { beat: 32, col: 7, kind: "gyre", color: null },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 6, color: "red" },
      { beat: 42, col: 0, kind: "lid", color: "red" },
      { beat: 47, col: 9, kind: "gyre", color: null },
    ],
  },
  {
    id: "theLidPeak",
    name: "LID ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 3, col: 10, kind: "lid", color: "cyan" },
      { beat: 7, col: 9, color: "cyan" },
      { beat: 11, col: 7, kind: "gyre", color: null },
      { beat: 15, col: 2, color: "cyan" },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 19, col: 8, kind: "rind", color: "red" },
      { beat: 23, col: 9, kind: "lid", color: "red" },
      { beat: 27, col: 5, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 30, col: 8, kind: "gyre", color: null },
      { beat: 34, col: 6, kind: "rind", color: "red" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 42, col: 1, kind: "lid", color: "cyan" },
      { beat: 46, col: 8, kind: "gyre", color: null },
    ],
  },
  {
    id: "theSplice",
    name: "THE SPLICE",
    guide: {
      scene: "theSplice",
    },
    entries: [],
    boss: { kind: "splice", rounds: [{ beats: 18 }, { beats: 27 }, { beats: 36 }] },
    bossType: "special",
    controls: "splice",
  },
];
