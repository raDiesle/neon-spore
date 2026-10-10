import { type CoreVerdict, coreTaken } from "./core-verdict.js";
import { lampreyBoss, lampreyFiring, lampreyStep } from "./lamprey.js";
import { lampreyRecoiled } from "./lamprey-step.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE LAMPREY's shot**: the lit gullet, met where the eel rears — in the
 * column of its tile, on its tile's row (`core-along.ts`) — so the bolt bursts
 * in the mouth and the eel takes it there, rather than flying on through the
 * head to be judged past the top of the field. The owner, 10 October 2026:
 * *the shot should not go through, and in the exact moment of hitting
 * indicate the boss was damaged.*
 *
 * Bitten into a tile, or leaping, the gullet is shut, so a bolt then meets
 * nothing. **A step with a colour wants that colour**, THE SEAM's rule
 * (`seam-shot.ts`): the other is a colour missed on the balance sheet and the
 * gullet stays lit. The last step is authored `"either"`, the white gullet,
 * and takes both.
 */
export function lampreyStruck(world: World, bullet: Bullet): boolean {
  const s = lampreyBoss(world);
  // A bolt already above the head when the gullet lit has gone past it, and
  // reaches the top having met nothing.
  if (s === null || bullet.row < s.row) return false;
  const verdict = lampreyVerdict(world, bullet.col, bullet.color);
  if (!coreTaken(world, verdict, lampreyStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "lampreyHit", hits: s.hits, col: bullet.col });
  lampreyRecoiled(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the eel (`core-verdict.ts`): the
 * lit gullet in its tile's column while it rears, nothing anywhere else.
 * Pure, so the picture asks it where a bolt stops (`render/lamprey-stop.ts`).
 */
export function lampreyVerdict(world: World, col: number, color: Color): CoreVerdict {
  const s = lampreyBoss(world);
  if (s === null || !lampreyFiring(s) || col !== s.col) return null;
  const step = lampreyStep(s);
  if (step === null) return "armour";
  return step.color === "either" || color === step.color ? "target" : "wrong";
}

/** The column and row a bolt meets the gullet at while it rears, for `core-along.ts`, or null. */
export function lampreyAside(world: World): { col: number; milli: number } | null {
  const s = lampreyBoss(world);
  if (s === null || !lampreyFiring(s)) return null;
  return { col: s.col, milli: s.row * MILLI };
}
