import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE UNDERTOW's seven, in a file of their own for `bind-baton.ts`' reason —
 * and along the seam the fight has: everything here happens *to the hull*,
 * in one column of it.
 *
 * All are panned, and harder than usual: the bow is on the pilot's screen
 * alone, and a bow heard in a lane is the one tell the navigator gets before
 * the lobe stands.
 *
 * Seven events on seven of the boss's nine sounds. A lobe tapped back down is
 * the old scar's slide — a lobe going back under — and the level's ebb is the
 * swallow that closed the old fight, one per lobe. `boss.undertowUnseated` and
 * `boss.undertowRise` are spare since the rework of 1 October 2026: nobody is
 * unseated and there is no last push.
 */
export function undertowCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "undertowBow"
        | "undertowLobe"
        | "undertowTaken"
        | "undertowGrow"
        | "undertowTapped"
        | "undertowBurst"
        | "undertowEbb";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "undertowBow":
      return { id: "boss.undertowBow", pan };
    case "undertowLobe":
      // The shield's lobe is higher: the dome's colour, and a lighter thing.
      return { id: "boss.undertowLobe", pan, pitch: e.answer === "shield" ? 1.2 : 1 };
    case "undertowTaken":
      return { id: "boss.undertowTaken", pan };
    case "undertowGrow":
      return { id: "boss.undertowWidened", pan };
    case "undertowTapped":
      return { id: "boss.undertowScar", pan };
    case "undertowBurst":
      return { id: "boss.undertowThrough", pan };
    case "undertowEbb":
      return { id: "boss.undertowSwallowed", pan, gain: 0.7 };
  }
}
