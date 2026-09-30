import type { SimConfig } from "./config.js";
import { type SpoolState, spoolGone } from "./spool.js";

/**
 * **THE SPOOL's zone, read off the state** (`spool.ts`): how wide it is, where
 * it sits, whether the line is inside it — and the brake depth that pays a
 * line out at a given rate, which the director's hand needs to stay in it.
 * The navigator alone is shown any of it; the pilot feels only the grip.
 */

/**
 * The depth that pays a line out at `rate` — `spoolPayRateMilli` read the
 * other way, for the one caller that has a rate and wants the grip: the
 * director's hand playing the fight correctly. **Called, never re-derived**
 * (`packages/sim/test/purity.test.ts`).
 */
export function spoolBrakeForRateMilli(cfg: SimConfig, rate: number): number {
  const reach = Math.max(1, cfg.spoolReachMilli);
  const span = Math.max(1, cfg.spoolRateFastMilli - cfg.spoolRateSlowMilli);
  const over = Math.max(0, Math.min(span, cfg.spoolRateFastMilli - rate));
  return Math.round((over * reach) / span);
}

/**
 * **How wide the zone is now**, in thousandths: narrower by
 * `spoolZoneNarrowMilli` a rib, and never narrower than that step, so the
 * last rib's zone is a target and not a point — `sinewZoneWidth`'s rule, and
 * the reason the last movement runs one leg rather than three. A zone this
 * narrow with corrections in it would be a step nobody could land.
 */
export function spoolZoneMilli(s: SpoolState, cfg: SimConfig): number {
  const narrow = Math.max(1, cfg.spoolZoneNarrowMilli);
  return Math.max(narrow, cfg.spoolZoneWideMilli - spoolGone(s) * narrow);
}

/** The zone on the track, low and high — what the navigator alone is shown. */
export function spoolZone(s: SpoolState, cfg: SimConfig): { low: number; high: number } {
  const half = Math.floor(spoolZoneMilli(s, cfg) / 2);
  return { low: Math.max(0, s.wantMilli - half), high: s.wantMilli + half };
}

/** Whether the paid-out length is inside the zone: the thing a movement counts. */
export function spoolInZone(s: SpoolState, cfg: SimConfig): boolean {
  const zone = spoolZone(s, cfg);
  return s.paidMilli >= zone.low && s.paidMilli <= zone.high;
}
