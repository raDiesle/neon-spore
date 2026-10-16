import type { Wave } from "../wave-types.js";

/**
 * Waves 361 to 370 of the game, in the order they are played: THE ECHO's block
 * and the boss THE SPLICE.
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
      { beat: 0, col: 9, kind: "echo", color: "cyan" },
      { beat: 7, col: 5, color: "cyan" },
      { beat: 14, col: 0, kind: "echo", color: "cyan" },
      { beat: 21, col: 1, color: "cyan" },
      { beat: 29, col: 2, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theEchoSpread",
    name: "ECHO SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "echo", color: "cyan" },
      { beat: 6, col: 6, kind: "dart", color: "cyan" },
      { beat: 13, col: 3, kind: "shell", color: "cyan" },
      { beat: 20, col: 5, kind: "echo", color: "red" },
      { beat: 25, col: 8, kind: "dart", color: "cyan" },
      { beat: 32, col: 4, kind: "shell", color: "red" },
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
    id: "theEchoBreathe",
    name: "ECHO PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 8, col: 0, kind: "echo", color: "red" },
      { beat: 16, col: 3, color: "red" },
      { beat: 24, col: 4, kind: "dart", color: "cyan" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 38, col: 10, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theEchoRecall",
    name: "ECHO MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 6, kind: "echo", color: "cyan" },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 5, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 22, col: 9, color: "cyan" },
      { beat: 28, col: 2, kind: "echo", color: "red" },
      { beat: 33, col: 8, color: "red" },
      { beat: 39, col: 0, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "theEchoBend",
    name: "ECHO TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 6, kind: "echo", color: "red" },
      { beat: 10, col: 3, color: "red" },
      { beat: 16, col: 2, kind: "dart", color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 6, kind: "echo", color: "cyan" },
      { beat: 32, col: 0, kind: "dart", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 7, color: "cyan" },
      { beat: 44, col: 9, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theEchoPeak",
    name: "ECHO ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 3, col: 4, kind: "echo", color: "cyan" },
      { beat: 6, col: 6, color: "cyan" },
      { beat: 10, col: 3, kind: "dart", color: "red" },
      { beat: 14, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 21, col: 3, kind: "echo", color: "red" },
      { beat: 25, col: 5, color: "cyan" },
      { beat: 25, col: 8, color: "cyan" },
      { beat: 29, col: 6, kind: "dart", color: "red" },
      { beat: 36, col: 4, color: "red" },
      { beat: 36, col: 7, color: "red" },
      { beat: 40, col: 5, kind: "echo", color: "cyan" },
      { beat: 44, col: 3, kind: "dart", color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 18, col: 10, row: 4, kind: "husk" },
      { beat: 33, col: 9, row: 4, kind: "husk" },
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
