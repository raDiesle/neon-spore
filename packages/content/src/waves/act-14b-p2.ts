import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-14b.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_14B_P2: Wave[] = [
  {
    id: "theWeight",
    name: "THE WEIGHT",
    guide: {
      scene: "theWeight",
    },
    entries: [
      { beat: 0, col: 5, kind: "weight", color: null },
      { beat: 14, col: 8, kind: "weight", color: null },
      { beat: 18, col: 3, color: "red" },
      { beat: 30, col: 2, kind: "weight", color: null },
      { beat: 32, col: 10, kind: "weight", color: null },
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
    id: "theCodex",
    name: "THE CODEX",
    guide: {
      scene: "theCodex",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 6, col: 7, color: "cyan" },
      { beat: 14, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 34, col: 10, color: "cyan" },
      { beat: 36, col: 3, color: "cyan" },
    ],
    faults: [{ kind: "codex" }],
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
];
