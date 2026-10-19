import { FILAMENT_SCRIPT } from "../filament-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 163 to 177 of the game, in the order they are played: THE VOLLEY's
 * review, the boss THE SCUTTLE, THE CRYSTAL's review, the boss THE ANTIPHON,
 * THE LID's review, the boss THE SPLICE, THE CLASP's review, the boss THE
 * CAIRN, THE MOULT's review, the boss THE WELL, THE BALLOON's review, the boss
 * THE REPRISE, THE CHOIR's review, the boss THE FILAMENT and THE FENCE's
 * review.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_11: Wave[] = [
  {
    id: "reviewVolleyRecall",
    name: "SCUTTLE LEGEND",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 5, col: 5, kind: "shell", color: "cyan" },
      { beat: 11, col: 6, color: "red" },
      { beat: 17, col: 8, kind: "meteor", color: null, cross: 1, row: 4 },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 28, col: 9, kind: "crystal", color: "red" },
      { beat: 34, col: 10, kind: "shell", color: "red" },
      { beat: 39, col: 1, color: "cyan" },
      { beat: 39, col: 9, color: "cyan" },
      { beat: 45, col: 10, kind: "meteor", color: null, cross: -1, row: 6 },
    ],
  },
  {
    id: "theScuttle",
    name: "THE SCUTTLE",
    guide: {
      scene: "theScuttle",
    },
    entries: [],
    boss: { kind: "scuttle" },
    bossType: "normal",
  },
  {
    id: "reviewCrystalRecall",
    name: "ANTIPHON RELIC",
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 1, kind: "seeder", color: "cyan" },
      { beat: 11, col: 3, color: "cyan" },
      { beat: 17, col: 9, kind: "lid", color: "red" },
      { beat: 23, col: 3, color: "red" },
      { beat: 23, col: 7, color: "red" },
      { beat: 29, col: 6, kind: "dart", color: "red" },
      { beat: 35, col: 1, kind: "seeder", color: "red" },
      { beat: 40, col: 2, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 5, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theAntiphon",
    name: "THE ANTIPHON",
    guide: {
      scene: "theAntiphon",
    },
    entries: [],
    boss: { kind: "antiphon" },
    bossType: "normal",
  },
  {
    id: "reviewLidRecall",
    name: "SPLICE HOMECOMING",
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 4, kind: "gyre", color: null },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 5, kind: "strand", color: "red", beads: 5 },
      { beat: 22, col: 0, color: "red" },
      { beat: 22, col: 10, color: "red" },
      { beat: 28, col: 10, kind: "shell", color: "red" },
      { beat: 36, col: 5, kind: "gyre", color: null },
      { beat: 41, col: 1, color: "cyan" },
      { beat: 41, col: 9, color: "cyan" },
      { beat: 47, col: 9, kind: "strand", color: "red", beads: 5 },
    ],
  },
  {
    id: "theSplice",
    name: "THE SPLICE",
    guide: {
      scene: "theSplice",
    },
    entries: [],
    boss: { kind: "splice", rounds: [{ beats: 18 }, { beats: 27 }, { beats: 36 }] },
    bossType: "special",
    controls: "splice",
  },
  {
    id: "reviewClaspRecall",
    name: "OLD CAIRN SONG",
    entries: [
      { beat: 0, col: 1, color: "cyan" },
      { beat: 5, col: 3, kind: "dart", color: "red" },
      { beat: 10, col: 4, color: "cyan" },
      { beat: 15, col: 10, kind: "magnet", color: "red" },
      { beat: 20, col: 3, color: "red" },
      { beat: 20, col: 7, color: "red" },
      { beat: 26, col: 5, kind: "meteor", color: null },
      { beat: 32, col: 6, kind: "dart", color: "cyan" },
      { beat: 38, col: 3, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 43, col: 8, kind: "magnet", color: "red" },
      { beat: 48, col: 4, kind: "meteor", color: null },
    ],
  },
  {
    id: "theCairn",
    name: "THE CAIRN",
    guide: {
      scene: "theCairn",
    },
    entries: [],
    boss: { kind: "cairn" },
    bossType: "normal",
  },
  {
    id: "reviewMoultRecall",
    name: "WELL LEGEND",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 12, col: 7, color: "red" },
      { beat: 17, col: 0, kind: "veil", color: null },
      { beat: 25, col: 0, color: "red" },
      { beat: 25, col: 10, color: "red" },
      { beat: 31, col: 3, kind: "moult", color: null },
      { beat: 43, col: 4, color: "red" },
      { beat: 43, col: 7, color: "red" },
    ],
    pods: [
      { beat: 6, col: 6, row: 4, kind: "husk" },
      { beat: 37, col: 10, row: 4, kind: "husk" },
    ],
  },
  {
    id: "theWell",
    name: "THE WELL",
    guide: {
      scene: "theWell",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 7, color: "cyan" },
      { beat: 18, col: 0, color: "cyan" },
      { beat: 26, col: 10, color: "red" },
      { beat: 38, col: 10, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 58, col: 5, color: "cyan" },
    ],
    boss: { kind: "well" },
    bossType: "special",
  },
  {
    id: "reviewBalloonRecall",
    name: "REPRISE REUNION",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 9, kind: "magnet", color: "red" },
      { beat: 13, col: 7, color: "cyan" },
      { beat: 19, col: 0, kind: "recoil", color: "red" },
      { beat: 24, col: 4, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 30, col: 8, kind: "choir", color: "red" },
      { beat: 36, col: 0, kind: "magnet", color: "cyan" },
      { beat: 43, col: 1, color: "red" },
      { beat: 43, col: 9, color: "red" },
    ],
  },
  {
    id: "theReprise",
    name: "THE REPRISE",
    guide: {
      scene: "theReprise",
    },
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 3, col: 5, color: "cyan" },
      { beat: 6, col: 10, color: "red" },
      { beat: 12, col: 3, color: "cyan" },
      { beat: 14, col: 7, color: "red" },
      { beat: 18, col: 0, color: "red" },
      { beat: 21, col: 10, color: "cyan" },
    ],
    boss: { kind: "reprise", beat: 12 },
    bossType: "normal",
  },
  {
    id: "reviewChoirRecall",
    name: "FILAMENT RELIC",
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 5, col: 6, kind: "choir", color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 16, col: 10, kind: "meteorMedium", color: null },
      { beat: 24, col: 0, color: "cyan" },
      { beat: 24, col: 10, color: "cyan" },
      { beat: 31, col: 9, kind: "recoil", color: "cyan" },
      { beat: 38, col: 0, kind: "choir", color: "red" },
      { beat: 44, col: 4, color: "red" },
      { beat: 44, col: 7, color: "red" },
    ],
  },
  {
    id: "theFilament",
    name: "THE FILAMENT",
    entries: [],
    boss: { kind: "filament", filaments: FILAMENT_SCRIPT },
    bossType: "normal",
    controls: "scene",
  },
  {
    id: "reviewFenceRecall",
    name: "SPOOL HOMECOMING",
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "dart", color: "cyan" },
      { beat: 11, col: 3, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 2, kind: "beatbox", color: null, beats: 4 },
      { beat: 23, col: 6, kind: "throb", color: "red" },
      { beat: 28, col: 1, color: "red" },
      { beat: 28, col: 9, color: "red" },
      { beat: 34, col: 3, kind: "dart", color: "cyan" },
      { beat: 40, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 46, col: 1, color: "cyan" },
      { beat: 46, col: 9, color: "cyan" },
    ],
  },
];
