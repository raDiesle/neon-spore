import { beatSeconds, type SimConfig } from "@neon-spore/sim";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import { bodyLife } from "./motion-life.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE GRINDSTONE's open caliper rocks on its axle**
 * (`docs/spec/living-bosses.md`, the rollout's step 11, the mechanisms'
 * hinged parts): THE HOOD and both its jaws turn together about the axle,
 * as far as the caliper is from shut, so a slack caliper rocks over the
 * wheel like a loose clamp and a bitten one is dead still on the stone. On
 * the beat clock, so both screens see one rock, and hushed under THE SLOW.
 *
 * **The jaw pads are marks**, so the rock is not only drawn: the hit test
 * (`grindstone-grip.ts`) and the verdict rings (`grindstone-verdicts.ts`)
 * place each pad through `grindstonePadPlaced` with this same turn, and the
 * pad a thumb is asked for is where it is drawn. A thumb on the pads closes
 * the caliper, and the rock dies with the gap.
 */

/** THE GRINDSTONE's own lattice, so it never rocks in step with another boss. */
const SEED = 257;
/** How far a slack caliper rocks at the widest, in radians: its jaw tips, 1.7 tiles out, move over half a tile. */
export const GRINDSTONE_ROCK = 0.36;

/** The caliper's rock at `beat` and `beatPhase`, `shut` of the way bitten, in canvas radians. */
export function grindstoneRock(
  slow: SlowSpan,
  cfg: SimConfig,
  shut: number,
  beat: number,
  beatPhase: number,
): number {
  const open = Math.max(0, Math.min(1, 1 - shut));
  const life = bodyLife();
  if (open <= 0 || life <= 0) return 0;
  const hush = slowHush(slow, beat, beatPhase);
  if (hush <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  const wander = noise1((seconds * 2) / IDLE_DRIFT.roll.period, subSeed(SEED, 0));
  return life * hush * open * GRINDSTONE_ROCK * wander;
}
