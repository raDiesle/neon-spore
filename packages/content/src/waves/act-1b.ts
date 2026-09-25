import type { Wave } from "../wave-types.js";

/**
 * The last of act one, cut off `act-1.ts` when that file reached the 250-line
 * ceiling on `CATCH AND AIM`.
 *
 * **`1b` and not `7`, for the reason `act-3b.ts` gives at length**: an act file
 * is a page rather than a chapter, so the cut is where the file filled up and
 * the name has to sort where the waves stand. These three are the end of the
 * tutorial arc and they read in one breath — the pod arrives, the hand learns
 * to aim, and then everything at once.
 *
 * New waves still land in the newest act rather than here; the director's save
 * splits an incoming list across the act files at each one's current length
 * (`tools/director/src/waves-acts.ts`).
 */
export const WAVES_ACT_1B: Wave[] = [
  {
    id: "salvage",
    name: "SALVAGE",
    guide: {
      scene: "salvage",
    },
    entries: [
      { beat: 2, col: 1, color: "cyan" },
      { beat: 7, col: 5, color: "red" },
    ],
    pods: [{ beat: 0, col: 3, row: 3, kind: "purge" }],
    controls: "standard5",
  },
  {
    id: "catchAndAim",
    name: "CATCH AND AIM",
    guide: {
      scene: "catchAndAim",
    },
    entries: [
      { beat: 4, col: 6, color: "cyan" },
      { beat: 9, col: 5, color: "red" },
      { beat: 15, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 1, row: 3, kind: "ward" },
      { beat: 11, col: 0, row: 4, kind: "ward" },
    ],
    controls: "standard5",
  },
  {
    id: "finale",
    name: "FINALE",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 6, color: "red" },
      { beat: 2, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 4, col: 4, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
    ],
    controls: "standard5",
  },
];
