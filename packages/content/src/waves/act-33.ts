import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 374 to 383 of the game, in the order they are played: THE GYRE's block,
 * the filler before THE FILAMENT and the boss THE FILAMENT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_33: Wave[] = [
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
      { beat: 0, col: 8, kind: "gyre", color: null },
      { beat: 7, col: 1, kind: "echo", color: "cyan" },
      { beat: 15, col: 6, kind: "gyre", color: null },
      { beat: 21, col: 4, kind: "echo", color: "cyan" },
      { beat: 27, col: 6, kind: "gyre", color: null },
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
      { beat: 17, col: 3, kind: "gyre", color: null },
      { beat: 22, col: 9, kind: "echo", color: "cyan" },
      { beat: 27, col: 2, kind: "meteor", color: null },
    ],
  },
  {
    id: "theGyrePair",
    name: "GYRE ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 9, kind: "gyre", color: null },
      { beat: 13, col: 0, color: "red" },
      { beat: 18, col: 10, kind: "echo", color: "cyan" },
      { beat: 26, col: 3, color: "cyan" },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 32, col: 0, kind: "rind", color: "cyan" },
      { beat: 38, col: 2, kind: "gyre", color: null },
    ],
  },
  {
    id: "theGyreRecall",
    name: "OLD GYRE SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "gyre", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 8, kind: "clasp", color: "cyan" },
      { beat: 21, col: 0, color: "cyan" },
      { beat: 21, col: 10, color: "cyan" },
      { beat: 26, col: 1, kind: "gyre", color: null },
      { beat: 32, col: 5, kind: "clasp", color: "cyan" },
      { beat: 38, col: 2, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theGyrePeak",
    name: "GYRE RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 3, kind: "gyre", color: null },
      { beat: 8, col: 4, color: "cyan" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 12, col: 9, kind: "echo", color: "red" },
      { beat: 20, col: 6, kind: "throb", color: "red" },
      { beat: 25, col: 1, color: "red" },
      { beat: 25, col: 9, color: "red" },
      { beat: 29, col: 4, kind: "gyre", color: null },
      { beat: 33, col: 7, kind: "echo", color: "cyan" },
      { beat: 38, col: 1, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
      { beat: 41, col: 2, kind: "throb", color: "red" },
      { beat: 45, col: 1, kind: "gyre", color: null },
    ],
  },
  {
    id: "fillerFilamentBreathe",
    name: "GYRE PICNIC",
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 2, kind: "gyre", color: null },
      { beat: 12, col: 7, color: "red" },
      { beat: 18, col: 5, kind: "echo", color: "red" },
      { beat: 26, col: 9, color: "red" },
      { beat: 33, col: 1, kind: "seeder", color: "red" },
      { beat: 40, col: 4, color: "red" },
    ],
  },
  {
    id: "fillerFilamentRecall",
    name: "GYRE MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 3, kind: "gyre", color: null },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 18, col: 2, kind: "morsel", color: "red" },
      { beat: 23, col: 1, color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 28, col: 7, kind: "gyre", color: null },
      { beat: 34, col: 6, kind: "morsel", color: "red" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerFilamentBend",
    name: "GYRE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "gyre", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 19, col: 5, kind: "echo", color: "cyan" },
      { beat: 25, col: 8, kind: "gyre", color: null },
      { beat: 31, col: 4, color: "red" },
      { beat: 31, col: 7, color: "red" },
      { beat: 37, col: 7, kind: "echo", color: "red" },
      { beat: 43, col: 10, kind: "gyre", color: null },
      { beat: 48, col: 2, color: "red" },
      { beat: 48, col: 8, color: "red" },
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
