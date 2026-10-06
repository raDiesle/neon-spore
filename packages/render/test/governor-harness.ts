import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  GOVERNOR_DOWN_MILLI,
  type GovernorState,
  type GovernorStep,
  governorBoss,
  governorFlightTicks,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE GOVERNOR set rather than played to, for `governor-frame.test.ts`: the
 * wave's own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
/** A tap step with the pilot's mark at three o'clock and the navigator's at nine. */
export const TAP: GovernorStep = {
  ask: "tap",
  marks: [
    { seat: 1, markMilli: 250 },
    { seat: 2, markMilli: 750 },
  ],
  ordered: false,
  paceMilli: 7,
  color: "either",
  beats: 5,
};
/** The same marks and one more, to be tapped in order. */
export const ORDERED: GovernorStep = {
  ...TAP,
  ask: "retap",
  marks: [...TAP.marks, { seat: 1, markMilli: 500 }],
  ordered: true,
};
export const FIRE: GovernorStep = {
  ask: "fire",
  marks: [],
  ordered: false,
  paceMilli: 4,
  color: "cyan",
  beats: 8,
};

/** Where the needle is when a bolt met now left with it pointing straight down. */
export function downNeedle(step: GovernorStep = FIRE): number {
  return (GOVERNOR_DOWN_MILLI + step.paceMilli * governorFlightTicks(CFG)) % 1000;
}

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("governor");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * The needle at `needleMilli`, `lit` under the cursor a beat in, nothing
 * tapped and the hub dark unless `arrange` says so.
 */
export function posed(
  world: World,
  lit: GovernorStep | null,
  needleMilli = 0,
  arrange: (s: GovernorState) => void = () => {},
): GovernorState {
  const s = governorBoss(world);
  if (s === null) throw new Error("the governor wave stood no governor");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.needleMilli = needleMilli;
  s.landed = 0;
  s.taps = [0, 0];
  s.hits = 0;
  s.hubLit = false;
  s.tapDown = [false, false];
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
