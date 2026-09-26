import {
  createWorld,
  DEFAULT_CONFIG,
  type MantleState,
  mantleBoss,
  type SimConfig,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";

/**
 * THE MANTLE's test rig: a shell installed, a thumb on a handle or the core
 * as the pair would put it there, and the fight driven to its finish. Shared
 * by `mantle.test.ts` and `mantle-brace.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);

/** Two thresholds, so the first shear leaves one pair and the second splits it. */
export const THRESHOLDS = [1400, 1700];

export function install(thresholds: readonly number[] = THRESHOLDS): World {
  const world = createWorld({ ...CFG }, 0);
  startWave(world, 0, [], [], { kind: "mantle", thresholds });
  return world;
}

export function mantle(world: World): MantleState {
  const s = mantleBoss(world);
  if (s === null) throw new Error("the wave installed no mantle");
  return s;
}

/** A thumb on a handle, held at `atMilli` thousandths of a tile. */
export const pull = (tick: number, player: 1 | 2, atMilli: number, on = true): TimedCommand => ({
  tick,
  player,
  command: {
    kind: "drag",
    target: player === 1 ? "mantleLeft" : "mantleRight",
    on,
    fromMilli: 0,
    fromYMilli: atMilli,
  },
});

export const tapCore = (tick: number, player: 1 | 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "mantleCore", on: true, fromMilli: 0 },
});

/** Step to a tick, feeding commands on the tick they are stamped for, and say
 * which event types went by — `world.events` is one tick's worth. */
export function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    const before = world.tick;
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
    if (world.tick === before) throw new Error("the tick stopped advancing");
  }
  return seen;
}

/** A beat on, with nothing sent. */
export function beat(world: World, n = 1): Set<string> {
  return runTo(world, world.tick + TPB * n);
}

/** Past the still: the handles are lit. */
export function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.mantleStillBeats + 1));
}

/** Both handles held still until the brace steadies and the last pull lights. */
export function brace(world: World): Set<string> {
  const t = world.tick;
  const seen = runTo(world, t + 1, [pull(t, 1, 0), pull(t, 2, 0)]);
  for (const e of beat(world, CFG.mantleBraceBeats + 1)) seen.add(e);
  return seen;
}

/** Every pair but the last sheared, the brace held, and the last pair pulled. */
export function toFinale(world: World): void {
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (i === THRESHOLDS.length - 1) brace(world);
    else lit(world);
    const t = world.tick;
    runTo(world, t + 1, [pull(t, 1, 1200), pull(t, 2, 1200)]);
    beat(world);
  }
}
