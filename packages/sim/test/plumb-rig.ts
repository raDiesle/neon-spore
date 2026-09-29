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
import { type PlumbState, type PlumbStep, plumbBoss, plumbLitStep } from "../src/plumb.js";
import { plumbStruck } from "../src/plumb-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE PLUMB's test rig: a script installed, a seat's stone pulled as the pair
 * would pull it, and a step driven to its answer. Shared by `plumb.test.ts`
 * and `plumb-bleed.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly PlumbStep[] = [
  { ask: "left", skewMilli: -3000, rangeMilli: 600, color: "either", beats: 5 },
  { ask: "left", skewMilli: 2800, rangeMilli: 400, color: "either", beats: 4 },
  { ask: "right", skewMilli: 3200, rangeMilli: 600, color: "either", beats: 5 },
  { ask: "right", skewMilli: -2800, rangeMilli: 400, color: "either", beats: 4 },
  { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
  { ask: "both", skewMilli: -2800, rangeMilli: 500, color: "either", beats: 3 },
  { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "cyan", beats: 3 },
  { ask: "both", skewMilli: 3000, rangeMilli: 450, color: "either", beats: 3 },
  { ask: "fire", skewMilli: 0, rangeMilli: 0, color: "either", beats: 3 },
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
 * One seat's stone pulled `pullMilli` across, right above nought, or let go
 * (`on` false); the seat is the stone's own unless said.
 */
export function pull(
  world: World,
  side: "left" | "right",
  pullMilli: number,
  on = true,
  player: 1 | 2 = side === "left" ? 1 : 2,
): string[] {
  const target = side === "left" ? "plumbLevelLeft" : "plumbLevelRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: pullMilli } },
  ]);
}

/** Both stones pulled half the lit step's skew each, the other way: the bob dead true. */
export function balance(world: World): void {
  const skew = plumbLitStep(plumb(world))?.skewMilli ?? 0;
  const half = Math.trunc(skew / 2);
  pull(world, "left", -half);
  pull(world, "right", half - skew);
}

/** Both thumbs up. */
export function letGoBoth(world: World): void {
  pull(world, "left", 0, false);
  pull(world, "right", 0, false);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: PlumbStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}

/** The lit step answered: both stones pulled true until it rests, or shot in its colour. */
export function answer(world: World): void {
  const s = plumb(world);
  const step = plumbLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") plumbStruck(world, shot(rightColor(step)));
  else {
    balance(world);
    runUntil(world, (w) => plumb(w).phase === "rest");
    letGoBoth(world);
  }
}

/** A bob with the steps before `n` answered and step `n` lit. */
export function toStep(n: number): World {
  const world = install();
  toLit(world);
  while (plumb(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}
