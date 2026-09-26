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
import { type PlumbState, type PlumbStep, plumbBoss } from "../src/plumb.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE PLUMB's test rig: a script installed, a seat's phone leant as the pair
 * would lean it, and a step driven to its answer. Shared by `plumb.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly PlumbStep[] = [
  { ask: "left", rangeMilli: 8000, color: "either", beats: 5 },
  { ask: "left", rangeMilli: 4000, color: "either", beats: 4 },
  { ask: "right", rangeMilli: 8000, color: "either", beats: 5 },
  { ask: "right", rangeMilli: 4000, color: "either", beats: 4 },
  { ask: "fire", rangeMilli: 0, color: "red", beats: 3 },
  { ask: "both", rangeMilli: 6000, color: "either", beats: 3 },
  { ask: "fire", rangeMilli: 0, color: "cyan", beats: 3 },
  { ask: "both", rangeMilli: 5000, color: "either", beats: 3 },
  { ask: "fire", rangeMilli: 0, color: "either", beats: 3 },
];

export function install(steps: readonly PlumbStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "plumb", steps });
  return world;
}

export function plumb(world: World): PlumbState {
  const s = plumbBoss(world);
  if (s === null) throw new Error("the wave installed no plumb");
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
    if (world.tick >= end) throw new Error("the bob never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => plumb(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/**
 * One seat's phone read at `leanMilli` off level, or put down (`on` false);
 * the seat is the weight's own unless said.
 */
export function lean(
  world: World,
  side: "left" | "right",
  leanMilli: number,
  on = true,
  player: 1 | 2 = side === "left" ? 1 : 2,
): string[] {
  const target = side === "left" ? "plumbLevelLeft" : "plumbLevelRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: leanMilli } },
  ]);
}

/** Both phones held dead level. */
export function levelBoth(world: World): void {
  lean(world, "left", 0);
  lean(world, "right", 0);
}

/** Both phones put down. */
export function putDownBoth(world: World): void {
  lean(world, "left", 0, false);
  lean(world, "right", 0, false);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: PlumbStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
