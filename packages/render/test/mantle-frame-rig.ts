import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type MantleState,
  mantleBoss,
  NO_SPARK,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE MANTLE's shell set rather than played to, and drawn: shared by
 * `mantle-frame.test.ts` and `mantle-brace-frame.test.ts`, so both files set
 * a phase the same way and read a frame the same way.
 */

const TPB = ticksPerBeat(CFG);

/** A world with the shell hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
export function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("mantle");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

export function body(world: World): MantleState {
  const s = mantleBoss(world);
  if (s === null) throw new Error("the mantle wave hung no shell");
  return s;
}

/** Shut and dark, long enough in that the drop into frame is over. */
export function still(world: World): MantleState {
  const s = body(world);
  s.phase = "still";
  s.phaseBeat = world.beat - 3;
  s.cursor = 0;
  s.depthMilli = [0, 0];
  s.sparkCol = NO_SPARK;
  return s;
}

/**
 * Movement `cursor` up and both thumbs where `left` and `right` say — kept
 * under the threshold, so the few ticks this file steps never shear a pair.
 */
export function pulling(world: World, left: number, right: number, cursor = 0): MantleState {
  const s = still(world);
  s.phase = "pull";
  s.phaseBeat = world.beat - 2;
  s.cursor = cursor;
  s.depthMilli = [left, right];
  return s;
}

export function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

/** Three frames, inside a beat, with the shell set as `arrange` says. */
export function frame(
  role: ViewRole,
  arrange: (world: World) => void,
): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** A colour as a glow lays it (the palette's hex) and as a fill or a faint stroke does (`rgba`). */
export function tinted(text: string, hex: string): number {
  const v = Number.parseInt(hex.slice(1), 16);
  return count(text, hex) + count(text, `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},`);
}
