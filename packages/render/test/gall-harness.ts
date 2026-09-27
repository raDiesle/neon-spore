import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GallState,
  type GallStep,
  gallBoss,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE GALL set rather than played to, for the two files that draw it:
 * `gall-frame.test.ts` for the body, `gall-receipts.test.ts` for what a
 * receipt leaves behind for a moment after.
 */

const TPB = ticksPerBeat(CFG);
export const CLOSE: GallStep = { ask: "close", color: "either", beats: 6 };
export const FIRE: GallStep = { ask: "fire", color: "cyan", beats: 3 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gall");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/** The gall standing on `point`, `lit` under the cursor `beats` beats in, unclosed and unpinched. */
export function posed(world: World, lit: GallStep | null, point = 0, beats = 1): GallState {
  const s = gallBoss(world);
  if (s === null) throw new Error("the gall wave stood no gall");
  s.phase = lit === null ? "rest" : "lit";
  s.phaseBeat = world.beat - beats;
  s.cursor = 0;
  s.point = point;
  s.closes = 0;
  s.hits = 0;
  s.bared = false;
  s.gapMilli = world.cfg.gallOpenMilli;
  s.heldBeats = 0;
  if (lit !== null) s.steps[0] = lit;
  return s;
}

/** The frames of a pose, with `thrown` pushed onto the first tick's events. */
export function frame(role: ViewRole, arrange: (world: World) => void, thrown?: SimEvent): string {
  const world = stood();
  arrange(world);
  const log: string[] = [];
  runFrames(world, role, 9, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && thrown) w.events.push(thrown);
    },
  });
  return log.join("|");
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}
