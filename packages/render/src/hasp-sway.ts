import { beatSeconds, type HaspState, type World } from "@neon-spore/sim";
import { haspClearing, haspOpened } from "./hasp-pose.js";
import { IDLE_DRIFT, subSeed } from "./idle-drift.js";
import { bodyLife } from "./motion-life.js";
import { slowHush } from "./slow-hush.js";
import { noise1 } from "./solid-motion.js";

/**
 * **A spent clasp of THE HASP swings on its hinge** (`docs/spec/living-bosses.md`,
 * the rollout's step 11, the mechanisms' hinged parts): its two half-shells,
 * hanging ajar, turn together about the pin at the nose, so the pair swings
 * like a gate left open and its tail travels across by more than half a tile,
 * which is seen (*Big enough to be seen*, `docs/looks.md`). Each clasp on its
 * own wander, so the spent ones never swing in step.
 *
 * It takes the place of the slack the halves used to breathe by on the wall
 * clock: this is on the beat, so both screens see one swing.
 *
 * **Only a spent clasp.** A sealed one is shut and says so, and its hub is
 * §20's secret on one screen and the seized tell on the other; nothing a
 * thumb holds is on a spent shell. A bolt meets the halves as they swing
 * (`haspStopper`). It goes as the row clears — the row swinging wide is the
 * readout — and dies down under THE SLOW, as any boss's motion does.
 */

/** THE HASP's own lattice, so it never swings in step with another boss. */
const SEED = 223;
/** How far a spent clasp swings at the widest, in radians: its tail, 2.7 tiles under the pin, moves most of a tile. */
export const HASP_SWING = 0.24;

/** Clasp `i`'s swing at `beat` and `beatPhase`, in radians, clockwise on the screen. */
export function haspSwing(
  world: World,
  s: HaspState,
  i: number,
  beat: number,
  beatPhase: number,
): number {
  const life = bodyLife();
  if (life <= 0 || !haspOpened(s, i)) return 0;
  const { cfg } = world;
  const left = (1 - haspClearing(s, cfg, beat, beatPhase)) * slowHush(world, beat, beatPhase);
  if (left <= 0) return 0;
  const seconds = (beat + beatPhase) * beatSeconds(cfg);
  return (
    life * left * HASP_SWING * noise1((seconds * 2) / IDLE_DRIFT.roll.period, subSeed(SEED, i))
  );
}
