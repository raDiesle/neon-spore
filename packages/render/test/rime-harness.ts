import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type RimeState,
  type RimeStep,
  rimeBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE RIME set rather than played to, for `core-stop.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: RimeStep = { ask: "fire", color: "cyan", beats: 4 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("rime");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens lit for `lit` a beat in, both halves wiped and the core covered unless `arrange` says so. */
export function posed(
  world: World,
  lit: RimeStep,
  arrange: (s: RimeState) => void = () => {},
): RimeState {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the rime wave stood no rime");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.rimeMilli = [0, 0];
  s.bared = false;
  s.steps[0] = lit;
  arrange(s);
  return s;
}
