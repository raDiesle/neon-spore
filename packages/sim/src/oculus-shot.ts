import { midCol } from "./config.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { oculusBoss, oculusLitStep, oculusLookCol } from "./oculus.js";
import { oculusAnswered } from "./oculus-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE OCULUS's shot**: the open socket, where a bolt leaves the top of the
 * field in the middle column.
 *
 * Only a lit fire step takes one, with the socket open. **A step with a
 * colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is
 * a colour missed on the balance sheet and the step stays lit. The last step
 * is authored `"either"`, the white core, and takes both.
 *
 * **A look step** is the same shot up another column: the eye has rolled in
 * its socket to look down `oculusLookCol`, and a bolt up that column answers
 * it. It is not a hit — the core was not struck, only met — so the three
 * hits stay the fight's health.
 *
 * What it says of a bolt is `oculusVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function oculusStruck(world: World, bullet: Bullet): boolean {
  const s = oculusBoss(world);
  const verdict = oculusVerdict(world, bullet.col, bullet.color);
  const step = s === null ? null : oculusLitStep(s);
  if (s === null || !coreTaken(world, verdict, step)) return verdict !== null;
  if (step?.ask === "look") world.events.push({ type: "oculusGlance", col: bullet.col });
  else {
    s.hits += 1;
    world.events.push({ type: "oculusHit", hits: s.hits, col: bullet.col });
  }
  oculusAnswered(world, s);
  return true;
}

/** What a bolt of `color` in `col` meets of the eye, ahead or looking aside (`core-verdict.ts`). */
export function oculusVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = oculusBoss(world);
  if (s === null) return null;
  const step = oculusLitStep(s);
  const aside =
    step === null ? undefined : { ask: "look", col: oculusLookCol(midCol(world.cfg), step) };
  return coreVerdict(world, col, color, s.socketOpen, step, aside);
}
