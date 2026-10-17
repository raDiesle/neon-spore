import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 172 to 181 of the game, in the order they are played: THE COUNT's
 * block, the filler before THE HAUL and the boss THE HAUL.
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
      { beat: 0, col: 6, kind: "countdown", color: "red" },
      { beat: 6, col: 4, kind: "countdown", color: "cyan" },
      { beat: 14, col: 7, kind: "countdown", color: "red" },
      { beat: 20, col: 2, kind: "countdown", color: "red" },
      { beat: 26, col: 8, kind: "countdown", color: "red" },
      { beat: 32, col: 7, kind: "countdown", color: "cyan" },
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
      { beat: 0, col: 7, color: "cyan" },
      { beat: 4, col: 2, kind: "countdown", color: "cyan" },
      { beat: 10, col: 9, color: "red" },
      { beat: 14, col: 0, kind: "throb", color: "red" },
      { beat: 20, col: 8, color: "red" },
      { beat: 24, col: 3, kind: "seeder", color: "red" },
      { beat: 29, col: 0, color: "cyan" },
      { beat: 33, col: 9, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theCountRecall",
    name: "ANCIENT COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 7, kind: "countdown", color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 17, col: 10, kind: "torch", color: null },
      { beat: 22, col: 0, color: "red" },
      { beat: 28, col: 10, kind: "countdown", color: "red" },
      { beat: 33, col: 7, color: "cyan" },
      { beat: 38, col: 3, kind: "torch", color: null },
    ],
  },
  {
    id: "theCountPeak",
    name: "COUNT THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 4, col: 0, kind: "countdown", color: "red" },
      { beat: 8, col: 3, color: "red" },
      { beat: 12, col: 10, kind: "throb", color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 20, col: 6, kind: "morsel", color: "red" },
      { beat: 24, col: 1, kind: "countdown", color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 6, kind: "throb", color: "red" },
      { beat: 36, col: 5, kind: "morsel", color: "cyan" },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 8, kind: "countdown", color: "red" },
      { beat: 48, col: 3, kind: "throb", color: "red" },
    ],
  },
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
];
