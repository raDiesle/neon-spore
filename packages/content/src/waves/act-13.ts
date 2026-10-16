import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 149 to 158 of the game, in the order they are played: THE LEECH's block
 * and the boss PINBALL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_13: Wave[] = [
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
    name: "NEW LEECH MOON",
    variant: true,
    entries: [
      { beat: 0, col: 7, kind: "meteorMedium", color: null },
      { beat: 6, col: 2, kind: "meteorMedium", color: null },
      { beat: 12, col: 8, kind: "meteorMedium", color: null },
      { beat: 20, col: 3, kind: "meteorMedium", color: null },
      { beat: 28, col: 7, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechSpread",
    name: "LEECH SPRINKLE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteorMedium", color: null },
      { beat: 7, col: 4, kind: "meteorMedium", color: null },
      { beat: 13, col: 5, kind: "meteorMedium", color: null },
      { beat: 20, col: 1, kind: "meteorMedium", color: null },
      { beat: 26, col: 10, kind: "meteorMedium", color: null },
      { beat: 31, col: 3, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechReach",
    name: "FAR LEECH",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "meteorMedium", color: null },
      { beat: 5, col: 6, kind: "weight", color: null },
      { beat: 11, col: 10, kind: "meteorMedium", color: null },
      { beat: 16, col: 5, kind: "weight", color: null },
      { beat: 21, col: 9, kind: "meteorMedium", color: null },
      { beat: 27, col: 4, kind: "weight", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechPair",
    name: "LEECH ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 3, kind: "meteorMedium", color: null },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 15, col: 4, kind: "weight", color: null },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 27, col: 2, kind: "meteorMedium", color: null },
      { beat: 33, col: 5, color: "red" },
      { beat: 39, col: 10, kind: "weight", color: null },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBreathe",
    name: "LEECH PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 8, kind: "meteorMedium", color: null },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 20, col: 3, kind: "meteorMedium", color: null },
      { beat: 26, col: 9, color: "cyan" },
      { beat: 33, col: 2, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 8, beats: 12 }],
  },
  {
    id: "theLeechRecall",
    name: "LEECH MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 6, kind: "meteorMedium", color: null },
      { beat: 11, col: 2, color: "red" },
      { beat: 16, col: 9, kind: "meteor", color: null },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 27, col: 3, kind: "meteorMedium", color: null },
      { beat: 33, col: 6, color: "cyan" },
      { beat: 38, col: 1, kind: "meteor", color: null },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechBend",
    name: "LEECH TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 3, kind: "meteorMedium", color: null },
      { beat: 6, col: 7, kind: "meteorMedium", color: null },
      { beat: 12, col: 7, color: "cyan" },
      { beat: 17, col: 5, color: "cyan" },
      { beat: 23, col: 10, kind: "weight", color: null },
      { beat: 28, col: 4, color: "cyan" },
      { beat: 33, col: 2, kind: "meteorMedium", color: null },
      { beat: 39, col: 4, color: "cyan" },
      { beat: 39, col: 7, color: "cyan" },
      { beat: 45, col: 7, kind: "weight", color: null },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
    ],
  },
  {
    id: "theLeechPeak",
    name: "LEECH ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 3, kind: "meteorMedium", color: null },
      { beat: 4, col: 7, kind: "meteorMedium", color: null },
      { beat: 8, col: 8, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 16, col: 1, kind: "weight", color: null },
      { beat: 20, col: 2, color: "red" },
      { beat: 24, col: 5, kind: "meteorMedium", color: null },
      { beat: 28, col: 3, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 32, col: 3, kind: "weight", color: null },
      { beat: 36, col: 1, color: "red" },
      { beat: 40, col: 5, kind: "meteorMedium", color: null },
      { beat: 40, col: 8, kind: "meteorMedium", color: null },
      { beat: 44, col: 10, color: "red" },
      { beat: 48, col: 4, kind: "weight", color: null },
    ],
    faults: [
      { kind: "leech", at: 8, beats: 12 },
      { kind: "leech", at: 34, beats: 14 },
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
];
