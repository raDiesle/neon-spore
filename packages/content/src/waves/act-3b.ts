import type { Wave } from "../wave-types.js";

/**
 * The second half of act three, cut off `act-3.ts` when that file reached the
 * 250-line ceiling on `THE VEIL`.
 *
 * **`3b` and not `6`, because the order of the waves is the order of the
 * game.** An act file is a page rather than a chapter — the cut is where the
 * file filled up, not where the game changes subject — so this one is spread
 * between act three and act four in `waves.ts`, and a name that sorted after
 * act five would say the opposite of where it stands. `THE VANE` is a boss and
 * the three after it are the mechanics that follow it, in the order they
 * always read in.
 *
 * Adding one `scene:` line to a wave in act three had cost two rounds of
 * shaving a sentence out of a comment to stay under the limit, which is the
 * warning `packages/sim/test/limits.test.ts` exists to give. New waves still
 * land in the newest act rather than here — the director's save splits an
 * incoming list across the act files at each one's current length and gives
 * the last of them whatever is left (`tools/director/src/waves-acts.ts`).
 *
 * **THE VANE carries no guide**, THE INSTAR's way: the owner, 30 September
 * 2026, *remove the tutorial, not required*. The mouth of the split says
 * `FIRE` in the colour it takes, and the cannon says `MOVE`, so the field
 * already says what the film did. The comment is up here because the
 * director writes this file back and keeps nothing between a wave's braces.
 */
export const WAVES_ACT_3B: Wave[] = [
  {
    id: "theFleet",
    name: "THE FLEET",
    guide: {
      scene: "theFleet",
    },
    entries: [],
    boss: {
      kind: "fleet",
      ships: [
        { col: 1, row: 1, len: 5, dir: "h" },
        { col: 8, row: 0, len: 4, dir: "v" },
        { col: 3, row: 5, len: 3, dir: "h" },
        { col: 0, row: 6, len: 3, dir: "v" },
        { col: 7, row: 8, len: 2, dir: "h" },
      ],
    },
    bossType: "special",
    controls: "fleet",
  },
  {
    id: "theLure",
    name: "THE LURE",
    guide: {
      scene: "theLure",
    },
    entries: [
      { beat: 0, col: 3, kind: "lure", color: "cyan" },
      { beat: 3, col: 8, color: "red" },
      { beat: 8, col: 5, kind: "lure", color: "red" },
      { beat: 9, col: 7, color: "red" },
      { beat: 15, col: 3, kind: "lure", color: "cyan" },
      { beat: 16, col: 7, color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theThrob",
    name: "THE THROB",
    guide: {
      scene: "theThrob",
    },
    entries: [{ beat: 0, col: 5, kind: "throb", color: "red" }],
    controls: "standard5",
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
      { beat: 19, col: 8, kind: "countdown", color: "cyan" },
    ],
    controls: "standard5",
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
    controls: "standard5",
  },
  {
    id: "theClasp",
    name: "THE CLASP",
    guide: {
      scene: "theClasp",
    },
    entries: [
      { beat: 0, col: 5, kind: "clasp", color: "cyan" },
      { beat: 6, col: 2, kind: "clasp", color: "red" },
      { beat: 12, col: 8, kind: "clasp", color: "red" },
      { beat: 20, col: 3, kind: "clasp", color: "cyan" },
      { beat: 28, col: 7, kind: "clasp", color: "cyan" },
    ],
    controls: "standard5",
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
      { beat: 17, col: 8, kind: "dart", color: "cyan" },
      { beat: 26, col: 3, kind: "dart", color: "cyan" },
    ],
    controls: "standard5",
  },
  {
    id: "theVeil",
    name: "THE VEIL",
    guide: {
      scene: "theVeil",
    },
    entries: [
      { beat: 0, col: 5, kind: "veil", color: null },
      { beat: 10, col: 2, kind: "veil", color: null },
      { beat: 11, col: 8, kind: "veil", color: null },
      { beat: 18, col: 3, kind: "veil", color: null },
      { beat: 24, col: 0, kind: "veil", color: null },
    ],
    controls: "standard5",
  },
];
