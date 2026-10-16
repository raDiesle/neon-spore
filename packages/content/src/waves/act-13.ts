import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 139 to 148 of the game, in the order they are played: THE SHELL's block
 * and the boss THE SCOUT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_13: Wave[] = [
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
      { beat: 0, col: 7, kind: "shell", color: "red" },
      { beat: 7, col: 3, kind: "shell", color: "red" },
      { beat: 14, col: 6, kind: "shell", color: "cyan" },
      { beat: 21, col: 5, kind: "shell", color: "red" },
      { beat: 27, col: 6, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotSpread",
    name: "SHELL SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "shell", color: "red" },
      { beat: 7, col: 5, kind: "shell", color: "red" },
      { beat: 13, col: 7, kind: "shell", color: "red" },
      { beat: 20, col: 2, kind: "shell", color: "cyan" },
      { beat: 27, col: 7, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotReach",
    name: "FAR SHELL",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 6, col: 6, color: "red" },
      { beat: 11, col: 2, kind: "shell", color: "cyan" },
      { beat: 16, col: 6, color: "red" },
      { beat: 21, col: 2, kind: "shell", color: "red" },
      { beat: 26, col: 6, color: "red" },
    ],
  },
  {
    id: "theThirdShotPair",
    name: "SHELL AND COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 4, col: 10, kind: "shell", color: "cyan" },
      { beat: 10, col: 7, color: "red" },
      { beat: 14, col: 3, kind: "countdown", color: "red" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 24, col: 9, kind: "torch", color: null },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 34, col: 8, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theThirdShotBreathe",
    name: "SHELL PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 8, col: 4, kind: "shell", color: "cyan" },
      { beat: 16, col: 7, color: "red" },
      { beat: 24, col: 2, kind: "meteor", color: null },
      { beat: 31, col: 9, color: "red" },
      { beat: 39, col: 7, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 2, kind: "shell", color: "cyan" },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 6, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 24, col: 10, color: "red" },
      { beat: 30, col: 5, kind: "shell", color: "red" },
      { beat: 35, col: 9, color: "cyan" },
    ],
  },
  {
    id: "theThirdShotBend",
    name: "SHELL TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 4, kind: "shell", color: "red" },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 5, kind: "countdown", color: "red" },
      { beat: 21, col: 3, color: "cyan" },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 3, kind: "shell", color: "cyan" },
      { beat: 32, col: 1, kind: "countdown", color: "cyan" },
      { beat: 37, col: 4, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 42, col: 7, kind: "shell", color: "red" },
      { beat: 48, col: 3, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theThirdShotPeak",
    name: "SHELL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 4, col: 5, kind: "shell", color: "cyan" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 2, kind: "countdown", color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 24, col: 3, kind: "shell", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 7, kind: "countdown", color: "cyan" },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 9, kind: "shell", color: "red" },
      { beat: 48, col: 3, kind: "countdown", color: "cyan" },
    ],
    pods: [
      { beat: 20, col: 10, row: 3, kind: "pod" },
      { beat: 36, col: 2, row: 4, kind: "pod" },
    ],
  },
  {
    id: "theScout",
    name: "THE SCOUT",
    guide: {
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    bossType: "special",
    controls: "scout",
  },
];
