import type { Wave } from "../wave-types.js";

/**
 * Waves 274 to 283 of the game, in the order they are played: THE DARK's block,
 * the filler before THE CURTAIN and the boss THE CURTAIN.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_23: Wave[] = [
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
      { beat: 0, col: 8, kind: "choir", color: "red" },
      { beat: 7, col: 10, kind: "meteor", color: null },
      { beat: 15, col: 7, kind: "choir", color: "cyan" },
      { beat: 21, col: 3, kind: "meteor", color: null },
      { beat: 27, col: 6, kind: "choir", color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkReach",
    name: "DARK VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "choir", color: "cyan" },
      { beat: 6, col: 5, kind: "magnet", color: "red" },
      { beat: 17, col: 8, kind: "choir", color: "red" },
      { beat: 25, col: 2, kind: "magnet", color: "red" },
    ],
    pods: [{ beat: 12, col: 0, row: 4, kind: "husk" }],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkPair",
    name: "DARK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 10, kind: "choir", color: "cyan" },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 2, kind: "magnet", color: "cyan" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 27, col: 9, kind: "throb", color: "red" },
      { beat: 35, col: 3, color: "cyan" },
      { beat: 40, col: 4, kind: "choir", color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkRecall",
    name: "DARK SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 7, col: 0, kind: "choir", color: "red" },
      { beat: 14, col: 10, color: "cyan" },
      { beat: 25, col: 10, color: "cyan" },
      { beat: 32, col: 0, kind: "choir", color: "cyan" },
      { beat: 38, col: 5, color: "red" },
    ],
    pods: [{ beat: 20, col: 4, row: 3, kind: "pod" }],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkPeak",
    name: "DARK INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 5, kind: "choir", color: "red" },
      { beat: 8, col: 1, color: "cyan" },
      { beat: 14, col: 9, kind: "magnet", color: "cyan" },
      { beat: 17, col: 1, color: "red" },
      { beat: 17, col: 9, color: "red" },
      { beat: 25, col: 0, kind: "veer", color: null },
      { beat: 32, col: 9, kind: "choir", color: "red" },
      { beat: 37, col: 3, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
      { beat: 43, col: 10, kind: "magnet", color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "fillerCurtainBreathe",
    name: "SLEEPY DARK",
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 6, kind: "choir", color: "cyan" },
      { beat: 14, col: 2, color: "red" },
      { beat: 21, col: 10, kind: "magnet", color: "cyan" },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 34, col: 7, kind: "torch", color: null },
    ],
  },
  {
    id: "fillerCurtainRecall",
    name: "DARK REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 3, kind: "choir", color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 19, col: 0, kind: "choir", color: "red" },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 32, col: 3, kind: "choir", color: "cyan" },
      { beat: 37, col: 1, color: "cyan" },
    ],
  },
  {
    id: "fillerCurtainBend",
    name: "DARK RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 0, kind: "choir", color: "cyan" },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 19, col: 7, kind: "magnet", color: "cyan" },
      { beat: 24, col: 1, color: "cyan" },
      { beat: 24, col: 9, color: "cyan" },
      { beat: 30, col: 4, kind: "choir", color: "red" },
      { beat: 35, col: 2, kind: "magnet", color: "red" },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 45, col: 9, kind: "choir", color: "cyan" },
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
