import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { governorBoss, governorFiring, governorLitStep } from "./governor.js";
import { governorAnswered } from "./governor-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GOVERNOR's shot**: the lit hub, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the hub lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white hub, and takes both.
 *
 * What it says of a bolt is `governorVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function governorStruck(world: World, bullet: Bullet): boolean {
  const s = governorBoss(world);
  const verdict = governorVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, governorLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "governorHit", hits: s.hits, col: bullet.col });
  governorAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function governorVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = governorBoss(world);
  return s === null ? null : coreVerdict(world, col, color, governorFiring(s), governorLitStep(s));
}
