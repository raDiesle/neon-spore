import type { Wave } from "../wave-types.js";

/**
 * Waves 321 to 330 of the game, in the order they are played: THE ECHO's block
 * and the boss THE CAIRN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_31: Wave[] = [
  {
    id: "theEcho",
    name: "THE ECHO",
    guide: {
      scene: "theEcho",
    },
    entries: [
      { beat: 0, col: 5, kind: "echo", color: "cyan" },
      { beat: 12, col: 5, kind: "echo", color: "red" },
      { beat: 13, col: 10, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 20, col: 3, kind: "echo", color: "cyan" },
      { beat: 24, col: 7, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoAgain",
    name: "NEW ECHO MOON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "echo", color: "red" },
      { beat: 6, col: 9, kind: "meteor", color: null },
      { beat: 13, col: 10, kind: "echo", color: "red" },
      { beat: 19, col: 9, kind: "meteor", color: null },
      { beat: 27, col: 3, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoSpread",
    name: "ECHO SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "echo", color: "cyan" },
      { beat: 6, col: 6, kind: "dart", color: "cyan" },
      { beat: 13, col: 3, kind: "rind", color: "red" },
      { beat: 20, col: 5, kind: "echo", color: "red" },
      { beat: 25, col: 8, kind: "dart", color: "cyan" },
      { beat: 32, col: 4, kind: "rind", color: "cyan" },
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
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 2, kind: "echo", color: "red" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 15, col: 0, kind: "dart", color: "red" },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 26, col: 0, kind: "rind", color: "red" },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 37, col: 0, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoBreathe",
    name: "ECHO PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 8, col: 0, kind: "echo", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 24, col: 4, kind: "dart", color: "cyan" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 38, col: 10, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 0, kind: "echo", color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 4, kind: "fence", color: null },
      { beat: 21, col: 8, color: "red" },
      { beat: 27, col: 0, kind: "echo", color: "red" },
      { beat: 33, col: 4, color: "cyan" },
      { beat: 39, col: 9, kind: "fence", color: null },
    ],
  },
  {
    id: "theEchoBend",
    name: "ECHO TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 0, kind: "echo", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 1, kind: "dart", color: "cyan" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 28, col: 7, kind: "echo", color: "cyan" },
      { beat: 34, col: 5, kind: "dart", color: "cyan" },
      { beat: 40, col: 2, color: "red" },
      { beat: 40, col: 8, color: "red" },
      { beat: 45, col: 1, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 10, kind: "echo", color: "cyan" },
      { beat: 7, col: 2, color: "red" },
      { beat: 11, col: 1, kind: "dart", color: "red" },
      { beat: 15, col: 2, color: "cyan" },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 22, col: 4, kind: "echo", color: "cyan" },
      { beat: 25, col: 5, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 29, col: 8, kind: "dart", color: "cyan" },
      { beat: 35, col: 5, color: "red" },
      { beat: 35, col: 8, color: "red" },
      { beat: 39, col: 1, kind: "echo", color: "red" },
      { beat: 43, col: 10, kind: "dart", color: "red" },
      { beat: 47, col: 3, color: "cyan" },
    ],
    pods: [
      { beat: 19, col: 0, row: 3, kind: "pod" },
      { beat: 32, col: 7, row: 3, kind: "pod" },
    ],
  },
  {
    id: "theCairn",
    name: "THE CAIRN",
    guide: {
      scene: "theCairn",
    },
    entries: [],
    boss: { kind: "cairn" },
    bossType: "normal",
  },
];
