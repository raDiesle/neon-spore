import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PlumbState,
  type PlumbStep,
  plumbBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE PLUMB set rather than played to, for `core-stop.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: PlumbStep = {
  ask: "fire",
  color: "cyan",
  beats: 4,
  skewMilli: 0,
  rangeMilli: 600,
};

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("plumb");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The bob lit for `lit` a beat in, both weights home and the core dark unless `arrange` says so. */
export function posed(
  world: World,
  lit: PlumbStep,
  arrange: (s: PlumbState) => void = () => {},
): PlumbState {
  const s = plumbBoss(world);
  if (s === null) throw new Error("the plumb wave stood no plumb");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.weights = [0, 0];
  s.coreLit = false;
  s.heldBeats = 0;
  s.pullMilli = [0, 0];
  s.steps[0] = lit;
  arrange(s);
  return s;
}
