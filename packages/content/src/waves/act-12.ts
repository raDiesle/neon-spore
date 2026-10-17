import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 139 to 148 of the game, in the order they are played: HEAVY ROCKS's
 * block and the boss SNAKE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_12: Wave[] = [
  {
    id: "theWard",
    name: "HEAVY ROCKS",
    guide: {
      scene: "theWard",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 8, col: 4, kind: "meteorMedium", color: null },
      { beat: 16, col: 7, kind: "meteorFast", color: null },
      { beat: 24, col: 3, kind: "meteorFaster", color: null },
      { beat: 32, col: 9, kind: "meteorFastest", color: null },
    ],
  },
  {
    id: "theWardAgain",
    name: "HEAVY ROCK RISING",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "meteorMedium", color: null },
      { beat: 6, col: 6, kind: "meteorMedium", color: null },
      { beat: 13, col: 7, kind: "meteorMedium", color: null },
      { beat: 19, col: 3, kind: "meteorMedium", color: null },
      { beat: 25, col: 7, kind: "meteorMedium", color: null },
      { beat: 31, col: 5, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardSpread",
    name: "HEAVY ROCK CONFETTI",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "meteorMedium", color: null },
      { beat: 7, col: 2, kind: "meteorMedium", color: null },
      { beat: 12, col: 8, kind: "meteorMedium", color: null },
      { beat: 18, col: 9, kind: "meteorMedium", color: null },
      { beat: 23, col: 4, kind: "meteorMedium", color: null },
      { beat: 29, col: 3, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardReach",
    name: "LONG HEAVY ROCK ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "meteorMedium", color: null },
      { beat: 5, col: 6, kind: "meteor", color: null },
      { beat: 10, col: 1, kind: "meteorMedium", color: null },
      { beat: 15, col: 10, kind: "meteor", color: null },
      { beat: 20, col: 0, kind: "meteorMedium", color: null },
      { beat: 26, col: 9, kind: "meteor", color: null },
    ],
  },
  {
    id: "theWardPair",
    name: "HEAVY ROCK PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 1, kind: "meteorMedium", color: null },
      { beat: 10, col: 3, color: "red" },
      { beat: 16, col: 6, kind: "weight", color: null },
      { beat: 22, col: 1, color: "cyan" },
      { beat: 27, col: 5, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 32, col: 0, color: "red" },
      { beat: 38, col: 8, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardBreathe",
    name: "LAZY HEAVY ROCK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 4, kind: "meteorMedium", color: null },
      { beat: 14, col: 6, color: "red" },
      { beat: 22, col: 2, kind: "meteorMedium", color: null },
      { beat: 28, col: 5, color: "red" },
      { beat: 36, col: 6, kind: "meteorMedium", color: null },
    ],
  },
  {
    id: "theWardRecall",
    name: "HEAVY ROCK REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 8, kind: "meteorMedium", color: null },
      { beat: 10, col: 9, color: "red" },
      { beat: 15, col: 7, kind: "torch", color: null },
      { beat: 21, col: 9, color: "cyan" },
      { beat: 27, col: 5, kind: "meteorMedium", color: null },
      { beat: 32, col: 10, color: "red" },
      { beat: 37, col: 6, kind: "torch", color: null },
    ],
  },
  {
    id: "theWardBend",
    name: "HEAVY ROCK RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "meteorMedium", color: null },
      { beat: 5, col: 8, kind: "meteorMedium", color: null },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 3, color: "red" },
      { beat: 21, col: 5, kind: "weight", color: null },
      { beat: 27, col: 7, color: "red" },
      { beat: 33, col: 6, kind: "meteorMedium", color: null },
      { beat: 39, col: 3, color: "red" },
      { beat: 39, col: 7, color: "red" },
      { beat: 44, col: 8, kind: "weight", color: null },
    ],
  },
  {
    id: "theWardPeak",
    name: "HEAVY ROCK OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 5, kind: "meteorMedium", color: null },
      { beat: 4, col: 8, kind: "meteorMedium", color: null },
      { beat: 8, col: 0, color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 16, col: 10, kind: "weight", color: null },
      { beat: 20, col: 3, color: "red" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 6, kind: "meteorMedium", color: null },
      { beat: 36, col: 3, kind: "weight", color: null },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 48, col: 7, kind: "meteorMedium", color: null },
    ],
    pods: [
      { beat: 24, col: 5, row: 4, kind: "husk" },
      { beat: 44, col: 10, row: 4, kind: "husk" },
    ],
  },
  {
    id: "snake",
    name: "SNAKE",
    guide: {
      scene: "snake",
    },
    entries: [],
    boss: { kind: "snake", rounds: SNAKE_ROUNDS },
    bossType: "special",
    controls: "snake",
  },
];
