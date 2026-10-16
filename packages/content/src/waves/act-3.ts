import { SWINDLE_SCRIPT } from "../swindle-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 39 to 48 of the game, in the order they are played: THE HUSK's block
 * and the boss THE SWINDLE.
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
      { beat: 3, col: 0, color: "red" },
      { beat: 9, col: 10, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 2, row: 3, kind: "pod" },
      { beat: 0, col: 5, row: 4, kind: "husk" },
      { beat: 6, col: 8, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskAgain",
    name: "HELLO HUSK",
    variant: true,
    entries: [
      { beat: 7, col: 6, color: "red" },
      { beat: 13, col: 4, color: "red" },
      { beat: 27, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 4, row: 4, kind: "husk" },
      { beat: 20, col: 5, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskSpread",
    name: "HUSK DRIFT",
    variant: true,
    entries: [
      { beat: 5, col: 3, color: "cyan" },
      { beat: 12, col: 6, color: "cyan" },
      { beat: 22, col: 3, color: "cyan" },
      { beat: 29, col: 4, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 8, row: 4, kind: "husk" },
      { beat: 17, col: 2, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskReach",
    name: "HUSK AT WORLD END",
    variant: true,
    entries: [
      { beat: 5, col: 7, color: "cyan" },
      { beat: 11, col: 1, color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 27, col: 8, color: "cyan" },
    ],
    pods: [
      { beat: 0, col: 1, row: 4, kind: "husk" },
      { beat: 17, col: 10, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskPair",
    name: "HUSK ALLIANCE",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 22, col: 0, color: "cyan" },
      { beat: 33, col: 8, color: "red" },
    ],
    pods: [
      { beat: 5, col: 2, row: 4, kind: "husk" },
      { beat: 17, col: 6, row: 3, kind: "pod" },
      { beat: 28, col: 3, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskBreathe",
    name: "SLEEPY HUSK",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 13, col: 6, color: "cyan" },
      { beat: 27, col: 2, color: "cyan" },
      { beat: 39, col: 2, color: "cyan" },
    ],
    pods: [
      { beat: 7, col: 4, row: 4, kind: "husk" },
      { beat: 21, col: 7, row: 4, kind: "husk" },
      { beat: 33, col: 7, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskRecall",
    name: "OLD HUSK SONG",
    variant: true,
    entries: [
      { beat: 0, col: 3, color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 22, col: 4, color: "cyan" },
      { beat: 34, col: 3, color: "cyan" },
    ],
    pods: [
      { beat: 6, col: 8, row: 4, kind: "husk" },
      { beat: 17, col: 9, row: 4, kind: "husk" },
      { beat: 28, col: 9, row: 4, kind: "husk" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskBend",
    name: "HUSK SPELL",
    variant: true,
    entries: [
      { beat: 0, col: 6, color: "cyan" },
      { beat: 11, col: 9, color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 22, col: 7, color: "red" },
      { beat: 40, col: 4, color: "red" },
      { beat: 40, col: 7, color: "red" },
    ],
    pods: [
      { beat: 5, col: 7, row: 4, kind: "husk" },
      { beat: 17, col: 10, row: 3, kind: "pod" },
      { beat: 28, col: 2, row: 4, kind: "husk" },
      { beat: 34, col: 6, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theHuskPeak",
    name: "HUSK RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 8, col: 1, color: "red" },
      { beat: 16, col: 2, color: "red" },
      { beat: 16, col: 8, color: "red" },
      { beat: 28, col: 5, color: "red" },
      { beat: 28, col: 8, color: "red" },
      { beat: 40, col: 1, color: "red" },
      { beat: 40, col: 9, color: "red" },
    ],
    pods: [
      { beat: 4, col: 8, row: 4, kind: "husk" },
      { beat: 12, col: 7, row: 3, kind: "pod" },
      { beat: 20, col: 0, row: 4, kind: "husk" },
      { beat: 24, col: 4, row: 3, kind: "pod" },
      { beat: 32, col: 6, row: 4, kind: "husk" },
      { beat: 36, col: 3, row: 3, kind: "pod" },
    ],
    controls: "standard5",
  },
  {
    id: "theSwindle",
    name: "THE SWINDLE",
    guide: {
      both: "A slime hangs real pods and fake ones, and swaps them round. Swallow every real pod she lets go, and none of the fake ones.",
      p1: "1. Open the maw when your partner says real.\n2. Keep it shut when your partner says fake.",
      p2: "1. Watch the fake pods while she swaps them.\n2. Say real or fake as each one falls.\n3. Shoot a pod loose early if you like.",
    },
    entries: [],
    boss: { kind: "swindle", steps: SWINDLE_SCRIPT },
    bossType: "normal",
    controls: "standard5",
  },
];
