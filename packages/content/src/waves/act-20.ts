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
      { beat: 0, col: 10, color: "cyan" },
      { beat: 7, col: 0, kind: "torch", color: null },
      { beat: 15, col: 5, color: "cyan" },
      { beat: 21, col: 8, kind: "lid", color: "cyan" },
      { beat: 28, col: 4, color: "red" },
      { beat: 36, col: 5, kind: "veil", color: null },
    ],
  },
  {
    id: "fillerPulseRecall",
    name: "PULSE HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 6, col: 5, kind: "beatbox", color: null, beats: 3 },
      { beat: 11, col: 1, color: "red" },
      { beat: 16, col: 6, kind: "lure", color: "cyan" },
      { beat: 21, col: 4, color: "red" },
      { beat: 21, col: 7, color: "red" },
      { beat: 27, col: 7, kind: "fence", color: null },
      { beat: 32, col: 6, kind: "beatbox", color: null, beats: 4 },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
    ],
  },
  {
    id: "fillerPulseBend",
    name: "PULSE ILLUSION",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 5, col: 3, kind: "balloon", color: null },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 11, col: 7, color: "cyan" },
      { beat: 17, col: 10, kind: "ghost", color: "cyan", path: "across" },
      { beat: 22, col: 3, kind: "magnet", color: "red" },
      { beat: 30, col: 1, color: "cyan" },
      { beat: 30, col: 9, color: "cyan" },
      { beat: 36, col: 4, kind: "balloon", color: null },
      { beat: 42, col: 0, kind: "ghost", color: "cyan" },
      { beat: 48, col: 2, color: "cyan" },
      { beat: 48, col: 8, color: "cyan" },
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
      { beat: 0, col: 10, color: "red" },
      { beat: 4, col: 3, kind: "volley", color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 16, col: 3, kind: "crystal", color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 28, col: 8, kind: "volley", color: "red" },
      { beat: 34, col: 10, color: "red" },
      { beat: 38, col: 7, kind: "blister", color: null, row: 3, by: "both", gesture: "hold" },
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
      { beat: 16, col: 6, kind: "shell", color: "cyan" },
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
      { beat: 0, col: 6, color: "red" },
      { beat: 7, col: 1, kind: "rind", color: "red" },
      { beat: 14, col: 8, color: "cyan" },
      { beat: 22, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 29, col: 2, color: "cyan" },
      { beat: 36, col: 9, kind: "dart", color: "red" },
    ],
  },
  {
    id: "fillerGorgeRecall",
    name: "GORGE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 3, kind: "magnet", color: "cyan" },
      { beat: 11, col: 0, color: "red" },
      { beat: 16, col: 6, kind: "lid", color: "cyan" },
      { beat: 21, col: 5, color: "red" },
      { beat: 21, col: 8, color: "red" },
      { beat: 27, col: 3, kind: "seeder", color: "red" },
      { beat: 33, col: 4, kind: "magnet", color: "cyan" },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "GORGE MIRAGE",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 8, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 11, col: 4, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 16, col: 1, kind: "veil", color: null },
      { beat: 22, col: 5, kind: "moult", color: null },
      { beat: 27, col: 1, color: "red" },
      { beat: 27, col: 9, color: "red" },
      { beat: 32, col: 10, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 38, col: 3, kind: "veil", color: null },
      { beat: 43, col: 2, color: "red" },
      { beat: 43, col: 8, color: "red" },
      { beat: 48, col: 2, kind: "moult", color: null },
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
