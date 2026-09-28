import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { flueBoss, flueFiring, flueLitStep } from "./flue.js";
import { flueAnswered } from "./flue-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE FLUE's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bared. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 */
export function flueStruck(world: World, bullet: Bullet): boolean {
  const s = flueBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  if (!flueFiring(s) || !core) return core;
  const step = flueLitStep(s);
  if (step === null) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "flueHit", hits: s.hits, col: bullet.col });
  flueAnswered(world, s);
  return true;
}
