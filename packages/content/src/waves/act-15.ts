import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 192 to 204 of the game, in the order they are played: the filler before
 * PINBALL, the boss PINBALL and THE THROB's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_15: Wave[] = [
  {
    id: "fillerPinballBreathe",
    name: "LEECH SIESTA",
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 8, col: 8, kind: "meteorMedium", color: null },
      { beat: 14, col: 4, color: "red" },
      { beat: 20, col: 10, kind: "meteorMedium", color: null },
      { beat: 26, col: 3, color: "red" },
      { beat: 33, col: 2, kind: "meteorMedium", color: null },
      { beat: 39, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerPinballRecall",
    name: "LEECH RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 1, kind: "meteorMedium", color: null },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 17, col: 4, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 28, col: 9, kind: "meteorMedium", color: null },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 40, col: 3, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "fillerPinballBend",
    name: "LEECH ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 5, col: 3, kind: "meteorMedium", color: null },
      { beat: 5, col: 6, kind: "meteorMedium", color: null },
      { beat: 11, col: 0, color: "cyan" },
      { beat: 17, col: 9, color: "red" },
      { beat: 22, col: 5, kind: "weight", color: null },
      { beat: 27, col: 6, color: "cyan" },
      { beat: 33, col: 4, kind: "meteorMedium", color: null },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
      { beat: 45, col: 6, kind: "weight", color: null },
    ],
  },
  {
    id: "pinball",
    name: "PINBALL",
    guide: {
      scene: "pinball",
    },
    entries: [],
    boss: { kind: "pinball", rounds: PINBALL_ROUNDS },
    bossType: "special",
    controls: "pinball",
  },
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
    id: "theThrobSpread",
    name: "THROB SCATTER",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "throb", color: "red" },
      { beat: 6, col: 8, kind: "throb", color: "red" },
      { beat: 11, col: 10, kind: "throb", color: "red" },
      { beat: 18, col: 7, kind: "throb", color: "red" },
      { beat: 25, col: 10, kind: "throb", color: "red" },
      { beat: 32, col: 6, kind: "throb", color: "red" },
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
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 8, kind: "throb", color: "red" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 16, col: 0, kind: "meteorMedium", color: null },
      { beat: 20, col: 10, color: "cyan" },
      { beat: 25, col: 3, kind: "glutton", color: "cyan" },
      { beat: 30, col: 6, color: "red" },
      { beat: 35, col: 7, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobBreathe",
    name: "THROB LULLABY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 8, col: 10, kind: "throb", color: "red" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 24, col: 1, kind: "throb", color: "red" },
      { beat: 31, col: 0, color: "cyan" },
      { beat: 38, col: 1, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobRecall",
    name: "ANCIENT THROB",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 0, kind: "throb", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 18, col: 5, kind: "torch", color: null },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 30, col: 6, kind: "throb", color: "red" },
      { beat: 36, col: 5, color: "cyan" },
    ],
  },
  {
    id: "theThrobBend",
    name: "THROB MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 6, col: 8, kind: "throb", color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 18, col: 9, kind: "meteorMedium", color: null },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 29, col: 4, kind: "throb", color: "red" },
      { beat: 34, col: 6, kind: "meteorMedium", color: null },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
      { beat: 45, col: 2, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theThrobPeak",
    name: "THROB THUNDER",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 5, kind: "throb", color: "red" },
      { beat: 8, col: 0, color: "red" },
      { beat: 12, col: 3, kind: "meteorMedium", color: null },
      { beat: 16, col: 1, color: "red" },
      { beat: 16, col: 9, color: "red" },
      { beat: 20, col: 8, kind: "torch", color: null },
      { beat: 24, col: 3, kind: "throb", color: "red" },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 28, col: 10, color: "cyan" },
      { beat: 32, col: 4, kind: "meteorMedium", color: null },
      { beat: 36, col: 2, kind: "torch", color: null },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 44, col: 0, kind: "throb", color: "red" },
      { beat: 48, col: 4, kind: "meteorMedium", color: null },
    ],
  },
];
