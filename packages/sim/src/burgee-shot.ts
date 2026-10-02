import { burgeeBoss, burgeeLitStep } from "./burgee.js";
import { burgeeAnswered } from "./burgee-step.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE BURGEE's shot**: the lit spindle, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the spindle lit. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white spindle, and takes both.
 *
 * What it says of a bolt is `burgeeVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function burgeeStruck(world: World, bullet: Bullet): boolean {
  const s = burgeeBoss(world);
  const verdict = burgeeVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, burgeeLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "burgeeHit", hits: s.hits, col: bullet.col });
  burgeeAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function burgeeVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = burgeeBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.spindleLit, burgeeLitStep(s));
}
