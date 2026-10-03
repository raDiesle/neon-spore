import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type ViseState,
  type ViseStep,
  viseBoss,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE VISE set rather than played to, for `core-stop.test.ts`: the wave's
 * own case stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: ViseStep = { ask: "fire", color: "cyan", beats: 3 };
export const SPIT: ViseStep = { ask: "spit", color: "cyan", beats: 4, offset: 2 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("vise");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The case stood, `lit` under the cursor a beat in, its kernel bared if `bared`. */
export function posed(world: World, lit: ViseStep, bared: boolean): ViseState {
  const s = viseBoss(world);
  if (s === null) throw new Error("the vise wave installed no case");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.bared = bared;
  s.cracks = [0, 0];
  s.gapMilli = [world.cfg.viseOpenMilli, world.cfg.viseOpenMilli];
  s.heldBeats = 0;
  s.steps[0] = lit;
  return s;
}
