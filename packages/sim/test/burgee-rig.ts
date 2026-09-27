import { type BurgeeState, type BurgeeStep, burgeeBoss, burgeeOnMark } from "../src/burgee.js";
import { midCol } from "../src/config.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE BURGEE's test rig: a script installed, and a tap and a draw sent as a
 * thumb would send them — the tap an edge, the draw a finger down and a lift
 * carrying the swipe's sign. Shared by `burgee.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/**
 * The shipped wave's script, written out: sim tests do not read content.
 * **Every catch's window outlasts a lap of the flag** at its sweep, a beat
 * after lighting to the last: at 1000 the flag is off a lit column three
 * beats running, so five beats; at 500 it is off five running, so seven. A
 * shorter window can light with the flag unable to get there.
 */
export const SCRIPT: readonly BurgeeStep[] = [
  { ask: "catch", freezer: 1, offset: -1, sweepMilli: 1000, color: "either", beats: 6 },
  { ask: "catch", freezer: 2, offset: 1, sweepMilli: 1000, color: "either", beats: 5 },
  { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "red", beats: 3 },
  { ask: "recatch", freezer: "either", offset: 1, sweepMilli: 500, color: "either", beats: 7 },
  { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "cyan", beats: 3 },
  { ask: "recatch", freezer: "either", offset: 1, sweepMilli: 1000, color: "either", beats: 5 },
  { ask: "fire", freezer: "either", offset: 0, sweepMilli: 0, color: "either", beats: 3 },
];

export function install(steps: readonly BurgeeStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "burgee", steps });
  return world;
}

export function burgee(world: World): BurgeeState {
  const s = burgeeBoss(world);
  if (s === null) throw new Error("the wave installed no burgee");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats of ticks; every event type seen.
 * Generous, because THE SLOW stretches a beat. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 60): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the flag never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => burgee(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** Until the flag swings over the lit column. */
export function toMark(world: World): Set<string> {
  return runUntil(world, (w) => burgeeOnMark(w, burgee(w)));
}

/** A thumb on the freeze mark from `player`: down, or lifted (`on` false). */
export function tap(world: World, player: 1 | 2, on = true): string[] {
  return tick(world, [
    {
      tick: world.tick,
      player,
      command: { kind: "drag", target: "burgeeFreeze", on, fromMilli: 0 },
    },
  ]);
}

/** A draw from `player`: the finger down, or lifted with a swipe of `swipe`'s sign. */
export function draw(world: World, player: 1 | 2, on: boolean, swipe = 0): string[] {
  return tick(world, [
    {
      tick: world.tick,
      player,
      command: { kind: "drag", target: "burgeeDraw", on, fromMilli: swipe },
    },
  ]);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}
