import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FlueState,
  type FlueStep,
  flueBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE FLUE set rather than played to, for `flue-frame.test.ts`: the wave's
 * own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const VENT: FlueStep = {
  ask: "vent",
  rester: 2,
  notches: [1, -1],
  color: "either",
  beats: 8,
};
export const DAMPER: FlueStep = {
  ask: "damper",
  rester: "both",
  notches: [],
  color: "either",
  beats: 4,
};
export const FIRE: FlueStep = { ask: "fire", rester: "both", notches: [], color: "cyan", beats: 3 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("flue");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * The ember `emberMilli` off the middle, `lit` under the cursor a beat in,
 * nobody resting, nothing tapped, vented or bared unless `arrange` says so.
 */
export function posed(
  world: World,
  lit: FlueStep | null,
  emberMilli = 0,
  arrange: (s: FlueState) => void = () => {},
): FlueState {
  const s = flueBoss(world);
  if (s === null) throw new Error("the flue wave stood no flue");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.emberMilli = emberMilli;
  s.emberDir = 1;
  s.taps = 0;
  s.vents = 0;
  s.hits = 0;
  s.bared = false;
  s.restBeats = [0, 0];
  s.stirred = [false, false];
  s.tapDown = [false, false];
  if (lit !== null) s.steps[0] = lit;
  arrange(s);
  return s;
}

/** Seat `seat` rested to the threshold, so a vent it rests on has steadied its ember. */
export function rested(seat: 1 | 2) {
  return (s: FlueState) => {
    s.restBeats[seat - 1] = CFG.flueRestThreshold;
  };
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
