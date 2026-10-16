import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 164 to 173 of the game, in the order they are played: THE COUNT's block
 * and the boss THE HAUL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_15: Wave[] = [
  {
    id: "theCount",
    name: "THE COUNT",
    guide: {
      scene: "theCount",
    },
    entries: [
      { beat: 0, col: 5, kind: "countdown", color: "red" },
      { beat: 8, col: 2, kind: "countdown", color: "cyan" },
      { beat: 18, col: 3, kind: "countdown", color: "red" },
      { beat: 19, col: 8, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theCountAgain",
    name: "FIRST COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "countdown", color: "cyan" },
      { beat: 8, col: 7, kind: "countdown", color: "red" },
      { beat: 16, col: 3, kind: "countdown", color: "cyan" },
      { beat: 23, col: 5, kind: "countdown", color: "cyan" },
      { beat: 30, col: 4, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountSpread",
    name: "COUNT SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "countdown", color: "red" },
      { beat: 6, col: 3, kind: "countdown", color: "cyan" },
      { beat: 13, col: 9, kind: "countdown", color: "red" },
      { beat: 19, col: 5, kind: "countdown", color: "cyan" },
      { beat: 24, col: 7, kind: "countdown", color: "red" },
      { beat: 31, col: 3, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theCountReach",
    name: "COUNT WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "countdown", color: "red" },
      { beat: 5, col: 4, color: "red" },
      { beat: 10, col: 0, kind: "countdown", color: "cyan" },
      { beat: 15, col: 4, color: "red" },
      { beat: 21, col: 8, kind: "countdown", color: "red" },
      { beat: 26, col: 3, color: "red" },
    ],
  },
  {
    id: "theCountPair",
    name: "COUNT TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 4, col: 10, kind: "countdown", color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 15, col: 9, kind: "throb", color: "red" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 25, col: 0, kind: "torch", color: null },
      { beat: 30, col: 8, color: "cyan" },
      { beat: 34, col: 9, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountBreathe",
    name: "COUNT LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 8, col: 1, kind: "countdown", color: "red" },
      { beat: 16, col: 6, color: "red" },
      { beat: 22, col: 1, kind: "meteor", color: null },
      { beat: 29, col: 9, color: "cyan" },
      { beat: 37, col: 5, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountRecall",
    name: "ANCIENT COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 7, kind: "countdown", color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 17, col: 9, kind: "countdown", color: "cyan" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 0, kind: "countdown", color: "red" },
      { beat: 35, col: 4, color: "red" },
    ],
  },
  {
    id: "theCountBend",
    name: "COUNT MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 6, kind: "countdown", color: "cyan" },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 16, col: 4, kind: "throb", color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 21, col: 8, color: "red" },
      { beat: 27, col: 8, kind: "countdown", color: "red" },
      { beat: 32, col: 5, kind: "throb", color: "red" },
      { beat: 37, col: 3, color: "red" },
      { beat: 37, col: 7, color: "red" },
      { beat: 42, col: 6, kind: "countdown", color: "red" },
      { beat: 47, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theCountPeak",
    name: "COUNT THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 4, col: 8, kind: "countdown", color: "red" },
      { beat: 8, col: 9, color: "cyan" },
      { beat: 12, col: 2, kind: "throb", color: "red" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 24, col: 1, kind: "countdown", color: "red" },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 6, color: "red" },
      { beat: 32, col: 2, kind: "throb", color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 9, kind: "countdown", color: "red" },
      { beat: 48, col: 0, kind: "throb", color: "red" },
    ],
    pods: [
      { beat: 20, col: 6, row: 3, kind: "pod" },
      { beat: 36, col: 4, row: 3, kind: "pod" },
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
];
