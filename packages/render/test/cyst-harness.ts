import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CystState,
  type CystStep,
  createWorld,
  cystBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE CYST set rather than played to, for `core-stop.test.ts`: the wave's
 * own sac stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: CystStep = { ask: "fire", color: "cyan", beats: 3 };
export const BUD: CystStep = { ask: "bud", color: "cyan", beats: 4, offset: 2 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("cyst");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The sac stood, `lit` under the cursor a beat in, its core shut unless `arrange` bares it. */
export function posed(
  world: World,
  lit: CystStep,
  arrange: (s: CystState) => void = () => {},
): CystState {
  const s = cystBoss(world);
  if (s === null) throw new Error("the cyst wave installed no sac");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.bared = false;
  s.cracks = [0, 0];
  s.gapMilli = [world.cfg.cystOpenMilli, world.cfg.cystOpenMilli];
  s.tapDown = [false, false];
  s.heldBeats = 0;
  s.steps[0] = lit;
  arrange(s);
  return s;
}
