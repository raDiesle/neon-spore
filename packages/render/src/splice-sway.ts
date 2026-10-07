import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE SPLICE's eater rears its head and swings its back end**
 * (`docs/spec/living-bosses.md` §1, the outline tier; the part map's "add the
 * joint"): the neck lifts the head out of its hang by up to most of a tile,
 * and the sac out of the lower hole swings up and down at its fat end by
 * more than half a tile, each on its own wander. That is seen (*Big enough to be seen*,
 * `docs/looks.md`).
 *
 * **The head only ever lifts.** Under it are the top ends of the straws and
 * the numbers the tongue snaps at, which it must not cover. Both roots stay
 * in their holes: the tendril is bent, never moved. **Nothing is pressed or
 * shot on it** — the hold's straws are the play — and the tongue starts from
 * the mouth wherever it is drawn, so nothing has to follow. The rounds open
 * no SLOW, so nothing hushes it.
 *
 * `calm` is how much of it is left (`splice-eater.ts`): gone through the bite
 * and the chew, back after the swallow, and gone as the beaten eater pulls
 * back into the wall; the back end's swing goes as the sac swells.
 */

/** How far the neck lifts the head at the most, and the back end's swing either way at its fat end, in tiles. */
export const SPLICE_LIFT = 0.7;
export const SPLICE_REAR = 0.65;

/** The eater's sway at beat `b` (its phase in it): the head's lift, up positive, and the back end's swing, down positive, in tiles. */
export function spliceSway(
  cfg: SimConfig,
  b: number,
  calm: number,
  swell: number,
): { readonly lift: number; readonly rear: number } {
  const k = outlineDrift("splice") * calm;
  if (k <= 0) return { lift: 0, rear: 0 };
  const t = (b * beatSeconds(cfg) * 2) / IDLE_DRIFT.roll.period;
  const seed = OUTLINE_SEED.splice;
  return {
    lift: k * SPLICE_LIFT * (0.5 + 0.5 * noise1(t, subSeed(seed, 0))),
    rear: k * (1 - swell) * SPLICE_REAR * noise1(t, subSeed(seed, 1)),
  };
}
