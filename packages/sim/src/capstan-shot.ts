import { capstanBoss, capstanLitStep } from "./capstan.js";
import { capstanAnswered } from "./capstan-step.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CAPSTAN's shot**: the bared core, where a bolt leaves the top of
 * the field in the middle column.
 *
 * Only a lit fire step takes one, with the core bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 *
 * What it says of a bolt is `capstanVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function capstanStruck(world: World, bullet: Bullet): boolean {
  const s = capstanBoss(world);
  const verdict = capstanVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, capstanLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "capstanHit", hits: s.hits, col: bullet.col });
  capstanAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function capstanVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = capstanBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.bared, capstanLitStep(s));
}
