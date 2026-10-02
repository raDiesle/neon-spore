import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SpawnEntry,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type VaneState,
  vanePivotCol,
  type World,
} from "../src/index.js";

/**
 * THE VANE's test rig: a wave opened on the arm, the beats that drive it and
 * the boss read back off the world, and the two hands' commands. `vane.test.ts`
 * (the arm), `vane-bearing.test.ts` (the shot) and `vane-pinned.test.ts` (a
 * whole cycle) stand on it — they were one file of 440 lines until 1 October
 * 2026 — and every other VANE test since 2 October.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const PIVOT = vanePivotCol(CFG);

/** The row the arm hangs across: a body is folded on the beat it crosses it. */
export const ARM = CFG.vaneArmRow;

export function open(pins?: number, queue: SpawnEntry[] = []): World {
  const world = createWorld({ ...CFG }, 1);
  startWave(world, 0, queue, [], { kind: "vane", pins });
  return world;
}

export function beats(world: World, n: number, inputs: TimedCommand[] = []): World {
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  for (let t = 0; t < n * TPB; t++) step(world, byTick.get(world.tick) ?? []);
  return world;
}

export const vane = (world: World): VaneState => {
  const b = world.boss;
  if (b === null || b.kind !== "vane") throw new Error("no vane");
  return b;
};

/** The pilot's thumb on the arm, down or up. */
export const arm = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "vaneArm",
  on,
  fromMilli: 0,
});

/** The navigator's carry off the housing, `milli` thousandths of the screen long. */
export const housing = (milli: number): TimedCommand["command"] => ({
  kind: "drag",
  target: "vaneHousing",
  on: false,
  fromMilli: 0,
  fromYMilli: milli,
});

/** A thumb down on the arm this instant. */
export function pin(world: World, player: 1 | 2 = 1): World {
  const at = world.tick;
  return beats(world, 1, [{ tick: at, player, command: arm(true) }]);
}
