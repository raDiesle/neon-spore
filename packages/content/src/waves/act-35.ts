import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 361 to 370 of the game, in the order they are played: THE GYRE's block
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
      { beat: 0, col: 6, kind: "gyre", color: null },
      { beat: 7, col: 8, color: "red" },
      { beat: 13, col: 2, kind: "gyre", color: null },
      { beat: 21, col: 1, color: "red" },
      { beat: 29, col: 7, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreSpread",
    name: "GYRE DRIFT",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "gyre", color: null },
      { beat: 7, col: 5, kind: "echo", color: "red" },
      { beat: 14, col: 4, kind: "coil", color: null },
      { beat: 20, col: 8, kind: "gyre", color: null },
      { beat: 26, col: 5, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "theGyreReach",
    name: "GYRE AT WORLD END",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "gyre", color: null },
      { beat: 5, col: 5, kind: "echo", color: "red" },
      { beat: 11, col: 10, kind: "meteor", color: null },
      { beat: 17, col: 4, kind: "gyre", color: null },
      { beat: 22, col: 8, kind: "echo", color: "red" },
      { beat: 28, col: 4, kind: "meteor", color: null },
    ],
  },
  {
    id: "theGyrePair",
    name: "GYRE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 6, col: 7, kind: "gyre", color: null },
      { beat: 10, col: 3, color: "red" },
      { beat: 14, col: 2, kind: "echo", color: "red" },
      { beat: 20, col: 3, color: "red" },
      { beat: 26, col: 0, kind: "beatbox", color: null, beats: 2 },
      { beat: 30, col: 10, color: "red" },
      { beat: 34, col: 0, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreBreathe",
    name: "SLEEPY GYRE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 10, kind: "gyre", color: null },
      { beat: 16, col: 2, color: "red" },
      { beat: 24, col: 6, kind: "echo", color: "red" },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 39, col: 10, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theGyreRecall",
    name: "OLD GYRE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 7, kind: "gyre", color: null },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 15, col: 9, kind: "rind", color: "cyan" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 26, col: 5, kind: "gyre", color: null },
      { beat: 31, col: 3, color: "red" },
      { beat: 37, col: 10, kind: "rind", color: "red" },
    ],
  },
  {
    id: "theGyreBend",
    name: "GYRE SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 1, kind: "gyre", color: null },
      { beat: 11, col: 4, color: "red" },
      { beat: 17, col: 1, kind: "echo", color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 27, col: 4, kind: "gyre", color: null },
      { beat: 32, col: 2, kind: "echo", color: "cyan" },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 6, color: "red" },
      { beat: 43, col: 7, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 3, col: 2, kind: "gyre", color: null },
      { beat: 6, col: 5, color: "cyan" },
      { beat: 9, col: 4, kind: "echo", color: "red" },
      { beat: 13, col: 2, color: "cyan" },
      { beat: 13, col: 8, color: "cyan" },
      { beat: 17, col: 10, kind: "rind", color: "cyan" },
      { beat: 21, col: 1, kind: "gyre", color: null },
      { beat: 25, col: 1, color: "red" },
      { beat: 25, col: 9, color: "red" },
      { beat: 29, col: 2, kind: "echo", color: "red" },
      { beat: 33, col: 8, kind: "rind", color: "red" },
      { beat: 37, col: 4, color: "cyan" },
      { beat: 37, col: 7, color: "cyan" },
      { beat: 41, col: 6, kind: "gyre", color: null },
      { beat: 45, col: 10, kind: "echo", color: "red" },
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
