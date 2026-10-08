import { midCol } from "../src/config.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type DragTarget,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type TrapezeSide,
  type TrapezeState,
  type TrapezeStep,
  trapezeBoss,
  trapezeCaller,
  trapezeLitStep,
  trapezeOpenZone,
} from "../src/trapeze.js";
import type { Bullet } from "../src/types.js";

/**
 * THE TRAPEZE's test rig: a script installed, and a swipe and a tap sent as a
 * thumb would send them — the finger down on a side, and the lift carrying
 * how far it went across. Shared by `trapeze.test.ts` and
 * `trapeze-shots.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly TrapezeStep[] = [
  { ask: "push", gongSide: 1, gongMilli: 10000, beats: 32 },
  { ask: "call", gongSide: -1, gongMilli: 14000, beats: 40 },
  { ask: "shoot", gongSide: 1, gongMilli: 16000, beats: 48 },
  { ask: "lock", gongSide: -1, gongMilli: 18000, beats: 48 },
];

export function install(steps: readonly TrapezeStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "trapeze", steps });
  return world;
}

export function trapeze(world: World): TrapezeState {
  const s = trapezeBoss(world);
  if (s === null) throw new Error("the wave installed no trapeze");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats of ticks; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the swing never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until a level is lit. */
export function toLevel(world: World): Set<string> {
  return runUntil(world, (w) => trapeze(w).phase === "level");
}

/** Until `zone` may be pushed. */
export function toWindow(world: World, zone: TrapezeSide): Set<string> {
  return runUntil(world, (w) => trapezeOpenZone(w.cfg, trapeze(w)) === zone);
}

function drag(target: DragTarget, player: 1 | 2, on: boolean, fromMilli: number): TimedCommand {
  return { tick: 0, player, command: { kind: "drag", target, on, fromMilli } };
}

/**
 * A swipe by `player` on `zone`: the finger down one tick and lifted the next,
 * `across` thousandths of a column toward the middle (or away, negative).
 * The event types the lift raised.
 */
export function swipe(world: World, player: 1 | 2, zone: TrapezeSide, across = 600): string[] {
  const target: DragTarget = zone < 0 ? "trapezePushLeft" : "trapezePushRight";
  const down = drag(target, player, true, 0);
  tick(world, [{ ...down, tick: world.tick }]);
  const up = drag(target, player, false, -zone * across);
  return tick(world, [{ ...up, tick: world.tick }]);
}

/** The pilot's tap on the alien, down and up. */
export function tapAlien(world: World, player: 1 | 2 = 1): string[] {
  const seen = tick(world, [{ ...drag("trapezeLock", player, true, 0), tick: world.tick }]);
  tick(world, [{ ...drag("trapezeLock", player, false, 0), tick: world.tick }]);
  return seen;
}

/** Push the lit swipe level until its gong: each window, its caller swipes. The event types seen. */
export function swingUp(world: World): Set<string> {
  const seen = new Set<string>();
  const cursor = trapeze(world).cursor;
  const end = world.tick + TPB * 80;
  while (trapeze(world).cursor === cursor) {
    if (world.tick >= end) throw new Error("the swing never kicked its gong");
    const s = trapeze(world);
    const zone = trapezeOpenZone(world.cfg, s);
    const types =
      zone === 0 || trapezeLitStep(s) === null
        ? tick(world)
        : swipe(world, trapezeCaller(s, zone) === 0 ? 1 : 2, zone);
    for (const t of types) seen.add(t);
  }
  return seen;
}

export function bolt(col: number, aimMilli = 0, driftMilli = 0): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color: "red", lance: false, driftMilli, aimMilli };
}
