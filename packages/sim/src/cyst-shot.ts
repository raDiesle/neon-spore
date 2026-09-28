import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { cystBoss, cystLitStep, cystStepCol } from "./cyst.js";
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
 *
 * **A bud** takes its shot up the column it swells over, in its colour, bared
 * core or not: it is a growth out of the flank, not the core.
 */
export function cystStruck(world: World, bullet: Bullet): boolean {
  const s = cystBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  const step = cystLitStep(s);
  if (step === null) return core;
  const bud = step.ask === "bud";
  if (!bud && (step.ask !== "fire" || !s.bared)) return core;
  if (bullet.col !== cystStepCol(midCol(world.cfg), step)) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  if (bud) {
    world.events.push({ type: "cystPop", col: bullet.col });
    cystAnswered(world, s);
    return true;
  }
  s.hits += 1;
  world.events.push({ type: "cystHit", hits: s.hits, col: bullet.col });
  cystAnswered(world, s);
  return true;
}
