import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 55 to 60 of the game, in the order they are played: the end of THE
 * HUSK's block, the filler before THE SWINDLE and the boss THE SWINDLE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_4: Wave[] = [
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
    name: "HUSK PICNIC",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 14, col: 4, color: "red" },
      { beat: 27, col: 8, color: "red" },
      { beat: 40, col: 6, color: "red" },
    ],
    pods: [
      { beat: 6, col: 2, row: 4, kind: "husk" },
      { beat: 20, col: 6, row: 4, kind: "husk" },
      { beat: 33, col: 2, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleRecall",
    name: "HUSK MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 11, col: 8, color: "cyan" },
      { beat: 21, col: 5, color: "cyan" },
      { beat: 32, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 4, row: 4, kind: "husk" },
      { beat: 16, col: 9, row: 4, kind: "husk" },
      { beat: 27, col: 1, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleBend",
    name: "HUSK TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 24, col: 3, color: "red" },
      { beat: 24, col: 6, color: "red" },
      { beat: 40, col: 4, color: "cyan" },
      { beat: 40, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 1, row: 4, kind: "husk" },
      { beat: 18, col: 4, row: 3, kind: "pod" },
      { beat: 29, col: 7, row: 4, kind: "husk" },
      { beat: 34, col: 5, row: 3, kind: "pod" },
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
