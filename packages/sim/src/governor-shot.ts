import type { SimConfig } from "./config.js";
import { hullRow, ticksPerBeat } from "./config.js";
import { coreMeetMilli } from "./core-along.js";
import { type CoreVerdict, coreTaken, coreVerdict } from "./core-verdict.js";
import { governorBoss, governorDownAgo, governorFiring, governorLitStep } from "./governor.js";
import { governorAnswered } from "./governor-step.js";
import { bulletMilli } from "./mid-beat.js";
import type { Bullet, Color } from "./types.js";
import { MILLI, type World } from "./world.js";

/**
 * **THE GOVERNOR's shot**: the lit hub, met in the middle column — and only
 * when **the needle pointed down at the cannon as the bolt left it**. The
 * owner, 6 October 2026: *cannon must be shot in the moment when needle is at
 * the bottom, so cannon must hit needle, not just somewhere the bottom of
 * boss.*
 *
 * The moment is the press, not the bolt's arrival: a bolt climbs to the hub
 * in the best part of a beat, and the needle would be a quarter of the way
 * round by then. The pace of a lit step does not change, so where the needle
 * was when this bolt left is where it is less the turns of its flight
 * (`governorDownAgo`). A beam stands in the column the tick it lights, and its
 * flight is nought.
 *
 * Only a lit fire step takes one, with the hub lit. **A step with a colour
 * wants that colour**, THE SEAM's rule (`seam-shot.ts`): the other is a colour
 * missed on the balance sheet and the step stays lit. The last step is
 * authored `"either"`, the white hub, and takes both. A bolt in the right
 * colour that left with the needle off the bottom is armour, and costs
 * nothing.
 *
 * What it says of a bolt is `governorVerdict`, which the picture asks too
 * (`core-verdict.ts`).
 */
export function governorStruck(world: World, bullet: Bullet): boolean {
  const s = governorBoss(world);
  const flight = bullet.lance ? 0 : governorFlightTicks(world.cfg);
  const verdict = governorVerdict(world, bullet.col, bullet.color, flight);
  if (s === null || !coreTaken(world, verdict, governorLitStep(s))) return verdict !== null;
  s.hits += 1;
  world.events.push({ type: "governorHit", hits: s.hits, col: bullet.col });
  governorAnswered(world, s);
  return true;
}

/**
 * What a bolt of `color` in `col` meets of the core (`core-verdict.ts`), the
 * bolt `flight` ticks out of the cannon — a bolt's whole climb to the hub
 * unless a caller says otherwise.
 */
export function governorVerdict(
  world: World,
  col: number,
  color: Color,
  flight = governorFlightTicks(world.cfg),
): CoreVerdict {
  const s = governorBoss(world);
  if (s === null) return null;
  const open = governorFiring(s) && governorDownAgo(world, s, flight);
  return coreVerdict(world, col, color, open, governorLitStep(s));
}

/** Ticks a bolt climbs from the muzzle to where the hub meets it (`bullets.ts`, `core-along.ts`). */
export function governorFlightTicks(cfg: SimConfig): number {
  return flown(cfg, coreMeetMilli("governor"));
}

/**
 * Ticks `bullet` has climbed since it left the muzzle — what the picture asks
 * the verdict with, so a bolt still in the air is judged by where the needle
 * was when it left, as the hub will judge it (`render/governor-stop.ts`).
 * A bolt already past the hub is asked about as it met it.
 */
export function governorFlownTicks(cfg: SimConfig, bullet: Bullet): number {
  if (bullet.lance) return 0;
  return Math.min(governorFlightTicks(cfg), flown(cfg, bulletMilli(bullet)));
}

/** Ticks a bolt takes from the muzzle up to `milli`, thousandths of a row down the field. */
function flown(cfg: SimConfig, milli: number): number {
  const climb = Math.round((cfg.bulletTilesPerBeat * MILLI) / ticksPerBeat(cfg));
  const from = (hullRow(cfg) - 1) * MILLI;
  return Math.max(0, Math.round((from - milli) / climb));
}
