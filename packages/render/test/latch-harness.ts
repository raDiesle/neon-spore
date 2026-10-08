import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LatchState,
  latchBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE LATCH set rather than played to, for `latch-frame.test.ts` and
 * `latch-grip.test.ts`: the wave's own colony stood past its drop, then posed
 * by writing its state.
 */

const TPB = ticksPerBeat(CFG);

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("latch");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * (CFG.latchEnterBeats + 1); i++) step(world, []);
  return world;
}

/**
 * `phase` a beat in on the script's first level (a `haul`): nothing hauled,
 * no knot in, no thumb down, the pilot's grip to pull — unless `arrange`
 * says otherwise.
 */
export function posed(
  world: World,
  phase: LatchState["phase"] = "level",
  arrange: (s: LatchState) => void = () => {},
): LatchState {
  const s = latchBoss(world);
  if (s === null) throw new Error("the latch wave stood no colony");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.hauledMilli = 0;
  s.floorMilli = 0;
  s.knots = 0;
  s.levelKnots = 0;
  s.down = [false, false];
  s.anchorMilli = [0, 0];
  s.depthMilli = [0, 0];
  s.turn = 0;
  s.yankBeat = -1;
  arrange(s);
  return s;
}

/** The frames of a pose, joined, the world held where it was posed. */
export function frame(role: ViewRole, arrange: (world: World) => void): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 3, {
    every: 1,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
