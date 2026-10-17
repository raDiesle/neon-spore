import type { Wave } from "../wave-types.js";

/**
 * Waves 385 to 394 of the game, in the order they are played: THE ECHO's block,
 * the filler before THE SPLICE and the boss THE SPLICE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_32: Wave[] = [
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
      { beat: 0, col: 3, kind: "echo", color: "red" },
      { beat: 7, col: 2, color: "cyan" },
      { beat: 14, col: 8, kind: "echo", color: "red" },
      { beat: 22, col: 5, color: "cyan" },
      { beat: 30, col: 8, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoReach",
    name: "ECHO HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "echo", color: "red" },
      { beat: 6, col: 5, kind: "dart", color: "red" },
      { beat: 11, col: 9, kind: "fence", color: null },
      { beat: 17, col: 5, kind: "echo", color: "cyan" },
      { beat: 22, col: 9, kind: "dart", color: "cyan" },
      { beat: 27, col: 5, kind: "fence", color: null },
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
      { beat: 26, col: 10, kind: "beatbox", color: null, beats: 2 },
      { beat: 34, col: 3, color: "cyan" },
      { beat: 40, col: 9, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 5, kind: "echo", color: "cyan" },
      { beat: 10, col: 8, color: "cyan" },
      { beat: 16, col: 4, kind: "seeder", color: "red" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 28, col: 10, kind: "echo", color: "red" },
      { beat: 34, col: 0, color: "red" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 3, kind: "echo", color: "red" },
      { beat: 9, col: 6, color: "red" },
      { beat: 17, col: 7, kind: "dart", color: "red" },
      { beat: 21, col: 1, color: "red" },
      { beat: 21, col: 9, color: "red" },
      { beat: 28, col: 0, kind: "throb", color: "red" },
      { beat: 33, col: 6, kind: "echo", color: "red" },
      { beat: 37, col: 0, color: "cyan" },
      { beat: 37, col: 10, color: "cyan" },
      { beat: 41, col: 6, kind: "dart", color: "cyan" },
      { beat: 45, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerSpliceBreathe",
    name: "SLEEPY ECHO",
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 3, kind: "echo", color: "cyan" },
      { beat: 14, col: 6, color: "red" },
      { beat: 20, col: 9, kind: "dart", color: "cyan" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 33, col: 2, kind: "moult", color: null },
      { beat: 39, col: 3, color: "red" },
    ],
  },
  {
    id: "fillerSpliceRecall",
    name: "ECHO REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 6, kind: "echo", color: "cyan" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 2, kind: "fence", color: null },
      { beat: 25, col: 3, color: "red" },
      { beat: 25, col: 6, color: "red" },
      { beat: 30, col: 7, kind: "echo", color: "cyan" },
      { beat: 36, col: 1, kind: "fence", color: null },
    ],
  },
  {
    id: "fillerSpliceBend",
    name: "ECHO MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 2, kind: "echo", color: "red" },
      { beat: 12, col: 4, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 7, kind: "dart", color: "cyan" },
      { beat: 22, col: 4, kind: "echo", color: "cyan" },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 6, color: "red" },
      { beat: 33, col: 8, kind: "dart", color: "red" },
      { beat: 38, col: 2, kind: "echo", color: "cyan" },
      { beat: 43, col: 3, color: "cyan" },
      { beat: 43, col: 6, color: "cyan" },
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
