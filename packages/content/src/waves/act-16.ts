import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 273 to 284 of the game, in the order they are played: the filler before
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
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 0, kind: "rind", color: "red" },
      { beat: 13, col: 8, color: "red" },
      { beat: 27, col: 9, color: "red" },
      { beat: 33, col: 7, kind: "gyre", color: null },
      { beat: 39, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 20, col: 7, row: 4, kind: "husk" }],
  },
  {
    id: "fillerCurtainRecall",
    name: "CURTAIN REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 2, kind: "seeder", color: "cyan" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 18, col: 0, kind: "wisp", color: null },
      { beat: 24, col: 10, color: "red" },
      { beat: 32, col: 1, kind: "gyre", color: null },
      { beat: 38, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerCurtainBend",
    name: "CURTAIN RIDDLE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 4, kind: "dart", color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 8, kind: "seeder", color: "cyan" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 23, col: 8, color: "cyan" },
      { beat: 28, col: 8, kind: "gyre", color: null },
      { beat: 33, col: 4, kind: "dart", color: "cyan" },
      { beat: 38, col: 5, color: "red" },
      { beat: 38, col: 8, color: "red" },
      { beat: 43, col: 3, kind: "seeder", color: "red" },
      { beat: 48, col: 4, kind: "gyre", color: null },
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
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 9, kind: "coil", color: null },
      { beat: 9, col: 10, color: "cyan" },
      { beat: 15, col: 2, kind: "moult", color: null },
      { beat: 20, col: 1, color: "red" },
      { beat: 26, col: 9, kind: "coil", color: null },
      { beat: 30, col: 8, color: "red" },
      { beat: 36, col: 5, kind: "throb", color: "red" },
    ],
  },
  {
    id: "theCoilRecall",
    name: "COIL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 9, kind: "coil", color: null },
      { beat: 10, col: 8, color: "red" },
      { beat: 16, col: 0, kind: "lure", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 27, col: 0, kind: "coil", color: null },
      { beat: 34, col: 9, color: "red" },
      { beat: 40, col: 6, kind: "blister", color: null, row: 2, gesture: "swipe" },
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
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 1, kind: "meteorMedium", color: null },
      { beat: 14, col: 3, color: "red" },
      { beat: 22, col: 10, kind: "veer", color: null },
      { beat: 29, col: 7, color: "red" },
      { beat: 36, col: 10, kind: "strand", color: "red", beads: 2 },
    ],
  },
  {
    id: "fillerPinballRecall",
    name: "PINBALL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 5, kind: "meteor", color: null },
      { beat: 11, col: 8, color: "red" },
      { beat: 17, col: 1, kind: "gyre", color: null },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 5, kind: "meteor", color: null, cross: 1, row: 5 },
      { beat: 34, col: 7, color: "red" },
      { beat: 40, col: 0, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerPinballBend",
    name: "PINBALL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 5, kind: "magnet", color: "red" },
      { beat: 10, col: 2, color: "red" },
      { beat: 15, col: 3, kind: "throb", color: "red" },
      { beat: 20, col: 1, color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 25, col: 5, kind: "dart", color: "cyan" },
      { beat: 30, col: 8, kind: "magnet", color: "red" },
      { beat: 36, col: 3, color: "red" },
      { beat: 36, col: 6, color: "red" },
      { beat: 41, col: 9, kind: "throb", color: "red" },
      { beat: 47, col: 2, kind: "dart", color: "cyan" },
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
