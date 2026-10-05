import { metColor, missedColor } from "./balance.js";
import { lampreyBoss, lampreyFiring } from "./lamprey.js";
import { lampreyRecoiled } from "./lamprey-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE LAMPREY's shot**: the lit gullet, judged where a bolt leaves the top
 * of the field in the column of the tile the eel rears on.
 *
 * Bitten into a tile, or leaping, the gullet is shut, so a bolt then meets
 * nothing. **A step with a colour wants that colour**, THE SEAM's rule
 * (`seam-shot.ts`): the other is a colour missed on the balance sheet and the
 * gullet stays lit. The last step is authored `"either"`, the white gullet,
 * and takes both.
 */
export function lampreyStruck(world: World, bullet: Bullet): boolean {
  const s = lampreyBoss(world);
  if (s === null || !lampreyFiring(s)) return false;
  if (bullet.col !== s.col) return false;
  const step = s.steps[s.cursor];
  if (step === undefined) return true;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  s.hits += 1;
  world.events.push({ type: "lampreyHit", hits: s.hits, col: bullet.col });
  lampreyRecoiled(world, s);
  return true;
}
