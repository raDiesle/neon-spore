import { midCol } from "../src/config.js";
import { type HalterState, type HalterStep, halterBoss } from "../src/halter.js";
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
 * THE HALTER's test rig: a script installed, a grip put down or lifted and a
 * stray command sent as the pair would send them, and a seat left alone for
 * beats at a time. Shared by `halter.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly HalterStep[] = [
  { ask: "left", color: "either", beats: 10 },
  { ask: "right", color: "either", beats: 10 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "guard", color: "either", beats: 8 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "guard", color: "either", beats: 6 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly HalterStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "halter", steps });
  return world;
}

export function halter(world: World): HalterState {
  const s = halterBoss(world);
  if (s === null) throw new Error("the wave installed no halter");
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
  return runUntil(world, (w) => halter(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** One grip down (`on`) or lifted, from a seat. */
export function grip(world: World, player: 1 | 2, side: "left" | "right", on = true): string[] {
  const target = side === "left" ? "halterChordLeft" : "halterChordRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: 0 } },
  ]);
}

/** Both grips down on one seat, a tick apart. */
export function chord(world: World, player: 1 | 2): string[] {
  const types = grip(world, player, "left");
  return [...types, ...grip(world, player, "right")];
}

/** A command that is nothing to THE HALTER but a touch: the shield slid to the middle. */
export function stir(world: World, player: 1 | 2): string[] {
  return tick(world, [{ tick: world.tick, player, command: { kind: "shieldCol", col: MID } }]);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: HalterStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
