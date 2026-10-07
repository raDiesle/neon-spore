import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { cystBoss, cystDone, cystLitStep, cystStepCol } from "./cyst.js";
import { cystAnswered } from "./cyst-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE CYST's shot**: the bared core in the middle column, and the bud in
 * its own, each met where it hangs (`core-along.ts`).
 *
 * Only a lit fire step takes one, with the core bare. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a
 * colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 *
 * **A bud** takes its shot up the column it swells over, in its colour, bared
 * core or not: it is a growth out of the flank, not the core.
 *
 * What it says of a bolt is `cystVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function cystStruck(world: World, bullet: Bullet): boolean {
  const s = cystBoss(world);
  const verdict = cystVerdict(world, bullet.col, bullet.color);
  const step = s === null ? null : cystLitStep(s);
  if (s === null || !coreTaken(world, verdict, step)) return verdict !== null;
  if (step?.ask === "bud") world.events.push({ type: "cystPop", col: bullet.col });
  else {
    s.hits += 1;
    world.events.push({ type: "cystHit", hits: s.hits, col: bullet.col });
  }
  cystAnswered(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the core or a bud
 * (`core-verdict.ts`). A bud is answered bared core or not. The sac split
 * stops nothing, as it is drawn stopping nothing (`render/cyst-draw.ts`).
 */
export function cystVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = cystBoss(world);
  if (s === null || cystDone(s)) return null;
  const step = cystLitStep(s);
  const bud = step?.ask === "bud";
  const aside =
    step === null ? undefined : { ask: "bud", col: cystStepCol(midCol(world.cfg), step) };
  return coreVerdict(world, col, color, s.bared || bud, step, aside);
}

/**
 * The bud's centre grown all the way out, thousandths of a row down the
 * field: where a bolt up its column is met (`core-along.ts`), and what the
 * picture grows it to (`render/cyst-story.ts`), so the two cannot drift apart.
 */
export const CYST_BUD_MILLI = 645;

/** The bud a lit step asks for — the column it swells over and its row — or null. */
export function cystBudAside(world: World): { col: number; milli: number } | null {
  const s = cystBoss(world);
  const step = s === null ? null : cystLitStep(s);
  if (step?.ask !== "bud") return null;
  return { col: cystStepCol(midCol(world.cfg), step), milli: CYST_BUD_MILLI };
}
