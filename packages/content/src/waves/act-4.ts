import { INSTAR_SCRIPT } from "../instar-script.js";
import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 51 to 63 of the game, in the order they are played: the end of THE
 * HUSK's block, the boss THE SWINDLE, THE MORSEL's block and the boss THE
 * INSTAR.
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
  {
    id: "theMorsel",
    name: "THE MORSEL",
    guide: {
      scene: "theMorsel",
    },
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 5, kind: "morsel", color: "red" },
      { beat: 18, col: 7, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselAgain",
    name: "MORSEL AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 4, kind: "morsel", color: "red" },
      { beat: 6, col: 5, kind: "morsel", color: "cyan" },
      { beat: 13, col: 4, kind: "morsel", color: "cyan" },
      { beat: 21, col: 5, kind: "morsel", color: "red" },
      { beat: 29, col: 6, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselSpread",
    name: "MORSEL RAIN",
    variant: true,
    entries: [
      { beat: 0, col: 2, kind: "morsel", color: "cyan" },
      { beat: 7, col: 5, kind: "morsel", color: "cyan" },
      { beat: 12, col: 8, kind: "morsel", color: "red" },
      { beat: 17, col: 5, kind: "morsel", color: "red" },
      { beat: 24, col: 3, kind: "morsel", color: "cyan" },
      { beat: 30, col: 5, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselReach",
    name: "MORSEL HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 10, kind: "morsel", color: "red" },
      { beat: 5, col: 6, kind: "morsel", color: "red" },
      { beat: 11, col: 2, kind: "morsel", color: "cyan" },
      { beat: 17, col: 7, kind: "morsel", color: "cyan" },
      { beat: 22, col: 3, kind: "morsel", color: "red" },
      { beat: 27, col: 9, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPair",
    name: "MORSEL DUET",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 6, col: 2, kind: "morsel", color: "red" },
      { beat: 10, col: 3, color: "red" },
      { beat: 21, col: 4, color: "red" },
      { beat: 27, col: 2, kind: "morsel", color: "red" },
      { beat: 33, col: 9, color: "red" },
    ],
    pods: [{ beat: 15, col: 8, row: 4, kind: "husk" }],
    controls: "standard5",
  },
  {
    id: "theMorselBreathe",
    name: "MORSEL HUSH",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 6, col: 5, kind: "morsel", color: "red" },
      { beat: 14, col: 7, color: "red" },
      { beat: 21, col: 6, kind: "meteor", color: null },
      { beat: 29, col: 7, color: "cyan" },
      { beat: 37, col: 8, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselRecall",
    name: "MORSEL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 6, col: 5, kind: "morsel", color: "red" },
      { beat: 12, col: 6, color: "red" },
      { beat: 17, col: 5, kind: "meteor", color: null },
      { beat: 22, col: 7, color: "cyan" },
      { beat: 27, col: 3, kind: "morsel", color: "cyan" },
      { beat: 32, col: 4, color: "cyan" },
      { beat: 38, col: 7, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselBend",
    name: "MORSEL PARADOX",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 6, col: 5, kind: "morsel", color: "red" },
      { beat: 11, col: 4, color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 6, color: "red" },
      { beat: 27, col: 3, kind: "morsel", color: "red" },
      { beat: 38, col: 4, color: "red" },
      { beat: 38, col: 7, color: "red" },
      { beat: 43, col: 8, kind: "morsel", color: "red" },
    ],
    pods: [
      { beat: 17, col: 7, row: 4, kind: "husk" },
      { beat: 33, col: 7, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPeak",
    name: "MORSEL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 4, col: 7, kind: "morsel", color: "red" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 4, color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
      { beat: 20, col: 7, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 24, col: 8, kind: "morsel", color: "cyan" },
      { beat: 28, col: 3, color: "cyan" },
      { beat: 28, col: 7, color: "cyan" },
      { beat: 36, col: 6, kind: "blister", color: null, row: 2, by: 2, gesture: "swipe" },
      { beat: 40, col: 5, color: "cyan" },
      { beat: 40, col: 8, color: "cyan" },
      { beat: 44, col: 4, kind: "morsel", color: "cyan" },
    ],
    pods: [
      { beat: 12, col: 2, row: 4, kind: "husk" },
      { beat: 32, col: 4, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theInstar",
    name: "THE INSTAR",
    entries: [],
    boss: { kind: "instar", steps: INSTAR_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
