import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SlingState,
  type SlingStep,
  slingBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE SLING set rather than played to, for `core-stop.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: SlingStep = { ask: "fire", aim: "left", color: "cyan", beats: 4 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("sling");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The fork lit for `lit` a beat in, both arms slack and the yoke dark unless `arrange` says so. */
export function posed(
  world: World,
  lit: SlingStep,
  arrange: (s: SlingState) => void = () => {},
): SlingState {
  const s = slingBoss(world);
  if (s === null) throw new Error("the sling wave stood no sling");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.arms = [0, 0];
  s.yokeLit = false;
  s.holding = [false, false];
  s.drawnBeats = [0, 0];
  s.loosed = [false, false];
  s.steps[0] = lit;
  arrange(s);
  return s;
}
