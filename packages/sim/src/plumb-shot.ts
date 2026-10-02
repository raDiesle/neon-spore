import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { plumbBoss, plumbLitStep } from "./plumb.js";
import { plumbAnswered } from "./plumb-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE PLUMB's shot**: the lit core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white core, and takes both.
 *
 * What it says of a bolt is `plumbVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function plumbStruck(world: World, bullet: Bullet): boolean {
  const s = plumbBoss(world);
  const verdict = plumbVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, plumbLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "plumbHit", hits: s.hits, col: bullet.col });
  plumbAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function plumbVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = plumbBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.coreLit, plumbLitStep(s));
}
