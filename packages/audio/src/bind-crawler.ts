import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE CRAWLER's two endings, as sounds.
 *
 * Its own file beside `bind-carom.ts` and `bind-volley.ts`, and for their
 * reason: `bind.ts` is at its 250-line limit, and one arrival's own incidents
 * are the cut it already makes when that happens. `cueFor` names both cases
 * itself and delegates rather than reaching this file through a `default` — a
 * default would take that switch's exhaustiveness with it, and the
 * exhaustiveness is what makes a new event a compile error rather than a
 * silence nobody notices.
 *
 * **Neither of the worm's two *answers* is here**, and that is the point of
 * the file being this short. A ring shot off shares `destroy`'s cue and a
 * plate warded off is a plain `deflect`, so both already have the sound the
 * pair has spent the whole game learning. What is new is only what happens at
 * the two ends of the encounter.
 */
export function crawlerCue(
  e: Extract<SimEvent, { type: "crawlerBeam" | "crawlerBurrow" }>,
  cols: number,
): Cue {
  if (e.type === "crawlerBeam") {
    // The ship sweeping a lane clean, on the ring that emptied it. The rings
    // themselves have already sounded, one kill at a time, so what is owed
    // here is not another death — it is the lane being handed back, and
    // `motion.teleport` is "something that was in a tile is not any more".
    return { id: "motion.teleport", pan: panForCol(e.col, cols) };
  }
  // Plating giving way from behind, one line at a time. Deliberately not one
  // of the breach cues: those fire beside this one, per column the worm bit
  // through, and what this has to say is the thing doing the biting — a body
  // that walked the whole deck while both of them watched, and is now inside.
  return { id: "hull.cockpitCrack", pan: panForCol(e.col, cols) };
}
