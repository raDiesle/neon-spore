import { GIMBAL_SCRIPT } from "../gimbal-script.js";
import { GORGE_LEVELS } from "../gorge-levels.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 138 to 150 of the game, in the order they are played: THE VOLLEY's
 * block, the boss THE GORGE, THE HANDOVER's block, the boss THE GIMBAL, THE
 * CRAWLER's block, the boss THE UNDERTOW, THE FLIP's block and the boss THE
 * VANE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_9: Wave[] = [
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
    id: "theVolleyRecall",
    name: "VOLLEY LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 5, col: 7, kind: "volley", color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 18, col: 10, kind: "fence", color: null },
      { beat: 24, col: 3, color: "red" },
      { beat: 29, col: 10, kind: "volley", color: "cyan" },
      { beat: 37, col: 8, color: "cyan" },
      { beat: 43, col: 2, kind: "blister", color: null, row: 3 },
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
  {
    id: "theHandover",
    name: "THE HANDOVER",
    guide: {
      scene: "theHandover",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 8, kind: "meteor", color: null },
      { beat: 8, col: 2, color: "cyan" },
      { beat: 12, col: 7, color: "red" },
      { beat: 16, col: 3, color: "cyan" },
      { beat: 22, col: 10, color: "red" },
      { beat: 28, col: 0, color: "cyan" },
    ],
    faults: [{ kind: "handover", at: 11, beats: 10 }],
  },
  {
    id: "theLeak",
    name: "THE LEAK",
    variant: true,
    guide: {
      scene: "theLeak",
    },
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 1, col: 3, color: "cyan" },
      { beat: 2, col: 3, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 11, col: 8, color: "red" },
      { beat: 12, col: 8, color: "red" },
      { beat: 20, col: 2, color: "cyan" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 22, col: 2, color: "red" },
      { beat: 23, col: 2, color: "cyan" },
      { beat: 30, col: 0, color: "red" },
      { beat: 31, col: 0, color: "red" },
      { beat: 32, col: 0, color: "red" },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 35, col: 10, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theHandoverRecall",
    name: "HANDOVER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 1, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 6, col: 9, kind: "meteor", color: null, cross: -1, row: 7 },
      { beat: 11, col: 4, color: "red" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 22, col: 2, kind: "rind", color: "cyan" },
      { beat: 28, col: 5, color: "red" },
      { beat: 34, col: 10, kind: "seeder", color: "cyan" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 45, col: 4, kind: "meteor", color: null, cross: 1, row: 5 },
    ],
    faults: [{ kind: "handover", at: 11, beats: 10 }],
  },
  {
    id: "theGimbal",
    name: "THE GIMBAL",
    guide: {
      scene: "theGimbal",
    },
    entries: [],
    boss: { kind: "gimbal", marks: GIMBAL_SCRIPT },
    bossType: "normal",
  },
  {
    id: "theCrawler",
    name: "THE CRAWLER",
    guide: {
      scene: "theCrawler",
    },
    entries: [
      { beat: 0, col: 0, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 24, col: 10, kind: "crawler", color: null, segments: 5, side: "right" },
      { beat: 48, col: 0, kind: "crawler", color: null, segments: 7, side: "left" },
    ],
  },
  {
    id: "theCrawlerRecall",
    name: "CRAWLER LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "red" },
      { beat: 6, col: 10, kind: "crawler", color: null, segments: 7, side: "left" },
      { beat: 11, col: 4, color: "red" },
      { beat: 17, col: 2, kind: "strand", color: "red", beads: 2 },
      { beat: 23, col: 9, color: "red" },
      { beat: 28, col: 4, kind: "crawler", color: null, segments: 3, side: "left" },
      { beat: 33, col: 10, color: "red" },
      { beat: 38, col: 0, kind: "beatbox", color: null, beats: 3 },
      { beat: 46, col: 7, color: "red" },
    ],
  },
  {
    id: "theUndertow",
    name: "THE UNDERTOW",
    guide: {
      scene: "theUndertow",
    },
    entries: [
      { beat: 54, col: 2, color: "red" },
      { beat: 62, col: 8, color: "cyan" },
      { beat: 70, col: 0, color: "cyan" },
      { beat: 78, col: 10, color: "red" },
      { beat: 86, col: 3, color: "red" },
      { beat: 94, col: 7, color: "cyan" },
    ],
    boss: { kind: "undertow" },
    bossType: "normal",
  },
  {
    id: "theFlip",
    name: "THE FLIP",
    guide: {
      scene: "theFlip",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 10, col: 8, color: "red" },
      { beat: 14, col: 0, color: "cyan" },
      { beat: 18, col: 10, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "red" },
      { beat: 34, col: 8, color: "cyan" },
      { beat: 38, col: 0, color: "red" },
      { beat: 42, col: 5, color: "cyan" },
    ],
    faults: [{ kind: "flip", seat: 1, at: 6 }],
  },
  {
    id: "theFlipRecall",
    name: "OLD FLIP SONG",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 5, kind: "blister", color: null, row: 3 },
      { beat: 10, col: 9, color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 33, col: 0, kind: "blister", color: null, row: 2, gesture: "swipe" },
      { beat: 38, col: 2, color: "red" },
      { beat: 38, col: 8, color: "red" },
    ],
    pods: [
      { beat: 17, col: 0, row: 4, kind: "husk" },
      { beat: 27, col: 7, row: 3, kind: "pod" },
    ],
    faults: [{ kind: "flip", seat: 1, at: 6 }],
  },
  {
    id: "theVane",
    name: "THE VANE",
    entries: [
      { beat: 0, col: 2, kind: "meteor", color: null },
      { beat: 3, col: 8, color: "red" },
    ],
    boss: { kind: "vane" },
    bossType: "normal",
    controls: "standard5",
  },
];
