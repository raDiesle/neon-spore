import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { slingBoss, slingLitStep } from "./sling.js";
import { slingAnswered } from "./sling-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE SLING's shot**: the lit yoke, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the yoke lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white yoke, and takes both.
 *
 * What it says of a bolt is `slingVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function slingStruck(world: World, bullet: Bullet): boolean {
  const s = slingBoss(world);
  const verdict = slingVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, slingLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "slingHit", hits: s.hits, col: bullet.col });
  slingAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function slingVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = slingBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.yokeLit, slingLitStep(s));
}
