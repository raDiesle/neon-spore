import type { SimConfig } from "./config.js";
import { hullRow, ticksPerBeat } from "./config.js";
import { coreMeetMilli } from "./core-along.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { governorBoss, governorDownIn, governorFiring, governorLitStep } from "./governor.js";
import { governorAnswered } from "./governor-step.js";
import { bulletMilli } from "./mid-beat.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE GOVERNOR's shot**: the needle's tip, lit, met where a bolt up the
 * middle column comes through the gap in the bottom of the rim — and only
 * **if the tip is in the gap when the bolt gets there**. The owner,
 * 7 October 2026: *the cannon should hit the needle, not the center*, and a
 * gap in the rim so that a bolt can logically reach a target turning on the
 * face.
 *
 * Until that day the hub took a bolt fired as the needle pointed down,
 * judged at the press because a bolt climbs to the hub in the best part of a
 * beat and the needle would be a quarter of the way round by then. The tip
 * hangs at the bottom of the dial, much nearer the cannon, and a fire step's
 * needle turns slowly, so the bolt is judged on the tick it meets the tip —
 * what the pair see is what is judged — and a bolt fired as the tip comes to
 * the gap meets it there.
 *
 * Only a lit fire step takes one, with the shot earned (`hubLit`). **A step
 * with a colour wants that colour**, THE SEAM's rule (`seam-shot.ts`): the
 * other is a colour missed on the balance sheet and the step stays lit. The
 * last step is authored `"either"` and takes both. A bolt that comes through
 * the gap with the tip away from it strikes the face behind, and costs
 * nothing.
 *
 * What it says of a bolt is `governorVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function governorStruck(world: World, bullet: Bullet): boolean {
  const s = governorBoss(world);
  const verdict = governorVerdict(world, bullet.col, bullet.color);
  if (s === null || !coreTaken(world, verdict, governorLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "governorHit", hits: s.hits, col: bullet.col });
  governorAnswered(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the core (`core-verdict.ts`),
 * `ahead` ticks before it meets the tip — on the tick it does unless a caller
 * says otherwise.
 */
export function governorVerdict(world: World, col: number, color: Color, ahead = 0): CoreVerdict {
  const s = governorBoss(world);
  if (s === null) return null;
  const open = governorFiring(s) && governorDownIn(world, s, ahead);
  return coreVerdict(world, col, color, open, governorLitStep(s));
}

/** Ticks a bolt climbs from the muzzle to where the tip meets it (`bullets.ts`, `core-along.ts`). */
export function governorFlightTicks(cfg: SimConfig): number {
  return flown(cfg, coreMeetMilli("governor"));
}

/**
 * Ticks until `bullet` meets the tip — what the picture asks the verdict
 * with, so a bolt still climbing is judged by where the needle will be when
 * it gets there, as the simulation will judge it (`render/governor-stop.ts`).
 * A beam stands in the column the tick it lights, and a bolt already past is
 * asked about as it met it: both are nought.
 */
export function governorTicksToTip(cfg: SimConfig, bullet: Bullet): number {
  if (bullet.lance) return 0;
  return Math.max(0, governorFlightTicks(cfg) - flown(cfg, bulletMilli(bullet)));
}

/** Ticks a bolt takes from the muzzle up to `milli`, thousandths of a row down the field. */
function flown(cfg: SimConfig, milli: number): number {
  const climb = Math.round((cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(cfg));
  const from = (hullRow(cfg) - 1) * MILLI;
  return Math.max(0, Math.round((from - milli) / climb));
}
