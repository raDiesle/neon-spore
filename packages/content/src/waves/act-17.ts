import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 189 to 198 of the game, in the order they are played: THE CHOKE's block
 * and the boss THE PULSE.
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
      { beat: 4, col: 8, color: "cyan" },
      { beat: 8, col: 3, color: "red" },
      { beat: 14, col: 2, color: "cyan" },
      { beat: 20, col: 10, color: "red" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 42, col: 10, color: "red" },
      { beat: 44, col: 0, color: "cyan" },
      { beat: 48, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "steer" }],
  },
  {
    id: "theChokeAgain",
    name: "CHOKE DAWN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "cyan" },
      { beat: 6, col: 9, kind: "shell", color: "red" },
      { beat: 14, col: 6, kind: "shell", color: "cyan" },
      { beat: 22, col: 9, kind: "shell", color: "red" },
      { beat: 29, col: 5, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theChokeSpread",
    name: "CHOKE SEEDS",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "shell", color: "red" },
      { beat: 7, col: 5, color: "red" },
      { beat: 14, col: 8, kind: "shell", color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 26, col: 1, kind: "shell", color: "red" },
      { beat: 31, col: 0, color: "red" },
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
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 6, kind: "shell", color: "red" },
      { beat: 9, col: 3, color: "red" },
      { beat: 14, col: 4, kind: "countdown", color: "cyan" },
      { beat: 19, col: 3, color: "cyan" },
      { beat: 25, col: 8, kind: "meteor", color: null },
      { beat: 31, col: 1, color: "red" },
      { beat: 35, col: 10, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theChokeBreathe",
    name: "CHOKE DREAM",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 8, kind: "shell", color: "cyan" },
      { beat: 12, col: 9, color: "red" },
      { beat: 19, col: 5, kind: "countdown", color: "cyan" },
      { beat: 25, col: 10, color: "red" },
      { beat: 33, col: 9, kind: "shell", color: "cyan" },
    ],
  },
  {
    id: "theChokeRecall",
    name: "CHOKE LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 0, kind: "shell", color: "red" },
      { beat: 11, col: 9, color: "red" },
      { beat: 16, col: 3, kind: "blister", color: null, row: 3, by: 2 },
      { beat: 22, col: 4, color: "red" },
      { beat: 27, col: 3, kind: "shell", color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 38, col: 2, kind: "blister", color: null, row: 3, by: 2 },
    ],
  },
  {
    id: "theChokeBend",
    name: "TWISTED CHOKE",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 1, kind: "shell", color: "red" },
      { beat: 10, col: 6, color: "cyan" },
      { beat: 15, col: 1, kind: "countdown", color: "cyan" },
      { beat: 20, col: 5, color: "cyan" },
      { beat: 20, col: 8, color: "cyan" },
      { beat: 25, col: 4, kind: "shell", color: "cyan" },
      { beat: 31, col: 6, kind: "countdown", color: "cyan" },
      { beat: 36, col: 2, color: "cyan" },
      { beat: 36, col: 8, color: "cyan" },
      { beat: 42, col: 10, kind: "shell", color: "cyan" },
      { beat: 47, col: 0, kind: "countdown", color: "cyan" },
    ],
  },
  {
    id: "theChokePeak",
    name: "CHOKE APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 4, col: 6, kind: "shell", color: "red" },
      { beat: 8, col: 4, color: "red" },
      { beat: 12, col: 0, kind: "countdown", color: "red" },
      { beat: 16, col: 1, color: "cyan" },
      { beat: 16, col: 9, color: "cyan" },
      { beat: 20, col: 6, kind: "seeder", color: "red" },
      { beat: 24, col: 1, kind: "shell", color: "cyan" },
      { beat: 28, col: 0, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 32, col: 6, kind: "countdown", color: "cyan" },
      { beat: 36, col: 3, kind: "seeder", color: "cyan" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 5, kind: "shell", color: "red" },
      { beat: 48, col: 1, kind: "countdown", color: "red" },
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
