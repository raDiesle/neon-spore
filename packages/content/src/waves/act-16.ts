import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 272 to 283 of the game, in the order they are played: the filler before
 * THE CURTAIN, the boss THE CURTAIN, THE COIL's block, the filler before
 * PINBALL and the boss PINBALL.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "fillerCurtainBreathe",
    name: "SLEEPY CURTAIN",
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 1, kind: "fence", color: null },
      { beat: 16, col: 8, color: "cyan" },
      { beat: 23, col: 0, kind: "countdown", color: "cyan" },
      { beat: 29, col: 10, color: "red" },
      { beat: 37, col: 6, kind: "wisp", color: null },
    ],
  },
  {
    id: "fillerCurtainRecall",
    name: "CURTAIN REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 9, kind: "dart", color: "red" },
      { beat: 13, col: 0, color: "cyan" },
      { beat: 18, col: 10, kind: "torch", color: null },
      { beat: 26, col: 7, color: "cyan" },
      { beat: 31, col: 10, kind: "balloon", color: null },
      { beat: 38, col: 0, color: "cyan" },
    ],
  },
  {
    id: "fillerCurtainBend",
    name: "CURTAIN RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 9, kind: "seeder", color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 18, col: 4, kind: "shell", color: "cyan" },
      { beat: 23, col: 5, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 29, col: 0, kind: "dart", color: "cyan" },
      { beat: 35, col: 7, kind: "seeder", color: "red" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 7, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theCurtain",
    name: "THE CURTAIN",
    guide: {
      scene: "theCurtain",
    },
    entries: [],
    boss: { kind: "curtain" },
    bossType: "normal",
  },
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
    id: "theCoilPair",
    name: "COIL TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 5, kind: "coil", color: null },
      { beat: 9, col: 8, color: "cyan" },
      { beat: 14, col: 4, kind: "moult", color: null },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 25, col: 6, kind: "coil", color: null },
      { beat: 30, col: 8, color: "red" },
      { beat: 35, col: 4, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theCoilRecall",
    name: "COIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 4, kind: "coil", color: null },
      { beat: 10, col: 9, color: "cyan" },
      { beat: 16, col: 4, kind: "recoil", color: "cyan" },
      { beat: 22, col: 10, color: "cyan" },
      { beat: 28, col: 4, kind: "coil", color: null },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 39, col: 7, kind: "meteor", color: null },
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
    name: "PINBALL LULLABY",
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 8, col: 9, kind: "magnet", color: "cyan" },
      { beat: 14, col: 3, color: "red" },
      { beat: 21, col: 0, kind: "throb", color: "red" },
      { beat: 27, col: 5, color: "red" },
      { beat: 34, col: 1, kind: "beatbox", color: null, beats: 3 },
      { beat: 40, col: 2, color: "cyan" },
    ],
  },
  {
    id: "fillerPinballRecall",
    name: "PINBALL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 9, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 2, kind: "gyre", color: null },
      { beat: 23, col: 7, color: "cyan" },
      { beat: 29, col: 1, kind: "echo", color: "red" },
      { beat: 35, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerPinballBend",
    name: "PINBALL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 0, kind: "echo", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 17, col: 2, kind: "gyre", color: null },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 28, col: 3, kind: "throb", color: "red" },
      { beat: 34, col: 7, kind: "echo", color: "red" },
      { beat: 39, col: 3, color: "cyan" },
      { beat: 39, col: 6, color: "cyan" },
      { beat: 44, col: 7, kind: "gyre", color: null },
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
