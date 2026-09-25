import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type FilamentState,
  filamentBoss,
  NO_GRAB,
  NOT_DRAWN,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { rgba } from "../src/hex.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, runFrames, VIEWPORT, waveWith } from "./frame-harness.js";

/**
 * THE FILAMENT's states, **set** rather than played to — `instar-frame.test.ts`'s
 * arrangement — for the two files that draw it: `filament-frame.test.ts` (the
 * turn, the clock, the pull) and `filament-heart-frame.test.ts` (the heart,
 * the vein and the tools).
 */

export const TPB = ticksPerBeat(CFG);
export const L = computeLayout(VIEWPORT, CFG, "test");

/** A world with the body in, a few beats along so a `phaseBeat` set in the past is one the world has seen. */
export function hung(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("filament");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < TPB * 4; i++) step(world, []);
  return world;
}

export function body(world: World): FilamentState {
  const s = filamentBoss(world);
  if (s === null) throw new Error("the filament wave hung no body");
  return s;
}

/** Filament `cursor` armed, the arm just begun. */
export function armed(world: World, cursor = 0): FilamentState {
  const s = body(world);
  s.cursor = cursor;
  s.phase = "arm";
  s.phaseBeat = world.beat;
  s.head = 0;
  s.tail = 0;
  s.headBeat = NOT_DRAWN;
  s.grab = [NO_GRAB, NO_GRAB];
  return s;
}

/** The trace on filament `cursor`, the head at `head` and the tail at `tail`, both thumbs on. */
export function tracing(world: World, head: number, tail: number, cursor = 0): FilamentState {
  const s = armed(world, cursor);
  s.phase = "trace";
  s.head = head;
  s.tail = tail;
  s.headBeat = world.beat - 1;
  s.stillBeat = world.beat;
  s.grab = [head, tail];
  return s;
}

/** The first filament traced end to end and a beat into its pull. */
export function pulled(world: World): FilamentState {
  const s = body(world);
  const last = (s.tiles[0]?.length ?? 1) - 1;
  const p = tracing(world, last, last);
  p.phase = "pull";
  p.phaseBeat = world.beat - 1;
  return p;
}

/** The seventh filament pulled a beat ago: the body is down. */
export function down(world: World): FilamentState {
  const s = armed(world, 0);
  s.cursor = s.tiles.length;
  s.phase = "down";
  s.phaseBeat = world.beat - 1;
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

export function count(text: string, colour: string): number {
  return text.split(colour).length - 1;
}

/** Three frames, inside a beat, with the body set as `arrange` says. */
export function frame(
  role: ViewRole,
  arrange: (world: World) => void,
): { calls: number; text: string } {
  const world = hung();
  arrange(world);
  return drawn(world, role, 9);
}

/** The body's own fill: the deep sheen at nine tenths, THE INSTAR's plate. */
export const BODY = rgba(PALETTE.sheenDeep, 0.9);
