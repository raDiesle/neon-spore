import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type SimEvent,
  startWave,
  step,
  type TrapezeState,
  type TrapezeStep,
  ticksPerBeat,
  trapezeBoss,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE TRAPEZE set rather than played to, for `trapeze-frame.test.ts`: the
 * wave's own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const CATCH: TrapezeStep = {
  ask: "catch",
  freezer: 1,
  offset: -1,
  sweepMilli: 1000,
  color: "either",
  beats: 6,
};
export const FIRE: TrapezeStep = {
  ask: "fire",
  freezer: "either",
  offset: 0,
  sweepMilli: 0,
  color: "cyan",
  beats: 3,
};

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("trapeze");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * The flag `swingMilli` off the middle, `lit` under the cursor a beat in,
 * nothing caught, frozen or held unless `arrange` says so.
 */
export function posed(
  world: World,
  lit: TrapezeStep | null,
  swingMilli = 0,
  arrange: (s: TrapezeState) => void = () => {},
): TrapezeState {
  const s = trapezeBoss(world);
  if (s === null) throw new Error("the trapeze wave stood no trapeze");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.swingMilli = swingMilli;
  s.swingDir = 1;
  s.frozenBeats = 0;
  s.frozenBy = null;
  s.catches = 0;
  s.hits = 0;
  s.spindleLit = false;
  s.holding = [false, false];
  s.drawnBeats = [0, 0];
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}

/**
 * The frames of a pose, joined, the world held where it was posed, with
 * `thrown` pushed onto the first tick's events.
 */
export function frame(role: ViewRole, arrange: (world: World) => void, thrown?: SimEvent): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
