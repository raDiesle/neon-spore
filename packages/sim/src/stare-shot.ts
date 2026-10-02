import { midCol } from "./config.js";
import { stareBoss } from "./stare-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE STARE's shot**: the eye in the middle column, where a bolt leaves the
 * top of the field — and meets an eye that cannot be hurt.
 *
 * The owner, 2 October 2026: *the eye cannot be shot or destroyed.* Until that
 * day a bolt into the shut eye ended a level; now every bolt up the middle,
 * in any phase, meets it and does nothing, which is armour (`shot-out.ts`).
 * Met rather than passed, so the shot is not the wasted one that loses the
 * wave, and `stareDeflect` rings it off the eye for the picture and the ear.
 */
export function stareStruck(world: World, bullet: Bullet): boolean {
  if (stareBoss(world) === null) return false;
  if (bullet.col !== midCol(world.cfg)) return false;
  world.events.push({ type: "stareDeflect", col: bullet.col });
  return true;
}
