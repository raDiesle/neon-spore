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
import {
  type OculusState,
  type OculusStep,
  oculusBoss,
  oculusLitStep,
  oculusLookCol,
} from "../src/oculus.js";
import { oculusStruck } from "../src/oculus-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE OCULUS's test rig: a script installed, a thumb on a leaf as the pair
 * would put it there, and a step driven to its answer. Shared by
 * `oculus.test.ts` and `oculus-story.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly OculusStep[] = [
  { ask: "shut", color: "either", beats: 4 },
  { ask: "shut", color: "either", beats: 4 },
  { ask: "shut", color: "either", beats: 4 },
  { ask: "break", color: "either", beats: 2 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "glare", color: "either", beats: 3 },
  { ask: "reseal", color: "either", beats: 3 },
  { ask: "look", color: "either", beats: 4, offset: -2 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "reseal", color: "either", beats: 4 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly OculusStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "oculus", steps });
  return world;
}

export function oculus(world: World): OculusState {
  const s = oculusBoss(world);
  if (s === null) throw new Error("the wave installed no oculus");
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
  return runUntil(world, (w) => oculus(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** A thumb put on a leaf, or lifted off it; the seat is the leaf's own unless said. */
export function leaf(
  world: World,
  side: "left" | "right",
  on: boolean,
  player: 1 | 2 = side === "left" ? 1 : 2,
): string[] {
  const target = side === "left" ? "oculusLeafLeft" : "oculusLeafRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: 0 } },
  ]);
}

/** Both thumbs down, one tick after the other. */
export function holdBoth(world: World): void {
  leaf(world, "left", true);
  leaf(world, "right", true);
}

/** Both thumbs up. */
export function releaseBoth(world: World): void {
  leaf(world, "left", false);
  leaf(world, "right", false);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: OculusStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}

/** The shield carried under the eye and pressed, as the two seats would. */
export function shieldUnder(world: World): string[] {
  tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col: MID } }]);
  return tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
}

/** The lit step answered: held, shot, shielded or let run, as it asks. */
export function answer(world: World): void {
  const step = oculusLitStep(oculus(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") oculusStruck(world, shot(rightColor(step)));
  else if (step.ask === "look")
    oculusStruck(world, shot(rightColor(step), oculusLookCol(MID, step)));
  else if (step.ask === "glare") shieldUnder(world);
  else if (step.ask === "break") runUntil(world, (w) => oculus(w).phase === "rest");
  else {
    holdBoth(world);
    runUntil(world, (w) => oculus(w).phase === "rest");
    releaseBoth(world);
  }
}

/** A lens with the steps before `n` answered and step `n` lit. */
export function toStep(n: number, steps: readonly OculusStep[] = SCRIPT): World {
  const world = install(steps);
  toLit(world);
  while (oculus(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}
