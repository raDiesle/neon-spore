import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type OculusState,
  type OculusStep,
  oculusBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE OCULUS set rather than played to, for `core-stop.test.ts`: the wave's
 * own lens stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: OculusStep = { ask: "fire", color: "cyan", beats: 3 };
export const LOOK: OculusStep = { ask: "look", color: "cyan", beats: 4, offset: -2 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("oculus");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The lens stood, `lit` under the cursor a beat in, its socket shut unless `open`. */
export function posed(world: World, lit: OculusStep, open: boolean): OculusState {
  const s = oculusBoss(world);
  if (s === null) throw new Error("the oculus wave installed no lens");
  s.phase = "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hits = 0;
  s.socketOpen = open;
  s.held = [false, false];
  s.heldTicks = 0;
  s.steps[0] = lit;
  return s;
}
