import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 182 to 191 of the game, in the order they are played: THE SHELL's
 * block, the filler before THE STARE and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "theThirdShot",
    name: "THE SHELL",
    guide: {
      scene: "theThirdShot",
    },
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "cyan" },
      { beat: 10, col: 7, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotAgain",
    name: "NEW SHELL MOON",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "red" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 14, col: 2, kind: "shell", color: "red" },
      { beat: 22, col: 6, kind: "shell", color: "red" },
      { beat: 29, col: 8, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotReach",
    name: "FAR SHELL",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 6, col: 6, kind: "countdown", color: "cyan" },
      { beat: 11, col: 2, kind: "shell", color: "cyan" },
      { beat: 16, col: 6, kind: "countdown", color: "cyan" },
      { beat: 21, col: 2, kind: "shell", color: "red" },
      { beat: 26, col: 6, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theThirdShotPair",
    name: "SHELL AND COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 2, kind: "shell", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 10, kind: "countdown", color: "cyan" },
      { beat: 22, col: 5, color: "red" },
      { beat: 26, col: 4, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 31, col: 8, color: "cyan" },
      { beat: 37, col: 1, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 3, kind: "shell", color: "red" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 1, kind: "shell", color: "cyan" },
      { beat: 34, col: 8, color: "red" },
      { beat: 40, col: 2, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "theThirdShotPeak",
    name: "SHELL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 4, kind: "shell", color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 12, col: 10, kind: "countdown", color: "cyan" },
      { beat: 16, col: 0, color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 20, col: 4, kind: "meteorMedium", color: null },
      { beat: 24, col: 5, kind: "shell", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 3, kind: "countdown", color: "cyan" },
      { beat: 36, col: 5, kind: "meteorMedium", color: null },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
      { beat: 44, col: 10, kind: "shell", color: "cyan" },
      { beat: 48, col: 9, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerStareBreathe",
    name: "SHELL HUSH",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 2, kind: "shell", color: "cyan" },
      { beat: 13, col: 9, color: "red" },
      { beat: 19, col: 7, kind: "countdown", color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 33, col: 2, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "SHELL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 3, kind: "shell", color: "cyan" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 5, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 23, col: 1, color: "red" },
      { beat: 28, col: 3, kind: "shell", color: "cyan" },
      { beat: 33, col: 0, color: "red" },
      { beat: 38, col: 8, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
  },
  {
    id: "fillerStareBend",
    name: "SHELL PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 1, kind: "shell", color: "red" },
      { beat: 11, col: 6, color: "red" },
      { beat: 17, col: 3, kind: "countdown", color: "cyan" },
      { beat: 23, col: 5, color: "red" },
      { beat: 23, col: 8, color: "red" },
      { beat: 28, col: 3, kind: "shell", color: "cyan" },
      { beat: 33, col: 0, kind: "countdown", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 6, color: "red" },
      { beat: 45, col: 2, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theStare",
    name: "THE STARE",
    entries: [],
    boss: { kind: "stare", levels: STARE_LEVELS },
    bossType: "normal",
  },
];
