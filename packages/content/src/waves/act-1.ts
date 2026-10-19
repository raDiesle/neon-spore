import { BROOD_SCRIPT } from "../brood-script.js";
import { MOTH_SCRIPT } from "../moth-script.js";
import type { Wave } from "../wave-types.js";

/**
 * Act one: the tutorial arc. Every wave here teaches exactly one thing on top
 * of the ones before it, and it ends on `FINALE`, which asks for all of them
 * at once. `waves.ts` is the barrel that concatenates this with the other
 * acts — see it for why the list was split by act in the first place.
 *
 * **TWO COLOURS carries no guide, and it used to.** CYAN introduces the second
 * colour a wave earlier now and shows what the wrong one costs, so a guide here
 * would be the same lesson twice in consecutive waves — padding, whichever of
 * the two was written first. What is left for that wave to be is the first time
 * both colours arrive inside one wave: nothing new to learn, one thing to keep
 * straight. The note is up here rather than beside the wave because the
 * director rebuilds the array on every save and keeps only what stands above it
 * (`tools/director/src/serialize.ts`) — a comment inside an entry is a comment
 * with one save left to live.
 *
 * **CYAN's and THE ROCK's waves open in the middle and leave room** (the
 * owner, 16 October 2026): the first body falls on the cannon's own column,
 * and nothing asks for a new column sooner than six beats after the last.
 *
 * **The panel grows with the arc**, which is the other half of the same rule.
 * The first eight waves name a rung of the standard ladder rather than the
 * standard panel — STANDARD 1 through 4, each one button more than the one
 * before it (`control-sets-table.ts`) — so a pair meeting the game is handed
 * exactly the controls the wave they are on asks for, in the places those
 * controls will keep for the rest of the game. SALVAGE is where the full
 * panel arrives, because the maw is the last thing the ladder holds back and
 * the pod is the one thing in the game that asks for it.
 *
 * **Fourteen bodies come between THE BROOD and THE ROCK, on STANDARD 2**
 * (the owner, 18 October 2026): the ones that ask for nothing but the cannon,
 * its strip and the two colours — SHELL, MAGNET, THROB, ECHO, RECOIL, GYRE,
 * LURE, RIND, STRAND, VEIL, DART, COUNT, GHOST and WISP, in that order. Each
 * is its head and three regular waves the composer wrote for the arc
 * (`waves:compose`), and a boss after each is the owner's to add. HOLD AND
 * AIM stands in front of THE MAGNET: a magnet is answered only by a bolt the
 * pilot's hand has turned (`sim/lock.ts`). The two come straight after the
 * shell's block (the owner, 19 October 2026), and the magnet's three waves
 * were drawn again so they mix only the shell. THE GYRE's film lost its SUCK
 * page.
 */
export const WAVES_ACT_1: Wave[] = [
  {
    id: "firstStep",
    name: "FIRST STEP",
    guide: {
      scene: "firstStep",
    },
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 8, col: 5, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 24, col: 8, color: "red" },
      { beat: 32, col: 10, color: "red" },
      { beat: 40, col: 3, color: "red" },
      { beat: 48, col: 0, color: "red" },
      { beat: 56, col: 5, color: "red" },
      { beat: 64, col: 5, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepAgain",
    name: "FIRST RED",
    variant: true,
    entries: [
      { beat: 0, col: 4, color: "red" },
      { beat: 7, col: 5, color: "red" },
      { beat: 13, col: 4, color: "red" },
      { beat: 21, col: 6, color: "red" },
      { beat: 29, col: 4, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepReach",
    name: "RED WANDERER",
    variant: true,
    entries: [
      { beat: 0, col: 1, color: "red" },
      { beat: 6, col: 6, color: "red" },
      { beat: 12, col: 1, color: "red" },
      { beat: 18, col: 8, color: "red" },
      { beat: 23, col: 4, color: "red" },
      { beat: 29, col: 8, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "firstStepPair",
    name: "RED TANGO",
    variant: true,
    entries: [
      { beat: 0, col: 8, color: "red" },
      { beat: 5, col: 2, color: "red" },
      { beat: 11, col: 10, color: "red" },
      { beat: 16, col: 7, color: "red" },
      { beat: 22, col: 2, color: "red" },
      { beat: 28, col: 10, color: "red" },
      { beat: 35, col: 1, color: "red" },
      { beat: 41, col: 4, color: "red" },
    ],
    controls: "standard1",
  },
  {
    id: "theMoth",
    name: "THE MOTH",
    entries: [],
    boss: { kind: "moth", steps: MOTH_SCRIPT },
    bossType: "normal",
    controls: "standard1",
  },
  {
    id: "cyan",
    name: "CYAN",
    guide: {
      scene: "cyan",
    },
    entries: [
      { beat: 0, col: 5, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 16, col: 4, color: "cyan" },
      { beat: 24, col: 6, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "cyanAgain",
    name: "CYAN AWAKENS",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "cyan" },
      { beat: 8, col: 5, color: "cyan" },
      { beat: 15, col: 4, color: "cyan" },
      { beat: 22, col: 6, color: "cyan" },
      { beat: 30, col: 5, color: "cyan" },
      { beat: 38, col: 4, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "twoColours",
    name: "CYAN PICNIC",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "red" },
      { beat: 5, col: 5, color: "red" },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 17, col: 4, color: "cyan" },
      { beat: 24, col: 6, color: "red" },
      { beat: 29, col: 6, color: "red" },
      { beat: 36, col: 5, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "alternating",
    name: "CYAN RAPTURE",
    variant: true,
    entries: [
      { beat: 0, col: 5, color: "cyan" },
      { beat: 6, col: 5, color: "red" },
      { beat: 12, col: 4, color: "cyan" },
      { beat: 18, col: 6, color: "red" },
      { beat: 24, col: 5, color: "cyan" },
      { beat: 30, col: 4, color: "red" },
      { beat: 36, col: 6, color: "cyan" },
      { beat: 42, col: 5, color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theBrood",
    name: "THE BROOD",
    entries: [],
    boss: { kind: "brood", steps: BROOD_SCRIPT },
    bossType: "normal",
    controls: "standard2",
  },
  {
    id: "theThirdShot",
    name: "THE SHELL",
    guide: {
      scene: "theThirdShot",
    },
    entries: [
      { beat: 0, col: 2, kind: "shell", color: "cyan" },
      { beat: 10, col: 7, kind: "shell", color: "red" },
    ],
    controls: "standard2",
  },
  {
    id: "theThirdShotPair",
    name: "SHELL AND CYAN",
    variant: true,
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 7, col: 4, kind: "shell", color: "red" },
      { beat: 13, col: 6, color: "cyan" },
      { beat: 20, col: 7, kind: "shell", color: "red" },
      { beat: 26, col: 0, color: "cyan" },
      { beat: 32, col: 2, kind: "shell", color: "red" },
      { beat: 38, col: 5, color: "cyan" },
    ],
    controls: "standard2",
  },
  {
    id: "theThirdShotRecall",
    name: "SHELL SAGA",
    variant: true,
    entries: [
      { beat: 0, col: 9, color: "cyan" },
      { beat: 7, col: 8, kind: "shell", color: "cyan" },
      { beat: 15, col: 7, color: "cyan" },
      { beat: 23, col: 4, kind: "shell", color: "red" },
      { beat: 31, col: 10, color: "cyan" },
      { beat: 38, col: 4, kind: "shell", color: "red" },
    ],
    controls: "standard2",
  },
];
