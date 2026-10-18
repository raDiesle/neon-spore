import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 436 to 445 of the game, in the order they are played: THE VOLLEY's
 * block, the filler before THE FILAMENT and the boss THE FILAMENT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_36: Wave[] = [
  {
    id: "theVolley",
    name: "THE VOLLEY",
    guide: {
      scene: "theVolley",
    },
    entries: [
      { beat: 0, col: 2, kind: "volley", color: "red" },
      { beat: 26, col: 8, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleyAgain",
    name: "HELLO VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "volley", color: "cyan" },
      { beat: 6, col: 7, kind: "crystal", color: "cyan" },
      { beat: 13, col: 0, kind: "volley", color: "cyan" },
      { beat: 20, col: 2, kind: "crystal", color: "red" },
      { beat: 26, col: 5, kind: "volley", color: "red" },
      { beat: 32, col: 2, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theVolleyReach",
    name: "VOLLEY HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "volley", color: "cyan" },
      { beat: 7, col: 10, kind: "crystal", color: "red" },
      { beat: 13, col: 6, kind: "rind", color: "red" },
      { beat: 19, col: 2, kind: "volley", color: "cyan" },
      { beat: 25, col: 6, kind: "crystal", color: "cyan" },
      { beat: 30, col: 1, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 0, kind: "volley", color: "cyan" },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 16, col: 2, kind: "crystal", color: "cyan" },
      { beat: 22, col: 1, color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 27, col: 0, kind: "gyre", color: null },
      { beat: 31, col: 3, kind: "volley", color: "red" },
      { beat: 37, col: 2, color: "cyan" },
      { beat: 37, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "VOLLEY LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 5, kind: "volley", color: "cyan" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 18, col: 7, kind: "clasp", color: "cyan" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 0, kind: "volley", color: "red" },
      { beat: 36, col: 2, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 10, kind: "volley", color: "cyan" },
      { beat: 9, col: 4, color: "cyan" },
      { beat: 9, col: 7, color: "cyan" },
      { beat: 12, col: 0, kind: "crystal", color: "red" },
      { beat: 20, col: 0, kind: "meteor", color: null },
      { beat: 20, col: 10, kind: "meteor", color: null },
      { beat: 26, col: 2, color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 30, col: 4, kind: "volley", color: "red" },
      { beat: 33, col: 3, color: "red" },
      { beat: 33, col: 7, color: "red" },
      { beat: 38, col: 9, kind: "crystal", color: "cyan" },
      { beat: 45, col: 0, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerFilamentBreathe",
    name: "VOLLEY LULLABY",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 7, col: 2, kind: "volley", color: "red" },
      { beat: 14, col: 9, color: "cyan" },
      { beat: 21, col: 1, kind: "crystal", color: "cyan" },
      { beat: 29, col: 0, color: "red" },
      { beat: 36, col: 9, kind: "echo", color: "red" },
    ],
  },
  {
    id: "fillerFilamentRecall",
    name: "ANCIENT VOLLEY",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "volley", color: "cyan" },
      { beat: 13, col: 3, color: "red" },
      { beat: 19, col: 5, kind: "weight", color: null },
      { beat: 25, col: 2, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 30, col: 3, kind: "volley", color: "red" },
      { beat: 36, col: 1, kind: "weight", color: null },
    ],
  },
  {
    id: "fillerFilamentBend",
    name: "VOLLEY RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 0, kind: "volley", color: "cyan" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 20, col: 9, kind: "crystal", color: "cyan" },
      { beat: 25, col: 10, kind: "volley", color: "red" },
      { beat: 31, col: 4, color: "cyan" },
      { beat: 31, col: 7, color: "cyan" },
      { beat: 37, col: 6, kind: "crystal", color: "red" },
      { beat: 42, col: 7, kind: "volley", color: "cyan" },
      { beat: 47, col: 1, color: "red" },
      { beat: 47, col: 9, color: "red" },
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
