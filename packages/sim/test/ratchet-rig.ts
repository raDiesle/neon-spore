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
import { type RatchetState, ratchetBoss } from "../src/ratchet.js";

/**
 * THE RATCHET's test rig: a wave installed, her thumb on the catch, his on
 * the pawl, and the moves a test is made of — a press, a clean tooth, and
 * the story state after one answered (`ratchet-story.ts`). Shared by
 * `ratchet.test.ts` and `ratchet-story.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const DOWN = CFG.ratchetReachMilli;

export function install(over: Partial<SimConfig> = {}): World {
  const world = createWorld({ ...CFG, ...over }, 0);
  startWave(world, 0, [], [], { kind: "ratchet" });
  return world;
}

export function rack(world: World): RatchetState {
  const s = ratchetBoss(world);
  if (s === null) throw new Error("the wave installed no ratchet");
  return s;
}

/** The navigator's thumb on the catch, carried `to` thousandths down. */
export const catchAt = (tick: number, to: number, on = true, player: 1 | 2 = 2): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "ratchetCatch", on, fromMilli: 0, fromYMilli: to },
});

/** The pilot's thumb on the pawl. */
export const pawlAt = (tick: number, on: boolean, player: 1 | 2 = 1): TimedCommand => ({
  tick,
  player,
  command: { kind: "drag", target: "ratchetPawl", on, fromMilli: 0 },
});

/** Step to a tick, feeding commands on their stamp, and say what went by. */
export function runTo(world: World, tick: number, cmds: TimedCommand[] = []): Set<string> {
  const seen = new Set<string>();
  while (world.tick < tick) {
    step(
      world,
      cmds.filter((c) => c.tick === world.tick),
    );
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** A tick on, with these sent. */
export function send(world: World, make: (t: number) => TimedCommand[]): Set<string> {
  const t = world.tick;
  return runTo(world, t + 1, make(t));
}

export const beat = (world: World, n = 1): Set<string> => runTo(world, world.tick + TPB * n);

/** Past the still, or the climb: the next pawl is lit. */
export const lit = (world: World): Set<string> => beat(world, CFG.ratchetStillBeats + 1);

/** A press and its release, two ticks. */
export function press(world: World): Set<string> {
  const seen = send(world, (t) => [pawlAt(t, true)]);
  for (const e of send(world, (t) => [pawlAt(t, false)])) seen.add(e);
  return seen;
}

/** The catch set, then the pawl pressed: one clean tooth. */
export function cleanTooth(world: World): Set<string> {
  const seen = send(world, (t) => [catchAt(t, 0, false)]);
  for (const e of send(world, (t) => [catchAt(t, DOWN)])) seen.add(e);
  for (const e of press(world)) seen.add(e);
  return seen;
}

/** Her catch lifted and set again, two ticks: a fresh `SET`. */
export function reset(world: World): Set<string> {
  const seen = send(world, (t) => [catchAt(t, 0, false)]);
  for (const e of send(world, (t) => [catchAt(t, DOWN)])) seen.add(e);
  return seen;
}

/**
 * **Whatever story state is on, answered**, then the climb waited out, so
 * the next pawl is lit: the move a test makes between two clean teeth when
 * the story is not what it is about.
 */
export function pass(world: World): Set<string> {
  const phase = rack(world).phase;
  const seen = new Set<string>();
  const add = (s: Set<string>) => {
    for (const e of s) seen.add(e);
  };
  const cfg = world.cfg;
  if (phase === "slip") add(reset(world));
  if (phase === "bind") add(reset(world));
  if (phase === "kick" || phase === "bind") add(send(world, (t) => [pawlAt(t, true)]));
  if (phase === "slip") add(beat(world, cfg.ratchetSlipBeats + 1));
  if (phase === "kick") add(beat(world, cfg.ratchetKickBeats + 1));
  if (phase === "bind") add(beat(world, cfg.ratchetBindBeats + 1));
  if (phase === "kick" || phase === "bind") add(send(world, (t) => [pawlAt(t, false)]));
  if (phase === "wind") for (let i = 0; i < cfg.ratchetWindSets; i += 1) add(reset(world));
  add(beat(world, cfg.ratchetClimbBeats + 1));
  return seen;
}
