import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { rimeBoss, rimeLitStep } from "./rime.js";
import { rimeAnswered } from "./rime-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE RIME's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white core, and takes both.
 *
 * What it says of a bolt is `rimeVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function rimeStruck(world: World, bullet: Bullet): boolean {
  const s = rimeBoss(world);
  const verdict = rimeVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, rimeLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "rimeHit", hits: s.hits, col: bullet.col });
  rimeAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function rimeVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = rimeBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.bared, rimeLitStep(s));
}
