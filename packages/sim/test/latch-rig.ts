import {
  createWorld,
  DEFAULT_CONFIG,
  type DragTarget,
  hashWorld,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import {
  type LatchGrip,
  type LatchState,
  type LatchStep,
  latchBoss,
  latchGripSeat,
} from "../src/latch.js";

/**
 * THE LATCH's test rig: a script installed, and a grip taken, pulled and let
 * go as a thumb would send them — the finger down, the depth carried on
 * `fromYMilli`, and the lift.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const KNOT = CFG.latchKnotMilli;
export const REACH = CFG.latchReachMilli;

/** The shipped wave's script, written out: sim tests do not read content. */
export const SCRIPT: readonly LatchStep[] = [
  { ask: "haul", knots: 2, beats: 28 },
  { ask: "yank", knots: 2, beats: 32 },
  { ask: "cross", knots: 2, beats: 32 },
];

export function install(steps: readonly LatchStep[] = SCRIPT, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "latch", steps });
  return world;
}

export function latch(world: World): LatchState {
  const s = latchBoss(world);
  if (s === null) throw new Error("the wave installed no latch");
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
    if (world.tick >= end) throw new Error("the rope never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until a level is lit. */
export function toLevel(world: World): Set<string> {
  return runUntil(world, (w) => latch(w).phase === "level");
}

function target(grip: LatchGrip): DragTarget {
  return grip === 0 ? "latchGripLeft" : "latchGripRight";
}

/** `player`'s thumb on `grip`, `depth` pulled down: the grab is the message with no depth. */
export function hold(player: 1 | 2, grip: LatchGrip, depth = 0): TimedCommand {
  return {
    tick: 0,
    player,
    command: { kind: "drag", target: target(grip), on: true, fromMilli: 0, fromYMilli: depth },
  };
}

/** `player`'s thumb lifted off `grip`. */
export function lift(player: 1 | 2, grip: LatchGrip): TimedCommand {
  return {
    tick: 0,
    player,
    command: { kind: "drag", target: target(grip), on: false, fromMilli: 0 },
  };
}

/**
 * One whole pull: `player` takes hold of `grip`, pulls it down `depth`, and
 * lets go. The event types the three ticks raised.
 */
export function pull(world: World, player: 1 | 2, grip: LatchGrip, depth = REACH): string[] {
  return [
    ...tick(world, [hold(player, grip)]),
    ...tick(world, [hold(player, grip, depth)]),
    ...tick(world, [lift(player, grip)]),
  ];
}

/** The player whose thumb takes `grip` in the lit level. */
export function playerOn(world: World, grip: LatchGrip): 1 | 2 {
  return latchGripSeat(latch(world), grip) === 0 ? 1 : 2;
}

/**
 * Hand over hand, the way a pair would: the grip that does not pull takes
 * hold, the puller takes hold, pulls a whole reach and lets go, and the turn
 * passes; on until the lit level is won. The event types seen.
 */
export function haulLevel(world: World): Set<string> {
  const seen = new Set<string>();
  const add = (types: string[]) => {
    for (const t of types) seen.add(t);
  };
  const cursor = latch(world).cursor;
  for (let n = 0; latch(world).cursor === cursor; n += 1) {
    if (n > 40) throw new Error("the level was never hauled in");
    const puller = latch(world).turn;
    const holder: LatchGrip = puller === 0 ? 1 : 0;
    add(tick(world, [hold(playerOn(world, holder), holder)]));
    add(tick(world, [hold(playerOn(world, puller), puller)]));
    add(tick(world, [hold(playerOn(world, puller), puller, REACH)]));
    add(tick(world, [lift(playerOn(world, puller), puller)]));
  }
  // Both thumbs off at the end of a level: nothing to slip, since the floor is the rope.
  for (const grip of [0, 1] as const) add(tick(world, [lift(playerOn(world, grip), grip)]));
  return seen;
}

export { hashWorld };
