import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type HalterState,
  type HalterStep,
  halterBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE HALTER set rather than played to, for `core-stop.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: HalterStep = { ask: "fire", color: "cyan", beats: 3 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("halter");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The seam standing, `lit` under the cursor a beat in, whole, nobody resting and no grip down unless `arrange` says so. */
export function posed(
  world: World,
  lit: HalterStep | null,
  arrange: (s: HalterState) => void = () => {},
): HalterState {
  const s = halterBoss(world);
  if (s === null) throw new Error("the halter wave stood no halter");
  s.phase = lit === null ? "pause" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.cracks = [0, 0];
  s.hits = 0;
  s.bared = false;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  s.grips = [0, 0];
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}
