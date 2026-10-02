import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { gallBoss, gallLitStep } from "./gall.js";
import { gallAnswered } from "./gall-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GALL's shot**: the bared root, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the root bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit.
 *
 * What it says of a bolt is `gallVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function gallStruck(world: World, bullet: Bullet): boolean {
  const s = gallBoss(world);
  const verdict = gallVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, gallLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "gallHit", hits: s.hits, col: bullet.col });
  gallAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the core (`core-verdict.ts`). */
export function gallVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = gallBoss(world);
  return s === null ? null : coreVerdict(world, col, color, s.bared, gallLitStep(s));
}
