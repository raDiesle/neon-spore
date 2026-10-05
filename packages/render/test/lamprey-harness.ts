import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type LampreyState,
  type LampreyStep,
  lampreyBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE LAMPREY set rather than played to, for `lamprey-frame.test.ts`: the
 * wave's own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const BITE: LampreyStep = {
  ask: "teeth",
  holder: 1,
  teeth: 3,
  jump: 1,
  beats: 12,
  color: "either",
};
export const PULL: LampreyStep = { ...BITE, ask: "pull", teeth: 0 };
export const APART: LampreyStep = { ...BITE, ask: "apart", teeth: 0 };
export const GULLET: LampreyStep = { ...BITE, ask: "gullet", teeth: 0, color: "red" };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("lamprey");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * `phase` a beat in on `lit` — a `teeth` held by seat 1 by default, on column
 * 3 of row 6, the tail laid off to the left, tooth 0 lit, every tooth in,
 * nothing pulled and no thumb down — unless `arrange` says otherwise.
 */
export function posed(
  world: World,
  phase: LampreyState["phase"] = "bite",
  lit: LampreyStep = BITE,
  arrange: (s: LampreyState) => void = () => {},
): LampreyState {
  const s = lampreyBoss(world);
  if (s === null) throw new Error("the lamprey wave stood no lamprey");
  s.phase = phase;
  s.phaseBeat = world.beat - 1;
  s.cursor = 0;
  s.steps[0] = lit;
  s.col = 3;
  s.row = 6;
  s.fromCol = 1;
  s.fromRow = 4;
  s.nextCol = 5;
  s.nextRow = 6;
  s.teethOut = 0;
  s.litTooth = 0;
  s.pulled = [];
  s.hits = 0;
  s.tailDown = [false, false];
  s.tailMilli = [0, 0];
  s.headMilli = [0, 0];
  s.tapDown = [false, false];
  s.slipped = [false, false];
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
