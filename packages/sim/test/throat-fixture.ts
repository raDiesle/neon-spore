import { DEFAULT_CONFIG, type SimConfig } from "../src/config.js";
import { type ThroatState, throatBoss } from "../src/throat.js";
import { throatHeard } from "../src/throat-hand.js";
import type { Color, Command, Creature, CreatureKind, Pod, PodKind } from "../src/types.js";
import { startWave } from "../src/wave-start.js";
import { createWorld, type World } from "../src/world.js";

/**
 * What `throat.test.ts` and `throat-suck.test.ts` share: a world with the
 * gullet installed, and the bodies, pods and thumbs a test puts on it.
 */

export const CFG: SimConfig = DEFAULT_CONFIG;
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 9;

export function open(seed = 5): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "throat" });
  return world;
}

export function tube(world: World): ThroatState {
  const boss = throatBoss(world);
  if (boss === null) throw new Error("no gullet installed");
  return boss;
}

/** A body put on the field where a test wants it. */
export function put(
  world: World,
  kind: CreatureKind,
  col: number,
  row: number,
  color: Color | null = null,
): Creature {
  const c: Creature = {
    id: world.nextId++,
    kind,
    col,
    row,
    fromRow: row,
    fromCol: col,
    color,
    holes: 0,
    petals: 0,
    dragMilli: 0,
    shell: 0,
  };
  world.creatures.push(c);
  return c;
}

/** A pod falling where a test wants it. */
export function pod(
  world: World,
  colMilli: number,
  rowMilli: number,
  kind: PodKind = "purge",
): Pod {
  const p: Pod = {
    id: world.nextId++,
    colMilli,
    rowMilli,
    driftMilli: 0,
    loose: true,
    kind,
    husk: false,
    crossMilli: 0,
  };
  world.pods.push(p);
  return p;
}

/** One sample of a thumb on a throat handle, heard as `bossHandsHeard` does. */
export function drag(
  world: World,
  player: 1 | 2,
  target: "throatAim" | "throatPump",
  on: boolean,
  fromMilli: number,
  fromYMilli: number,
): void {
  const command: Command = { kind: "drag", target, on, fromMilli, fromYMilli };
  throatHeard(world, player, command);
}

/** A thumb carried down once and then turned `turns` times on the pump, then
 * lifted: the first stroke is free, so this is `turns` gains. */
export function pump(world: World, turns: number, reach = 2000): void {
  for (let i = 0; i <= turns + 1; i++)
    drag(world, 1, "throatPump", true, 0, i % 2 === 0 ? 0 : reach);
  drag(world, 1, "throatPump", false, 0, 0);
}
