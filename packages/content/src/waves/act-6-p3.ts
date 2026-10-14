import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-6-p2.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_6_P3: Wave[] = [
  {
    id: "theVeerBreathe",
    name: "EASY VEERS",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "cyan" },
      { beat: 6, col: 0, kind: "veer", color: null },
      { beat: 13, col: 4, color: "cyan" },
      { beat: 19, col: 0, kind: "volley", color: "red" },
      { beat: 26, col: 2, color: "red" },
      { beat: 34, col: 7, kind: "carom", color: "cyan" },
    ],
  },
  {
    id: "theVeerRecall",
    name: "VEER RECALL",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 6, col: 10, kind: "veer", color: null },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 10, kind: "ghost", color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 1, kind: "veer", color: null },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 39, col: 2, kind: "ghost", color: "red" },
    ],
  },
  {
    id: "theVeerBend",
    name: "VEERS AND TWINS",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 7, kind: "veer", color: null },
      { beat: 11, col: 5, color: "cyan" },
      { beat: 17, col: 6, kind: "volley", color: "red" },
      { beat: 23, col: 0, color: "cyan" },
      { beat: 23, col: 10, color: "cyan" },
      { beat: 29, col: 8, kind: "veer", color: null },
      { beat: 35, col: 4, kind: "volley", color: "red" },
      { beat: 40, col: 3, color: "cyan" },
      { beat: 40, col: 6, color: "cyan" },
      { beat: 45, col: 7, kind: "veer", color: null },
    ],
  },
  {
    id: "theVeerPeak",
    name: "VEER PEAK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 4, col: 4, kind: "veer", color: null },
      { beat: 8, col: 2, color: "red" },
      { beat: 12, col: 0, kind: "volley", color: "cyan" },
      { beat: 15, col: 1, color: "cyan" },
      { beat: 15, col: 9, color: "cyan" },
      { beat: 22, col: 4, kind: "veer", color: null },
      { beat: 26, col: 2, color: "red" },
      { beat: 26, col: 8, color: "red" },
      { beat: 30, col: 10, kind: "volley", color: "red" },
      { beat: 37, col: 2, color: "red" },
      { beat: 37, col: 8, color: "red" },
      { beat: 41, col: 4, kind: "veer", color: null },
      { beat: 45, col: 7, kind: "volley", color: "cyan" },
    ],
    pods: [
      { beat: 19, col: 6, row: 3, kind: "ward" },
      { beat: 34, col: 0, row: 4, kind: "ward" },
    ],
  },
  {
    id: "theStrand",
    name: "THE STRAND",
    guide: {
      scene: "theStrand",
    },
    entries: [
      { beat: 0, col: 5, kind: "strand", color: "red", beads: 2 },
      { beat: 18, col: 2, kind: "strand", color: "cyan", beads: 3 },
      { beat: 36, col: 2, kind: "strand", color: "red", beads: 5 },
    ],
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
    id: "theFence",
    name: "THE FENCE",
    guide: {
      scene: "theFence",
    },
    entries: [
      { beat: 0, col: 5, kind: "fence", color: null },
      { beat: 12, col: 5, kind: "fence", color: null },
      { beat: 24, col: 5, kind: "fence", color: null },
    ],
  },
];
