import { midCol } from "../src/config.js";
import {
  type FlueLevel,
  type FlueState,
  type FlueWeapon,
  flueBoss,
  flueLitLevel,
} from "../src/flue.js";
import { flueEmberMet } from "../src/flue-lead.js";
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
import type { Color } from "../src/types.js";

/**
 * THE FLUE's test rig: the levels installed, a bolt or a beam sent as the
 * navigator's thumb would send it, and the tick on which to send one so that
 * it meets the ember. Shared by `flue.test.ts` and `flue-shot.test.ts`.
 */

export const CFG: SimConfig = { ...DEFAULT_CONFIG };
export const TPB = ticksPerBeat(CFG);
export const MID = midCol(CFG);

/** The shipped wave's levels, written out: sim tests do not read content. */
export const LEVELS: readonly FlueLevel[] = [
  { weapon: "bolt", color: "red", speedMilli: 2000, slowMilli: 1000 },
  { weapon: "bolt", color: "cyan", speedMilli: 3000, slowMilli: 1000 },
  { weapon: "beam", color: "red", speedMilli: 1000, slowMilli: 500 },
  { weapon: "beam", color: "cyan", speedMilli: 1500, slowMilli: 500 },
  { weapon: "bolt", color: "red", speedMilli: 4000, slowMilli: 250 },
  { weapon: "beam", color: "cyan", speedMilli: 2000, slowMilli: 250 },
];

export function install(levels: readonly FlueLevel[] = LEVELS, seed = 0): World {
  const world = createWorld({ ...CFG }, seed);
  startWave(world, 0, [], [], { kind: "flue", levels });
  return world;
}

export function flue(world: World): FlueState {
  const s = flueBoss(world);
  if (s === null) throw new Error("the wave installed no flue");
  return s;
}

/** One tick, with `cmds` stamped for it; the event types it raised. */
export function tick(world: World, cmds: Omit<TimedCommand, "tick">[] = []): string[] {
  step(
    world,
    cmds.map((c) => ({ ...c, tick: world.tick })),
  );
  return world.events.map((e) => e.type);
}

/** Tick on until `until` holds, at most `beats` beats; every event type seen. */
export function runUntil(world: World, until: (w: World) => boolean, beats = 80): Set<string> {
  const seen = new Set<string>();
  const end = world.tick + TPB * beats;
  while (!until(world)) {
    if (world.tick >= end) throw new Error("the flue never got there");
    for (const t of tick(world)) seen.add(t);
  }
  return seen;
}

/** Until the next level is lit. */
export function toLit(world: World): Set<string> {
  return runUntil(world, (w) => flue(w).phase === "lit");
}

/** The navigator's shot: a bolt fired, or a colour held down to fill the beam. */
export function press(weapon: FlueWeapon, color: Color): Omit<TimedCommand, "tick"> {
  return weapon === "bolt"
    ? { player: 2, command: { kind: "fire", color } }
    : { player: 2, command: { kind: "prime", on: true, color } };
}

/** Tick on until a shot pressed now would meet the ember `offMilli` off the cannon, nought dead on. */
export function toLead(world: World, weapon: FlueWeapon, offMilli = 0): void {
  runUntil(world, (w) => {
    const at = flueEmberMet(w, flue(w), weapon);
    return at !== null && Math.abs(at - offMilli) <= 40;
  });
}

/**
 * The shot sent on its lead and seen to its end: the level's own weapon and
 * colour unless told otherwise, the thumb lifted once a beam has gone. The
 * event types from the press to the verdict.
 */
export function shoot(
  world: World,
  opts: { weapon?: FlueWeapon; color?: Color; offMilli?: number } = {},
): Set<string> {
  const level = flueLitLevel(flue(world));
  if (level === null) throw new Error("no level is lit");
  const weapon = opts.weapon ?? level.weapon;
  const color = opts.color ?? level.color;
  toLead(world, weapon, opts.offMilli ?? 0);
  const before = { hits: flue(world).hits, shots: flue(world).shots };
  const seen = new Set(tick(world, [press(weapon, color)]));
  for (const t of runUntil(world, (w) => {
    const s = flueBoss(w);
    return s === null || s.hits !== before.hits || s.shots !== before.shots || s.phase !== "lit";
  }))
    seen.add(t);
  if (world.prime !== null)
    tick(world, [{ player: 2, command: { kind: "prime", on: false, color } }]);
  return seen;
}

/** A flue with the levels before `n` cleared and level `n` lit. */
export function toLevel(n: number, seed = 0): World {
  const world = install(LEVELS, seed);
  toLit(world);
  for (let i = 0; i < n; i += 1) {
    shoot(world);
    toLit(world);
  }
  return world;
}
