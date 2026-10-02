import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { flueBoss, flueFiring, flueLitStep } from "./flue.js";
import { flueAnswered } from "./flue-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE FLUE's shot**: the bared core, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the core bared. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 *
 * What it says of a bolt is `flueVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function flueStruck(world: World, bullet: Bullet): boolean {
  const s = flueBoss(world);
  const verdict = flueVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, flueLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "flueHit", hits: s.hits, col: bullet.col });
  flueAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function flueVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = flueBoss(world);
  return s === null ? null : coreVerdict(world, col, color, flueFiring(s), flueLitStep(s));
}
