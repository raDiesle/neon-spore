import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import {
  trivetBoss,
  trivetChordHeld,
  trivetLitStep,
  trivetStepCol,
  trivetTipSide,
} from "./trivet.js";
import { trivetAnswered } from "./trivet-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE TRIVET's shot**: the lit hub, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the hub lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white hub, and takes both.
 *
 * **A lurch** takes its shot where the hub has swung to, and only while the
 * foot it leans on is held down by its own seat's chord: a hub shot off a
 * stand going over is a bolt into the dark.
 *
 * What it says of a bolt is `trivetVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function trivetStruck(world: World, bullet: Bullet): boolean {
  const s = trivetBoss(world);
  const verdict = trivetVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, trivetLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "trivetHit", hits: s.hits, col: bullet.col });
  trivetAnswered(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the hub (`core-verdict.ts`). A
 * lurched hub with its foot's chord not held is armour wherever it hangs.
 */
export function trivetVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = trivetBoss(world);
  if (s === null) return null;
  const step = trivetLitStep(s);
  const aside =
    step === null ? undefined : { ask: "tip", col: trivetStepCol(midCol(world.cfg), step) };
  const verdict = coreVerdict(world, col, color, s.hubLit, step, aside);
  if (verdict === null || step?.ask !== "tip") return verdict;
  return trivetChordHeld(s, trivetTipSide(step), step.pads) ? verdict : "armour";
}
