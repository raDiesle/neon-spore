import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type GimbalState,
  gimbalBoss,
  NO_BEARING,
  NO_SEAM,
  type SimEvent,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, runFrames, waveWith } from "./frame-harness.js";

/**
 * The poses THE GIMBAL's frame pages set the cradle to — dark and still, one
 * ring turning, both at true, the shear, the loose spin and the drum split
 * open — and the one way they turn a `World` into a canvas's own text. The
 * states are **set** rather than played to: `sim/test/gimbal.test.ts` proves
 * the alignments, the shears and the seam. Split out so the pages
 * (`gimbal-frame.test.ts`, `gimbal-answer.test.ts`, `gimbal-beam.test.ts`)
 * carry no copy of it.
 */

export const TPB = ticksPerBeat(CFG);

/** A world with the cradle hung, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
export function hung(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("gimbal");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

export function body(world: World): GimbalState {
  const s = gimbalBoss(world);
  if (s === null) throw new Error("the gimbal wave hung no cradle");
  return s;
}

/** The opening dark, the beat it began. */
export function still(world: World): GimbalState {
  const s = body(world);
  s.phase = "still";
  s.phaseBeat = world.beat;
  s.cursor = 0;
  s.atMilli = [0, 0];
  s.seamCol = NO_SEAM;
  return s;
}

/** Alignment `cursor` up, both rings standing where `outer` and `inner` say — in true bearings. */
export function turning(world: World, outer: number, inner: number, cursor = 0): GimbalState {
  const s = still(world);
  s.phase = "turn";
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  s.atMilli = [outer, inner];
  s.handMilli = [NO_BEARING, NO_BEARING];
  return s;
}

/** Both rings on the marks of alignment `cursor`, which is what a shear is about to follow. */
export function aligned(world: World, cursor = 0): GimbalState {
  const mark = body(world).marks[cursor];
  if (mark === undefined) throw new Error("the script has no such alignment");
  const s = turning(world, mark.outerMilli, mark.innerMilli, cursor);
  s.heldBeats = 1;
  return s;
}

/** A tooth coming off: `cursor` alignments spent, a beat into the shear. */
export function shearing(world: World, cursor = 1): GimbalState {
  const s = still(world);
  s.phase = "shear";
  s.phaseBeat = world.beat - 1;
  s.cursor = cursor;
  return s;
}

/** The last tooth gone and the seam leaking, half way down its fuse. */
export function leaking(world: World): GimbalState {
  const s = body(world);
  const spent = shearing(world, s.marks.length);
  spent.seamCol = 5;
  spent.seamBeat = world.beat - Math.floor(CFG.gimbalSeamBeats / 2);
  return spent;
}

/** The drum open, a beat in: the rings loose and the hatch swinging. */
export function opening(world: World): GimbalState {
  const s = still(world);
  s.phase = "open";
  s.phaseBeat = world.beat - 1;
  s.cursor = s.marks.length;
  return s;
}

export function drawn(
  world: World,
  role: ViewRole,
  ticks: number,
  /** One event thrown on the first tick, for the reactions: the fx are the one
   * part of this picture read off what *happened* rather than off what is
   * (`render/gimbal-fx.ts`). */
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const log: string[] = [];
  const { ctx } = runFrames(world, role, ticks, {
    every: 3,
    onCanvas: (c) => {
      c.log = log;
    },
    onTick: (tick, w) => {
      step(w, []);
      if (tick === 0 && said !== null) w.events.push(said);
    },
  });
  return { calls: ctx.calls, text: log.join("|") };
}

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the cradle set as `arrange` says. */
export function frame(
  role: ViewRole,
  arrange: (world: World) => void,
  said: SimEvent | null = null,
): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9, said);
}

/** How many words a screen set down. The stub logs the call and not the word. */
export function words(shot: { text: string }): number {
  return count(shot.text, "fillText(");
}
