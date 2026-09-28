import { metColor, missedColor } from "./balance.js";
import { capstanBoss, capstanLitStep } from "./capstan.js";
import { capstanAnswered } from "./capstan-step.js";
import { midCol } from "./config.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CAPSTAN's shot**: the bared core, where a bolt leaves the top of
 * the field in the middle column.
 *
 * Only a lit fire step takes one, with the core bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 */
export function capstanStruck(world: World, bullet: Bullet): boolean {
  const s = capstanBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  if (!s.bared) return core;
  const step = capstanLitStep(s);
  if (step === null || step.ask !== "fire" || !core) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "capstanHit", hits: s.hits, col: bullet.col });
  capstanAnswered(world, s);
  return true;
}
