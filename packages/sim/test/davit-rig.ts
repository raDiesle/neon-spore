import { midCol } from "../src/config.js";
import { type DavitState, type DavitStep, davitBoss } from "../src/davit.js";
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
 * THE DAVIT's test rig: a script installed, a seat's phone leaned onto a
 * target, a seat's finger put down on its draw and lifted with a swipe as the
 * pair would, and a step driven to its answer. Shared by `davit.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly DavitStep[] = [
  { ask: "left", leanMilli: -20000, rangeMilli: 8000, color: "either", beats: 6 },
  { ask: "left", leanMilli: 15000, rangeMilli: 8000, color: "either", beats: 4 },
  { ask: "right", leanMilli: 20000, rangeMilli: 8000, color: "either", beats: 6 },
  { ask: "right", leanMilli: -15000, rangeMilli: 8000, color: "either", beats: 4 },
  { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "red", beats: 3 },
  { ask: "reland", leanMilli: -10000, rangeMilli: 8000, color: "either", beats: 3 },
  { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "cyan", beats: 3 },
  { ask: "reland", leanMilli: 10000, rangeMilli: 8000, color: "either", beats: 3 },
  { ask: "fire", leanMilli: 0, rangeMilli: 0, color: "either", beats: 3 },
];

export function install(steps: readonly DavitStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "davit", steps });
  return world;
}

export function davit(world: World): DavitState {
  const s = davitBoss(world);
  if (s === null) throw new Error("the wave installed no davit");
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
    if (world.tick >= end) throw new Error("the boom never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => davit(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** The seat whose handles these are: the pilot's left, the navigator's right. */
const seatOf = (side: 0 | 1): 1 | 2 => (side === 0 ? 1 : 2);

type Target = "davitSteerLeft" | "davitSteerRight" | "davitLooseLeft" | "davitLooseRight";

function drag(world: World, target: Target, on: boolean, fromMilli: number, player: 1 | 2) {
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli } },
  ]);
}

/** A seat's phone leaned to `milli`; the seat is the lean's own unless said. */
export function lean(world: World, side: 0 | 1, milli: number, player = seatOf(side)): string[] {
  return drag(world, side === 0 ? "davitSteerLeft" : "davitSteerRight", true, milli, player);
}

/** A seat's phone stopped reporting. */
export function unlean(world: World, side: 0 | 1): string[] {
  return drag(world, side === 0 ? "davitSteerLeft" : "davitSteerRight", false, 0, seatOf(side));
}

/** A finger down on a draw; the seat is the draw's own unless said. */
export function hold(world: World, side: 0 | 1, player = seatOf(side)): string[] {
  return drag(world, side === 0 ? "davitLooseLeft" : "davitLooseRight", true, 0, player);
}

/** The finger lifted, swiping `swipe` — negative left, positive right, nought none. */
export function lift(world: World, side: 0 | 1, swipe: number): string[] {
  return drag(world, side === 0 ? "davitLooseLeft" : "davitLooseRight", false, swipe, seatOf(side));
}

/** A swipe toward the half `leanMilli` points into. */
export const toward = (leanMilli: number): number => (leanMilli < 0 ? -600 : 600);

/** Until `side` has held the lit step's count. */
export function drawHome(world: World, side: 0 | 1): Set<string> {
  const beatsAsked = davit(world).steps[davit(world).cursor]?.beats ?? 0;
  return runUntil(world, (w) => davit(w).drawnBeats[side] >= beatsAsked);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: DavitStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
