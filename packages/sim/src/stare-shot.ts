import { midCol } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { stareBoss } from "./stare-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE STARE's shot**: the eye in the middle column, met at its dome's lower
 * edge (`core-along.ts`) — an eye that cannot be hurt.
 *
 * The owner, 2 October 2026: *the eye cannot be shot or destroyed.* Until that
 * day a bolt into the shut eye ended a level; now every bolt up the middle,
 * in any phase, meets it and does nothing, which is armour (`shot-out.ts`).
 * Met rather than passed, so the shot is not the wasted one that loses the
 * wave, and `stareDeflect` rings it off the eye for the picture and the ear.
 */
export function stareStruck(world: World, bullet: Bullet): boolean {
  if (stareVerdict(world, bullet.col, bullet.color) === null) return false;
  world.events.push({ type: "stareDeflect", col: bullet.col });
  return true;
}

/**
 * **What a bolt in `col` meets of THE STARE**, pure, so the picture asks it
 * where a bolt stops (`render/stare-stop.ts`) and `stareStruck` acts on the
 * same answer: the eye's armour up the middle column in either colour, and
 * nothing anywhere else. Never a target: the eye cannot be hurt.
 */
export function stareVerdict(world: World, col: number, _color: Color): CoreVerdict {
  if (stareBoss(world) === null) return null;
  return col === midCol(world.cfg) ? "armour" : null;
}
