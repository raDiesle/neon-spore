import { NETTLE_SCRIPT } from "../nettle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 516 to 525 of the game, in the order they are played: THE CAROM's
 * block, the filler before THE NETTLE and the boss THE NETTLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_45: Wave[] = [
  {
    id: "theCarom",
    name: "THE CAROM",
    guide: {
      scene: "theCarom",
    },
    entries: [
      { beat: 0, col: 0, kind: "carom", color: "red" },
      { beat: 12, col: 10, kind: "carom", color: "cyan" },
      { beat: 24, col: 2, kind: "carom", color: "cyan" },
      { beat: 28, col: 8, kind: "carom", color: "red" },
    ],
  },
  {
    id: "theCaromAgain",
    name: "CAROM RISING",
    variant: true,
    entries: [
      { beat: 0, col: 6, kind: "carom", color: "cyan" },
      { beat: 8, col: 0, kind: "ghost", color: "red" },
      { beat: 15, col: 6, kind: "veer", color: null },
      { beat: 21, col: 0, kind: "carom", color: "red" },
      { beat: 29, col: 5, kind: "ghost", color: "cyan", path: "across" },
    ],
  },
  {
    id: "theCaromReach",
    name: "CAROM VOYAGE",
    variant: true,
    entries: [
      { beat: 0, col: 9, kind: "carom", color: "red" },
      { beat: 6, col: 2, kind: "ghost", color: "cyan", path: "across" },
      { beat: 12, col: 6, kind: "lid", color: "red" },
      { beat: 17, col: 0, kind: "carom", color: "red" },
      { beat: 23, col: 7, kind: "ghost", color: "cyan" },
      { beat: 29, col: 3, kind: "lid", color: "cyan" },
    ],
  },
  {
    id: "theCaromPair",
    name: "CAROM ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 8, kind: "carom", color: "red" },
      { beat: 13, col: 9, color: "red" },
      { beat: 17, col: 5, kind: "ghost", color: "cyan", path: "across" },
      { beat: 22, col: 4, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 26, col: 3, kind: "recoil", color: "red" },
      { beat: 31, col: 7, kind: "carom", color: "red" },
      { beat: 37, col: 1, color: "red" },
      { beat: 37, col: 9, color: "red" },
    ],
  },
  {
    id: "theCaromRecall",
    name: "OLD CAROM SONG",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 3, kind: "carom", color: "red" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 17, col: 10, kind: "veil", color: null },
      { beat: 22, col: 2, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 4, kind: "carom", color: "red" },
      { beat: 33, col: 5, kind: "veil", color: null },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
    ],
  },
  {
    id: "theCaromPeak",
    name: "CAROM INFERNO",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 2, kind: "carom", color: "red" },
      { beat: 7, col: 3, color: "red" },
      { beat: 7, col: 7, color: "red" },
      { beat: 15, col: 10, kind: "ghost", color: "red" },
      { beat: 21, col: 3, kind: "volley", color: "cyan" },
      { beat: 24, col: 2, color: "cyan" },
      { beat: 24, col: 8, color: "cyan" },
      { beat: 28, col: 6, kind: "carom", color: "cyan" },
      { beat: 32, col: 2, kind: "ghost", color: "cyan" },
      { beat: 36, col: 4, color: "cyan" },
      { beat: 36, col: 7, color: "cyan" },
      { beat: 40, col: 8, kind: "volley", color: "cyan" },
      { beat: 44, col: 4, kind: "carom", color: "cyan" },
      { beat: 48, col: 3, color: "cyan" },
      { beat: 48, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerNettleBreathe",
    name: "CAROM DREAM",
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 7, col: 10, kind: "carom", color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 22, col: 10, kind: "ghost", color: "cyan" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 5, kind: "rind", color: "cyan" },
    ],
  },
  {
    id: "fillerNettleRecall",
    name: "CAROM SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 5, kind: "carom", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 17, col: 7, kind: "magnet", color: "cyan" },
      { beat: 22, col: 9, kind: "carom", color: "red" },
      { beat: 27, col: 3, color: "red" },
      { beat: 27, col: 7, color: "red" },
      { beat: 32, col: 0, kind: "magnet", color: "red" },
      { beat: 40, col: 1, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "fillerNettleBend",
    name: "CAROM PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 5, kind: "carom", color: "cyan" },
      { beat: 11, col: 2, kind: "ghost", color: "red" },
      { beat: 16, col: 4, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 21, col: 7, kind: "carom", color: "red" },
      { beat: 26, col: 8, kind: "ghost", color: "cyan" },
      { beat: 32, col: 0, color: "cyan" },
      { beat: 32, col: 10, color: "cyan" },
      { beat: 37, col: 5, kind: "carom", color: "cyan" },
      { beat: 43, col: 7, kind: "ghost", color: "cyan" },
      { beat: 48, col: 5, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
    ],
  },
  {
    id: "theNettle",
    name: "THE NETTLE",
    guide: {
      both: "A jellyfish over the ship. Its rings say what to do. A hand is your thumb on it. SHOOT, SHIELD or SUCK is the panel, under the ring.",
      p1: "1. Pull, tap, turn or hold the rings on the left, and the shared ones.\n2. Move the cannon under SHOOT or SUCK. Hold SUCK yourself.\n3. When the shield is under SHIELD, press your shield button.",
      p2: "1. Pull, tap, turn or hold the rings on the right, and the shared ones.\n2. Fire when the cannon is under SHOOT.\n3. Move the shield under SHIELD, and say when.",
    },
    entries: [],
    boss: { kind: "nettle", steps: NETTLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
