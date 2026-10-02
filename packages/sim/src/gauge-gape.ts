import type { SimConfig } from "./config.js";
import type { GaugeState } from "./gauge.js";

/**
 * **How far THE GAUGE's mouth is open**, and the one number that makes the
 * round harder as it goes.
 *
 * The owner, 2 October 2026: *when hitted wrong, the wave is lost. What about
 * different levels and idea to increase distance of cannon to teeth (so more
 * opened mouth)?* A miss used to jam the valve, and a pair who did not know
 * the needle could then be swung by hand ran the level's clock out on their
 * first wrong shot. So a miss costs a step of the mouth instead, and so does
 * every level up: the teeth stand further from the cannon, the wound torn
 * between them is further off and so a narrower angle to aim at, and a mouth
 * opened `gaugeGapeFull` steps swallows the ship — the round lost, the hull
 * struck, exactly as the clock running out does (`gauge-round.ts`).
 *
 * **Derived, never stored.** The opening is `level + misses`, two numbers the
 * round already keeps and hashes, so there is no third one that could fall
 * out of step with them. The picture eases the rim out from the shot that
 * opened it (`render/gauge-alien.ts`) and asks the same function.
 */

/** Steps the mouth stands open: one a level behind the pair, one a miss. */
export function gaugeGape(gauge: GaugeState): number {
  return gauge.level + gauge.misses;
}

/** Whether the mouth is open wide enough to swallow the ship. */
export function gaugeSwallowed(cfg: SimConfig, gauge: GaugeState): boolean {
  return gaugeGape(gauge) >= cfg.gaugeGapeFull;
}

/**
 * Half the band's width at this opening, before any bind narrows it — the
 * wound is the same tear further off, so the angle it spans shrinks.
 */
export function gaugeGapeSpan(cfg: SimConfig, gauge: GaugeState): number {
  return cfg.gaugeSpanMilli - gaugeGape(gauge) * cfg.gaugeGapeSpanMilli;
}
