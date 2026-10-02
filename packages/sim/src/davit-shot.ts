import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { davitBoss, davitLitStep } from "./davit.js";
import { davitAnswered } from "./davit-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE DAVIT's shot**: the lit pivot, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the pivot lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white pivot, and takes both.
 *
 * What it says of a bolt is `davitVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function davitStruck(world: World, bullet: Bullet): boolean {
  const s = davitBoss(world);
  const verdict = davitVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, davitLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "davitHit", hits: s.hits, col: bullet.col });
  davitAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function davitVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = davitBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.pivotLit, davitLitStep(s));
}
