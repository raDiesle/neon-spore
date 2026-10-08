import { type BastionState, type BastionStep, bastionBoss } from "../src/bastion.js";
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

/**
 * THE BASTION's test rig: a script installed, a plate pulled out as a thumb
 * would send it — the finger down, the drag carried on `fromMilli` and
 * `fromYMilli`, and the lift — the rim turned, the shield raised, and a bolt
 * met where the moon hangs.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);
export const PULL = CFG.bastionPullMilli;

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly BastionStep[] = [
  { layer: "plates", beats: 32 },
  { layer: "ring", colors: ["red", "cyan", "red", "cyan", "red", "cyan"], beats: 40 },
  { layer: "lattice", offsets: [-2, 2, 0, -1, 1], beats: 48 },
  { layer: "port", offsets: [-2, 1, 0], beats: 32 },
];

export function install(steps: readonly BastionStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "bastion", steps });
  return world;
}

export function bastion(world: World): BastionState {
  const s = bastionBoss(world);
  if (s === null) throw new Error("the wave installed no bastion");
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
    if (world.tick >= end) throw new Error("the moon never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until a shell is lit. */
export function toLayer(world: World): Set<string> {
  return runUntil(world, (w) => bastion(w).phase === "layer");
}

function drag(player: 1 | 2, target: DragTarget, on: boolean, x = 0, y = 0): TimedCommand {
  return { tick: 0, player, command: { kind: "drag", target, on, fromMilli: x, fromYMilli: y } };
}

/** `player`'s thumb on `side`'s plates, carried `x`, `y` from where it went down. */
export function plate(player: 1 | 2, side: 0 | 1, x = 0, y = 0): TimedCommand {
  return drag(player, side === 0 ? "bastionPlateLeft" : "bastionPlateRight", true, x, y);
}

/** `player`'s thumb lifted off `side`'s plates. */
export function lift(player: 1 | 2, side: 0 | 1): TimedCommand {
  return drag(player, side === 0 ? "bastionPlateLeft" : "bastionPlateRight", false);
}

/** `player`'s thumb on the rim, carried `along` round it. */
export function rim(player: 1 | 2, along: number, on = true): TimedCommand {
  return drag(player, "bastionSpin", on, along);
}

/**
 * One plate pulled out `along` its own way and let go, by the seat it
 * belongs to: down, carried, lifted. The event types the three ticks raised.
 */
export function pullPlate(world: World, side: 0 | 1, way: readonly [number, number], along = PULL) {
  const player = side === 0 ? 1 : 2;
  const x = Math.round((way[0] * along) / 1000);
  const y = Math.round((way[1] * along) / 1000);
  return [
    ...tick(world, [plate(player, side)]),
    ...tick(world, [plate(player, side, x, y)]),
    ...tick(world, [lift(player, side)]),
  ];
}

export function shot(col: number, color: Color): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** The navigator slides the shield to `col`; the pilot raises it. Every event type seen. */
export function shield(world: World, col: number): Set<string> {
  const seen = new Set(
    tick(world, [{ tick: world.tick, player: 2, command: { kind: "shieldCol", col } }]),
  );
  for (const t of tick(world, [{ tick: world.tick, player: 1, command: { kind: "guard" } }]))
    seen.add(t);
  return seen;
}

/** The script with only the shells named, each from `SCRIPT`. */
export function only(...layers: BastionStep["layer"][]): BastionStep[] {
  return layers.map((l) => {
    const found = SCRIPT.find((s) => s.layer === l);
    if (found === undefined) throw new Error(`no ${l} in the script`);
    return found;
  });
}

export { hashWorld };
