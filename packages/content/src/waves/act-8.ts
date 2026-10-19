import { PULSE_STAGES } from "../pulse-stages.js";
import { SCOUT_ARENAS } from "../scout-arenas.js";
import { SCOUT_HAUL_ARENAS } from "../scout-haul-arenas.js";
import type { Wave } from "../wave-types.js";

/**
 * Waves 125 to 137 of the game, in the order they are played: the boss THE
 * SCOUT, THE CLASP's block, the boss THE BATON, THE LID's block, the boss THE
 * OCULUS, THE CODEX's block, the boss THE HAUL, THE CRYSTAL's block and the
 * boss THE PULSE.
 *
 * Cut by `bun run waves:order --write` (`waves-recut.ts`), which cuts every act
 * after the tutorial arc again in play order. A save that fills it cuts a page
 * after it (`acts.ts`).
 */
export const WAVES_ACT_8: Wave[] = [
  {
    id: "theScout",
    name: "THE SCOUT",
    guide: {
      scene: "theScout",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theClasp",
    name: "THE CLASP",
    hints: "theClasp",
    entries: [
      { beat: 0, col: 5, kind: "clasp", color: "cyan" },
      { beat: 6, col: 2, kind: "clasp", color: "red" },
      { beat: 12, col: 8, kind: "clasp", color: "red" },
      { beat: 20, col: 3, kind: "clasp", color: "cyan" },
      { beat: 28, col: 7, kind: "clasp", color: "cyan" },
    ],
  },
  {
    id: "theClaspRecall",
    name: "CLASP HOMECOMING",
    variant: true,
    entries: [
      { beat: 0, col: 2, color: "cyan" },
      { beat: 5, col: 7, kind: "clasp", color: "cyan" },
      { beat: 11, col: 2, color: "red" },
      { beat: 17, col: 10, kind: "lure", color: "red" },
      { beat: 22, col: 3, color: "red" },
      { beat: 30, col: 2, kind: "clasp", color: "red" },
      { beat: 36, col: 1, color: "red" },
      { beat: 41, col: 4, kind: "rind", color: "cyan" },
      { beat: 46, col: 1, color: "cyan" },
    ],
  },
  {
    id: "theBaton",
    name: "THE BATON",
    guide: {
      scene: "theBaton",
    },
    entries: [],
    boss: { kind: "baton" },
    bossType: "normal",
  },
  {
    id: "theLid",
    name: "THE LID",
    guide: {
      scene: "theLid",
    },
    entries: [
      { beat: 0, col: 5, kind: "lid", color: "cyan" },
      { beat: 14, col: 2, kind: "lid", color: "red" },
      { beat: 24, col: 8, kind: "lid", color: "red" },
    ],
  },
  {
    id: "theLidRecall",
    name: "ANCIENT LID",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "cyan" },
      { beat: 5, col: 10, kind: "lid", color: "cyan" },
      { beat: 10, col: 5, color: "red" },
      { beat: 15, col: 1, kind: "beatbox", color: null, beats: 4 },
      { beat: 21, col: 3, color: "red" },
      { beat: 27, col: 7, kind: "lid", color: "cyan" },
      { beat: 32, col: 1, color: "red" },
      { beat: 38, col: 10, kind: "fence", color: null },
      { beat: 46, col: 1, color: "red" },
    ],
  },
  {
    id: "theOculus",
    name: "THE OCULUS",
    guide: {
      both: "Shut the eye's leaves together, three times: hold, then tap, then turn. After each, shoot the eye in its colour. Shoot what falls in between.",
      p1: "1. Hold the left half with the other one.\n2. Then tap it. Then turn it round.\n3. When the eye shows a colour, fire it.",
      p2: "1. Hold the right half with the other one.\n2. Then tap it. Then turn it round.\n3. White takes either colour.",
    },
    entries: [
      { beat: 6, col: 0, color: "red" },
      { beat: 11, col: 10, color: "cyan" },
      { beat: 16, col: 2, color: "red" },
      { beat: 21, col: 8, color: "cyan" },
      { beat: 26, col: 0, color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 36, col: 2, color: "red" },
      { beat: 41, col: 8, color: "cyan" },
      { beat: 46, col: 0, color: "red" },
      { beat: 51, col: 10, color: "cyan" },
      { beat: 56, col: 2, color: "red" },
      { beat: 61, col: 8, color: "cyan" },
      { beat: 66, col: 0, color: "red" },
      { beat: 71, col: 10, color: "cyan" },
      { beat: 76, col: 2, color: "red" },
      { beat: 81, col: 8, color: "cyan" },
      { beat: 86, col: 0, color: "red" },
    ],
    boss: {
      kind: "oculus",
      steps: [
        { ask: "shut", color: "either", beats: 6, fuse: 32 },
        { ask: "break", color: "either", beats: 2 },
        { ask: "fire", color: "red", beats: 0 },
        { ask: "tap", color: "either", beats: 32, need: 12 },
        { ask: "fire", color: "cyan", beats: 0 },
        { ask: "turn", color: "either", beats: 32, need: 8 },
        { ask: "fire", color: "either", beats: 0 },
      ],
    },
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
    id: "theCodexRecall",
    name: "CODEX LEGEND",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 5, col: 7, kind: "meteorMedium", color: null },
      { beat: 11, col: 0, color: "red" },
      { beat: 21, col: 2, color: "cyan" },
      { beat: 27, col: 1, kind: "torch", color: null },
      { beat: 33, col: 10, color: "cyan" },
      { beat: 41, col: 6, kind: "meteorMedium", color: null },
      { beat: 47, col: 1, color: "cyan" },
    ],
    pods: [{ beat: 16, col: 5, row: 4, kind: "husk" }],
    faults: [{ kind: "codex" }],
  },
  {
    id: "theHaul",
    name: "THE HAUL",
    guide: {
      scene: "theHaul",
    },
    entries: [],
    boss: { kind: "scout", arenas: SCOUT_HAUL_ARENAS },
    bossType: "special",
    controls: "scout",
  },
  {
    id: "theCrystal",
    name: "THE CRYSTAL",
    hints: "theCrystal",
    entries: [
      { beat: 0, col: 0, kind: "crystal", color: "red" },
      { beat: 20, col: 10, kind: "crystal", color: "cyan" },
      { beat: 40, col: 2, kind: "crystal", color: "cyan" },
      { beat: 46, col: 8, kind: "crystal", color: "red" },
    ],
  },
  {
    id: "theCrystalRecall",
    name: "CRYSTAL REUNION",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 6, kind: "crystal", color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 0, kind: "magnet", color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 30, col: 0, kind: "crystal", color: "red" },
      { beat: 35, col: 4, color: "cyan" },
      { beat: 41, col: 0, kind: "countdown", color: "cyan" },
      { beat: 46, col: 5, color: "cyan" },
    ],
  },
  {
    id: "pulse",
    name: "THE PULSE",
    guide: {
      scene: "thePulse",
    },
    entries: [],
    boss: { kind: "pulse", stages: PULSE_STAGES },
    bossType: "special",
    controls: "pulse",
  },
];
