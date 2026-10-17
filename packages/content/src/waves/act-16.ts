import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 205 to 217 of the game, in the order they are played: the filler before
 * THE SCOUT, the boss THE SCOUT and THE COUNT's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "fillerScoutBreathe",
    name: "THROB SIESTA",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 7, col: 6, kind: "throb", color: "red" },
      { beat: 15, col: 2, color: "cyan" },
      { beat: 23, col: 9, kind: "meteorMedium", color: null },
      { beat: 29, col: 10, color: "cyan" },
      { beat: 36, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "fillerScoutRecall",
    name: "THROB RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 8, kind: "throb", color: "red" },
      { beat: 10, col: 3, color: "red" },
      { beat: 15, col: 0, kind: "glutton", color: "red" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 26, col: 4, kind: "throb", color: "red" },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 36, col: 10, kind: "glutton", color: "cyan" },
    ],
  },
  {
    id: "fillerScoutBend",
    name: "THROB ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 6, kind: "throb", color: "red" },
      { beat: 12, col: 5, color: "cyan" },
      { beat: 17, col: 1, kind: "meteorMedium", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 5, kind: "throb", color: "red" },
      { beat: 34, col: 2, kind: "meteorMedium", color: null },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 46, col: 9, kind: "throb", color: "red" },
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
      { beat: 0, col: 7, kind: "countdown", color: "cyan" },
      { beat: 8, col: 3, kind: "countdown", color: "cyan" },
      { beat: 16, col: 8, kind: "countdown", color: "red" },
      { beat: 24, col: 2, kind: "countdown", color: "cyan" },
      { beat: 30, col: 4, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theCountSpread",
    name: "COUNT SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "countdown", color: "red" },
      { beat: 7, col: 8, kind: "countdown", color: "red" },
      { beat: 14, col: 1, kind: "countdown", color: "red" },
      { beat: 20, col: 7, kind: "countdown", color: "red" },
      { beat: 25, col: 3, kind: "countdown", color: "red" },
      { beat: 32, col: 1, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountReach",
    name: "COUNT WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "countdown", color: "red" },
      { beat: 5, col: 4, kind: "throb", color: "red" },
      { beat: 10, col: 0, kind: "countdown", color: "cyan" },
      { beat: 15, col: 4, kind: "throb", color: "red" },
      { beat: 21, col: 8, kind: "countdown", color: "red" },
      { beat: 26, col: 3, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theCountPair",
    name: "COUNT TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 10, kind: "countdown", color: "red" },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 16, col: 7, kind: "throb", color: "red" },
      { beat: 21, col: 4, color: "red" },
      { beat: 25, col: 6, kind: "torch", color: null },
      { beat: 30, col: 2, color: "red" },
      { beat: 34, col: 8, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountBreathe",
    name: "COUNT LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 7, col: 5, kind: "countdown", color: "red" },
      { beat: 13, col: 2, color: "red" },
      { beat: 21, col: 10, kind: "countdown", color: "cyan" },
      { beat: 28, col: 6, color: "red" },
      { beat: 34, col: 10, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "theCountRecall",
    name: "ANCIENT COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 9, kind: "countdown", color: "red" },
      { beat: 10, col: 0, color: "red" },
      { beat: 16, col: 8, kind: "seeder", color: "red" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 27, col: 0, kind: "countdown", color: "cyan" },
      { beat: 33, col: 1, color: "cyan" },
      { beat: 38, col: 9, kind: "seeder", color: "red" },
    ],
  },
  {
    id: "theCountBend",
    name: "COUNT MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 9, kind: "countdown", color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 4, kind: "throb", color: "red" },
      { beat: 21, col: 0, color: "red" },
      { beat: 21, col: 10, color: "red" },
      { beat: 27, col: 8, kind: "countdown", color: "cyan" },
      { beat: 32, col: 4, kind: "throb", color: "red" },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 43, col: 9, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theCountPeak",
    name: "COUNT THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 4, col: 9, kind: "countdown", color: "cyan" },
      { beat: 8, col: 3, color: "cyan" },
      { beat: 12, col: 5, kind: "throb", color: "red" },
      { beat: 16, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 20, col: 4, kind: "torch", color: null },
      { beat: 24, col: 10, kind: "countdown", color: "cyan" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 32, col: 6, kind: "throb", color: "red" },
      { beat: 36, col: 9, kind: "torch", color: null },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 8, kind: "countdown", color: "cyan" },
      { beat: 48, col: 2, kind: "throb", color: "red" },
    ],
  },
];
