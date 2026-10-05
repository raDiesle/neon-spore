import {
  type AntiphonState,
  antiphonBoss,
  antiphonChooser,
  antiphonStanding,
} from "../src/antiphon.js";
import { antiphonVeinMilli } from "../src/antiphon-vein.js";
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
 * What every THE ANTIPHON test opens with: a world on the boss, the body,
 * the beat an organ stands grown, and the chooser's thumb on the rail —
 * through `step`, so a carry goes the way a device's does.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
export const TPB = ticksPerBeat(CFG);

/** A world on THE ANTIPHON; `hull` false for a hull that cannot be struck, so the fight goes on past a wrong answer. */
export function open(seed = 3, hull = true): World {
  const world = createWorld(hull ? CFG : { ...CFG, hullInvulnerable: true }, seed);
  startWave(world, 6, [], [], { kind: "antiphon" });
  return world;
}

export function body(world: World): AntiphonState {
  const s = antiphonBoss(world);
  if (s === null) throw new Error("no body installed");
  return s;
}

/** Run `n` beats, and say which events went by. */
export function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let i = 0; i < n * TPB; i++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}

/** Run until the organ stands grown all the way out. */
export function grown(world: World): AntiphonState {
  const s = body(world);
  for (let n = 0; n < 80 * TPB; n++) {
    if (antiphonStanding(s, CFG, world.beat)) return s;
    step(world, []);
  }
  throw new Error("nothing grew");
}

/** A thumb on rail index `id`, displaced `milli` of the way down its vein (or by `raw`), from `player` — the chooser's by default. */
export function thumb(
  world: World,
  id: number,
  milli: number,
  o: { player?: 1 | 2; on?: boolean; raw?: { fromMilli: number; fromYMilli: number } } = {},
): TimedCommand {
  const s = body(world);
  return {
    tick: world.tick,
    player: o.player ?? antiphonChooser(s),
    command: {
      kind: "drag",
      target: "antiphonRail",
      on: o.on ?? true,
      ...(o.raw ?? antiphonVeinMilli(CFG, s, id, milli)),
      id,
    },
  };
}

/** One tick with `commands`, and the events it raised. */
export function tick(world: World, commands: TimedCommand[]): Set<string> {
  step(world, commands);
  return new Set(world.events.map((e) => e.type));
}

/** Carry rail index `id` all the way down its vein, a quarter a tick, and say what was raised. */
export function carryHome(world: World, id: number): Set<string> {
  const seen = new Set<string>();
  for (const milli of [250, 500, 750, 1000]) {
    for (const e of tick(world, [thumb(world, id, milli)])) seen.add(e);
    if (body(world).rail.length === 0) break;
  }
  return seen;
}
