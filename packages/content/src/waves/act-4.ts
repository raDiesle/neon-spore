import { INSTAR_SCRIPT } from "../instar-script.js";
import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 53 to 66 of the game, in the order they are played: the filler before
 * THE SWINDLE, the boss THE SWINDLE, THE MORSEL's block, the filler before THE
 * INSTAR and the boss THE INSTAR.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_4: Wave[] = [
  {
    id: "fillerSwindleBreathe",
    name: "HUSK PICNIC",
    entries: [
      { beat: 0, col: 7, color: "cyan" },
      { beat: 13, col: 3, color: "red" },
      { beat: 25, col: 8, color: "red" },
      { beat: 38, col: 4, color: "red" },
    ],
    pods: [
      { beat: 7, col: 6, row: 4, kind: "husk" },
      { beat: 19, col: 4, row: 4, kind: "husk" },
      { beat: 32, col: 2, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleRecall",
    name: "HUSK MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 12, col: 1, color: "red" },
      { beat: 23, col: 0, color: "red" },
      { beat: 33, col: 7, color: "red" },
    ],
    pods: [
      { beat: 6, col: 8, row: 4, kind: "husk" },
      { beat: 18, col: 10, row: 4, kind: "husk" },
      { beat: 28, col: 6, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleBend",
    name: "HUSK TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 11, col: 2, color: "cyan" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 40, col: 5, color: "red" },
      { beat: 40, col: 8, color: "red" },
    ],
    pods: [
      { beat: 5, col: 10, row: 4, kind: "husk" },
      { beat: 17, col: 7, row: 3, kind: "pod" },
      { beat: 28, col: 4, row: 4, kind: "husk" },
      { beat: 34, col: 10, row: 3, kind: "pod" },
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
    id: "theMorselReach",
    name: "MORSEL HORIZON",
    variant: true,
    entries: [
      { beat: 0, col: 1, kind: "morsel", color: "red" },
      { beat: 5, col: 5, kind: "morsel", color: "red" },
      { beat: 10, col: 10, kind: "morsel", color: "red" },
      { beat: 16, col: 6, kind: "morsel", color: "red" },
      { beat: 21, col: 10, kind: "morsel", color: "red" },
      { beat: 27, col: 5, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPair",
    name: "MORSEL DUET",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 6, col: 3, kind: "morsel", color: "cyan" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 28, col: 6, kind: "morsel", color: "cyan" },
      { beat: 32, col: 7, color: "red" },
    ],
    pods: [{ beat: 18, col: 4, row: 4, kind: "husk" }],
    controls: "standard5",
  },
  {
    id: "theMorselRecall",
    name: "MORSEL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "red" },
      { beat: 6, col: 3, kind: "morsel", color: "red" },
      { beat: 11, col: 6, color: "red" },
      { beat: 16, col: 2, kind: "morsel", color: "red" },
      { beat: 22, col: 9, color: "red" },
      { beat: 28, col: 10, kind: "morsel", color: "red" },
      { beat: 34, col: 2, color: "red" },
      { beat: 40, col: 9, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPeak",
    name: "MORSEL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 0, kind: "morsel", color: "red" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 20, col: 0, kind: "torch", color: null },
      { beat: 24, col: 6, kind: "morsel", color: "red" },
      { beat: 28, col: 5, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 36, col: 8, kind: "torch", color: null },
      { beat: 40, col: 0, color: "cyan" },
      { beat: 40, col: 10, color: "cyan" },
      { beat: 44, col: 8, kind: "morsel", color: "cyan" },
    ],
    pods: [
      { beat: 12, col: 9, row: 4, kind: "husk" },
      { beat: 32, col: 7, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBreathe",
    name: "MORSEL DREAM",
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 8, col: 2, kind: "morsel", color: "cyan" },
      { beat: 14, col: 3, color: "red" },
      { beat: 20, col: 6, kind: "meteor", color: null },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 33, col: 5, kind: "morsel", color: "cyan" },
      { beat: 40, col: 3, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarRecall",
    name: "MORSEL LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 6, kind: "morsel", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 15, col: 3, kind: "torch", color: null },
      { beat: 21, col: 10, color: "red" },
      { beat: 26, col: 8, kind: "morsel", color: "red" },
      { beat: 31, col: 0, color: "red" },
      { beat: 36, col: 1, kind: "torch", color: null },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBend",
    name: "TWISTED MORSEL",
    variant: true,
    entries: [
      { beat: 0, col: 10, color: "cyan" },
      { beat: 6, col: 4, kind: "morsel", color: "cyan" },
      { beat: 11, col: 3, color: "red" },
      { beat: 22, col: 5, color: "red" },
      { beat: 22, col: 8, color: "red" },
      { beat: 28, col: 3, kind: "morsel", color: "cyan" },
      { beat: 39, col: 2, color: "cyan" },
      { beat: 39, col: 8, color: "cyan" },
      { beat: 45, col: 9, kind: "morsel", color: "cyan" },
    ],
    pods: [
      { beat: 16, col: 0, row: 4, kind: "husk" },
      { beat: 33, col: 0, row: 4, kind: "husk" },
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
