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
      both: "The panel is complete. The maw is the last button, and this wave is for it. The pod hangs until a shot frees it. Then it sinks and drifts.",
      p1: "1. SUCK is new, beside your trigger.\n2. Chase the pod with the cannon. Open the maw as it reaches the hull.\n3. A pod that breaks on the skin loses the wave. One you take clears the field.",
      p2: "Free it with a shot of either colour, then say which way it is drifting.",
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
      both: "A wreck on one side, bodies on the other, one cannon. A finger on a body marks it. While it stays, every shot steers into it. The colour still counts.",
      p1: "1. Keep the cannon on the pod's side.\n2. Hold a body with your other thumb. It slows and wears a frame.\n3. The next shot hits it. Say which one you have.",
      p2: "1. Fire the colour your partner names. Stop naming columns.\n2. A wrong colour still bounces off.\n3. While the hand is down, a shot can go nowhere else.",
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
