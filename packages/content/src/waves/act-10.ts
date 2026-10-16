import { SNAKE_ROUNDS } from "../snake-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 103 to 112 of the game, in the order they are played: THE LEECH's block
 * and the boss SNAKE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_10: Wave[] = [
  {
    id: "theLeech",
    name: "THE LEECH",
    guide: {
      scene: "theLeech",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 18, col: 0, color: "red" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 3, color: "red" },
      { beat: 42, col: 8, color: "cyan" },
      { beat: 48, col: 2, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechAgain",
    name: "LEECH AGAIN",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "meteorMedium", color: null },
      { beat: 7, col: 5, kind: "meteorMedium", color: null },
      { beat: 15, col: 3, kind: "meteorMedium", color: null },
      { beat: 22, col: 5, kind: "meteorMedium", color: null },
      { beat: 29, col: 4, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechSpread",
    name: "LEECH WIDE",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "meteorMedium", color: null },
      { beat: 6, col: 6, kind: "meteorMedium", color: null },
      { beat: 12, col: 7, kind: "meteorMedium", color: null },
      { beat: 18, col: 1, kind: "meteorMedium", color: null },
      { beat: 23, col: 3, kind: "meteorMedium", color: null },
      { beat: 30, col: 4, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechReach",
    name: "LEECH AT THE EDGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteorMedium", color: null },
      { beat: 5, col: 4, kind: "meteor", color: null },
      { beat: 10, col: 8, kind: "meteorMedium", color: null },
      { beat: 15, col: 0, kind: "meteor", color: null },
      { beat: 21, col: 10, kind: "meteorMedium", color: null },
      { beat: 27, col: 6, kind: "meteor", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechPair",
    name: "LEECH IN PAIRS",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 5, kind: "meteorMedium", color: null },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 17, col: 9, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 33, col: 2, color: "cyan" },
      { beat: 37, col: 5, kind: "meteorMedium", color: null },
    ],
    pods: [{ beat: 27, col: 7, row: 3, kind: "purge" }],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBreathe",
    name: "LEECH AT EASE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 9, kind: "meteorMedium", color: null },
      { beat: 15, col: 3, color: "cyan" },
      { beat: 21, col: 2, kind: "meteor", color: null },
      { beat: 27, col: 8, color: "red" },
      { beat: 33, col: 5, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechRecall",
    name: "LEECH RECALLED",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 0, kind: "meteorMedium", color: null },
      { beat: 11, col: 1, color: "red" },
      { beat: 23, col: 4, color: "red" },
      { beat: 29, col: 2, kind: "meteorMedium", color: null },
      { beat: 35, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 17, col: 7, row: 3, kind: "purge" }],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBend",
    name: "LEECH TWICE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 3, kind: "meteorMedium", color: null },
      { beat: 6, col: 7, kind: "meteorMedium", color: null },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 5, color: "cyan" },
      { beat: 23, col: 10, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 33, col: 2, kind: "meteorMedium", color: null },
      { beat: 39, col: 4, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 45, col: 7, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechPeak",
    name: "LEECH PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 3, kind: "meteorMedium", color: null },
      { beat: 4, col: 7, kind: "meteorMedium", color: null },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 16, col: 1, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 20, col: 2, color: "red" },
      { beat: 24, col: 5, kind: "meteorMedium", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 3, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 36, col: 1, color: "red" },
      { beat: 40, col: 5, kind: "meteorMedium", color: null },
      { beat: 40, col: 8, kind: "meteorMedium", color: null },
      { beat: 44, col: 10, color: "red" },
      { beat: 48, col: 4, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
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
