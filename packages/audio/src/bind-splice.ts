import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * **What THE SPLICE sounds like**: a straw drawn on, and what comes down it.
 *
 * Its own file rather than four more cases in `bind.ts`, which is at its
 * limit, and along the seam `bind-fleet.ts` already cut for the same kind of
 * fight.
 *
 * **Panned and never pitched.** Every one of these is a column — the entrance
 * the cannon was standing over — and a straw has no row to pitch: it runs the
 * whole height of the field. The pan is doing real work even so, because the
 * navigator cannot see the cannon at all and the column is exactly the thing
 * the two seats are talking about (`view-role.ts`).
 *
 * **The feed is not delayed and the arrival is not held back.** THE FLEET
 * holds four of its five cues by the shell's flight because the sim reports
 * the whole salvo on the beat it is fired; here the sim reports the arrival on
 * the beat it actually arrives (`splice-round.ts`'s `arrive`), so the wait is
 * already in the event and a delay would count it twice.
 */
export function spliceCue(
  e: Extract<SimEvent, { type: "spliceFeed" | "spliceFed" | "spliceWrong" | "spliceDown" }>,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  if (e.type === "spliceFeed") return { id: "boss.spliceFeed", pan };
  if (e.type === "spliceFed") return { id: "boss.spliceFed", pan };
  // A wrong feed and a spent clock are one sound. They cost the same thing and
  // they mean the same thing to the pair — the round is gone — and a second
  // sound for the clock would be a coordinate nobody can act on by the time
  // they hear it.
  if (e.type === "spliceWrong") return { id: "boss.spliceWrong", pan };
  return { id: "boss.spliceDown", pan };
}
