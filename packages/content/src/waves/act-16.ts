import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 192 to 201 of the game, in the order they are played: THE CHOKE's
 * block, the filler before THE PULSE and the boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_16: Wave[] = [
  {
    id: "theChoke",
    name: "THE CHOKE",
    guide: {
      scene: "theChoke",
    },
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 16, col: 4, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 32, col: 9, color: "red" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 48, col: 1, color: "red" },
      { beat: 60, col: 9, color: "red" },
      { beat: 68, col: 1, color: "cyan" },
      { beat: 76, col: 4, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "cyan" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 14, col: 2, kind: "shell", color: "cyan" },
      { beat: 22, col: 6, kind: "shell", color: "cyan" },
      { beat: 29, col: 9, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theChokeReach",
    name: "OUTER CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 0, kind: "shell", color: "red" },
      { beat: 6, col: 4, kind: "countdown", color: "cyan" },
      { beat: 16, col: 1, kind: "shell", color: "cyan" },
      { beat: 24, col: 5, kind: "countdown", color: "red" },
    ],
    pods: [{ beat: 11, col: 8, row: 4, kind: "husk" }],
  },
  {
    id: "theChokePair",
    name: "CHOKE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 9, kind: "shell", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 16, col: 0, kind: "countdown", color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 34, col: 1, color: "red" },
      { beat: 40, col: 0, kind: "shell", color: "red" },
    ],
    pods: [{ beat: 28, col: 4, row: 3, kind: "pod" }],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 10, kind: "shell", color: "red" },
      { beat: 12, col: 9, color: "red" },
      { beat: 17, col: 0, kind: "shell", color: "red" },
      { beat: 25, col: 10, color: "red" },
      { beat: 32, col: 0, kind: "shell", color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 4, col: 8, kind: "shell", color: "red" },
      { beat: 8, col: 6, color: "cyan" },
      { beat: 12, col: 7, kind: "countdown", color: "cyan" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 2, kind: "seeder", color: "red" },
      { beat: 24, col: 5, kind: "shell", color: "red" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 32, col: 7, kind: "countdown", color: "red" },
      { beat: 36, col: 4, kind: "seeder", color: "cyan" },
      { beat: 41, col: 0, color: "cyan" },
      { beat: 41, col: 10, color: "cyan" },
      { beat: 45, col: 1, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "fillerPulseBreathe",
    name: "SOFT CHOKE",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 3, kind: "shell", color: "red" },
      { beat: 14, col: 6, color: "red" },
      { beat: 22, col: 2, kind: "countdown", color: "cyan" },
      { beat: 29, col: 6, color: "cyan" },
      { beat: 37, col: 0, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "CHOKE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 8, kind: "shell", color: "cyan" },
      { beat: 13, col: 1, color: "cyan" },
      { beat: 18, col: 5, kind: "beatbox", color: null, beats: 2 },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 10, kind: "shell", color: "cyan" },
      { beat: 33, col: 4, color: "red" },
      { beat: 39, col: 5, kind: "beatbox", color: null, beats: 4 },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "CROOKED CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 5, col: 5, kind: "shell", color: "cyan" },
      { beat: 10, col: 9, color: "red" },
      { beat: 16, col: 5, kind: "countdown", color: "cyan" },
      { beat: 21, col: 4, color: "cyan" },
      { beat: 21, col: 7, color: "cyan" },
      { beat: 27, col: 6, kind: "shell", color: "cyan" },
      { beat: 32, col: 9, kind: "countdown", color: "red" },
      { beat: 37, col: 5, color: "cyan" },
      { beat: 37, col: 8, color: "cyan" },
      { beat: 42, col: 10, kind: "shell", color: "red" },
      { beat: 48, col: 2, kind: "countdown", color: "red" },
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
