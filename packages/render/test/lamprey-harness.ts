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
  ask: "bite",
  pinner: 1,
  teeth: 3,
  toothBeats: 3,
  col: 3,
  crawl: 1,
  crawlBeats: 3,
  color: "either",
  beats: 0,
};
export const GULLET: LampreyStep = { ...BITE, ask: "gullet", color: "red", beats: 4 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("lamprey");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * `phase` a beat in on `lit` — a bite on column 3 by default, the jaw at its
 * first column, tooth 0 lit, every tooth in, nothing pulled and no thumb
 * down — unless `arrange` says otherwise.
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
  s.jawCol = lit.col;
  s.crawlDir = lit.crawl;
  s.crawlBeat = world.beat - 1;
  s.biteMilli = 0;
  s.teethOut = 0;
  s.litTooth = 0;
  s.toothBeat = world.beat - 1;
  s.pulled = [];
  s.rebiting = false;
  s.hits = 0;
  s.holdCol = [-1, -1];
  s.tapDown = [false, false];
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
