import type { Wave } from "../wave-types.js";

/**
 * Waves 302 to 311 of the game, in the order they are played: THE DARK's block,
 * the filler before THE CURTAIN and the boss THE CURTAIN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
  {
    id: "theDark",
    name: "THE DARK",
    guide: {
      scene: "theDark",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 32, col: 7, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "red" },
      { beat: 56, col: 5, color: "cyan" },
      { beat: 64, col: 2, color: "red" },
      { beat: 72, col: 8, color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkAgain",
    name: "DARK MORNING",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "moult", color: null },
      { beat: 8, col: 4, kind: "moult", color: null },
      { beat: 16, col: 9, kind: "moult", color: null },
      { beat: 23, col: 7, kind: "moult", color: null },
      { beat: 31, col: 2, kind: "moult", color: null },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkReach",
    name: "LONG DARK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "moult", color: null },
      { beat: 6, col: 5, kind: "balloon", color: null },
      { beat: 17, col: 0, kind: "moult", color: null },
      { beat: 25, col: 5, kind: "balloon", color: null },
    ],
    pods: [{ beat: 11, col: 9, row: 3, kind: "pod" }],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkPair",
    name: "DARK ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 1, kind: "moult", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 6, kind: "balloon", color: null },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 29, col: 7, kind: "gyre", color: null },
      { beat: 35, col: 9, color: "red" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkRecall",
    name: "DARK LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 9, kind: "moult", color: null },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 19, col: 8, kind: "wisp", color: null },
      { beat: 25, col: 1, color: "red" },
      { beat: 32, col: 10, kind: "moult", color: null },
      { beat: 37, col: 9, color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkPeak",
    name: "DARK INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 8, kind: "moult", color: null },
      { beat: 12, col: 9, color: "red" },
      { beat: 18, col: 1, kind: "balloon", color: null },
      { beat: 25, col: 0, color: "red" },
      { beat: 25, col: 10, color: "red" },
      { beat: 29, col: 8, kind: "wisp", color: null },
      { beat: 34, col: 2, kind: "moult", color: null },
      { beat: 40, col: 1, color: "cyan" },
      { beat: 40, col: 9, color: "cyan" },
      { beat: 43, col: 10, kind: "balloon", color: null },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "fillerCurtainBreathe",
    name: "SLEEPY DARK",
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 10, kind: "moult", color: null },
      { beat: 13, col: 2, color: "red" },
      { beat: 21, col: 1, kind: "balloon", color: null },
      { beat: 27, col: 9, color: "red" },
      { beat: 33, col: 7, kind: "echo", color: "cyan" },
      { beat: 39, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerCurtainRecall",
    name: "DARK REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 1, kind: "moult", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 6, kind: "gyre", color: null },
      { beat: 22, col: 7, color: "red" },
      { beat: 28, col: 5, kind: "moult", color: null },
      { beat: 33, col: 9, color: "red" },
      { beat: 39, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "fillerCurtainBend",
    name: "DARK RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 5, kind: "moult", color: null },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 17, col: 2, kind: "balloon", color: null },
      { beat: 23, col: 1, color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 6, kind: "moult", color: null },
      { beat: 34, col: 5, kind: "balloon", color: null },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
];
