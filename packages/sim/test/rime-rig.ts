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
import { type RimeState, type RimeStep, rimeBoss } from "../src/rime.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE RIME's test rig: a script installed, a wiping thumb on a half as the
 * pair would put it there, the shield under the lens, and a step driven to
 * its answer. Shared by `rime.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly RimeStep[] = [
  { ask: "left", color: "either", beats: 6 },
  { ask: "left", color: "either", beats: 4 },
  { ask: "right", color: "either", beats: 6 },
  { ask: "right", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "shield", color: "either", beats: 3 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "shield", color: "either", beats: 3 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly RimeStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "rime", steps });
  return world;
}

export function rime(world: World): RimeState {
  const s = rimeBoss(world);
  if (s === null) throw new Error("the wave installed no rime");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats of ticks; every event type seen.
 * Generous, because THE SLOW stretches a beat. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 40): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the lens never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => rime(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/**
 * A thumb on a half that has turned back `count` times since it went down,
 * or lifted off it; the seat is the half's own unless said.
 */
export function rub(
  world: World,
  side: "left" | "right",
  on: boolean,
  count = 0,
  player: 1 | 2 = side === "left" ? 1 : 2,
): string[] {
  const target = side === "left" ? "rimeHalfLeft" : "rimeHalfRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: 0, id: count } },
  ]);
}

/** A fresh thumb put down on a half and turned back as often as its frost takes. */
export function wipe(world: World, side: "left" | "right"): string[] {
  rub(world, side, false);
  const frost = rime(world).rimeMilli[side === "left" ? 0 : 1];
  return rub(world, side, true, Math.ceil(frost / CFG.rimeShaveMilli));
}

/** The navigator slides the shield to `col`; the pilot presses guard. */
export function shield(world: World, col = MID): Set<string> {
  const seen = new Set(
    tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col } }]),
  );
  for (const t of tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]))
    seen.add(t);
  return seen;
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: RimeStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
