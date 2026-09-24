import { closeSlow, openSlow } from "./slow.js";
import type { UndertowState } from "./undertow.js";
import type { World } from "./world.js";

/**
 * **THE SLOW on THE UNDERTOW spans its asks exactly** (`docs/decisions.md`
 * #33, `gorge-slow.ts`' pattern): a lobe standing for the maw, the plate or
 * the beam; the floor bowing under the cannon until it is slid off for the
 * last time; and the last lobe for its hold. Each closes on its own clock,
 * and the slow is up for as long as any of them is.
 *
 * Read off the state, on every beat and after every taking, because a pair
 * puts two asks up at once and a widened breach a third. The bow of an
 * ordinary push asks nothing yet — it is the warning, and the lobe after it
 * the ask. The body passing through is a death, not an ask, and keeps
 * `undertowSlowBeats` of its own (`undertow-step.ts`).
 */
export function undertowSlow(world: World, u: UndertowState): void {
  if (u.phase === "taken") return;
  const cfg = world.cfg;
  let left = 0;
  for (const b of u.breaches) {
    let span = 0;
    if (b.stage === "standing") {
      span = u.phase === "last" ? cfg.undertowLastBeats : cfg.undertowStandBeats;
    } else if (u.phase === "seat") {
      const answered = world.cannonCol !== b.col && u.slid + 1 >= cfg.undertowUnseatSlides;
      span = answered ? 0 : cfg.undertowUnseatBeats;
    }
    if (span > 0) left = Math.max(left, b.stageBeat + span - world.beat);
  }
  if (left > 0) openSlow(world, left);
  else closeSlow(world);
}
