import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  createWorld,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE CAPSTAN set rather than played to, for `core-stop.test.ts`: the wave's
 * own drum stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: CapstanStep = { ask: "fire", color: "cyan", beats: 3 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("capstan");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The drum standing, `lit` under the cursor a beat in, unworn, level and covered unless `arrange` says so. */
export function posed(
  world: World,
  lit: CapstanStep | null,
  arrange: (s: CapstanState) => void = () => {},
): CapstanState {
  const s = capstanBoss(world);
  if (s === null) throw new Error("the capstan wave stood no drum");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.wear = [0, 0];
  s.hits = 0;
  s.bared = false;
  s.pullMilli = [0, 0];
  s.rubs = [0, 0];
  s.rubbed = false;
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}
