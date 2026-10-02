import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { halterBoss, halterLitStep } from "./halter.js";
import { halterAnswered } from "./halter-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE HALTER's shot**: the bared centre, where a bolt leaves the top of
 * the field in the middle column.
 *
 * Only a lit fire step takes one, with the centre bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white centre, and takes both.
 *
 * What it says of a bolt is `halterVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function halterStruck(world: World, bullet: Bullet): boolean {
  const s = halterBoss(world);
  const verdict = halterVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, halterLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "halterHit", hits: s.hits, col: bullet.col });
  halterAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function halterVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = halterBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.bared, halterLitStep(s));
}
