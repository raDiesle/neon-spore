import {
  type CapstanState,
  type CapstanStep,
  capstanBoss,
  capstanSeatIndex,
} from "../src/capstan.js";
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
 * THE CAPSTAN's test rig: a script installed, a phone leaned or gone quiet
 * and a thumb's reversals sent as the pair would send them. Shared by
 * `capstan.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);
/** A lean well past the mark, either way. */
export const OVER = CFG.capstanLeanMilli + 3000;

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly CapstanStep[] = [
  { ask: "left", color: "either", beats: 12 },
  { ask: "right", color: "either", beats: 12 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "hold", color: "either", beats: 8 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "hold", color: "either", beats: 6 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly CapstanStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "capstan", steps });
  return world;
}

export function capstan(world: World): CapstanState {
  const s = capstanBoss(world);
  if (s === null) throw new Error("the wave installed no capstan");
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
    if (world.tick >= end) throw new Error("the case never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => capstan(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** A seat's phone leaned `milli` off level, or gone quiet (`on` false). */
export function lean(world: World, player: 1 | 2, milli: number, on = true): string[] {
  return tick(world, [
    {
      tick: world.tick,
      player,
      command: { kind: "drag", target: "capstanLean", on, fromMilli: milli },
    },
  ]);
}

/** A seat's thumb reporting `count` reversals since it went down, or lifted (`on` false). */
export function rubCount(world: World, player: 1 | 2, count: number, on = true): string[] {
  return tick(world, [
    {
      tick: world.tick,
      player,
      command: { kind: "drag", target: "capstanRub", on, fromMilli: 0, id: count },
    },
  ]);
}

/** `n` fresh reversals from a seat's thumb, one report each; every event type seen. */
export function wipe(world: World, player: 1 | 2, n: number): string[] {
  const types: string[] = [];
  const at = capstan(world).rubs[capstanSeatIndex(player)];
  for (let i = 1; i <= n; i++) types.push(...rubCount(world, player, at + i));
  return types;
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: CapstanStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
