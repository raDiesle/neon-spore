import { GORGE_LEVELS } from "../gorge-levels.js";
import { PULSE_STAGES } from "../pulse-stages.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 321 to 332 of the game, in the order they are played: the filler before
 * THE PULSE, the boss THE PULSE, THE VOLLEY's block, the filler before THE
 * GORGE and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_20: Wave[] = [
  {
    id: "fillerPulseBreathe",
    name: "PULSE DREAM",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 8, col: 2, kind: "coil", color: null },
      { beat: 15, col: 8, color: "cyan" },
      { beat: 23, col: 10, kind: "lid", color: "red" },
      { beat: 29, col: 8, color: "cyan" },
      { beat: 35, col: 5, kind: "lure", color: "cyan" },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "PULSE HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 6, kind: "clasp", color: "cyan" },
      { beat: 10, col: 7, color: "cyan" },
      { beat: 16, col: 8, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 21, col: 1, color: "red" },
      { beat: 21, col: 9, color: "red" },
      { beat: 29, col: 2, kind: "balloon", color: null },
      { beat: 34, col: 0, kind: "clasp", color: "cyan" },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "PULSE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 5, col: 6, kind: "wisp", color: null },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 22, col: 5, kind: "shell", color: "cyan" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 34, col: 0, kind: "wisp", color: null },
      { beat: 44, col: 1, color: "cyan" },
      { beat: 44, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 17, col: 10, row: 4, kind: "husk" },
      { beat: 39, col: 4, row: 4, kind: "husk" },
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
  {
    id: "theVolley",
    name: "THE VOLLEY",
    guide: {
      scene: "theVolley",
    },
    entries: [
      { beat: 0, col: 2, kind: "volley", color: "red" },
      { beat: 26, col: 8, kind: "volley", color: "cyan" },
    ],
  },
  {
    id: "theVolleyPair",
    name: "VOLLEY PARTY",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 8, kind: "volley", color: "cyan" },
      { beat: 11, col: 9, color: "cyan" },
      { beat: 15, col: 7, kind: "crystal", color: "red" },
      { beat: 20, col: 1, color: "cyan" },
      { beat: 25, col: 6, kind: "volley", color: "cyan" },
      { beat: 31, col: 5, color: "cyan" },
      { beat: 36, col: 8, kind: "shell", color: "red" },
    ],
  },
  {
    id: "theVolleyRecall",
    name: "VOLLEY LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 5, col: 9, kind: "volley", color: "cyan" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 16, col: 6, kind: "echo", color: "cyan" },
      { beat: 21, col: 8, color: "red" },
      { beat: 27, col: 0, kind: "volley", color: "red" },
      { beat: 34, col: 10, color: "red" },
      { beat: 40, col: 8, kind: "ghost", color: "cyan" },
    ],
  },
  {
    id: "theVolleyPeak",
    name: "VOLLEY APOCALYPSE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 7, kind: "volley", color: "red" },
      { beat: 8, col: 0, color: "red" },
      { beat: 16, col: 1, kind: "crystal", color: "cyan" },
      { beat: 23, col: 0, color: "red" },
      { beat: 23, col: 10, color: "red" },
      { beat: 30, col: 1, kind: "volley", color: "cyan" },
      { beat: 39, col: 0, color: "red" },
      { beat: 39, col: 10, color: "red" },
      { beat: 45, col: 3, kind: "volley", color: "red" },
      { beat: 48, col: 5, kind: "crystal", color: "red" },
    ],
    pods: [{ beat: 36, col: 9, row: 4, kind: "husk" }],
  },
  {
    id: "fillerGorgeBreathe",
    name: "GORGE DREAM",
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 8, col: 2, kind: "echo", color: "cyan" },
      { beat: 15, col: 0, color: "cyan" },
      { beat: 23, col: 5, kind: "meteorMedium", color: null },
      { beat: 31, col: 2, color: "cyan" },
      { beat: 39, col: 8, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "fillerGorgeRecall",
    name: "GORGE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 5, kind: "echo", color: "red" },
      { beat: 11, col: 3, color: "red" },
      { beat: 16, col: 6, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 28, col: 6, kind: "seeder", color: "cyan" },
      { beat: 33, col: 3, kind: "echo", color: "cyan" },
      { beat: 38, col: 3, color: "cyan" },
      { beat: 38, col: 6, color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "GORGE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 5, kind: "moult", color: null },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "cyan" },
      { beat: 18, col: 10, kind: "shell", color: "red" },
      { beat: 23, col: 7, kind: "wisp", color: null },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 6, color: "cyan" },
      { beat: 34, col: 9, kind: "moult", color: null },
      { beat: 40, col: 2, kind: "shell", color: "cyan" },
      { beat: 46, col: 2, color: "red" },
      { beat: 46, col: 8, color: "red" },
    ],
  },
  {
    id: "theGorge",
    name: "THE GORGE",
    guide: {
      scene: "theGorge",
    },
    entries: [
      { beat: 20, col: 2, kind: "meteor", color: null },
      { beat: 28, col: 8, kind: "meteor", color: null },
      { beat: 34, col: 5, color: "red" },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 46, col: 10, kind: "meteor", color: null },
      { beat: 52, col: 5, color: "cyan" },
      { beat: 60, col: 3, kind: "meteor", color: null },
      { beat: 66, col: 7, color: "red" },
      { beat: 74, col: 5, kind: "meteor", color: null },
      { beat: 82, col: 2, color: "cyan" },
    ],
    boss: { kind: "gorge", levels: GORGE_LEVELS },
    bossType: "normal",
  },
];
