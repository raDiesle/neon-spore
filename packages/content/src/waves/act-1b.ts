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
    sentence: "The one where shooting something is only half of getting it.",
    guide: {
      both: "The panel is complete: the maw is the last button, and it is yours from here on. This is the wave it is for. The pod hangs where it was left, and shooting it loose is only half of getting it — after that it sinks and drifts.",
      p1: "SUCK is new, beside your trigger. Chase the pod with the cannon and open the maw as it reaches the hull. It mends the ship.",
      p2: "Free it with a shot of either colour, then say which way it is drifting.",
      scene: "salvage",
    },
    entries: [
      { beat: 2, col: 1, color: "cyan" },
      { beat: 7, col: 5, color: "red" },
    ],
    pods: [{ beat: 0, col: 3, row: 3 }],
  },
  {
    id: "catchAndAim",
    name: "CATCH AND AIM",
    sentence: "The one where the cannon is under the pod and the shot is somewhere else.",
    guide: {
      both: "A wreck on one side, bodies on the other, and one cannon. A finger held on a body marks it: while the hand is there every shot steers into it, whatever column it left the muzzle in. What it does not decide is the colour.",
      p1: "Keep the cannon on the pod's side and hold a body with your other thumb. It slows, it wears a frame, and it is what the next shot will hit — say which one you have got.",
      p2: "Fire the colour he names and stop naming columns. A wrong colour still bounces off, and while his hand is down there is nothing else a shot can go to.",
      scene: "catchAndAim",
    },
    entries: [
      { beat: 4, col: 6, color: "cyan" },
      { beat: 9, col: 5, color: "red" },
      { beat: 15, col: 6, color: "red" },
    ],
    pods: [
      { beat: 0, col: 1, row: 3 },
      { beat: 11, col: 0, row: 4 },
    ],
  },
  {
    id: "finale",
    name: "FINALE",
    sentence: "The one where everything you have learned arrives at once.",
    entries: [
      { beat: 0, col: 0, color: "cyan" },
      { beat: 0, col: 6, color: "red" },
      { beat: 2, col: 3, kind: "meteor", color: null },
      { beat: 4, col: 2, color: "cyan" },
      { beat: 4, col: 4, color: "red" },
      { beat: 7, col: 1, kind: "meteor", color: null },
      { beat: 7, col: 5, kind: "meteor", color: null },
    ],
  },
];
