import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 152 to 161 of the game, in the order they are played: THE LEECH's
 * block, the filler before PINBALL and the boss PINBALL.
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
      { beat: 8, col: 5, color: "cyan" },
      { beat: 22, col: 5, color: "red" },
      { beat: 30, col: 6, color: "cyan" },
      { beat: 38, col: 5, color: "red" },
      { beat: 52, col: 6, color: "cyan" },
      { beat: 60, col: 5, color: "red" },
    ],
    faults: [
      { kind: "leech", at: 12, beats: 12 },
      { kind: "leech", at: 44, beats: 16 },
    ],
  },
  {
    id: "theLeechAgain",
    name: "NEW LEECH MOON",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "meteorMedium", color: null },
      { beat: 6, col: 8, kind: "meteorMedium", color: null },
      { beat: 13, col: 3, kind: "meteorMedium", color: null },
      { beat: 21, col: 8, kind: "meteorMedium", color: null },
      { beat: 28, col: 2, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechReach",
    name: "FAR LEECH",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "meteorMedium", color: null },
      { beat: 5, col: 10, kind: "weight", color: null },
      { beat: 13, col: 6, kind: "meteorMedium", color: null },
      { beat: 18, col: 2, kind: "weight", color: null },
      { beat: 23, col: 6, kind: "meteorMedium", color: null },
      { beat: 29, col: 10, kind: "weight", color: null },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechPair",
    name: "LEECH ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 7, kind: "meteorMedium", color: null },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 6, kind: "weight", color: null },
      { beat: 24, col: 4, color: "cyan" },
      { beat: 29, col: 10, kind: "glutton", color: "cyan" },
      { beat: 34, col: 2, color: "cyan" },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechRecall",
    name: "LEECH MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 10, kind: "meteorMedium", color: null },
      { beat: 13, col: 8, color: "red" },
      { beat: 19, col: 0, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 26, col: 10, color: "red" },
      { beat: 32, col: 8, kind: "meteorMedium", color: null },
      { beat: 37, col: 4, color: "red" },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "theLeechPeak",
    name: "LEECH ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 0, kind: "meteorMedium", color: null },
      { beat: 5, col: 10, kind: "meteorMedium", color: null },
      { beat: 11, col: 7, color: "red" },
      { beat: 15, col: 5, color: "cyan" },
      { beat: 20, col: 0, kind: "weight", color: null },
      { beat: 24, col: 1, color: "red" },
      { beat: 28, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 1, color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
      { beat: 38, col: 8, kind: "meteorMedium", color: null },
      { beat: 42, col: 3, kind: "weight", color: null },
    ],
    faults: [{ kind: "leech", at: 12, beats: 12 }],
  },
  {
    id: "fillerPinballBreathe",
    name: "LEECH SIESTA",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 2, kind: "meteorMedium", color: null },
      { beat: 14, col: 8, color: "red" },
      { beat: 20, col: 1, kind: "meteorMedium", color: null },
      { beat: 26, col: 0, color: "red" },
      { beat: 32, col: 9, kind: "meteorMedium", color: null },
      { beat: 40, col: 2, color: "red" },
    ],
  },
  {
    id: "fillerPinballRecall",
    name: "LEECH RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 10, kind: "meteorMedium", color: null },
      { beat: 13, col: 1, color: "red" },
      { beat: 18, col: 7, kind: "glutton", color: "cyan" },
      { beat: 23, col: 10, color: "red" },
      { beat: 30, col: 1, kind: "meteorMedium", color: null },
      { beat: 36, col: 9, color: "cyan" },
    ],
  },
  {
    id: "fillerPinballBend",
    name: "LEECH ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 2, kind: "meteorMedium", color: null },
      { beat: 6, col: 8, kind: "meteorMedium", color: null },
      { beat: 12, col: 6, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 24, col: 10, kind: "weight", color: null },
      { beat: 32, col: 0, color: "red" },
      { beat: 38, col: 5, kind: "meteorMedium", color: null },
      { beat: 43, col: 3, color: "cyan" },
      { beat: 43, col: 7, color: "cyan" },
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
