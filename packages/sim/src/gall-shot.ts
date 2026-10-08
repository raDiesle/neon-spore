import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { type GallState, gallBoss, gallLitStep, gallPointCol } from "./gall.js";
import { gallAnswered } from "./gall-step.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE GALL's shot**: the alien where it landed, met in its own column.
 *
 * Only a lit fire step takes one. **A step with a colour wants that colour**,
 * THE SEAM's rule (`seam-shot.ts`): the other is a colour missed on the
 * balance sheet and the step stays lit. Between fire steps it is armour: a
 * bolt bursts on it and costs nothing.
 *
 * What it says of a bolt is `gallVerdict`, which the picture asks too.
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

/**
 * What a bolt of `color` in `col` meets of the alien (`core-verdict.ts`): in
 * its own column while it sits, armour unless a fire step is lit; nothing in
 * any other column, and nothing while it is in the air or dead.
 */
export function gallVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = gallBoss(world);
  if (s === null || !gallSitting(s)) return null;
  const at = gallPointCol(world.cfg, s.point);
  if (col !== at) return null;
  const step = gallLitStep(s);
  if (step?.ask !== "fire") return "armour";
  return coreVerdict(world, col, color, true, step, { ask: "fire", col: at });
}

/** The column and row a bolt meets the alien at while it sits, for `core-along.ts`, or null. */
export function gallAside(world: World, milli: number): { col: number; milli: number } | null {
  const s = gallBoss(world);
  if (s === null || !gallSitting(s)) return null;
  return { col: gallPointCol(world.cfg, s.point), milli };
}

/** Whether the alien sits on a point, rather than in the air or dead. */
function gallSitting(s: GallState): boolean {
  return s.phase !== "leap" && s.phase !== "flat";
}
