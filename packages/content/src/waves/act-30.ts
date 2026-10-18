import type { Wave } from "../wave-types.js";

/**
 * Waves 375 to 384 of the game, in the order they are played: THE ECHO's block,
 * the filler before THE SPLICE and the boss THE SPLICE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_30: Wave[] = [
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
      { beat: 0, col: 2, kind: "echo", color: "cyan" },
      { beat: 6, col: 4, color: "cyan" },
      { beat: 13, col: 0, kind: "echo", color: "cyan" },
      { beat: 20, col: 3, color: "cyan" },
      { beat: 26, col: 2, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoReach",
    name: "ECHO HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "echo", color: "red" },
      { beat: 6, col: 5, kind: "dart", color: "red" },
      { beat: 11, col: 9, kind: "magnet", color: "red" },
      { beat: 17, col: 5, kind: "echo", color: "cyan" },
      { beat: 22, col: 9, kind: "dart", color: "cyan" },
      { beat: 27, col: 5, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theEchoPair",
    name: "ECHO ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 6, kind: "echo", color: "red" },
      { beat: 9, col: 7, color: "red" },
      { beat: 14, col: 8, kind: "dart", color: "red" },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 26, col: 10, kind: "weight", color: null },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 40, col: 9, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 1, kind: "echo", color: "cyan" },
      { beat: 14, col: 10, color: "cyan" },
      { beat: 20, col: 0, kind: "veer", color: null },
      { beat: 28, col: 5, color: "red" },
      { beat: 34, col: 10, kind: "echo", color: "red" },
      { beat: 39, col: 9, color: "red" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 3, col: 5, kind: "echo", color: "cyan" },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 9, kind: "dart", color: "cyan" },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 26, col: 2, kind: "balloon", color: null },
      { beat: 32, col: 9, kind: "echo", color: "red" },
      { beat: 38, col: 2, color: "red" },
      { beat: 38, col: 8, color: "red" },
      { beat: 41, col: 4, kind: "dart", color: "red" },
      { beat: 46, col: 10, kind: "balloon", color: null },
    ],
  },
  {
    id: "fillerSpliceBreathe",
    name: "SLEEPY ECHO",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 10, kind: "echo", color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 19, col: 4, kind: "dart", color: "cyan" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 33, col: 2, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "fillerSpliceRecall",
    name: "ECHO REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 0, kind: "echo", color: "cyan" },
      { beat: 13, col: 4, color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 3, kind: "echo", color: "cyan" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 7, row: 3, kind: "pod" },
      { beat: 35, col: 8, row: 3, kind: "pod" },
    ],
  },
  {
    id: "fillerSpliceBend",
    name: "ECHO MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 1, kind: "echo", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 6, kind: "dart", color: "cyan" },
      { beat: 22, col: 8, kind: "echo", color: "red" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 34, col: 7, kind: "dart", color: "cyan" },
      { beat: 39, col: 4, kind: "echo", color: "red" },
      { beat: 44, col: 2, color: "cyan" },
      { beat: 44, col: 8, color: "cyan" },
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
