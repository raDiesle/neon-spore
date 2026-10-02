import { gorgeStruck } from "../src/gorge-step.js";
import {
  createWorld,
  DEFAULT_CONFIG,
  type GorgeLevel,
  type GorgeState,
  gorgeBoss,
  gorgeColOf,
  type SimConfig,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import type { Bullet, Color } from "../src/types.js";

/**
 * What THE GORGE's three test files share: a world with the boss up on
 * levels the test names, a shot into a column, a bubble fed full and beats
 * stepped. The levels are written here rather than read from content, which
 * the simulation's tests never import — and so each test can ask for the one
 * level it is about.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
export const TPB = ticksPerBeat(CFG);

/** A row in any order, a row in one order, and a ring that wants both colours. */
export const ROW: GorgeLevel = {
  intakes: 4,
  ordered: false,
  ring: false,
  mixed: 0,
  needMin: 1,
  needMax: 3,
};
export const ORDERED: GorgeLevel = { ...ROW, intakes: 5, ordered: true };
export const RING: GorgeLevel = {
  intakes: 5,
  ordered: false,
  ring: true,
  mixed: 0,
  needMin: 2,
  needMax: 3,
};
export const MIXED: GorgeLevel = {
  ...RING,
  intakes: 6,
  ordered: true,
  mixed: 6,
  needMin: 2,
  needMax: 4,
};

export function open(levels: readonly GorgeLevel[], seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, 6, [], [], { kind: "gorge", levels });
  return world;
}

export function sack(world: World): GorgeState {
  const g = gorgeBoss(world);
  if (g === null) throw new Error("no gorge installed");
  return g;
}

export function shot(world: World, col: number, color: Color): Bullet {
  return {
    id: world.nextId++,
    col,
    row: 0,
    subMilli: 0,
    color,
    lance: false,
    driftMilli: 0,
    aimMilli: 0,
  };
}

/** One shot of `color` into bubble `i`, where a shot meets it; the events it said. */
export function hit(world: World, i: number, color: Color): string[] {
  world.events.length = 0;
  gorgeStruck(world, shot(world, gorgeColOf(world.cfg, sack(world), i), color));
  return world.events.map((e) => e.type);
}

/** Bubble `i` fed exactly what it wants, reds first. */
export function sate(world: World, i: number): void {
  const k = sack(world).intakes[i];
  if (k === undefined) throw new Error(`no bubble ${i}`);
  while (k.gotRed < k.needRed) hit(world, i, "red");
  while (k.gotCyan < k.needCyan) hit(world, i, "cyan");
}

/** `n` beats stepped with nobody's hand on anything; every event type said. */
export function beats(world: World, n: number): Set<string> {
  const seen = new Set<string>();
  for (let t = 0; t < n * TPB; t++) {
    step(world, []);
    for (const e of world.events) seen.add(e.type);
  }
  return seen;
}
