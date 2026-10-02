import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  DAVIT_UNREAD,
  type DavitState,
  type DavitStep,
  davitBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { CFG, waveWith } from "./frame-harness.js";

/**
 * THE DAVIT set rather than played to, for `core-stop.test.ts`: the wave's
 * own boom stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const FIRE: DavitStep = {
  ask: "fire",
  leanMilli: 0,
  rangeMilli: 0,
  color: "cyan",
  beats: 4,
};

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("davit");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The boom stood, `lit` under the cursor a beat in, swung to `aimMilli`, the pivot dark unless `arrange` says so. */
export function posed(
  world: World,
  lit: DavitStep | null,
  aimMilli = 0,
  arrange: (s: DavitState) => void = () => {},
): DavitState {
  const s = davitBoss(world);
  if (s === null) throw new Error("the davit wave installed no boom");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.aimMilli = aimMilli;
  s.hits = 0;
  s.pivotLit = false;
  s.swings = [0, 0];
  s.tiltMilli = [DAVIT_UNREAD, DAVIT_UNREAD];
  s.holding = [false, false];
  s.drawnBeats = [0, 0];
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}
