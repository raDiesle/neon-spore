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
      { beat: 0, col: 3, color: "red" },
      { beat: 13, col: 7, color: "cyan" },
      { beat: 26, col: 5, color: "cyan" },
      { beat: 38, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 7, col: 6, row: 4, kind: "husk" },
      { beat: 19, col: 8, row: 4, kind: "husk" },
      { beat: 32, col: 4, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleRecall",
    name: "HUSK MEMORY",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 12, col: 10, color: "cyan" },
      { beat: 26, col: 6, color: "cyan" },
      { beat: 38, col: 9, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 7, row: 4, kind: "husk" },
      { beat: 18, col: 1, row: 4, kind: "husk" },
      { beat: 32, col: 7, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerSwindleBend",
    name: "HUSK TRICK",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 22, col: 2, color: "cyan" },
      { beat: 22, col: 8, color: "cyan" },
      { beat: 42, col: 3, color: "cyan" },
      { beat: 42, col: 7, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 6, row: 4, kind: "husk" },
      { beat: 17, col: 9, row: 3, kind: "pod" },
      { beat: 30, col: 10, row: 4, kind: "husk" },
      { beat: 36, col: 5, row: 3, kind: "pod" },
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
      { beat: 13, col: 6, kind: "morsel", color: "red" },
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
      { beat: 0, col: 7, color: "cyan" },
      { beat: 5, col: 10, kind: "morsel", color: "cyan" },
      { beat: 10, col: 6, color: "red" },
      { beat: 21, col: 2, color: "red" },
      { beat: 26, col: 5, kind: "morsel", color: "cyan" },
      { beat: 32, col: 9, color: "cyan" },
    ],
    pods: [{ beat: 15, col: 1, row: 4, kind: "husk" }],
    controls: "standard5",
  },
  {
    id: "theMorselRecall",
    name: "MORSEL HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 7, color: "red" },
      { beat: 5, col: 2, kind: "morsel", color: "red" },
      { beat: 10, col: 4, color: "red" },
      { beat: 15, col: 6, kind: "morsel", color: "red" },
      { beat: 20, col: 9, color: "red" },
      { beat: 25, col: 10, kind: "morsel", color: "cyan" },
      { beat: 31, col: 2, color: "red" },
      { beat: 37, col: 9, kind: "morsel", color: "red" },
    ],
    controls: "standard5",
  },
  {
    id: "theMorselPeak",
    name: "MORSEL FURY",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "cyan" },
      { beat: 4, col: 10, kind: "morsel", color: "red" },
      { beat: 12, col: 2, color: "cyan" },
      { beat: 23, col: 1, color: "red" },
      { beat: 23, col: 9, color: "red" },
      { beat: 29, col: 1, kind: "torch", color: null },
      { beat: 34, col: 6, kind: "morsel", color: "red" },
      { beat: 39, col: 1, color: "red" },
      { beat: 39, col: 9, color: "red" },
      { beat: 47, col: 0, kind: "torch", color: null },
    ],
    pods: [
      { beat: 16, col: 0, row: 4, kind: "husk" },
      { beat: 43, col: 3, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBreathe",
    name: "MORSEL DREAM",
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 6, col: 5, kind: "morsel", color: "red" },
      { beat: 13, col: 8, color: "red" },
      { beat: 19, col: 6, kind: "meteor", color: null },
      { beat: 27, col: 3, color: "cyan" },
      { beat: 34, col: 5, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarRecall",
    name: "MORSEL LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "red" },
      { beat: 5, col: 8, kind: "morsel", color: "red" },
      { beat: 10, col: 10, color: "cyan" },
      { beat: 15, col: 8, kind: "morsel", color: "red" },
      { beat: 20, col: 4, color: "cyan" },
      { beat: 25, col: 6, kind: "morsel", color: "red" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 35, col: 8, kind: "morsel", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "fillerInstarBend",
    name: "TWISTED MORSEL",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "red" },
      { beat: 6, col: 7, kind: "morsel", color: "cyan" },
      { beat: 12, col: 5, color: "red" },
      { beat: 24, col: 3, color: "cyan" },
      { beat: 24, col: 7, color: "cyan" },
      { beat: 29, col: 6, kind: "morsel", color: "cyan" },
      { beat: 41, col: 3, color: "red" },
      { beat: 41, col: 7, color: "red" },
      { beat: 46, col: 6, kind: "morsel", color: "red" },
    ],
    pods: [
      { beat: 18, col: 6, row: 4, kind: "husk" },
      { beat: 35, col: 2, row: 4, kind: "husk" },
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
