import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import type { Bullet, Color } from "./types.js";
import { viseBoss, viseDone, viseLitStep, viseSeedCol } from "./vise.js";
import { viseAnswered } from "./vise-step.js";
import type { World } from "./world.js";

/**
 * **THE VISE's shot**: the bared kernel in the middle column, and a spat
 * seed in its own, each met where it hangs (`core-along.ts`).
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

/**
 * What a bolt of `color` in `col` meets of the kernel or a seed
 * (`core-verdict.ts`). The case split stops nothing, as it is drawn stopping
 * nothing (`render/vise-draw.ts`).
 */
export function viseVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = viseBoss(world);
  if (s === null || viseDone(s)) return null;
  const step = viseLitStep(s);
  const aside =
    step === null ? undefined : { ask: "spit", col: viseSeedCol(midCol(world.cfg), step) };
  return coreVerdict(world, col, color, s.bared, step, aside);
}

/**
 * The spat seed's centre thrown all the way out, thousandths of a row down
 * the field: where a bolt up its column is met (`core-along.ts`), and what
 * the picture throws it to (`render/vise-story.ts`), so the two cannot drift
 * apart.
 */
export const VISE_SEED_MILLI = 3113;

/** The seed a lit spit step asks for — the column it hangs over and its row — or null. */
export function viseSeedAside(world: World): { col: number; milli: number } | null {
  const s = viseBoss(world);
  const step = s === null ? null : viseLitStep(s);
  if (step?.ask !== "spit") return null;
  return { col: viseSeedCol(midCol(world.cfg), step), milli: VISE_SEED_MILLI };
}
