import { PINBALL_ROUNDS } from "../pinball-rounds.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 111 to 124 of the game, in the order they are played: THE BALLOON's
 * block, the boss THE SINEW, THE MOULT's block, the boss THE CHRYSALIS, THE
 * DARK's block, the boss THE CURTAIN, THE COIL's block, the boss PINBALL and
 * THE JAM's block.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_7: Wave[] = [
  {
    id: "theBalloon",
    name: "THE BALLOON",
    hints: "theBalloon",
    entries: [
      { beat: 0, col: 3, kind: "balloon", color: null },
      { beat: 8, col: 8, kind: "balloon", color: null },
      { beat: 18, col: 7, kind: "balloon", color: null },
      { beat: 26, col: 0, kind: "balloon", color: null },
      { beat: 34, col: 10, kind: "balloon", color: null },
      { beat: 44, col: 3, kind: "balloon", color: null },
    ],
  },
  {
    id: "theBalloonRecall",
    name: "BALLOON LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 10, kind: "balloon", color: null },
      { beat: 10, col: 1, color: "red" },
      { beat: 18, col: 2, kind: "rind", color: "cyan" },
      { beat: 23, col: 1, color: "red" },
      { beat: 29, col: 8, kind: "balloon", color: null },
      { beat: 35, col: 6, color: "cyan" },
      { beat: 41, col: 7, kind: "veer", color: null },
      { beat: 46, col: 5, color: "cyan" },
    ],
  },
  {
    id: "theSinew",
    name: "THE SINEW",
    guide: {
      scene: "theSinew",
    },
    entries: [],
    boss: { kind: "sinew" },
    bossType: "normal",
  },
  {
    id: "theMoult",
    name: "THE MOULT",
    guide: {
      scene: "theMoult",
    },
    entries: [
      { beat: 0, col: 1, kind: "meteor", color: null },
      { beat: 4, col: 5, kind: "moult", color: null },
      { beat: 9, col: 7, kind: "moult", color: null },
      { beat: 18, col: 4, kind: "moult", color: null },
      { beat: 19, col: 7, kind: "moult", color: null },
    ],
  },
  {
    id: "theMoultRecall",
    name: "MOULT RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 1, kind: "moult", color: null },
      { beat: 12, col: 8, color: "red" },
      { beat: 18, col: 1, kind: "veer", color: null },
      { beat: 24, col: 9, color: "red" },
      { beat: 29, col: 5, kind: "moult", color: null },
      { beat: 34, col: 6, color: "cyan" },
      { beat: 40, col: 10, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 45, col: 4, color: "cyan" },
    ],
  },
  {
    id: "theChrysalis",
    name: "THE CHRYSALIS",
    entries: [],
    boss: {
      kind: "chrysalis",
      steps: [
        { skin: "slime", rubs: 6, beats: 32 },
        { skin: "slime", rubs: 10, beats: 40 },
        { skin: "quills", beats: 36 },
        { skin: "quills", tracks: ["sweep", "sweep", "snake", "climb"], beats: 48 },
        { skin: "sacs", offsets: [-2, 1, 0, 2], beats: 40 },
        { skin: "sacs", offsets: [1, -1, 2, -2, 0], beats: 48 },
        { skin: "heart", offsets: [-1, 2, 0], colors: ["red", "cyan", "red"], beats: 32 },
        {
          skin: "heart",
          offsets: [2, -2, 1, -1],
          colors: ["cyan", "red", "red", "cyan"],
          beats: 40,
        },
      ],
    },
    bossType: "normal",
    controls: "standard5",
  },
  {
    id: "theDark",
    name: "THE DARK",
    guide: {
      scene: "theDark",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 16, col: 8, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 32, col: 7, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 48, col: 10, color: "red" },
      { beat: 56, col: 5, color: "cyan" },
      { beat: 64, col: 2, color: "red" },
      { beat: 72, col: 8, color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
  },
  {
    id: "theDarkRecall",
    name: "DARK LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 4, kind: "meteor", color: null },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 16, col: 10, kind: "morsel", color: "cyan" },
      { beat: 21, col: 1, color: "red" },
      { beat: 29, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 35, col: 4, color: "red" },
      { beat: 40, col: 10, kind: "meteor", color: null },
      { beat: 46, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "dark", at: 8 }],
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
    id: "theJam",
    name: "THE JAM",
    guide: {
      scene: "theJam",
    },
    entries: [
      { beat: 0, col: 5, kind: "lure", color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 20, col: 3, kind: "lure", color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 36, col: 7, kind: "lure", color: "red" },
      { beat: 50, col: 4, color: "red" },
      { beat: 62, col: 1, kind: "lure", color: "cyan" },
      { beat: 70, col: 9, color: "red" },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 9 }],
  },
  {
    id: "theJamRecall",
    name: "OLD JAM SONG",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 5, kind: "veer", color: null },
      { beat: 10, col: 6, color: "cyan" },
      { beat: 16, col: 7, kind: "wisp", color: null },
      { beat: 21, col: 6, color: "cyan" },
      { beat: 26, col: 10, kind: "meteor", color: null, cross: 1, row: 9 },
      { beat: 31, col: 6, color: "cyan" },
      { beat: 37, col: 1, kind: "veer", color: null },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 48, col: 7, kind: "wisp", color: null },
    ],
    faults: [{ kind: "cannon", color: "alternating", at: 9 }],
  },
];
