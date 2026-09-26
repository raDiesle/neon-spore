import { midCol } from "../src/config.js";
import {
  GRINDSTONE_PADS,
  type GrindstoneState,
  type GrindstoneStep,
  grindstoneBoss,
} from "../src/grindstone.js";
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
import type { Bullet, Color, DragTarget } from "../src/types.js";

/**
 * THE GRINDSTONE's test rig: a script installed, a seat's thumb rubbing its
 * flat or its pads put down on its jaw as the pair would, and a step driven
 * to its answer. Shared by `grindstone.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly GrindstoneStep[] = [
  { ask: "left", color: "either", beats: 6 },
  { ask: "left", color: "either", beats: 4 },
  { ask: "right", color: "either", beats: 6 },
  { ask: "right", color: "either", beats: 4 },
  { ask: "fire", color: "red", beats: 3 },
  { ask: "clamp", color: "either", beats: 3 },
  { ask: "fire", color: "cyan", beats: 3 },
  { ask: "clamp", color: "either", beats: 3 },
  { ask: "fire", color: "either", beats: 3 },
];

export function install(steps: readonly GrindstoneStep[] = SCRIPT): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "grindstone", steps });
  return world;
}

export function grindstone(world: World): GrindstoneState {
  const s = grindstoneBoss(world);
  if (s === null) throw new Error("the wave installed no grindstone");
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
    if (world.tick >= end) throw new Error("the wheel never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next step is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => grindstone(w).phase === "lit");
}

/** Until `n` more beats have gone by. */
export function beats(world: World, n: number): Set<string> {
  const at = world.beat + n;
  return runUntil(world, (w) => w.beat >= at);
}

/** The seat whose flat or jaw this is: the pilot's left, the navigator's right. */
export const seatOf = (side: 0 | 1): 1 | 2 => (side === 0 ? 1 : 2);

function drag(
  world: World,
  target: DragTarget,
  on: boolean,
  id: number | undefined,
  player: 1 | 2,
): string[] {
  const command = {
    kind: "drag" as const,
    target,
    on,
    fromMilli: 0,
    ...(id === undefined ? {} : { id }),
  };
  return tick(world, [{ tick: world.tick, player, command }]);
}

const flat = (side: 0 | 1): DragTarget => (side === 0 ? "grindFlatLeft" : "grindFlatRight");
const jaw = (side: 0 | 1): DragTarget => (side === 0 ? "grindJawLeft" : "grindJawRight");

/** A thumb on a flat that has turned back `reversals` times since it went down. */
export function rub(
  world: World,
  side: 0 | 1,
  reversals: number,
  player: 1 | 2 = seatOf(side),
): string[] {
  return drag(world, flat(side), true, reversals, player);
}

/** The thumb off the flat. */
export function liftFlat(world: World, side: 0 | 1): string[] {
  return drag(world, flat(side), false, undefined, seatOf(side));
}

/** One pad on a jaw down or up. */
export function pad(
  world: World,
  side: 0 | 1,
  which: number,
  on: boolean,
  player: 1 | 2 = seatOf(side),
): string[] {
  return drag(world, jaw(side), on, which, player);
}

/** Every pad of both jaws down. */
export function clampAll(world: World): void {
  for (const side of [0, 1] as const)
    for (let p = 0; p < GRINDSTONE_PADS; p++) pad(world, side, p, true);
}

/** Rub the lit flat one reversal a tick until the pass is answered. */
export function grindClean(world: World, side: 0 | 1): Set<string> {
  const seen = new Set<string>();
  const cursor = grindstone(world).cursor;
  for (let n = 1; grindstone(world).cursor === cursor && grindstone(world).phase === "lit"; n++) {
    if (n > 40) throw new Error("the flat never came clean");
    for (const t of rub(world, side, n)) seen.add(t);
  }
  liftFlat(world, side);
  return seen;
}

export function shot(color: Color, col = MID): Bullet {
  return { id: 999, col, row: 20, subMilli: 0, color, lance: false, driftMilli: 0, aimMilli: 0 };
}

/** A colour the step takes. */
export function rightColor(step: GrindstoneStep): Color {
  return step.color === "either" ? "cyan" : step.color;
}
