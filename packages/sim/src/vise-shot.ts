import { metColor, missedColor } from "./balance.js";
import { midCol } from "./config.js";
import type { Bullet } from "./types.js";
import { viseBoss, viseLitStep, viseSeedCol } from "./vise.js";
import { viseAnswered } from "./vise-step.js";
import type { World } from "./world.js";

/**
 * **THE VISE's shot**: the bared kernel, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the kernel bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white kernel, and takes both.
 *
 * **A spit step** is the same shot up another column: the kernel has spat a
 * seed that hangs over `viseSeedCol`, and a bolt up that column bursts it. It
 * is not a hit — the kernel was not struck — so the three hits stay the
 * fight's health.
 */
export function viseStruck(world: World, bullet: Bullet): boolean {
  const s = viseBoss(world);
  if (s === null) return false;
  // The core is in the middle column, bared or not: a bolt there met it,
  // and while it is shut that is armour (`shot-out.ts`).
  const core = bullet.col === midCol(world.cfg);
  if (!s.bared) return core;
  const step = viseLitStep(s);
  if (step === null || (step.ask !== "fire" && step.ask !== "spit")) return core;
  const col = step.ask === "spit" ? viseSeedCol(midCol(world.cfg), step) : midCol(world.cfg);
  if (bullet.col !== col) return core;
  if (step.color !== "either") {
    if (bullet.color !== step.color) {
      missedColor(world);
      return true;
    }
    metColor(world);
  }
  if (step.ask === "spit") world.events.push({ type: "viseSeedBurst", col });
  else {
    s.hits += 1;
    world.events.push({ type: "viseHit", hits: s.hits, col });
  }
  viseAnswered(world, s);
  return true;
}
