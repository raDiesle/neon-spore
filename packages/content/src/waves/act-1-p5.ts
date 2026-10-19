import type { Wave } from "../wave-types.js";

/**
 * Cut from `act-1-p4.ts` by the director's save when that file passed the
 * 250-line ceiling; it plays straight after it (`acts.ts`).
 */
export const WAVES_ACT_1_P5: Wave[] = [
  {
    id: "theLureRecall",
    name: "LURE REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 8, col: 3, kind: "lure", color: "cyan" },
      { beat: 16, col: 10, color: "cyan" },
      { beat: 23, col: 4, kind: "echo", color: "red" },
      { beat: 30, col: 9, color: "cyan" },
      { beat: 37, col: 1, kind: "lure", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theRind",
    name: "THE RIND",
    guide: {
      scene: "theRind",
    },
    entries: [
      { beat: 0, col: 5, kind: "rind", color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 18, col: 3, kind: "rind", color: "cyan" },
      { beat: 26, col: 8, kind: "rind", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theRindRecall",
    name: "ANCIENT RIND",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 7, col: 7, kind: "rind", color: "red" },
      { beat: 14, col: 2, color: "red" },
      { beat: 21, col: 3, kind: "throb", color: "red" },
      { beat: 28, col: 10, color: "cyan" },
      { beat: 35, col: 2, kind: "rind", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theDart",
    name: "THE DART",
    guide: {
      scene: "theDart",
    },
    entries: [
      { beat: 0, col: 5, kind: "dart", color: "red" },
      { beat: 8, col: 10, kind: "dart", color: "cyan" },
      { beat: 16, col: 2, kind: "dart", color: "red" },
      { beat: 24, col: 8, kind: "dart", color: "cyan" },
      { beat: 33, col: 3, kind: "dart", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theDartRecall",
    name: "DART HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 5, kind: "dart", color: "cyan" },
      { beat: 14, col: 10, color: "red" },
      { beat: 21, col: 0, kind: "throb", color: "red" },
      { beat: 29, col: 4, color: "cyan" },
      { beat: 37, col: 7, kind: "dart", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theCount",
    name: "THE COUNT",
    guide: {
      scene: "theCount",
    },
    entries: [
      { beat: 0, col: 5, kind: "countdown", color: "red" },
      { beat: 8, col: 2, kind: "countdown", color: "cyan" },
      { beat: 18, col: 3, kind: "countdown", color: "red" },
      { beat: 26, col: 8, kind: "countdown", color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theCountRecall",
    name: "ANCIENT COUNT",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 0, kind: "countdown", color: "red" },
      { beat: 14, col: 9, color: "red" },
      { beat: 21, col: 8, kind: "echo", color: "red" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 36, col: 2, kind: "countdown", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theGhost",
    name: "THE GHOST",
    guide: {
      scene: "theGhost",
    },
    entries: [
      { beat: 0, col: 3, kind: "ghost", color: "cyan" },
      { beat: 10, col: 2, kind: "ghost", color: "red" },
      { beat: 18, col: 2, kind: "ghost", color: "cyan", path: "across" },
    ],
    controls: "standard2",
  },
];
