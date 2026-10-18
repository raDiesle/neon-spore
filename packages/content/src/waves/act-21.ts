import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 312 to 321 of the game, in the order they are played: THE COIL's block,
 * the filler before PINBALL and the boss PINBALL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_21: Wave[] = [
  {
    id: "theCoil",
    name: "THE COIL",
    guide: {
      scene: "theCoil",
    },
    entries: [
      { beat: 7, col: 6, kind: "coil", color: null },
      { beat: 15, col: 7, kind: "coil", color: null },
      { beat: 23, col: 5, kind: "meteor", color: null },
      { beat: 37, col: 7, kind: "coil", color: null },
      { beat: 45, col: 7, kind: "coil", color: null },
      { beat: 61, col: 7, kind: "coil", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "theCoilAgain",
    name: "FIRST COIL",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "coil", color: null },
      { beat: 8, col: 6, kind: "coil", color: null },
      { beat: 15, col: 2, kind: "coil", color: null },
      { beat: 21, col: 9, kind: "coil", color: null },
      { beat: 27, col: 6, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilReach",
    name: "OUTER COIL",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "coil", color: null },
      { beat: 6, col: 5, kind: "moult", color: null },
      { beat: 18, col: 10, kind: "coil", color: null },
      { beat: 26, col: 3, kind: "moult", color: null },
    ],
    pods: [{ beat: 12, col: 1, row: 3, kind: "pod" }],
  },
  {
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 8, kind: "coil", color: null },
      { beat: 11, col: 6, color: "cyan" },
      { beat: 15, col: 9, kind: "moult", color: null },
      { beat: 21, col: 10, color: "red" },
      { beat: 26, col: 4, kind: "recoil", color: "cyan" },
      { beat: 32, col: 6, color: "cyan" },
      { beat: 37, col: 2, kind: "coil", color: null },
    ],
  },
  {
    id: "theCoilRecall",
    name: "COIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 7, kind: "coil", color: null },
      { beat: 12, col: 6, color: "red" },
      { beat: 17, col: 0, kind: "ghost", color: "cyan", path: "across" },
      { beat: 23, col: 6, color: "red" },
      { beat: 29, col: 3, kind: "coil", color: null },
      { beat: 34, col: 7, color: "red" },
      { beat: 39, col: 4, kind: "ghost", color: "cyan" },
    ],
  },
  {
    id: "theTwitch",
    name: "COIL INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 5, kind: "meteor", color: null },
      { beat: 10, col: 10, kind: "coil", color: null },
      { beat: 26, col: 10, kind: "coil", color: null },
      { beat: 28, col: 10, kind: "coil", color: null },
      { beat: 30, col: 10, kind: "coil", color: null },
      { beat: 48, col: 10, kind: "coil", color: null },
      { beat: 50, col: 10, kind: "coil", color: null },
      { beat: 52, col: 10, kind: "coil", color: null },
      { beat: 54, col: 10, kind: "coil", color: null },
      { beat: 62, col: 0, kind: "meteorMedium", color: null },
    ],
    faults: [{ kind: "shield" }],
  },
  {
    id: "fillerPinballBreathe",
    name: "COIL LULLABY",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 6, kind: "coil", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 20, col: 1, kind: "moult", color: null },
      { beat: 28, col: 6, color: "red" },
      { beat: 34, col: 9, kind: "dart", color: "red" },
    ],
  },
  {
    id: "fillerPinballRecall",
    name: "COIL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 9, kind: "coil", color: null },
      { beat: 10, col: 4, color: "red" },
      { beat: 16, col: 9, kind: "recoil", color: "red" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 28, col: 3, kind: "coil", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 1, kind: "recoil", color: "cyan" },
    ],
  },
  {
    id: "fillerPinballBend",
    name: "COIL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 0, kind: "coil", color: null },
      { beat: 14, col: 7, color: "cyan" },
      { beat: 20, col: 5, kind: "moult", color: null },
      { beat: 25, col: 2, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 31, col: 9, kind: "coil", color: null },
      { beat: 36, col: 5, kind: "moult", color: null },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 6, color: "red" },
      { beat: 47, col: 9, kind: "coil", color: null },
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
