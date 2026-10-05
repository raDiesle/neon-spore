import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FlueLevel,
  type FlueState,
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
 * THE FLUE set rather than played to, for the flue's render tests: the
 * wave's own boss stood a few beats in, then posed by writing its state.
 */

const TPB = ticksPerBeat(CFG);
export const BOLT: FlueLevel = { weapon: "bolt", color: "red", speedMilli: 2000, slowMilli: 1000 };
export const BEAM: FlueLevel = { weapon: "beam", color: "cyan", speedMilli: 1000, slowMilli: 500 };

export function stood(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("flue");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

/**
 * `lit` lit a beat in under the cursor (or resting between levels when
 * null), the ember `emberMilli` off the middle, every shot left and nothing
 * cleared unless `arrange` says so.
 */
export function posed(
  world: World,
  lit: FlueLevel | null,
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
  s.shots = CFG.flueShots;
  s.hits = 0;
  if (lit !== null) s.levels[0] = lit;
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
