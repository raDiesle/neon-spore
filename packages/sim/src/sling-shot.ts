import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { slingBoss, slingLitStep } from "./sling.js";
import { slingAnswered } from "./sling-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SLING's shot**: the lit yoke, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the yoke lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white yoke, and takes both.
 */
export function slingStruck(world: World, bullet: Bullet): boolean {
  const s = slingBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  if (!s.yokeLit) return core;
  const step = slingLitStep(s);
  if (step === null || step.ask !== "fire" || !core) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "slingHit", hits: s.hits, col: bullet.col });
  slingAnswered(world, s);
  return true;
}
