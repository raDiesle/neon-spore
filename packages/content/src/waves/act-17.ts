import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 218 to 230 of the game, in the order they are played: the filler before
 * THE HAUL, the boss THE HAUL and THE SHELL's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_17: Wave[] = [
  {
    id: "fillerHaulBreathe",
    name: "COUNT PICNIC",
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 8, kind: "countdown", color: "cyan" },
      { beat: 14, col: 1, color: "red" },
      { beat: 22, col: 5, kind: "throb", color: "red" },
      { beat: 29, col: 4, color: "red" },
      { beat: 37, col: 9, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerHaulRecall",
    name: "COUNT MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 4, kind: "countdown", color: "red" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 10, kind: "morsel", color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 27, col: 8, kind: "countdown", color: "red" },
      { beat: 32, col: 2, color: "cyan" },
      { beat: 37, col: 8, kind: "morsel", color: "red" },
    ],
  },
  {
    id: "fillerHaulBend",
    name: "COUNT TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 10, kind: "countdown", color: "red" },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 18, col: 2, kind: "throb", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 28, col: 3, kind: "countdown", color: "red" },
      { beat: 34, col: 4, kind: "throb", color: "red" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 44, col: 6, kind: "countdown", color: "cyan" },
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
      { beat: 0, col: 4, kind: "shell", color: "cyan" },
      { beat: 8, col: 2, kind: "shell", color: "red" },
      { beat: 15, col: 7, kind: "shell", color: "red" },
      { beat: 23, col: 2, kind: "shell", color: "red" },
      { beat: 30, col: 6, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotSpread",
    name: "SHELL SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "shell", color: "red" },
      { beat: 5, col: 1, kind: "shell", color: "red" },
      { beat: 12, col: 3, kind: "shell", color: "cyan" },
      { beat: 17, col: 7, kind: "shell", color: "cyan" },
      { beat: 23, col: 0, kind: "shell", color: "cyan" },
      { beat: 29, col: 8, kind: "shell", color: "cyan" },
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
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 0, kind: "shell", color: "cyan" },
      { beat: 9, col: 10, color: "red" },
      { beat: 15, col: 1, kind: "countdown", color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 24, col: 4, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 29, col: 1, color: "red" },
      { beat: 34, col: 8, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotBreathe",
    name: "SHELL PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 8, kind: "shell", color: "red" },
      { beat: 13, col: 4, color: "red" },
      { beat: 21, col: 5, kind: "shell", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 36, col: 1, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 5, kind: "shell", color: "red" },
      { beat: 11, col: 2, color: "red" },
      { beat: 16, col: 3, kind: "morsel", color: "red" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 27, col: 4, kind: "shell", color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 0, kind: "morsel", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotBend",
    name: "SHELL TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 5, col: 5, kind: "shell", color: "cyan" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 6, kind: "countdown", color: "red" },
      { beat: 23, col: 1, color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 28, col: 7, kind: "shell", color: "red" },
      { beat: 34, col: 0, kind: "countdown", color: "cyan" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 46, col: 10, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotPeak",
    name: "SHELL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 4, col: 3, kind: "shell", color: "red" },
      { beat: 8, col: 9, color: "red" },
      { beat: 12, col: 0, kind: "countdown", color: "cyan" },
      { beat: 16, col: 0, color: "red" },
      { beat: 16, col: 10, color: "red" },
      { beat: 20, col: 5, kind: "morsel", color: "cyan" },
      { beat: 24, col: 6, kind: "shell", color: "red" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 32, col: 10, kind: "countdown", color: "red" },
      { beat: 36, col: 8, kind: "morsel", color: "red" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 10, kind: "shell", color: "cyan" },
      { beat: 48, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
];
