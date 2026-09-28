import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { plumbBoss, plumbLitStep } from "./plumb.js";
import { plumbAnswered } from "./plumb-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE PLUMB's shot**: the lit core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white core, and takes both.
 */
export function plumbStruck(world: World, bullet: Bullet): boolean {
  const s = plumbBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  if (!s.coreLit) return core;
  const step = plumbLitStep(s);
  if (step === null || step.ask !== "fire" || !core) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "plumbHit", hits: s.hits, col: bullet.col });
  plumbAnswered(world, s);
  return true;
}
