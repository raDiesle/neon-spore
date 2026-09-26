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
import { type KeelState, keelBoss, keelLit, keelSeat, NO_ROCK } from "../src/keel.js";
import { keelStruck } from "../src/keel-shot.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * THE KEEL's test rig: a wave installed, a tap from the seat that owns the lit
 * joint, and the three places a test starts from — the socket flashing, the
 * spine dim before the fast run, and the rock in the air. Shared by
 * `keel.test.ts` and `keel-tempo.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const COLS = CFG.cols;
export const MID = midCol(CFG);

export function install(socket: Color = "red", reprise: readonly number[] = [4, 3, 0]): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "keel", socket, reprise });
  return world;
}

export function keel(world: World): KeelState {
  const s = keelBoss(world);
  if (s === null) throw new Error("the wave installed no keel");
  return s;
}

export const tap = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "keelJoint", on: true, fromMilli: 0 },
});

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
    if (world.tick >= end) throw new Error("the spine never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

export const isLit = (w: World): boolean => keelBoss(w) !== null && keelLit(keel(w));

/** Tap the lit joint from the seat that owns it (P1 when either may). */
export function answer(world: World): Set<string> {
  const seat = keelSeat(keel(world), COLS) ?? 1;
  return new Set(tick(world, [tap(world.tick, seat)]));
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** Through movement one: four joints locked and the socket flashing. */
export function toSocket(world: World): void {
  for (let i = 0; i < 4; i++) {
    runUntil(world, isLit);
    answer(world);
  }
  runUntil(world, (w) => keel(w).phase === "socket");
}
/** Through movement two: the socket shut, the last joint tapped, the spine dim. */
export function toTempo(world: World): void {
  toSocket(world);
  keelStruck(world, shot(MID, "red"));
  runUntil(world, isLit);
  answer(world);
  runUntil(world, (w) => keel(w).movement === 3);
}

/** Through movement three with every tap landed: the rock in the air. */
export function toRock(world: World): void {
  toTempo(world);
  for (let i = 0; i < 3; i++) {
    runUntil(world, isLit);
    answer(world);
  }
  runUntil(world, (w) => keel(w).rockCol !== NO_ROCK);
}
