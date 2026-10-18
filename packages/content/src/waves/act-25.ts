import { PULSE_STAGES } from "../pulse-stages.js";
import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 358 to 371 of the game, in the order they are played: the filler before
 * THE HAUL, the boss THE HAUL, THE CRYSTAL's block, the filler before THE PULSE
 * and the boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_25: Wave[] = [
  {
    id: "fillerHaulBreathe",
    name: "CODEX HUSH",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 2, kind: "lid", color: "cyan" },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 20, col: 0, kind: "clasp", color: "cyan" },
      { beat: 27, col: 2, color: "red" },
      { beat: 34, col: 9, kind: "wisp", color: null },
    ],
  },
  {
    id: "fillerHaulRecall",
    name: "CODEX RELIC",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 1, kind: "lid", color: "cyan" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 10, kind: "ghost", color: "red" },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 29, col: 8, kind: "lid", color: "red" },
      { beat: 37, col: 3, color: "red" },
    ],
  },
  {
    id: "fillerHaulBend",
    name: "CODEX TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 1, kind: "lid", color: "red" },
      { beat: 13, col: 10, color: "red" },
      { beat: 19, col: 7, kind: "clasp", color: "red" },
      { beat: 24, col: 2, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 30, col: 3, kind: "lid", color: "cyan" },
      { beat: 35, col: 5, kind: "clasp", color: "red" },
      { beat: 41, col: 1, color: "cyan" },
      { beat: 41, col: 9, color: "cyan" },
      { beat: 47, col: 4, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theCrystal",
    name: "THE CRYSTAL",
    guide: {
      scene: "theCrystal",
    },
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "red" },
      { beat: 20, col: 10, kind: "crystal", color: "cyan" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 46, col: 8, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalAgain",
    name: "CRYSTAL RISING",
    variant: true,
    entries: [
      { beat: 0, col: 8, kind: "crystal", color: "red" },
      { beat: 8, col: 1, kind: "crystal", color: "red" },
      { beat: 15, col: 8, kind: "crystal", color: "cyan" },
      { beat: 21, col: 4, kind: "crystal", color: "red" },
      { beat: 28, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theCrystalReach",
    name: "LONG CRYSTAL ROAD",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "crystal", color: "red" },
      { beat: 6, col: 3, kind: "lid", color: "red" },
      { beat: 17, col: 1, kind: "crystal", color: "cyan" },
      { beat: 25, col: 9, kind: "lid", color: "cyan" },
    ],
    pods: [{ beat: 12, col: 8, row: 3, kind: "pod" }],
  },
  {
    id: "theCrystalPair",
    name: "CRYSTAL WALTZ",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 6, col: 8, kind: "crystal", color: "red" },
      { beat: 12, col: 10, color: "red" },
      { beat: 17, col: 7, kind: "lid", color: "red" },
      { beat: 23, col: 4, color: "red" },
      { beat: 27, col: 8, kind: "echo", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 37, col: 7, kind: "crystal", color: "cyan" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 10, kind: "crystal", color: "cyan" },
      { beat: 13, col: 4, color: "red" },
      { beat: 18, col: 8, kind: "wisp", color: null },
      { beat: 24, col: 0, color: "red" },
      { beat: 29, col: 10, kind: "crystal", color: "cyan" },
      { beat: 37, col: 2, color: "red" },
    ],
  },
  {
    id: "theCrystalPeak",
    name: "CRYSTAL ECLIPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 3, col: 1, kind: "crystal", color: "red" },
      { beat: 11, col: 2, color: "red" },
      { beat: 14, col: 4, kind: "lid", color: "cyan" },
      { beat: 18, col: 3, color: "cyan" },
      { beat: 18, col: 6, color: "cyan" },
      { beat: 22, col: 3, kind: "countdown", color: "red" },
      { beat: 27, col: 8, kind: "crystal", color: "red" },
      { beat: 33, col: 0, color: "cyan" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 38, col: 6, kind: "lid", color: "cyan" },
      { beat: 43, col: 0, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "fillerPulseBreathe",
    name: "CRYSTAL DREAM",
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 3, kind: "crystal", color: "red" },
      { beat: 12, col: 5, color: "red" },
      { beat: 19, col: 1, kind: "lid", color: "red" },
      { beat: 27, col: 5, color: "red" },
      { beat: 34, col: 10, kind: "echo", color: "cyan" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "CRYSTAL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 6, kind: "crystal", color: "cyan" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 18, col: 0, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 26, col: 8, color: "cyan" },
      { beat: 32, col: 8, kind: "crystal", color: "cyan" },
      { beat: 37, col: 7, kind: "blister", color: null, row: 3 },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "CRYSTAL ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 4, kind: "crystal", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 6, color: "red" },
      { beat: 17, col: 7, kind: "lid", color: "red" },
      { beat: 22, col: 5, kind: "crystal", color: "red" },
      { beat: 28, col: 4, color: "red" },
      { beat: 28, col: 7, color: "red" },
      { beat: 33, col: 6, kind: "lid", color: "red" },
      { beat: 38, col: 4, kind: "crystal", color: "red" },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
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
