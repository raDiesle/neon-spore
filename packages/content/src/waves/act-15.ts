import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import { STARE_LEVELS } from "../stare-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 178 to 191 of the game, in the order they are played: the filler before
 * THE HAUL, the boss THE HAUL, THE SHELL's block, the filler before THE STARE
 * and the boss THE STARE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_15: Wave[] = [
  {
    id: "fillerHaulBreathe",
    name: "COUNT PICNIC",
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 7, col: 7, kind: "countdown", color: "red" },
      { beat: 13, col: 9, color: "red" },
      { beat: 20, col: 4, kind: "throb", color: "red" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 36, col: 0, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerHaulRecall",
    name: "COUNT MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 1, kind: "countdown", color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 18, col: 5, kind: "countdown", color: "cyan" },
      { beat: 24, col: 2, color: "red" },
      { beat: 29, col: 7, kind: "countdown", color: "cyan" },
      { beat: 35, col: 0, color: "red" },
    ],
  },
  {
    id: "fillerHaulBend",
    name: "COUNT TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 1, kind: "countdown", color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 5, kind: "throb", color: "red" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 3, kind: "countdown", color: "red" },
      { beat: 34, col: 6, kind: "throb", color: "red" },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 45, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
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
      { beat: 0, col: 0, kind: "shell", color: "cyan" },
      { beat: 5, col: 4, kind: "countdown", color: "red" },
      { beat: 11, col: 8, kind: "shell", color: "red" },
      { beat: 16, col: 4, kind: "countdown", color: "cyan" },
      { beat: 21, col: 0, kind: "shell", color: "cyan" },
      { beat: 26, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotPair",
    name: "SHELL AND COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 6, kind: "shell", color: "red" },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 10, kind: "countdown", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 29, col: 1, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 33, col: 8, color: "red" },
    ],
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 10, kind: "shell", color: "cyan" },
      { beat: 13, col: 8, color: "red" },
      { beat: 19, col: 0, kind: "morsel", color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 33, col: 0, kind: "shell", color: "red" },
      { beat: 38, col: 3, color: "red" },
    ],
  },
  {
    id: "theThirdShotPeak",
    name: "SHELL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 2, kind: "shell", color: "cyan" },
      { beat: 9, col: 8, color: "red" },
      { beat: 15, col: 1, kind: "countdown", color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 19, col: 6, color: "cyan" },
      { beat: 27, col: 1, kind: "glutton", color: "red" },
      { beat: 34, col: 10, kind: "shell", color: "red" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
      { beat: 42, col: 5, kind: "countdown", color: "red" },
      { beat: 47, col: 10, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "fillerStareBreathe",
    name: "SHELL HUSH",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 5, kind: "shell", color: "cyan" },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 19, col: 9, kind: "countdown", color: "cyan" },
      { beat: 26, col: 4, color: "cyan" },
      { beat: 34, col: 2, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerStareRecall",
    name: "SHELL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 4, kind: "shell", color: "red" },
      { beat: 11, col: 1, color: "red" },
      { beat: 17, col: 10, kind: "meteorMedium", color: null },
      { beat: 25, col: 0, color: "cyan" },
      { beat: 30, col: 3, kind: "shell", color: "red" },
      { beat: 36, col: 6, color: "red" },
    ],
  },
  {
    id: "fillerStareBend",
    name: "SHELL PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 10, kind: "shell", color: "red" },
      { beat: 13, col: 9, color: "cyan" },
      { beat: 19, col: 5, kind: "countdown", color: "cyan" },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 7, color: "red" },
      { beat: 30, col: 6, kind: "shell", color: "cyan" },
      { beat: 36, col: 3, kind: "countdown", color: "cyan" },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
      { beat: 47, col: 9, kind: "shell", color: "red" },
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
