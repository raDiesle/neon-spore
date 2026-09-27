import { type HaspState, haspBoss } from "../src/hasp.js";
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

/**
 * **THE HASP's test rig**: the door installed, the two hands on it, and the
 * story between the hasps played through — shared by `hasp.test.ts` and
 * `hasp-story.test.ts`, cut out of the first when the story would have put
 * it further past the limit.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const DOWN = CFG.haspReachMilli;

export function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "hasp" });
  return world;
}

export function door(world: World): HaspState {
  const s = haspBoss(world);
  if (s === null) throw new Error("the wave installed no hasp");
  return s;
}

/** The pilot's thumb on the latch, carried `to` thousandths down the reach. */
export const latch = (tick: number, to: number, on = true): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "drag", target: "haspLatch", on, fromMilli: 0, fromYMilli: to },
});

/** The navigator's finger reporting where it stands on the rim. */
export const rim = (tick: number, at: number, on = true): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "drag", target: "haspWheel", on, fromMilli: at },
});

/** Step to a tick, feeding commands on their stamp, and say what went by. */
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

/** Past the still: the first latch is lit and the hands count. */
export function lit(world: World): Set<string> {
  return runTo(world, world.tick + TPB * (CFG.haspStillBeats + 1));
}

/** His hand down on the latch, and left there. */
export function grip(world: World, to = DOWN): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [latch(t, to)]);
}

/** His hand off it. */
export function letGo(world: World): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, [latch(t, 0, false)]);
}

/**
 * Her finger going round the rim, `by` thousandths a tick for `ticks` ticks,
 * taking hold of it first — which is what `NO_BEARING` on the wire means.
 */
export function wind(world: World, ticks: number, by = 200): Set<string> {
  const t = world.tick;
  const cmds: TimedCommand[] = [rim(t, -1), rim(t + 1, 0)];
  for (let i = 1; i <= ticks; i += 1) cmds.push(rim(t + 1 + i, (i * by) % 1000));
  return runTo(world, t + ticks + 2, cmds);
}

/**
 * Her finger rocking the rim `sweeps` times, two hundred each way — the first
 * sweep sets the way round, every one after it is a reversal.
 */
export function rock(world: World, sweeps: number): Set<string> {
  const t = world.tick;
  const cmds: TimedCommand[] = [rim(t, -1), rim(t + 1, 0)];
  for (let i = 1; i <= sweeps; i += 1) cmds.push(rim(t + 1 + i, i % 2 === 1 ? 200 : 0));
  return runTo(world, t + sweeps + 2, cmds);
}

/** Her finger taken onto the rim and left standing there. */
export function rest(world: World): Set<string> {
  const t = world.tick;
  return runTo(world, t + 2, [rim(t, -1), rim(t + 1, 0)]);
}

/** One whole hasp wound off, with a hand on the latch the whole way — the
 * third's need at two hundred a tick, which is more than the first two ask. */
export function windOff(world: World): Set<string> {
  grip(world);
  const seen = wind(world, (CFG.haspWindMilli + 2 * CFG.haspWindStepMilli) / 200);
  for (const type of letGo(world)) seen.add(type);
  return seen;
}

/** The swing after an opening, up to the state it ends in. */
export function settle(world: World): Set<string> {
  return beat(world, CFG.haspSwingBeats + 1);
}

/**
 * **The swing and the story after it, answered** (`hasp-story.ts`): up to
 * the next latch lit, or the row swinging clear after the third. His hand is
 * left on the latch wherever the answer needed it there.
 */
export function between(world: World): Set<string> {
  const seen = settle(world);
  const add = (more: Set<string>): void => {
    for (const type of more) seen.add(type);
  };
  const phase = door(world).phase;
  if (phase === "rattle") {
    add(grip(world));
    add(beat(world, CFG.haspRattleBeats));
  } else if (phase === "backspin") {
    add(wind(world, CFG.haspWindTravelMilli / 200));
    add(grip(world));
    add(rock(world, CFG.haspRustRocks + 1));
  } else if (phase === "sway") {
    add(grip(world));
    add(rest(world));
    add(beat(world, CFG.haspSwayBeats));
  }
  return seen;
}
