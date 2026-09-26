import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { cystBoss, cystLitStep } from "./cyst.js";
import { cystAnswered } from "./cyst-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CYST's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 */
export function cystStruck(world: World, bullet: Bullet): void {
  const s = cystBoss(world);
  if (s === null || !s.bared) return;
  const step = cystLitStep(s);
  if (step === null || step.ask !== "fire" || bullet.col !== midCol(world.cfg)) return;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "cystHit", hits: s.hits, col: bullet.col });
  cystAnswered(world, s);
}
