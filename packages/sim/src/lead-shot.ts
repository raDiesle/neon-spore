import { leadBoss, leadPassing, leadShootable, leadStill } from "./lead.js";
import { leadMet } from "./lead-step.js";
import type { Bullet } from "./types.js";
import type { World } from "./world.js";

/**
 * **A shot that nothing on the field stopped, leaving through the top** under
 * THE LEAD. Called by `bullets.ts` and `lance-burn.ts` beside `ledgerStruck`,
 * and a no-op unless THE LEAD is the boss.
 *
 * Its own file beside `lead-step.ts` for `ledger-shot.ts`' reason: next door
 * is the fight's **clock**, and this happens on the **tick**, where a bolt
 * leaves the field. Nothing is judged here — a bolt is put into the air
 * above the field with the beat it comes due, and the clock judges it
 * against where the body is *then*, which is the whole fight
 * (`docs/spec/bosses-choreographed.md` §11).
 *
 * **The beam is the other weapon, and it is judged now**: it stands, so
 * there is no flight to it — a beam up the body's own column on its last
 * pass is the end of it, and a beam up any column while it stands dead
 * still is the plating's answer, nothing (`leadMet` counts it against
 * `leadStillFills`). A beam while the stalk still has
 * segments to shoot is an ordinary shot with no flight: it burns the column
 * and touches nothing, because the design's beam is the answer to the last
 * segment alone, and a beam that took one earlier would make the last pass
 * a formality.
 */
export function leadStruck(world: World, b: Bullet): void {
  const s = leadBoss(world);
  if (s === null) return;
  if (b.lance) {
    if (leadPassing(s) && b.col === s.col) leadMet(world, s, b.col);
    return;
  }
  if (!leadShootable(s) || leadStill(s)) return;
  const dueBeat = world.beat + world.cfg.leadFlightBeats;
  s.flights.push({ col: b.col, dueBeat });
  world.events.push({ type: "leadFlight", col: b.col, dueBeat });
}
