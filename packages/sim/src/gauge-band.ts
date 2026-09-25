import type { SimConfig } from "./config.js";
import { GAUGE_FULL, type GaugeState } from "./gauge.js";
import { nextInt } from "./rng.js";
import type { World } from "./world.js";

/**
 * **The band between the two marks**: where it lands, where it walks, and how
 * wide it is at this moment.
 *
 * Its own file rather than three functions inside `gauge.ts`, cut when the
 * round gained its two states and that file reached its limit, along the seam
 * the round has always had: next door is the *needle* — what the valve does to
 * it, what a call is judged as — and this is the thing it is being aimed at.
 * The seam is also the split the round is played on, because the band is the
 * half only the navigator can see (`render/gauge.ts`, `showsGaugeMarks`).
 *
 * The one function here that is not arithmetic is `gaugeSpanNow`, and it is
 * here because the width is a fact about the band: the bind is the navigator's
 * state and the number it changes is hers.
 */

/** Whether the band is wound tight — narrow unless her thumb is holding it. */
export function gaugeBound(gauge: GaugeState): boolean {
  return gauge.boundBeat !== -1;
}

/**
 * Half the band's width **right now**, which is the one number the whole round
 * is judged against and the reason it is a function rather than a comparison
 * written where it is wanted: wound tight it is `gaugeBoundSpanMilli`, and her
 * thumb on it gives the full width back. Called and never re-derived, so the
 * picture cannot draw one width while the judgement uses another — which on
 * this round would be the pair calling a needle the screen shows between the
 * marks and being told it was not.
 */
export function gaugeSpanNow(cfg: SimConfig, gauge: GaugeState): number {
  return gaugeBound(gauge) && !gauge.openThumb ? cfg.gaugeBoundSpanMilli : cfg.gaugeSpanMilli;
}

/**
 * Whether the needle is between the two marks, from the config alone — the
 * whole judgement, for a picture that has a config and no world
 * (`render/gauge.ts` lights her aim ring with it). `gaugeSeated` is this.
 */
export function gaugeSeatedBy(cfg: SimConfig, gauge: GaugeState): boolean {
  return Math.abs(gauge.needleMilli - gauge.markMilli) <= gaugeSpanNow(cfg, gauge);
}

/**
 * The band walks one step a beat and turns round at the ends rather than
 * stopping there. A band that parked against an end would hand the pair a
 * target that never moves again, which is the round solving itself.
 *
 * It walks by its **full** half-width, wound or not: the bind narrows the
 * window and never moves the ends of the dial in, so a band that binds at one
 * end of its walk is still a band, and not one pinned against the rim.
 */
export function driftBand(world: World, gauge: GaugeState): void {
  const span = world.cfg.gaugeSpanMilli;
  const next = gauge.markMilli + gauge.driftDir * world.cfg.gaugeDriftMilli;
  if (next < span || next > GAUGE_FULL - span) {
    gauge.driftDir = -gauge.driftDir;
    gauge.markMilli = Math.max(span, Math.min(GAUGE_FULL - span, gauge.markMilli));
    return;
  }
  gauge.markMilli = next;
}

/**
 * A fresh band, drawn from the seeded rng — and never within reach of where the
 * needle already is. A draw that landed on the needle would be a mark the pair
 * got without saying anything, which is the one outcome this round must not
 * have.
 */
export function drawBand(world: World, gauge: GaugeState): void {
  const span = world.cfg.gaugeSpanMilli;
  const lo = span;
  const hi = GAUGE_FULL - span;
  let mark = lo + nextInt(world.rng, hi - lo + 1);
  const reach = span * 3;
  if (Math.abs(mark - gauge.needleMilli) < reach) {
    const away = gauge.needleMilli * 2 > GAUGE_FULL ? -reach : reach;
    mark = Math.max(lo, Math.min(hi, gauge.needleMilli + away));
  }
  gauge.markMilli = mark;
  gauge.driftDir = nextInt(world.rng, 2) === 0 ? -1 : 1;
}
