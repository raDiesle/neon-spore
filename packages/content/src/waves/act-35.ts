import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 371 to 380 of the game, in the order they are played: THE GYRE's block
 * and the boss THE FILAMENT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_35: Wave[] = [
  {
    id: "theGyre",
    name: "THE GYRE",
    guide: {
      scene: "theGyre",
    },
    entries: [{ beat: 0, col: 5, kind: "gyre", color: null }],
  },
  {
    id: "theGyreAgain",
    name: "HELLO GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "gyre", color: null },
      { beat: 8, col: 1, kind: "echo", color: "cyan" },
      { beat: 14, col: 7, kind: "gyre", color: null },
      { beat: 20, col: 8, kind: "echo", color: "cyan" },
      { beat: 27, col: 5, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreSpread",
    name: "GYRE DRIFT",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "gyre", color: null },
      { beat: 6, col: 0, kind: "echo", color: "cyan" },
      { beat: 12, col: 10, kind: "meteorMedium", color: null },
      { beat: 18, col: 7, kind: "gyre", color: null },
      { beat: 25, col: 5, kind: "echo", color: "red" },
      { beat: 32, col: 1, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theGyreReach",
    name: "GYRE AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "gyre", color: null },
      { beat: 6, col: 1, kind: "echo", color: "cyan" },
      { beat: 11, col: 9, kind: "meteorMedium", color: null },
      { beat: 16, col: 2, kind: "gyre", color: null },
      { beat: 21, col: 8, kind: "echo", color: "cyan" },
      { beat: 27, col: 3, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theGyrePair",
    name: "GYRE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 6, kind: "gyre", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 14, col: 1, kind: "echo", color: "cyan" },
      { beat: 20, col: 0, color: "red" },
      { beat: 20, col: 10, color: "red" },
      { beat: 25, col: 5, kind: "clasp", color: "cyan" },
      { beat: 29, col: 9, kind: "gyre", color: null },
      { beat: 33, col: 3, color: "cyan" },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 39, col: 9, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theGyreBreathe",
    name: "SLEEPY GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 7, col: 7, kind: "gyre", color: null },
      { beat: 15, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "echo", color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
      { beat: 34, col: 6, kind: "torch", color: null },
    ],
  },
  {
    id: "theGyreRecall",
    name: "OLD GYRE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 5, kind: "gyre", color: null },
      { beat: 10, col: 0, color: "red" },
      { beat: 15, col: 6, kind: "countdown", color: "cyan" },
      { beat: 20, col: 4, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 26, col: 3, kind: "gyre", color: null },
      { beat: 31, col: 6, kind: "countdown", color: "red" },
      { beat: 36, col: 0, color: "red" },
      { beat: 36, col: 10, color: "red" },
    ],
  },
  {
    id: "theGyreBend",
    name: "GYRE SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 8, kind: "gyre", color: null },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 15, col: 4, kind: "echo", color: "cyan" },
      { beat: 21, col: 3, kind: "gyre", color: null },
      { beat: 26, col: 4, color: "red" },
      { beat: 26, col: 7, color: "red" },
      { beat: 31, col: 5, kind: "echo", color: "red" },
      { beat: 36, col: 4, kind: "gyre", color: null },
      { beat: 42, col: 2, color: "cyan" },
      { beat: 42, col: 8, color: "cyan" },
      { beat: 47, col: 4, kind: "echo", color: "red" },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 3, col: 1, kind: "gyre", color: null },
      { beat: 6, col: 3, color: "red" },
      { beat: 6, col: 7, color: "red" },
      { beat: 9, col: 3, kind: "echo", color: "red" },
      { beat: 13, col: 2, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 17, col: 3, color: "red" },
      { beat: 17, col: 7, color: "red" },
      { beat: 21, col: 0, kind: "gyre", color: null },
      { beat: 25, col: 4, kind: "echo", color: "cyan" },
      { beat: 29, col: 2, color: "cyan" },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 32, col: 9, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 36, col: 10, kind: "gyre", color: null },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 43, col: 9, kind: "echo", color: "cyan" },
      { beat: 46, col: 8, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "theFilament",
    name: "THE FILAMENT",
    entries: [],
    boss: { kind: "filament", filaments: FILAMENT_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
];
