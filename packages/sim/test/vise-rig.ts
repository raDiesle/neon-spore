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
import { type ViseState, type ViseStep, viseBoss, viseLitStep, viseSeedCol } from "../src/vise.js";
import { viseStruck } from "../src/vise-shot.js";

/**
 * THE VISE's test rig: a script installed, a pinch on a lobe as the pair
 * would put it there, and a step driven to its answer. Shared by
 * `vise.test.ts` and `vise-story.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly ViseStep[] = [
  { ask: "left", color: "either", beats: 5 },
  { ask: "left", color: "either", beats: 4 },
  { ask: "right", color: "either", beats: 5 },
  { ask: "right", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "both", color: "either", beats: 3 },
  { ask: "bite", color: "either", beats: 3 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "spit", color: "red", beats: 4, offset: 2 },
  { ask: "both", color: "either", beats: 3 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly ViseStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "vise", steps });
  return world;
}

export function vise(world: World): ViseState {
  const s = viseBoss(world);
  if (s === null) throw new Error("the wave installed no vise");
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
  return runUntil(world, (w) => vise(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/**
 * A pinch on a lobe with its two touches `gap` thousandths apart, or lifted
 * off it; the seat is the lobe's own unless said.
 */
export function pinch(
  world: World,
  side: "left" | "right",
  on: boolean,
  gap = 0,
  player: 1 | 2 = side === "left" ? 1 : 2,
): string[] {
  const target = side === "left" ? "viseLobeLeft" : "viseLobeRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: gap } },
  ]);
}

/** Both lobes pinched shut, one tick after the other. */
export function pinchBoth(world: World): void {
  pinch(world, "left", true);
  pinch(world, "right", true);
}

/** Both pinches lifted. */
export function releaseBoth(world: World): void {
  pinch(world, "left", false);
  pinch(world, "right", false);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: ViseStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}

/** The shield carried under the case and pressed, as the two seats would. */
export function shieldUnder(world: World): string[] {
  tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col: MID } }]);
  return tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]);
}

/** The lit step answered: pinched, shot, shielded or the seed burst, as it asks. */
export function answer(world: World): void {
  const step = viseLitStep(vise(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") viseStruck(world, shot(rightColor(step)));
  else if (step.ask === "spit") viseStruck(world, shot(rightColor(step), viseSeedCol(MID, step)));
  else if (step.ask === "bite") shieldUnder(world);
  else {
    if (step.ask === "both") pinchBoth(world);
    else pinch(world, step.ask, true);
    runUntil(world, (w) => vise(w).phase === "rest");
    releaseBoth(world);
  }
}

/** A case with the steps before `n` answered and step `n` lit. */
export function toStep(n: number, steps: readonly ViseStep[] = SCRIPT): World {
  const world = install(steps);
  toLit(world);
  while (vise(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}
