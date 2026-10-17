import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 296 to 299 of the game, in the order they are played: the filler before
 * THE GORGE and the boss THE GORGE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_23: Wave[] = [
  {
    id: "fillerGorgeBreathe",
    name: "SLEEPY CLAW",
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 8, col: 7, kind: "strand", color: "cyan", beads: 3 },
      { beat: 15, col: 10, color: "red" },
      { beat: 21, col: 6, kind: "veer", color: null },
      { beat: 27, col: 5, color: "red" },
      { beat: 33, col: 7, kind: "seeder", color: "cyan" },
    ],
  },
  {
    id: "fillerGorgeRecall",
    name: "OLD CLAW SONG",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 6, col: 2, kind: "strand", color: "red", beads: 5 },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 1, kind: "meteor", color: null },
      { beat: 23, col: 3, color: "cyan" },
      { beat: 28, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 33, col: 8, color: "cyan" },
      { beat: 39, col: 4, kind: "meteor", color: null },
    ],
  },
  {
    id: "fillerGorgeBend",
    name: "CLAW SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 4, kind: "strand", color: "cyan", beads: 3 },
      { beat: 12, col: 1, color: "red" },
      { beat: 18, col: 0, kind: "veer", color: null },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 30, col: 4, kind: "strand", color: "red", beads: 5 },
      { beat: 36, col: 5, kind: "veer", color: null },
      { beat: 41, col: 3, color: "cyan" },
      { beat: 41, col: 7, color: "cyan" },
      { beat: 46, col: 8, kind: "strand", color: "cyan", beads: 3 },
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
