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
 * first wrong shot. So every level up opens the mouth a step: the teeth stand
 * further from the cannon, and the wound torn between them is further off and
 * so a narrower angle to aim at.
 *
 * A miss opened it a step as well, and five steps swallowed the ship, until
 * the owner answered the jam's question later the same day with a rule for
 * every boss: *a miss makes the boss wave fail and requires retry. this is
 * generic rules for bosses*. So a miss loses the round outright (`stepGauge`),
 * the mouth opens on levels alone, and three levels never reach a swallow.
 *
 * **Derived, never stored.** The opening is `level`, a number the round
 * already keeps and hashes. The picture eases the rim out from the shot that
 * opened it (`render/gauge-gape.ts`) and asks the same function.
 */

/** Steps the mouth stands open: one a level behind the pair. */
export function gaugeGape(gauge: GaugeState): number {
  return gauge.level;
}

/**
 * Half the band's width at this opening, before any bind narrows it — the
 * wound is the same tear further off, so the angle it spans shrinks.
 */
export function gaugeGapeSpan(cfg: SimConfig, gauge: GaugeState): number {
  return cfg.gaugeSpanMilli - gaugeGape(gauge) * cfg.gaugeGapeSpanMilli;
}
