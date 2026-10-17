import { SCOUT_ARENAS } from "../scout-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 163 to 172 of the game, in the order they are played: THE THROB's
 * block, the filler before THE SCOUT and the boss THE SCOUT.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_14: Wave[] = [
  {
    id: "theThrob",
    name: "THE THROB",
    guide: {
      scene: "theThrob",
    },
    entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
  },
  {
    id: "theThrobAgain",
    name: "FIRST THROB",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "throb", color: "red" },
      { beat: 8, col: 4, kind: "throb", color: "red" },
      { beat: 15, col: 8, kind: "throb", color: "red" },
      { beat: 22, col: 5, kind: "throb", color: "red" },
      { beat: 28, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobReach",
    name: "THROB WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "throb", color: "red" },
      { beat: 6, col: 5, kind: "meteorMedium", color: null },
      { beat: 11, col: 9, kind: "throb", color: "red" },
      { beat: 16, col: 5, kind: "meteorMedium", color: null },
      { beat: 22, col: 9, kind: "throb", color: "red" },
      { beat: 28, col: 5, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theThrobPair",
    name: "THROB TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 6, kind: "throb", color: "red" },
      { beat: 11, col: 0, color: "red" },
      { beat: 17, col: 7, kind: "meteorMedium", color: null },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 33, col: 9, color: "red" },
      { beat: 39, col: 2, kind: "throb", color: "red" },
    ],
    pods: [{ beat: 29, col: 8, row: 3, kind: "pod" }],
  },
  {
    id: "theThrobRecall",
    name: "ANCIENT THROB",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 10, kind: "throb", color: "red" },
      { beat: 10, col: 0, color: "cyan" },
      { beat: 15, col: 10, kind: "torch", color: null },
      { beat: 20, col: 6, color: "red" },
      { beat: 26, col: 1, kind: "throb", color: "red" },
      { beat: 31, col: 5, color: "red" },
      { beat: 36, col: 6, kind: "torch", color: null },
    ],
  },
  {
    id: "theThrobPeak",
    name: "THROB THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 4, col: 0, kind: "throb", color: "red" },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 10, kind: "meteorMedium", color: null },
      { beat: 16, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 20, col: 9, kind: "glutton", color: "red" },
      { beat: 24, col: 10, kind: "throb", color: "red" },
      { beat: 28, col: 2, color: "cyan" },
      { beat: 28, col: 8, color: "cyan" },
      { beat: 32, col: 7, kind: "meteorMedium", color: null },
      { beat: 36, col: 4, kind: "glutton", color: "cyan" },
      { beat: 40, col: 0, color: "red" },
      { beat: 40, col: 10, color: "red" },
      { beat: 44, col: 1, kind: "throb", color: "red" },
      { beat: 48, col: 8, kind: "meteorMedium", color: null },
    ],
  },
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
];
