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
  type TrivetState,
  type TrivetStep,
  trivetBoss,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
} from "../src/trivet.js";
import { trivetStruck } from "../src/trivet-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE TRIVET's test rig: a script installed, a seat's pads pressed as the
 * pair would press them, and a step driven to its answer. Shared by
 * `trivet.test.ts` and `trivet-story.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly TrivetStep[] = [
  { ask: "front", pads: 2, color: "either", beats: 5 },
  { ask: "front", pads: 3, color: "either", beats: 4 },
  { ask: "rear", pads: 2, color: "either", beats: 5 },
  { ask: "rear", pads: 3, color: "either", beats: 4 },
  { ask: "fire", pads: 2, color: "red", beats: 3 },
  { ask: "both", pads: 2, color: "either", beats: 3 },
  { ask: "tip", pads: 3, color: "either", beats: 4, offset: -2 },
  { ask: "fire", pads: 2, color: "cyan", beats: 3 },
  { ask: "needle", pads: 2, color: "either", beats: 4, offset: 2 },
  { ask: "both", pads: 2, color: "either", beats: 3 },
  { ask: "fire", pads: 2, color: "either", beats: 3 },
];

export function install(steps: readonly TrivetStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "trivet", steps });
  return world;
}

export function trivet(world: World): TrivetState {
  const s = trivetBoss(world);
  if (s === null) throw new Error("the wave installed no trivet");
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
    if (world.tick >= end) throw new Error("the stand never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => trivet(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** One pad on a foot pressed or lifted; the seat is the foot's own unless said. */
export function pad(
  world: World,
  side: "front" | "rear",
  id: number,
  on: boolean,
  player: 1 | 2 = side === "front" ? 1 : 2,
): string[] {
  const target = side === "front" ? "trivetPadFront" : "trivetPadRear";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli: 0, id } },
  ]);
}

/** The first `n` pads of a foot pressed down, a tick apart. */
export function chord(world: World, side: "front" | "rear", n: number): void {
  for (let id = 0; id < n; id++) pad(world, side, id, true);
}

/** Every pad on a foot lifted. */
export function lift(world: World, side: "front" | "rear", n = 3): void {
  for (let id = 0; id < n; id++) pad(world, side, id, false);
}

/** Both feet's first `n` pads down. */
export function chordBoth(world: World, n = 2): void {
  chord(world, "front", n);
  chord(world, "rear", n);
}

/** Every pad on both feet lifted. */
export function liftBoth(world: World): void {
  lift(world, "front");
  lift(world, "rear");
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: TrivetStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}

/** The shield slid under `col`, then the guard pressed a tick later; every event type seen. */
export function shield(world: World, col = MID): Set<string> {
  const seen = new Set(
    tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col } }]),
  );
  for (const t of tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]))
    seen.add(t);
  return seen;
}

const FOOT = ["front", "rear"] as const;

/**
 * The lit step answered: its chord or chords held until it rests, shot in its
 * colour, the lurch's foot held and the swung hub shot, or the needle turned.
 */
export function answer(world: World): void {
  const step = trivetLitStep(trivet(world));
  if (step === null) throw new Error("nothing is lit");
  if (step.ask === "fire") trivetStruck(world, shot(rightColor(step)));
  else if (step.ask === "needle") shield(world, trivetStepCol(MID, step));
  else if (step.ask === "tip") {
    const foot = FOOT[trivetTipSide(step)];
    chord(world, foot, step.pads);
    trivetStruck(world, shot(rightColor(step), trivetStepCol(MID, step)));
    lift(world, foot);
  } else {
    if (step.ask === "both") chordBoth(world, step.pads);
    else chord(world, step.ask, step.pads);
    runUntil(world, (w) => trivet(w).phase === "rest");
    liftBoth(world);
  }
}

/** A stand with the steps before `n` answered and step `n` lit. */
export function toStep(n: number, steps: readonly TrivetStep[] = SCRIPT): World {
  const world = install(steps);
  toLit(world);
  while (trivet(world).cursor < n) {
    answer(world);
    toLit(world);
  }
  return world;
}
