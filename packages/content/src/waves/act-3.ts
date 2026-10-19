import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 120 to 132 of the game, in the order they are played: THE HUSK's block,
 * the filler before THE SWINDLE and the boss THE SWINDLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_3: Wave[] = [
  {
    id: "theHusk",
    name: "THE HUSK",
    guide: {
      scene: "theHusk",
    },
    entries: [
      { beat: 3, col: 4, color: "red" },
      { beat: 11, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 4, row: 3, kind: "pod" },
      { beat: 0, col: 5, row: 4, kind: "husk" },
      { beat: 6, col: 6, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskPair",
    name: "HUSK TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 23, col: 5, color: "cyan" },
      { beat: 33, col: 4, color: "red" },
    ],
    pods: [
      { beat: 7, col: 0, row: 4, kind: "husk" },
      { beat: 15, col: 6, row: 3, kind: "pod" },
      { beat: 28, col: 9, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskRecall",
    name: "ANCIENT HUSK",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 11, col: 7, color: "red" },
      { beat: 17, col: 4, kind: "meteor", color: null },
      { beat: 23, col: 10, color: "red" },
      { beat: 37, col: 5, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 2, row: 4, kind: "husk" },
      { beat: 29, col: 1, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskPeak",
    name: "HUSK RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 8, col: 3, color: "red" },
      { beat: 19, col: 1, color: "red" },
      { beat: 19, col: 9, color: "red" },
      { beat: 28, col: 10, kind: "meteor", color: null },
      { beat: 32, col: 3, color: "cyan" },
      { beat: 32, col: 6, color: "cyan" },
      { beat: 45, col: 4, color: "red" },
      { beat: 45, col: 7, color: "red" },
    ],
    pods: [
      { beat: 4, col: 1, row: 4, kind: "husk" },
      { beat: 11, col: 10, row: 3, kind: "pod" },
      { beat: 24, col: 7, row: 4, kind: "husk" },
      { beat: 36, col: 9, row: 4, kind: "husk" },
      { beat: 41, col: 3, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theRoe",
    name: "THE ROE",
    variant: true,
    setPiece: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 8, col: 8, color: "cyan" },
      { beat: 20, col: 3, color: "red" },
    ],
    pods: [
      { beat: 2, col: 5, row: 1, kind: "pod", due: 24, roe: true },
      { beat: 2, col: 5, row: 4, kind: "pod", due: 24, roe: true },
      { beat: 2, col: 5, row: 7, kind: "pod", due: 24, roe: true },
      { beat: 16, col: 8, row: 2, kind: "pod", due: 24, roe: true },
      { beat: 16, col: 8, row: 5, kind: "pod", due: 24, roe: true },
      { beat: 16, col: 8, row: 8, kind: "pod", due: 24, roe: true },
    ],
    controls: "standard5",
  },
  {
    id: "theClutch",
    name: "THE CLUTCH",
    variant: true,
    setPiece: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 10, col: 1, color: "cyan" },
      { beat: 20, col: 5, color: "red" },
    ],
    pods: [
      { beat: 2, col: 2, row: 3, kind: "pod", due: 32 },
      { beat: 2, col: 4, row: 5, kind: "husk", due: 32 },
      { beat: 2, col: 6, row: 3, kind: "pod", due: 32 },
      { beat: 2, col: 8, row: 5, kind: "pod", due: 32 },
    ],
    controls: "standard5",
  },
  {
    id: "theDrop",
    name: "THE DROP",
    variant: true,
    setPiece: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 12, col: 8, color: "red" },
      { beat: 24, col: 3, color: "red" },
    ],
    pods: [
      { beat: 2, col: 4, row: 3, kind: "pod", due: 24 },
      { beat: 2, col: 7, row: 3, kind: "husk", due: 24, drop: 6 },
      { beat: 16, col: 2, row: 4, kind: "pod", due: 20 },
      { beat: 16, col: 6, row: 2, kind: "husk", due: 20, drop: 4 },
    ],
    controls: "standard5",
  },
  {
    id: "theWatch",
    name: "THE WATCH",
    variant: true,
    setPiece: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 12, col: 1, color: "cyan" },
      { beat: 24, col: 6, color: "cyan" },
    ],
    pods: [
      { beat: 2, col: 2, row: 3, kind: "pod", due: 14, clockP1: true },
      { beat: 2, col: 5, row: 2, kind: "pod", due: 30, clockP1: true },
      { beat: 2, col: 8, row: 4, kind: "pod", due: 22, clockP1: true },
    ],
    controls: "standard5",
  },
  {
    id: "theNeighbour",
    name: "THE NEIGHBOUR",
    variant: true,
    setPiece: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 12, col: 9, color: "cyan" },
      { beat: 24, col: 5, color: "red" },
    ],
    pods: [
      { beat: 2, col: 3, row: 3, kind: "pod", due: 24 },
      { beat: 2, col: 4, row: 5, kind: "husk", due: 24 },
      { beat: 16, col: 7, row: 5, kind: "pod", due: 24 },
      { beat: 16, col: 6, row: 3, kind: "husk", due: 24 },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleBreathe",
    name: "SWINDLE DREAM",
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 8, col: 2, kind: "rind", color: "cyan" },
      { beat: 16, col: 5, color: "cyan" },
      { beat: 24, col: 6, kind: "torch", color: null },
      { beat: 30, col: 4, color: "cyan" },
      { beat: 36, col: 7, kind: "blister", color: null, row: 3 },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleRecall",
    name: "ANCIENT SWINDLE",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 0, kind: "strand", color: "red", beads: 2 },
      { beat: 11, col: 4, color: "cyan" },
      { beat: 23, col: 4, color: "cyan" },
      { beat: 28, col: 9, kind: "shell", color: "red" },
      { beat: 34, col: 5, color: "cyan" },
      { beat: 40, col: 4, kind: "strand", color: "red", beads: 2 },
    ],
    pods: [{ beat: 17, col: 5, row: 3, kind: "pod" }],
    controls: "standard5",
  },
  {
    id: "fillerSwindleBend",
    name: "SWINDLE TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 6, col: 10, kind: "blister", color: null, row: 3 },
      { beat: 12, col: 3, color: "red" },
      { beat: 18, col: 2, kind: "meteor", color: null },
      { beat: 24, col: 4, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 29, col: 7, kind: "shell", color: "cyan" },
      { beat: 35, col: 8, kind: "blister", color: null, row: 3 },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
      { beat: 45, col: 7, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theSwindle",
    name: "THE SWINDLE",
    guide: {
      both: "A slime hangs real pods and fake ones, and swaps them round. Swallow every real pod she lets go, and none of the fake ones.",
      p1: "1. Open the maw when your partner says real.\n2. Keep it shut when your partner says fake.",
      p2: "1. Watch the fake pods while she swaps them.\n2. Say real or fake as each one falls.",
    },
    entries: [],
    boss: { kind: "swindle", steps: SWINDLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
