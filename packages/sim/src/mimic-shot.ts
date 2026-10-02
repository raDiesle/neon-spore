import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import { mimicBoss, mimicFiring } from "./mimic.js";
import { mimicClenched } from "./mimic-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE MIMIC's shot**: the bare core, where a bolt leaves the top of the
 * field in the middle column, while it is lit.
 *
 * **A core lit in a colour wants that colour**, THE LAMPREY's gullet
 * (`lamprey-shot.ts`): the other is a colour missed on the balance sheet and
 * the core stays lit. Under its skin there is nothing to hit, so a bolt then
 * meets nothing.
 */
export function mimicStruck(world: World, bullet: Bullet): boolean {
  const s = mimicBoss(world);
  if (s === null || !mimicFiring(s)) return false;
  if (bullet.col !== midCol(world.cfg)) return false;
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
  world.events.push({ type: "mimicHit", hits: s.hits, col: bullet.col });
  mimicClenched(world, s);
  return true;
}
