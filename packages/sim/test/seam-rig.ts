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
import { type SeamState, type SeamStep, seamBoss, seamLitStep, seamStepCol } from "../src/seam.js";
import { seamStruck } from "../src/seam-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE SEAM's test rig: a script installed, the shot and the shield as the
 * pair would give them, and a whole step answered. Shared by `seam.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly SeamStep[] = [
  { ask: "point", color: "red", offset: 0, seals: false },
  { ask: "grit", color: "either", offset: 0, seals: false },
  { ask: "point", color: "cyan", offset: 0, seals: true },
  { ask: "point", color: "red", offset: 0, seals: false },
  { ask: "point", color: "cyan", offset: 0, seals: true },
  { ask: "grit", color: "either", offset: 0, seals: false },
  { ask: "rock", color: "cyan", offset: 2, seals: false },
  { ask: "point", color: "either", offset: 0, seals: true },
  { ask: "both", color: "either", offset: -2, seals: false },
];

export function install(steps: readonly SeamStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "seam", steps });
  return world;
}

export function seam(world: World): SeamState {
  const s = seamBoss(world);
  if (s === null) throw new Error("the wave installed no seam");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(world, cmds);
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 12): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the ridge never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => seam(w).phase === "lit");
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
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

/** The lit step answered the way it asks: shot in its column and colour, the
 * shield under the ridge, or both. */
export function answer(world: World): void {
  const s = seam(world);
  const step = seamLitStep(s);
  if (step === null) throw new Error("nothing is lit");
  if (step.ask !== "grit") seamStruck(world, shot(seamStepCol(world, step), rightColor(step)));
  if (step.ask === "grit" || step.ask === "both") shield(world);
}

/** A colour the step takes. */
export function rightColor(step: SeamStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
