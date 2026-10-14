import { type HydraState, type HydraStep, hydraBoss } from "../src/hydra.js";
import {
  type Bullet,
  type Color,
  createWorld,
  DEFAULT_CONFIG,
  type DragTarget,
  hashWorld,
  midCol,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { rimLapMilli } from "../src/rim-turn.js";

/**
 * THE HYDRA's test rig: a script installed, a neck swiped across, a coil's
 * lever carried round, an eye tapped, and a bolt met. THE CHRYSALIS's rig
 * (`chrysalis-rig.ts`) on a body with heads.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);
export const LAP = rimLapMilli(CFG.hydraCoilRimMilli);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly HydraStep[] = [
  { head: "bite", count: 2, beats: 28 },
  { head: "bite", count: 3, ways: [-1, 1, -1], beats: 36 },
  { head: "coil", laps: 2, beats: 32 },
  { head: "coil", laps: 3, beats: 40 },
  { head: "eye", count: 4, beats: 36 },
  { head: "eye", count: 6, beats: 48 },
  { head: "maw", offsets: [-2, 1, 0], colors: ["red", "cyan", "red"], beats: 36 },
  { head: "maw", offsets: [2, -1, 1, -2], colors: ["cyan", "red", "cyan", "red"], beats: 44 },
];

export function install(steps: readonly HydraStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "hydra", steps });
  return world;
}

export function hydra(world: World): HydraState {
  const s = hydraBoss(world);
  if (s === null) throw new Error("the wave installed no hydra");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: TimedCommand[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats of ticks; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the hydra never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until a level's heads are coming. */
export function toHeads(world: World): Set<string> {
  return runUntil(world, (w) => hydra(w).phase === "heads");
}

export function drag(player: 1 | 2, target: DragTarget, on: boolean, x = 0): TimedCommand {
  return { tick: 0, player, command: { kind: "drag", target, on, fromMilli: x } };
}

const NECK = ["hydraNeckLeft", "hydraNeckRight"] as const;
const COIL = ["hydraCoilLeft", "hydraCoilRight"] as const;
const EYE = ["hydraEyeLeft", "hydraEyeRight"] as const;

/** `side`'s own seat swipes across its neck `x` (signed) and lifts. The event types raised. */
export function swipe(world: World, side: 0 | 1, x: number, player: 1 | 2 = side === 0 ? 1 : 2) {
  const seen = tick(world, [drag(player, NECK[side], true)]);
  seen.push(...tick(world, [drag(player, NECK[side], true, Math.round(x / 2))]));
  seen.push(...tick(world, [drag(player, NECK[side], true, x)]));
  return [...seen, ...tick(world, [drag(player, NECK[side], false)])];
}

/**
 * `side`'s own seat carries its coil's lever `milli` round (signed, clockwise
 * positive), a stride a tick, and lifts. The event types raised.
 */
export function turn(world: World, side: 0 | 1, milli: number): string[] {
  const player = side === 0 ? 1 : 2;
  const seen = tick(world, [drag(player, COIL[side], true, 0)]);
  const stride = 1000 * Math.sign(milli);
  for (let at = stride; Math.abs(at) <= Math.abs(milli); at += stride) {
    seen.push(...tick(world, [drag(player, COIL[side], true, at)]));
  }
  return [...seen, ...tick(world, [drag(player, COIL[side], false)])];
}

/** `player` taps `side`'s eye: down, then up. The event types raised. */
export function tap(world: World, side: 0 | 1, player: 1 | 2 = side === 0 ? 1 : 2): string[] {
  const seen = tick(world, [drag(player, EYE[side], true)]);
  return [...seen, ...tick(world, [drag(player, EYE[side], false)])];
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** The script with only the heads named, each the first of it in `SCRIPT`. */
export function only(...heads: HydraStep["head"][]): HydraStep[] {
  return heads.map((k) => {
    const found = SCRIPT.find((s) => s.head === k);
    if (found === undefined) throw new Error(`no ${k} in the script`);
    return found;
  });
}

export { hashWorld };
