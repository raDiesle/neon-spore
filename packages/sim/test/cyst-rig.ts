import { midCol } from "../src/config.js";
import { type CystState, type CystStep, cystBoss, cystFreezer, cystPincher } from "../src/cyst.js";
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
 * THE CYST's test rig: a script installed, a tap on a freeze mark and a pinch
 * on a flank as the pair would put them there, and a step driven to its
 * answer. Shared by `cyst.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly CystStep[] = [
  { ask: "left", color: "either", beats: 4 },
  { ask: "right", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "left", color: "either", beats: 3 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "right", color: "either", beats: 2 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly CystStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "cyst", steps });
  return world;
}

export function cyst(world: World): CystState {
  const s = cystBoss(world);
  if (s === null) throw new Error("the wave installed no cyst");
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
    if (world.tick >= end) throw new Error("the case never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => cyst(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

type Side = "left" | "right";
const sideIndex = (side: Side): 0 | 1 => (side === "left" ? 0 : 1);

/** A thumb down on a flank's freeze mark, or lifted; the seat is the flank's freezer unless said. */
export function tap(
  world: World,
  side: Side,
  on = true,
  player: 1 | 2 = cystFreezer(sideIndex(side)),
): string[] {
  const target = side === "left" ? "cystFreezeLeft" : "cystFreezeRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: 0 } },
  ]);
}

/** A tap made and let go: down on one tick, up on the next. */
export function tapUp(world: World, side: Side): string[] {
  const types = tap(world, side, true);
  tap(world, side, false);
  return types;
}

/**
 * A pinch on a flank with its two touches `gap` thousandths apart, or lifted
 * off it; the seat is the flank's pincher unless said.
 */
export function pinch(
  world: World,
  side: Side,
  on: boolean,
  gap = 0,
  player: 1 | 2 = cystPincher(sideIndex(side)),
): string[] {
  const target = side === "left" ? "cystFlankLeft" : "cystFlankRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: gap } },
  ]);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: CystStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
