import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import type { Bullet, Color } from "./types.js";
import { viseBoss, viseLitStep, viseSeedCol } from "./vise.js";
import { viseAnswered } from "./vise-step.js";
import type { World } from "./world.js";

/**
 * **THE VISE's shot**: the bared kernel, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the kernel bare. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white kernel, and takes both.
 *
 * **A spit step** is the same shot up another column: the kernel has spat a
 * seed that hangs over `viseSeedCol`, and a bolt up that column bursts it. It
 * is not a hit — the kernel was not struck — so the three hits stay the
 * fight's health.
 *
 * What it says of a bolt is `viseVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function viseStruck(world: World, bullet: Bullet): boolean {
  const s = viseBoss(world);
  const verdict = viseVerdict(world, bullet.col, bullet.color);
  const step = s === null ? null : viseLitStep(s);
  if (s === null || !coreTaken(world, verdict, step)) return verdict !== null;
  if (step?.ask === "spit") world.events.push({ type: "viseSeedBurst", col: bullet.col });
  else {
    s.hits += 1;
    world.events.push({ type: "viseHit", hits: s.hits, col: bullet.col });
  }
  viseAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the kernel or a seed (`core-verdict.ts`). */
export function viseVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = viseBoss(world);
  if (s === null) return null;
  const step = viseLitStep(s);
  const aside =
    step === null ? undefined : { ask: "spit", col: viseSeedCol(midCol(world.cfg), step) };
  return coreVerdict(world, col, color, s.bared, step, aside);
}
