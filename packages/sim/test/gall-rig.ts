import { midCol } from "../src/config.js";
import { type GallState, type GallStep, gallBoss, gallSeatAt } from "../src/gall.js";
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
 * THE GALL's test rig: a script installed and a press sent as a finger
 * would send it — down or lifted, and the point it went down on. Shared by
 * `gall.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly GallStep[] = [
  { ask: "close", color: "either", beats: 6 },
  { ask: "close", color: "either", beats: 5 },
  { ask: "close", color: "either", beats: 5 },
  { ask: "fire", color: "red", beats: 3 },
];

export function install(steps: readonly GallStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "gall", steps });
  return world;
}

export function gall(world: World): GallState {
  const s = gallBoss(world);
  if (s === null) throw new Error("the wave installed no gall");
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
    if (world.tick >= end) throw new Error("the seam never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => gall(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** A press from `player` on `point`, or lifted (`on` false). */
export function press(world: World, player: 1 | 2, point: number, on = true): string[] {
  return tick(world, [
    {
      tick: world.tick,
      player,
      command: { kind: "drag", target: "gallPress", on, fromMilli: 0, id: point },
    },
  ]);
}

/** The press a pair would make: the nearer seat, on the gall where it sits. */
export function pressHere(world: World): string[] {
  const at = gall(world).point;
  return press(world, gallSeatAt(at), at);
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}
