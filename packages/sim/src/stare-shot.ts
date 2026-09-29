import { midCol } from "./config.js";
import { stareShootable } from "./stare.js";
import { stareBoss, stareHitHome } from "./stare-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE STARE's shot**: the eye in the middle column, where a bolt leaves the
 * top of the field.
 *
 * Only the **shut** eye on a **live** pass takes one, in either colour: the
 * owner, 29 September 2026 — *time to shoot and hit once if the eye is not
 * opened in the red damaging state*. One hit ends the level
 * (`stareHitHome`). Anywhere else in the fight a bolt up the middle meets the
 * eye and does nothing, which is armour (`shot-out.ts`): the blue pass is for
 * learning, and the charging eye is the lid's.
 */
export function stareStruck(world: World, bullet: Bullet): boolean {
  const s = stareBoss(world);
  if (s === null) return false;
  if (bullet.col !== midCol(world.cfg)) return false;
  if (stareShootable(s)) stareHitHome(world, s);
  return true;
}
