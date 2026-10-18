import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 265 to 274 of the game, in the order they are played: THE MAGNET's
 * block, the filler before THE PULSE and the boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
  {
    id: "theMagnet",
    name: "THE MAGNET",
    guide: {
      scene: "theMagnet",
    },
    entries: [
      { beat: 0, col: 5, kind: "magnet", color: "red" },
      { beat: 14, col: 2, kind: "magnet", color: "cyan" },
      { beat: 28, col: 7, kind: "magnet", color: "red" },
      { beat: 44, col: 0, kind: "magnet", color: "cyan" },
      { beat: 52, col: 10, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "theMagnetAgain",
    name: "MAGNET RISING",
    variant: true,
    entries: [
      { beat: 0, col: 3, kind: "magnet", color: "red" },
      { beat: 6, col: 2, kind: "magnet", color: "red" },
      { beat: 12, col: 9, kind: "magnet", color: "cyan" },
      { beat: 20, col: 1, kind: "magnet", color: "red" },
      { beat: 26, col: 8, kind: "magnet", color: "red" },
      { beat: 32, col: 9, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetReach",
    name: "LONG MAGNET ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "magnet", color: "red" },
      { beat: 6, col: 8, kind: "fence", color: null },
      { beat: 19, col: 8, kind: "magnet", color: "red" },
      { beat: 24, col: 4, kind: "fence", color: null },
    ],
    pods: [{ beat: 11, col: 0, row: 4, kind: "husk" }],
  },
  {
    id: "theMagnetPair",
    name: "MAGNET DUET",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 9, kind: "magnet", color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 16, col: 10, kind: "fence", color: null },
      { beat: 24, col: 2, color: "red" },
      { beat: 30, col: 9, kind: "meteor", color: null },
      { beat: 36, col: 6, color: "red" },
      { beat: 40, col: 3, kind: "magnet", color: "cyan" },
    ],
  },
  {
    id: "theMagnetRecall",
    name: "MAGNET LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "magnet", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "meteor", color: null },
      { beat: 28, col: 9, color: "cyan" },
      { beat: 34, col: 8, kind: "magnet", color: "red" },
      { beat: 40, col: 7, color: "red" },
    ],
  },
  {
    id: "theMagnetPeak",
    name: "MAGNET OVERDRIVE",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 3, kind: "magnet", color: "red" },
      { beat: 8, col: 9, color: "red" },
      { beat: 16, col: 8, kind: "fence", color: null },
      { beat: 20, col: 4, color: "cyan" },
      { beat: 20, col: 7, color: "cyan" },
      { beat: 24, col: 1, kind: "veer", color: null },
      { beat: 28, col: 5, kind: "magnet", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 39, col: 2, kind: "fence", color: null },
      { beat: 44, col: 7, kind: "veer", color: null },
      { beat: 47, col: 5, color: "cyan" },
      { beat: 47, col: 8, color: "cyan" },
    ],
  },
  {
    id: "fillerPulseBreathe",
    name: "MAGNET DREAM",
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 4, kind: "magnet", color: "red" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 19, col: 2, kind: "fence", color: null },
      { beat: 25, col: 4, color: "red" },
      { beat: 31, col: 9, kind: "beatbox", color: null, beats: 2 },
      { beat: 37, col: 10, color: "red" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "MAGNET HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 8, kind: "magnet", color: "red" },
      { beat: 10, col: 2, color: "red" },
      { beat: 16, col: 10, kind: "veer", color: null },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 27, col: 8, kind: "magnet", color: "cyan" },
      { beat: 32, col: 10, color: "red" },
      { beat: 39, col: 1, kind: "veer", color: null },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "MAGNET ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 5, col: 9, kind: "magnet", color: "cyan" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 8, kind: "fence", color: null },
      { beat: 22, col: 4, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 27, col: 6, kind: "magnet", color: "cyan" },
      { beat: 33, col: 4, kind: "fence", color: null },
      { beat: 38, col: 1, color: "red" },
      { beat: 38, col: 9, color: "red" },
      { beat: 43, col: 6, kind: "magnet", color: "red" },
    ],
  },
  {
    id: "pulse",
    name: "THE PULSE",
    guide: {
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
];
