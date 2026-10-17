import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 193 to 202 of the game, in the order they are played: THE CHOKE's
 * block, the filler before THE PULSE and the boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_17: Wave[] = [
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
      { beat: 0, col: 7, kind: "shell", color: "red" },
      { beat: 8, col: 6, kind: "shell", color: "cyan" },
      { beat: 15, col: 1, kind: "shell", color: "red" },
      { beat: 23, col: 8, kind: "shell", color: "cyan" },
      { beat: 29, col: 2, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theChokeReach",
    name: "OUTER CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "shell", color: "red" },
      { beat: 6, col: 6, kind: "countdown", color: "cyan" },
      { beat: 18, col: 8, kind: "shell", color: "cyan" },
      { beat: 24, col: 3, kind: "countdown", color: "red" },
    ],
    pods: [{ beat: 12, col: 1, row: 4, kind: "husk" }],
  },
  {
    id: "theChokePair",
    name: "CHOKE DUET",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 3, kind: "shell", color: "red" },
      { beat: 10, col: 5, color: "cyan" },
      { beat: 16, col: 1, kind: "countdown", color: "cyan" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 1, kind: "torch", color: null },
      { beat: 31, col: 2, color: "red" },
      { beat: 35, col: 4, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 5, col: 6, kind: "shell", color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 16, col: 6, kind: "beatbox", color: null, beats: 2 },
      { beat: 22, col: 0, color: "red" },
      { beat: 28, col: 10, kind: "shell", color: "cyan" },
      { beat: 34, col: 0, color: "cyan" },
      { beat: 40, col: 5, kind: "beatbox", color: null, beats: 3 },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 3, kind: "shell", color: "red" },
      { beat: 8, col: 2, color: "red" },
      { beat: 12, col: 3, kind: "countdown", color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 20, col: 3, kind: "glutton", color: "cyan" },
      { beat: 24, col: 7, kind: "shell", color: "red" },
      { beat: 28, col: 0, color: "cyan" },
      { beat: 28, col: 10, color: "cyan" },
      { beat: 32, col: 3, kind: "countdown", color: "red" },
      { beat: 36, col: 10, kind: "glutton", color: "cyan" },
      { beat: 40, col: 3, color: "red" },
      { beat: 40, col: 6, color: "red" },
      { beat: 44, col: 0, kind: "shell", color: "cyan" },
      { beat: 48, col: 9, kind: "countdown", color: "red" },
    ],
  },
  {
    id: "fillerPulseBreathe",
    name: "SOFT CHOKE",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 2, kind: "shell", color: "cyan" },
      { beat: 15, col: 1, color: "red" },
      { beat: 22, col: 7, kind: "countdown", color: "red" },
      { beat: 30, col: 8, color: "red" },
      { beat: 37, col: 6, kind: "shell", color: "red" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "CHOKE SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 10, kind: "shell", color: "cyan" },
      { beat: 10, col: 4, color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 27, col: 6, kind: "shell", color: "red" },
      { beat: 32, col: 8, color: "cyan" },
    ],
    pods: [{ beat: 16, col: 5, row: 4, kind: "husk" }],
  },
  {
    id: "fillerPulseBend",
    name: "CROOKED CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 4, kind: "shell", color: "red" },
      { beat: 10, col: 1, color: "red" },
      { beat: 15, col: 2, kind: "countdown", color: "cyan" },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 25, col: 6, kind: "shell", color: "red" },
      { beat: 30, col: 1, kind: "countdown", color: "red" },
      { beat: 36, col: 3, color: "cyan" },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 42, col: 3, kind: "shell", color: "red" },
      { beat: 47, col: 9, kind: "countdown", color: "red" },
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
