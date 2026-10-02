import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GrindstoneState,
  type GrindstoneStep,
  grindstoneBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE GRINDSTONE set rather than played to, for `core-stop.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: GrindstoneStep = { ask: "fire", color: "cyan", beats: 3 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("grindstone");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The wheel standing, `lit` under the cursor a beat in, nothing ground and the caliper slack unless `arrange` says so. */
export function posed(
  world: World,
  lit: GrindstoneStep | null,
  arrange: (s: GrindstoneState) => void = () => {},
): GrindstoneState {
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the grindstone wave stood no grindstone");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.passes = [0, 0];
  s.gritMilli = [1000, 1000];
  s.locked = false;
  s.hits = 0;
  s.padsDown = [0, 0];
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}
