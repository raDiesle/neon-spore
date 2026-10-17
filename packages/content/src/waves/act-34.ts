import type { Wave } from "../wave-types.js";

/**
 * Waves 364 to 373 of the game, in the order they are played: THE ECHO's block,
 * the filler before THE SPLICE and the boss THE SPLICE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_34: Wave[] = [
  {
    id: "theEcho",
    name: "THE ECHO",
    guide: {
      scene: "theEcho",
    },
    entries: [
      { beat: 0, col: 5, kind: "echo", color: "cyan" },
      { beat: 12, col: 5, kind: "echo", color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 36, col: 3, kind: "echo", color: "cyan" },
      { beat: 44, col: 7, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoAgain",
    name: "NEW ECHO MOON",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "echo", color: "red" },
      { beat: 7, col: 4, color: "red" },
      { beat: 14, col: 0, kind: "echo", color: "red" },
      { beat: 20, col: 4, color: "red" },
      { beat: 27, col: 8, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoReach",
    name: "FAR ECHO",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "echo", color: "red" },
      { beat: 6, col: 0, kind: "dart", color: "cyan" },
      { beat: 12, col: 5, color: "red" },
      { beat: 17, col: 9, kind: "echo", color: "cyan" },
      { beat: 23, col: 5, kind: "dart", color: "cyan" },
      { beat: 28, col: 9, color: "red" },
    ],
  },
  {
    id: "theEchoPair",
    name: "ECHO AND DART",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 5, kind: "echo", color: "red" },
      { beat: 8, col: 10, color: "cyan" },
      { beat: 14, col: 0, kind: "dart", color: "red" },
      { beat: 19, col: 8, color: "cyan" },
      { beat: 24, col: 10, kind: "meteorMedium", color: null },
      { beat: 28, col: 5, color: "red" },
      { beat: 32, col: 1, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 1, kind: "echo", color: "cyan" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 15, col: 4, kind: "echo", color: "red" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 27, col: 0, kind: "echo", color: "cyan" },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 37, col: 1, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 3, col: 8, kind: "echo", color: "cyan" },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 10, col: 7, kind: "dart", color: "red" },
      { beat: 13, col: 5, color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 17, col: 6, kind: "torch", color: null },
      { beat: 21, col: 3, kind: "echo", color: "red" },
      { beat: 24, col: 5, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 28, col: 10, kind: "dart", color: "cyan" },
      { beat: 32, col: 7, kind: "torch", color: null },
      { beat: 35, col: 5, color: "red" },
      { beat: 35, col: 8, color: "red" },
      { beat: 39, col: 8, kind: "echo", color: "cyan" },
      { beat: 42, col: 4, kind: "dart", color: "cyan" },
      { beat: 46, col: 1, color: "red" },
    ],
  },
  {
    id: "fillerSpliceBreathe",
    name: "ECHO SIESTA",
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 6, kind: "echo", color: "red" },
      { beat: 14, col: 0, color: "red" },
      { beat: 21, col: 2, kind: "dart", color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 36, col: 6, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerSpliceRecall",
    name: "ECHO RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 9, kind: "echo", color: "cyan" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 23, col: 5, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 6, kind: "echo", color: "cyan" },
      { beat: 39, col: 1, color: "cyan" },
      { beat: 39, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 6, row: 4, kind: "husk" },
      { beat: 33, col: 2, row: 4, kind: "husk" },
    ],
  },
  {
    id: "fillerSpliceBend",
    name: "ECHO ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 3, kind: "echo", color: "cyan" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 15, col: 9, kind: "dart", color: "red" },
      { beat: 21, col: 4, kind: "echo", color: "red" },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 32, col: 2, kind: "dart", color: "cyan" },
      { beat: 37, col: 0, kind: "echo", color: "cyan" },
      { beat: 43, col: 3, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
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
