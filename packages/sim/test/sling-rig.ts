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
import { type SlingAim, type SlingState, type SlingStep, slingBoss } from "../src/sling.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE SLING's test rig: a script installed, a seat's finger put down on its
 * arm and lifted with a swipe as the pair would, and a step driven to its
 * answer. Shared by `sling.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly SlingStep[] = [
  { ask: "left", aim: "left", color: "either", beats: 5 },
  { ask: "left", aim: "right", color: "either", beats: 4 },
  { ask: "right", aim: "right", color: "either", beats: 5 },
  { ask: "right", aim: "left", color: "either", beats: 4 },
  { ask: "fire", aim: "left", color: "red", beats: 3 },
  { ask: "both", aim: "left", color: "either", beats: 3 },
  { ask: "fire", aim: "left", color: "cyan", beats: 3 },
  { ask: "both", aim: "right", color: "either", beats: 3 },
  { ask: "fire", aim: "left", color: "either", beats: 3 },
];

export function install(steps: readonly SlingStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "sling", steps });
  return world;
}

export function sling(world: World): SlingState {
  const s = slingBoss(world);
  if (s === null) throw new Error("the wave installed no sling");
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
    if (world.tick >= end) throw new Error("the fork never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => sling(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** The seat whose arm this is: the pilot's left, the navigator's right. */
const seatOf = (side: 0 | 1): 1 | 2 => (side === 0 ? 1 : 2);

function drag(world: World, side: 0 | 1, on: boolean, fromMilli: number, player: 1 | 2): string[] {
  const target = side === 0 ? "slingDrawLeft" : "slingDrawRight";
  return tick(world, [
    { tick: world.tick, player, command: { kind: "drag", target, on, fromMilli } },
  ]);
}

/** A finger down on an arm; the seat is the arm's own unless said. */
export function hold(world: World, side: 0 | 1, player: 1 | 2 = seatOf(side)): string[] {
  return drag(world, side, true, 0, player);
}

/** The finger lifted, swiping `swipe` — negative left, positive right, nought none. */
export function lift(world: World, side: 0 | 1, swipe: number): string[] {
  return drag(world, side, false, swipe, seatOf(side));
}

/** A swipe toward `aim`. */
export const toward = (aim: SlingAim): number => (aim === "left" ? -600 : 600);

/** Until each of `sides` has held the lit step's count. */
export function drawHome(world: World, sides: readonly (0 | 1)[]): Set<string> {
  const beatsAsked = sling(world).steps[sling(world).cursor]?.beats ?? 0;
  return runUntil(world, (w) => sides.every((side) => sling(w).drawnBeats[side] >= beatsAsked));
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: SlingStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
